import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export type FormInputProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  disabled?: boolean;
};
