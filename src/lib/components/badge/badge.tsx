import type { CSSProperties, ReactNode } from "react";

export type BadgeProps = {
  children: ReactNode;
  /** CSS color for the label, dot, and edge. */
  accent: string;
  /**
   * `bare` is a plain accent label; `outlined` adds a boxed edge and a status
   * dot. Only one badge on a surface should be outlined.
   */
  variant?: "bare" | "outlined";
  /** Slowly pulses the outlined badge to mark genuinely live data. */
  pulse?: boolean;
  className?: string;
};

/** Compact status label — the tag on a signal panel, or a LIVE marker. */
export function Badge({
  children,
  accent,
  variant = "bare",
  pulse = false,
  className,
}: BadgeProps) {
  const style = { "--badge-accent": accent } as CSSProperties;

  if (variant === "bare") {
    return (
      <span
        style={{ ...style, color: accent }}
        className={[
          "font-display text-2xs font-extrabold tracking-wide",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      style={{
        ...style,
        color: accent,
        background: "color-mix(in srgb, var(--badge-accent) 12%, transparent)",
        borderColor: "color-mix(in srgb, var(--badge-accent) 62%, transparent)",
        boxShadow:
          "0 0 8px -4px color-mix(in srgb, var(--badge-accent) 20%, transparent)",
      }}
      className={[
        "inline-flex items-center gap-1.25 border px-1.75 py-1 font-display text-2xs font-extrabold tracking-label",
        pulse ? "animate-pulse" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className="size-1.25 rounded-pill"
        style={{ background: accent }}
      />
      {children}
    </span>
  );
}
