import type { ReactNode } from "react";

import { formatOzCompact } from "@/utils";

export type TileFooterProps = {
  /** What the tile is worth, or what state it is in. */
  status: string;
  /** CSS color for the status line. */
  accent: string;
  /** Glyph set before the status, sized to the 10px label. */
  icon?: ReactNode;
  /** Traded volume, rendered on the right. Omitted when a tile has none. */
  volumeOz?: number;
};

/**
 * The bottom rail shared by every trending tile: the stake on the left, the
 * market's volume on the right. Every kind carries one, so a row of tiles ends
 * on a single baseline instead of each kind stopping wherever its content did.
 */
export function TileFooter({
  status,
  accent,
  icon,
  volumeOz,
}: TileFooterProps) {
  return (
    <>
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span
        className="ds-tabular min-w-0 flex-1 truncate font-display text-2xs font-extrabold tracking-wide"
        style={{ color: accent }}
      >
        {status}
      </span>
      {volumeOz !== undefined ? (
        <span className="ds-tabular shrink-0 font-display text-2xs font-extrabold tracking-wide text-muted">
          VOL {formatOzCompact(volumeOz)} OZ
        </span>
      ) : null}
    </>
  );
}
