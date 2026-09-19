import { forwardRef } from "react";
import clsx from "clsx";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        className={clsx(
          "focus-ring h-11 rounded-xl2 border border-border bg-paper-raised px-4 text-sm text-ink placeholder:text-ink-faint",
          error && "border-red-400",
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
});
