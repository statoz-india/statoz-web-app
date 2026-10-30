import { withAlpha } from "@/styles";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type ButtonVariant = "solid" | "tonal" | "surface" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: ReactNode;
  /**
   * `solid` fills with the accent, `tonal` tints a dark plate with it,
   * `surface` is the neutral plate used for third-party sign-in, and `ghost`
   * drops the plate entirely.
   */
  variant?: ButtonVariant;
  /** CSS color driving the fill, edge, and label. */
  accent?: string;
  /** Blooms the accent behind the plate. For the one focal action on a screen. */
  glow?: boolean;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Renders a link that looks like a button. */
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Shows a spinner in place of the trailing icon and blocks input. */
  pending?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Accessible name, when the label alone does not read as one. */
  label?: string;
  className?: string;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-field)" };

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 px-3.5 ds-type-control-small",
  md: "h-11 gap-2.5 px-4 ds-type-control",
  lg: "h-13 gap-3 px-5 ds-type-control-large",
};

/** The plate colors each variant paints: an edge, an inset fill, and a label. */
function surfacesFor(variant: ButtonVariant, accent: string) {
  switch (variant) {
    case "solid":
      return {
        edge: accent,
        fill: accent,
        color: "var(--ds-color-text-inverse)",
      };
    case "tonal":
      return {
        edge: withAlpha(accent, 0.5),
        fill: `color-mix(in srgb, ${accent} 15%, var(--ds-color-background-secondary))`,
        color: "var(--ds-color-text-default)",
      };
    case "surface":
      return {
        edge: "var(--ds-color-border-default)",
        fill: "var(--ds-color-background-elevated)",
        color: "var(--ds-color-text-default)",
      };
    case "ghost":
      return { edge: "transparent", fill: "transparent", color: accent };
  }
}

/**
 * The system's chamfered action plate. Built as an edge layer with the fill
 * inset a pixel inside it, because a clip path crops a border away.
 */
export function Button({
  children,
  variant = "solid",
  accent = "var(--ds-color-accent-cyan)",
  glow = false,
  size = "md",
  fullWidth = false,
  href,
  onClick,
  type = "button",
  disabled = false,
  pending = false,
  leadingIcon,
  trailingIcon,
  label,
  className,
}: ButtonProps) {
  const { edge, fill, color } = surfacesFor(variant, accent);
  const blocked = disabled || pending;

  const chrome = [
    "relative inline-flex items-center justify-center tracking-label",
    "transition-[transform,filter] duration-150 hover:-translate-y-px hover:brightness-110 active:translate-y-0",
    // A clip path crops anything layered behind the plate, so the bloom is a
    // drop-shadow — applied after clipping, it traces the chamfered silhouette.
    glow ? "drop-shadow-[0_0_12px_var(--button-glow)]" : "",
    sizes[size],
    fullWidth ? "w-full" : "",
    blocked ? "pointer-events-none opacity-55" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-px"
        style={{ ...clip, background: fill }}
      />
      {leadingIcon ? (
        <span aria-hidden className="relative grid shrink-0 place-items-center">
          {leadingIcon}
        </span>
      ) : null}
      <span className="relative truncate">{children}</span>
      {pending ? (
        <span
          aria-hidden
          className="relative size-3.5 shrink-0 animate-spin rounded-pill border-2 border-current border-t-transparent"
        />
      ) : trailingIcon ? (
        <span aria-hidden className="relative grid shrink-0 place-items-center">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  const style: CSSProperties = {
    ...clip,
    background: edge,
    color,
    ...(glow ? { "--button-glow": withAlpha(accent, 0.5) } : {}),
  } as CSSProperties;

  if (href) {
    return (
      <Link href={href} aria-label={label} className={chrome} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={blocked}
      aria-label={label}
      aria-busy={pending || undefined}
      className={chrome}
      style={style}
    >
      {content}
    </button>
  );
}
