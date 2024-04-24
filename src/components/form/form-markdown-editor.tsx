import { FormInputProps } from "@/components/form/input.types";
import { MarkdownEditor } from "@/components/markdown-editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { FieldValues } from "react-hook-form";

type FormMarkdownEditorProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    editing?: boolean;
    className?: string;
    border?: boolean;
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
  className,
  border,
}: FormMarkdownEditorProps<TFieldValues>) {
  // https://github.com/facebook/react/issues/12518
  // onKeyDown is a React synthetic event
  // To stop propagation, we need to use the native event
  // We want to prevent any global keyboard shortcuts from triggering
  // while the user is typing in the editor
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const div = formRef.current;
    if (!div || disabled) return;

    const handler = (event: KeyboardEvent) => {
      event.stopPropagation();
    };

    div.addEventListener("keydown", handler);
    div.addEventListener("keyup", handler);

    return () => {
      div.removeEventListener("keydown", handler);
      div.removeEventListener("keyup", handler);
    };
  }, [disabled]);

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <ScrollArea className={className}>
          <FormItem ref={formRef}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <MarkdownEditor border={border} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </ScrollArea>
      )}
    />
  );
}

FormMarkdownEditor.displayName = "FormMarkdownEditor";
