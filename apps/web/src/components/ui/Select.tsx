import { forwardRef } from "react";
import clsx from "clsx";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <select
        ref={ref}
        id={fieldId}
        className={clsx(
          "focus-ring h-11 rounded-xl2 border border-border bg-paper-raised px-4 text-sm text-ink",
          error && "border-red-400",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
});
