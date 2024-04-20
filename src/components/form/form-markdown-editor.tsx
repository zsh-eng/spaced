import { FormInputProps } from "@/components/form/input.types";
import { MarkdownEditor } from "@/components/markdown-editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldValues } from "react-hook-form";

type FormMarkdownEditorProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    editing?: boolean;
  };

/**
 * Form field for a markdown rich text editor.
 *
 * Note: provide a `key` prop to force re-rendering of the editor.
 * The editor only reads the initial `value` on mount.
 * After that, it manages its own state.
 * This is the prevent the editor from constantly serialising and deserialising the content.
 *
 */
export function FormMarkdownEditor<TFieldValues extends FieldValues>({
  form,
  name,
  disabled,
  label,
}: FormMarkdownEditorProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <MarkdownEditor {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

FormMarkdownEditor.displayName = "FormMarkdownEditor";
