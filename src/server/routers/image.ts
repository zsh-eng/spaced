import { publicProcedure, router } from "@/server/trpc";
import { success } from "@/utils/format";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// https://stackoverflow.com/questions/26667820/upload-a-base64-encoded-image-using-formdata
function dataURItoBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}

const token = process.env.CLOUDFLARE_IMAGE_UPLOAD_WORKER_TOKEN;

// TODO this token should be provided through context
if (!token) {
  throw new Error("Cloudflare image upload worker token must be provided.");
}

export const imageRouter = router({
  // Image uploads from the markdown editor
  upload: publicProcedure
    .input(
      z.object({
        base64String: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { base64String, name } = input;
      const file = dataURItoBlob(base64String);
      const formData = new FormData();
      formData.append("file", file, name);

      console.log("Uploading image");
      const res = await fetch("https://upload.zsheng.app/upload", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }

      const { imageLink } = await res.json();
      if (typeof imageLink !== "string" || !imageLink) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }

      console.log(success`Image uploaded: ${imageLink}`);

      return imageLink as string;
    }),
});
