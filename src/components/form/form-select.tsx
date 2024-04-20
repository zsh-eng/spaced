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

type SelectData =
  | {
      value: string;
      label: string;
    }
  | string;

type SelectGroupData = {
  group: string;
  items: SelectData[];
};

type Data = Array<SelectData | SelectGroupData>;

type FormSelectProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    placeholder?: string;
    description?: string;
    data: Data;
  };

function isGroupData(
  data: SelectData | SelectGroupData,
): data is SelectGroupData {
  return (data as SelectGroupData).group !== undefined;
}

function getSelectDataKey(data: SelectData) {
  if (typeof data === "string") {
    return data;
  }

  return data.value;
}

function SelectDataItem({ data }: { data: SelectData }) {
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
}: FormSelectProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
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
            </FormControl>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

FormSelect.displayName = "FormSelect";
