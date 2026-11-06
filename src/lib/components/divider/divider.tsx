import type { ReactNode } from "react";

export type DividerProps = {
  /** Sits centered in a gap in the rule, as in an "OR" split. */
  label?: ReactNode;
  className?: string;
};

/** A hairline rule, optionally broken by a centered label. */
export function Divider({ label, className }: DividerProps) {
  const classes = ["flex items-center", className ?? ""]
    .filter(Boolean)
    .join(" ");

  if (!label) {
    return (
      <hr
        className={["h-px border-0 bg-line-muted", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return (
    <div role="separator" className={`${classes} gap-3`}>
      <span aria-hidden className="h-px flex-1 bg-line-muted" />
      <span className="font-display text-2xs font-black tracking-ultra text-muted">
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-line-muted" />
    </div>
  );
}
