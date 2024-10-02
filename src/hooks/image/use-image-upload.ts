import { type Card } from "@/schema";
import { ReactQueryOptions, trpc } from "@/utils/trpc";

type ImageUploadOptions = ReactQueryOptions["image"]["upload"];
type ImageUpload = ReturnType<typeof trpc.image.upload.useMutation>;

/**
 * Hook to create a {@link Card}.
 */
export function useImageUpload(options?: ImageUploadOptions): ImageUpload {
  const utils = trpc.useUtils();

  return trpc.image.upload.useMutation({
    ...options,
    onSuccess: async () => {
      await utils.image.list.invalidate();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });
}
