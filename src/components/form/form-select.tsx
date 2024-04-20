import { FormInputProps } from "@/components/form/input.types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { FieldValues } from "react-hook-form";

type SelectValueData =
  | {
      value: string;
      label: string;
    }
  | string;

type SelectGroupData = {
  group: string;
  items: SelectValueData[];
};

export type SelectData = Array<SelectValueData | SelectGroupData>;

type FormSelectProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    /**
     * The label of the select input.
     */
    placeholder?: string;
    /**
     * The description of the select input.
     */
    description?: string;
    /**
     * The data of the select input.
     */
    data: SelectData;
    /**
     * If true, the select input will allow multiple selections.
     */
    multiple?: boolean;
  };

function isGroupData(
  data: SelectValueData | SelectGroupData,
): data is SelectGroupData {
  return (data as SelectGroupData).group !== undefined;
}

function getSelectDataKey(data: SelectValueData) {
  if (typeof data === "string") {
    return data;
  }

  return data.value;
}

function SelectDataItem({ data }: { data: SelectValueData }) {
  if (typeof data === "string") {
    return (
      <SelectItem key={data} value={data}>
        {data}
      </SelectItem>
    );
  }

  return (
    <SelectItem key={data.value} value={data.value}>
      {data.label}
    </SelectItem>
  );
}

export function FormSelect<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  disabled,
  placeholder,
  description,
  data,
  multiple,
}: FormSelectProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={(value) => {
              // TODO implement true multi select using react-select library
              // The implementation is going to be non-trivial
              field.onChange(() => (multiple ? [value] : value));
            }}
            defaultValue={multiple ? field.value[0] : field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {data.map((item) => {
                if (isGroupData(item)) {
                  return (
                    <SelectGroup key={item.group}>
                      <SelectLabel>{item.group}</SelectLabel>
                      {item.items.map((groupItem) => (
                        <SelectDataItem
                          key={getSelectDataKey(groupItem)}
                          data={groupItem}
                        />
                      ))}
                    </SelectGroup>
                  );
                }

                return (
                  <SelectDataItem key={getSelectDataKey(item)} data={item} />
                );
              })}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

FormSelect.displayName = "FormSelect";
