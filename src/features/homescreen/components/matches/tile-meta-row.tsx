import { sportModuleFor, type Sport } from "@/config/sports";
import { accentVar } from "@/utils";

import { SportIcon } from "../sport-icon";

export type TileMetaRowProps = {
  /** Left out for a market the API does not tie to a sport. */
  sport?: Sport;
  leagueLabel: string;
  /** Names the sport before the league. Wide tiles have the room; squares don't. */
  showSportLabel?: boolean;
};

/**
 * The line every trending tile opens with: what sport this is, then which
 * competition. The sport accent colours the glyph and its label; the league
 * stays muted, so the accent means "sport" on every tile rather than shifting
 * to mean "tile kind" on some of them.
 */
export function TileMetaRow({
  sport,
  leagueLabel,
  showSportLabel = false,
}: TileMetaRowProps) {
  const sportModule = sport ? sportModuleFor(sport) : null;
  const sportAccent = sportModule ? accentVar(sportModule.accent) : undefined;

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {sportModule ? (
        <SportIcon
          sport={sportModule.sport}
          size={13}
          className="shrink-0"
          style={{ color: sportAccent }}
        />
      ) : null}
      {sportModule && showSportLabel ? (
        <>
          <span
            className="shrink-0 font-display text-2xs font-extrabold tracking-wide"
            style={{ color: sportAccent }}
          >
            {sportModule.shortLabel}
          </span>
          <span aria-hidden className="h-2.25 w-px shrink-0 bg-line-strong" />
        </>
      ) : null}
      <span className="min-w-0 truncate font-display text-2xs font-extrabold tracking-wide text-muted">
        {leagueLabel}
      </span>
    </div>
  );
}
