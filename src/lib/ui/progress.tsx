export type ProgressProps = {
  /** Fill fraction, 0..1. */
  value: number;
  /** CSS color for the fill and its glow. */
  accent: string;
  /** Accessible name for the measurement. */
  label: string;
  height?: number;
  className?: string;
};

/** Thin accent meter used for probabilities and completion. */
export function Progress({
  value,
  accent,
  label,
  height = 4,
  className,
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 1);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={[
        "w-full overflow-hidden rounded-sm bg-background/70",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ height }}
    >
      <div
        className="h-full rounded-sm transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped * 100}%`,
          background: accent,
          boxShadow: `0 0 6px -1px color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      />
    </div>
  );
}
