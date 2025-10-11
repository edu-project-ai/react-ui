import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormPasswordInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: Path<TFieldValues>;
  label?: string;
  control: Control<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
}

function FormPasswordInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  placeholder = "Enter your password",
  control,
  rules,
  className,
  ...rest
}: FormPasswordInputProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);

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
            <div className="relative">
              <input
                {...field}
                {...rest}
                id={name}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className={cn(
                  "w-full px-4 py-3 pr-12 rounded-lg border bg-background text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  error
                    ? "border-destructive focus:ring-destructive"
                    : "border-border hover:border-primary/50",
                  className
                )}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
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

export default FormPasswordInput;
