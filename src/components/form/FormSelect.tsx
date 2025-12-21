import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: Path<TFieldValues>;
  label?: string;
  control: Control<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  options: SelectOption[];
}

function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  control,
  rules,
  options,
  className,
  ...rest
}: FormSelectProps<TFieldValues>) {
  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <>
            <select
              {...field}
              {...rest}
              id={name}
              className={cn(
                "w-full px-4 py-3 rounded-lg border bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "cursor-pointer appearance-none",
                error
                  ? "border-destructive focus:ring-destructive"
                  : "border-border hover:border-primary/50",
                className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p
                id={`${name}-error`}
                className="text-destructive text-xs mt-1.5 flex items-center gap-1"
                role="alert"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}

export default FormSelect;
