"use client";

import clsx from "clsx";

export interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
  label: string; // for screen readers
}

export function CheckCircle({ checked, onToggle, label }: CheckCircleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={clsx(
        "focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        checked ? "border-accent bg-accent" : "border-border bg-transparent hover:border-accent",
      )}
    >
      {checked ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-paper" strokeWidth={2}>
          <path d="M3 8.5L6.2 11.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}
