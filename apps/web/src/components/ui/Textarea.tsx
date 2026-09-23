import { forwardRef } from "react";
import clsx from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={fieldId}
        className={clsx(
          "focus-ring min-h-[6rem] resize-y rounded-xl2 border border-border bg-paper-raised px-4 py-3 text-sm text-ink placeholder:text-ink-faint",
          error && "border-red-400",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
});
