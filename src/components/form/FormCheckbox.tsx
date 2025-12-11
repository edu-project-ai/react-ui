import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";

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
  ...rest
}: FormCheckboxProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <label
          htmlFor={name}
          className={cn(
            "flex items-center gap-3 cursor-pointer group",
            className
          )}
        >
          <div className="relative">
            <input
              {...field}
              {...rest}
              id={name}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={cn(
                "w-5 h-5 rounded border-2 transition-all duration-200",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                value
                  ? "bg-primary border-primary"
                  : "bg-background border-border group-hover:border-primary/50"
              )}
            >
              {value && (
                <svg
                  className="w-full h-full text-primary-foreground p-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-foreground select-none">
            {label}
          </span>
        </label>
      )}
    />
  );
}

export default FormCheckbox;
