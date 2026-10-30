import type { ReactNode } from "react";

export type BentoSpan = "square" | "wide" | "tall";

export type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export type BentoTileProps = {
  span?: BentoSpan;
  children: ReactNode;
  className?: string;
};

const spanClass: Record<BentoSpan, string> = {
  square: "",
  wide: "col-span-2",
  tall: "row-span-2",
};

/**
 * Dense two-column bento that widens to three and four columns on larger
 * screens. Tiles pack into the first cell that fits, while source order stays
 * the reading and tab order.
 *
 * The row height clears a signal panel's two rails — a 36px tag rail and a 32px
 * footer — with room left for its body. The vertical gap is the horizontal gap
 * plus the panel's lift, so the shadow hangs into the gutter instead of
 * widening it, and both gutters read the same.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={[
        "grid grid-cols-2 gap-x-3 gap-y-[calc(0.75rem+var(--ds-shape-signal-lift))]",
        "grid-flow-dense auto-rows-[minmax(10.5rem,auto)]",
        "md:grid-cols-3 lg:grid-cols-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** One cell of a {@link BentoGrid}. */
export function BentoTile({
  span = "square",
  children,
  className,
}: BentoTileProps) {
  return (
    <div
      className={[spanClass[span], className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
