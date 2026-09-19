import clsx from "clsx";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "glass-surface rounded-xl3 p-5 shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
