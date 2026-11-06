export type SkeletonProps = {
  /** Accessible description of what is loading. */
  label?: string;
  /** Narrows the last bar, for tiles whose final line is short. */
  compact?: boolean;
  className?: string;
};

/**
 * Placeholder for a loading {@link SignalPanel}: three muted bars inside the
 * same chamfered silhouette, so the layout does not shift when data lands.
 */
export function Skeleton({
  label = "Loading",
  compact = false,
  className,
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={["relative h-full w-full", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="flex h-full w-full flex-col justify-between px-3.5 pb-3 pt-3.5"
        style={{
          clipPath: "var(--ds-clip-signal)",
          background: "var(--ds-color-background-elevated)",
        }}
      >
        {/* Bars land on the panel's tag rail and footer rail, so nothing shifts
            sideways or vertically when the real tile replaces this one. */}
        <div className="h-1.75 w-18 animate-pulse bg-line-strong/65" />
        <div className="space-y-2">
          <div className="h-2.5 w-full animate-pulse bg-line-strong/50" />
          <div
            className="h-2 animate-pulse bg-line-strong/35"
            style={{ width: compact ? "42%" : "72%" }}
          />
        </div>
      </div>
    </div>
  );
}
