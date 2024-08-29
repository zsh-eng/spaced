import { FormInputProps } from "@/components/form/input.types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { FieldValues, useWatch } from "react-hook-form";

type FormMultiSelectProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    /**
     * The label of the multi-select input.
     */
    label: string;
    /**
     * The description of the multi-select input.
     */
    description?: string;
    /**
     * The data of the multi-select input.
     */
    data: Array<{
      value: string;
      label: string;
    }>;
    defaultValues?: Array<{
      value: string;
      label: string;
    }>;
  };

export function FormMultiSelect<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled,
  data,
  defaultValues = [],
}: FormMultiSelectProps<TFieldValues>) {
  const currentValues = useWatch({ name });
  const multiSelectValues = Array.isArray(currentValues)
    ? data.filter((d) => currentValues.includes(d.value))
    : [];

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <MultiSelect
              isMulti
              defaultValue={defaultValues}
              value={multiSelectValues}
              onChange={(values) => {
                field.onChange(() => values.map((v) => v.value));
              }}
              options={data}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
