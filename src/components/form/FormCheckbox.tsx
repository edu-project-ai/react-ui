import {
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface FormCheckboxProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "name"> {
  name: Path<TFieldValues>;
  label: string;
  control: Control<TFieldValues>;
}

function FormCheckbox<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  control,
  className,
  disabled,
}: FormCheckboxProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={className}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="cursor-pointer">
              {label}
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export default FormCheckbox;
