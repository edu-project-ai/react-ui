import { memo } from "react";
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
import { Input } from "@/components/ui/input";

interface FormArrayInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange"> {
  name: Path<TFieldValues>;
  label?: string;
  control: Control<TFieldValues>;
}

/**
 * A form input that handles comma-separated array values.
 * Displays array as comma-separated string, stores as string[] in form state.
 */
function FormArrayInputInner<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  placeholder = "",
  control,
  className,
  ...rest
}: FormArrayInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              {...rest}
              id={name}
              value={Array.isArray(field.value) ? field.value.join(", ") : (field.value ?? "")}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  field.onChange([]);
                } else {
                  field.onChange(value.split(",").map((s) => s.trim()));
                }
              }}
              onBlur={field.onBlur}
              placeholder={placeholder}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Memoized to prevent re-renders when other form fields change
const FormArrayInput = memo(FormArrayInputInner) as typeof FormArrayInputInner;

export default FormArrayInput;
