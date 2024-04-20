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
import { FieldValues } from "react-hook-form";

type FormTextareaProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    placeholder?: string;
    description?: string;
    className?: string;
    rows?: number;
  };

export function FormTextarea<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  disabled,
  className,
  placeholder,
  description,
  rows,
}: FormTextareaProps<TFieldValues>) {
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

FormTextarea.displayName = "FormTextarea";
