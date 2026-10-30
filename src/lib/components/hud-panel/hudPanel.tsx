import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type HudPanelProps = {
  /** CSS color that drives the panel's edge and its glow. */
  accent: string;
  /** Adds the accent bloom that marks the one featured plate on a surface. */
  glow?: boolean;
  href?: string;
  onClick?: () => void;
  /** Accessible name, required when the panel is interactive. */
  label?: string;
  className?: string;
  children?: ReactNode;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-hud)" };

/**
 * The HUD plate: a strong chamfer on the top-left and bottom-right corners with
 * smaller answering cuts on the other two. Cards and action surfaces share the
 * silhouette so they read as the same piece of hardware.
 *
 * Built as an accent edge with the fill inset a pixel inside it, because a clip
 * path crops a border away. The glow sits on a fourth layer behind everything,
 * since a `box-shadow` would be clipped along with the element that casts it.
 *
 * When interactive, the hit area is a stretched overlay rather than a wrapper,
 * so panel content stays flow-level regardless of which element it uses.
 */
export function HudPanel({
  accent,
  glow = false,
  href,
  onClick,
  label,
  className,
  children,
}: HudPanelProps) {
  const interactive = Boolean(href ?? onClick);
  const style = { "--hud-accent": accent } as CSSProperties;

  return (
    <div className="group relative h-full w-full" style={style}>
      {glow ? (
        <div
          aria-hidden
          className="absolute -inset-0.5 blur-[6px]"
          style={{
            ...clip,
            background:
              "color-mix(in srgb, var(--hud-accent) 22%, transparent)",
          }}
        />
      ) : null}

      <div
        className={[
          "relative h-full w-full transition-transform duration-150",
          interactive
            ? "group-hover:-translate-y-0.5 group-active:translate-y-0"
            : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Accent edge — the inset fill below leaves 1px of it showing. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            ...clip,
            background:
              "color-mix(in srgb, var(--hud-accent) 86%, transparent)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-px"
          style={{
            ...clip,
            background: "var(--ds-color-background-elevated)",
          }}
        />

        {/* Content is clipped so artwork can bleed to the cut edges. */}
        <div
          className="relative z-10 flex h-full w-full flex-col overflow-hidden"
          style={clip}
        >
          {children}
        </div>

        {href ? (
          <Link
            href={href}
            aria-label={label}
            className="absolute inset-0 z-20"
            style={clip}
          />
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="absolute inset-0 z-20"
            style={clip}
          />
        ) : null}
      </div>
    </div>
  );
}
