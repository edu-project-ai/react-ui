import {
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormInputProps<TFieldValues extends FieldValues = FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<TFieldValues>;
  label?: string;
  control: Control<TFieldValues>;
  rules?: RegisterOptions<TFieldValues>;
}

function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  type = "text",
  placeholder = "",
  control,
  className,
  rules,
  ...rest
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className={className}
              {...field}
              {...rest}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormInput;
