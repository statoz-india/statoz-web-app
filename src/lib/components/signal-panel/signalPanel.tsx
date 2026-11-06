import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type SignalPanelProps = {
  /** CSS color that drives the panel's edge, hairline, wash, and lift. */
  accent: string;
  /** Opt-in medium slate treatment; the original accent wash remains default. */
  appearance?: "accented" | "balanced";
  /** Small label pinned to the left of the panel's top rail. */
  tag?: ReactNode;
  /** Sits opposite the tag on the top rail — a clock, a count, a status. */
  meta?: ReactNode;
  /** Fills the bottom rail: the panel's stakes, volume, or state line. */
  footer?: ReactNode;
  /** Applies the standard content inset. Off for panels that centre their own. */
  pad?: boolean;
  /** Casts the accent-tinted shadow that makes the panel sit above the page. */
  lifted?: boolean;
  href?: string;
  onClick?: () => void;
  /** Accessible name, required when the panel is interactive. */
  label?: string;
  className?: string;
  children?: ReactNode;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-signal)" };

/** The single horizontal inset every rail and the body share. */
const RAIL_INSET = "px-3.5";

/**
 * The signature StatOz surface: a chamfered plate with a notched top-right
 * edge, an accent hairline across the top, and an accent shadow beneath.
 *
 * Built from stacked layers that share one clip path — a lift, an accent edge,
 * and the fill — so the cut corners stay crisp at any size. The content column
 * carries the clip too, because the bottom rail paints an opaque background of
 * its own and would otherwise square the panel off at exactly the corners the
 * silhouette cuts.
 *
 * The accent edge is drawn one pixel *outside* the fill rather than under it.
 * The app strokes the silhouette rather than insetting a fill, and keeping the
 * ring outside is what makes that faithful: no rail, badge, or meter background
 * can reach it, so the edge stays unbroken the whole way round the shape.
 *
 * Content sits in three regions: a fixed top rail carrying the tag, a flexible
 * body, and an optional bottom rail. The rails are structural rather than
 * absolutely positioned, so panels never have to guess how much padding clears
 * the tag, and every panel in a grid ends on the same baseline.
 *
 * When interactive, the hit area is a stretched overlay rather than a wrapper,
 * so panel content stays flow-level regardless of which element it uses. The
 * overlay is clipped, which would swallow a focus outline — so the focus ring
 * is drawn by the panel's own layers instead.
 */
export function SignalPanel({
  accent,
  appearance = "accented",
  tag,
  meta,
  footer,
  pad = true,
  lifted = true,
  href,
  onClick,
  label,
  className,
  children,
}: SignalPanelProps) {
  const interactive = Boolean(href ?? onClick);
  const balanced = appearance === "balanced";
  const style = {
    "--panel-accent": accent,
    "--panel-edge": `color-mix(in srgb, ${accent} ${balanced ? 45 : 55}%, transparent)`,
    "--panel-edge-hover": `color-mix(in srgb, ${accent} ${balanced ? 60 : 74}%, transparent)`,
    "--panel-lift": `color-mix(in srgb, ${accent} ${balanced ? 16 : 22}%, transparent)`,
    "--panel-surface": balanced
      ? "var(--ds-gradient-trending-card)"
      : `color-mix(in srgb, ${accent} 8%, var(--ds-color-background-elevated))`,
    "--panel-top-line": `color-mix(in srgb, ${accent} ${balanced ? 65 : 80}%, transparent)`,
    "--panel-footer-border": `1px solid color-mix(in srgb, ${accent} 16%, transparent)`,
    "--panel-footer-background": balanced
      ? "var(--ds-color-fixture-strip)"
      : `color-mix(in srgb, ${accent} 7%, var(--ds-color-background-muted))`,
    "--panel-footer-height": balanced ? "38px" : "32px",
  } as CSSProperties;

  return (
    <div className="group relative h-full w-full" style={style}>
      {lifted ? (
        <div
          aria-hidden
          className="absolute -inset-px translate-y-(--ds-shape-signal-lift)"
          style={{
            ...clip,
            background: "var(--panel-lift)",
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
        {/* Accent edge — a 1px ring standing one pixel proud of the fill, so
            nothing painted inside the panel can break it. It brightens on hover
            and goes solid under keyboard focus. Background comes from classes,
            not inline style, so the variants can win. */}
        <div
          aria-hidden
          className={[
            "absolute -inset-px transition-[background-color] duration-150",
            "bg-(--panel-edge)",
            interactive
              ? "group-hover:bg-(--panel-edge-hover) group-has-focus-visible:bg-(--panel-accent)"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={clip}
        />
        {/* The fill pulls back to 3px under keyboard focus, widening the edge
            into a ring that follows the chamfer exactly — the clip path would
            have cut away a real outline. */}
        <div
          aria-hidden
          className={[
            "absolute inset-0",
            interactive ? "group-has-focus-visible:inset-0.75" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            ...clip,
            background: "var(--panel-surface)",
          }}
        />
        {/* The one bright line on the panel. It stops where the notch steps in
            — a pixel further and it would hang off the cut edge, since it sits
            outside the clipped content column. */}
        <div
          aria-hidden
          className="absolute top-0 h-0.5 left-(--ds-shape-signal-cut) right-[calc(var(--ds-shape-signal-notch)+var(--ds-shape-signal-step))]"
          style={{
            background: "var(--panel-top-line)",
          }}
        />

        <div className="relative z-10 flex h-full w-full flex-col" style={clip}>
          {tag || meta ? (
            <div
              className={`flex h-9 shrink-0 items-center justify-between gap-2 ${RAIL_INSET}`}
            >
              <span className="flex min-w-0 items-center">{tag}</span>
              {meta ? (
                <span className="flex shrink-0 items-center">{meta}</span>
              ) : null}
            </div>
          ) : null}

          <div
            className={[
              "flex min-h-0 flex-1 flex-col",
              // One rhythm for every panel: 8px between the body's regions.
              pad ? `gap-2 ${RAIL_INSET} pb-2` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={`flex shrink-0 items-center gap-2 ${RAIL_INSET}`}
              style={{
                height: "var(--panel-footer-height)",
                borderTop: "var(--panel-footer-border)",
                background: "var(--panel-footer-background)",
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            aria-label={label}
            className="absolute inset-0 z-20 outline-none"
            style={clip}
          />
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="absolute inset-0 z-20 outline-none"
            style={clip}
          />
        ) : null}
      </div>
    </div>
  );
}
