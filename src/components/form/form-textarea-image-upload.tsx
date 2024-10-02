import { FormInputProps } from "@/components/form/input.types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/image/use-image-upload";
import { trpc } from "@/utils/trpc";
import { ClipboardEventHandler, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { toast } from "sonner";

type FormTextareaImageUploadProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    placeholder?: string;
    description?: string;
    className?: string;
    rows?: number;
  };

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

/**
 * A textarea that allows for image uploads.
 */
export function FormTextareaImageUpload<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  disabled,
  className,
  placeholder,
  description,
  rows,
}: FormTextareaImageUploadProps<TFieldValues>) {
  const imageUploadMutation = useImageUpload();

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = async (e) => {
    const dataTransfer = Array.from(e.clipboardData.items);
    const images: File[] = dataTransfer
      .filter((item) => item.type.includes("image"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (images.length === 0) return;

    // Only handle the first image for now
    const image = images[0];
    const base64String = await toBase64(image);
    const imageUploadPromise = imageUploadMutation.mutateAsync({
      base64String,
      name: image.name,
    });

    toast.promise(imageUploadPromise, {
      loading: "Uploading image...",
      success: "Image uploaded",
      error: "Failed to upload image",
    });

    const link = await imageUploadPromise;
    const markdownFormattedLink = `![${image.name}](${link})`;

    const newText = `${form.getValues(name)}\n${markdownFormattedLink}`;
    form.setValue(name, newText as TFieldValues[typeof name]);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              className={className}
              placeholder={placeholder}
              rows={rows}
              onPaste={handlePaste}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

FormTextareaImageUpload.displayName = "FormTextareaImageUpload";
