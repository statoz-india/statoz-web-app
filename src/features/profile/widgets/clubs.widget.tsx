import type { ReactNode } from "react";

import { sportModules, type Sport } from "@/config/sports";
import type { SignupTournament } from "@/core";
import { CheckBoxBlankIcon, CheckBoxIcon, CheckIcon } from "@/lib/icons";
import { accentVar, octagonClipPath, withAlpha } from "@/styles";

import { SPORT_ICONS, sportColor } from "../components/surfaces";
import type { Team } from "../types";

/** A square sport switch; the chosen one gets a thick edge and a glow. */
export function SportButton({
  sport,
  selected,
  onClick,
}: {
  sport: Sport;
  selected: boolean;
  onClick: () => void;
}) {
  const color = sportColor(sport);
  const Icon = SPORT_ICONS[sport];
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={sportModules[sport].label}
      title={sportModules[sport].label}
      onClick={onClick}
      className={`grid h-12 w-14 shrink-0 place-items-center transition-[border-color,background-color,box-shadow] duration-150 ${selected ? "border-2 bg-surface" : "border bg-surface/78"}`}
      style={{
        borderColor: withAlpha(color, selected ? 0.95 : 0.48),
        boxShadow: selected
          ? `0 0 12px -3px ${withAlpha(color, 0.14)}`
          : undefined,
      }}
    >
      <Icon
        size={22}
        className={`transition-transform duration-150 ${selected ? "scale-110" : ""}`}
        style={{ color: selected ? color : withAlpha(color, 0.62) }}
      />
    </button>
  );
}

/**
 * A league: the card shows its clubs, the box follows it. The highlight is
 * cyan until the league is followed, then lime.
 */
export function LeagueCard({
  league,
  showing,
  followed,
  onShow,
  onFollow,
}: {
  league: SignupTournament;
  showing: boolean;
  followed: boolean;
  onShow: () => void;
  onFollow: () => void;
}) {
  const highlight = accent(followed);
  return (
    <div
      className={`relative h-23 w-26.5 shrink-0 transition-colors duration-150 ${showing ? "border-[1.5px] bg-surface" : "border border-line-subtle bg-surface/64"}`}
      style={showing ? { borderColor: highlight } : undefined}
    >
      <button
        type="button"
        aria-pressed={showing}
        onClick={onShow}
        className="flex size-full flex-col p-2 text-left"
      >
        <span
          className={`pr-6 font-display text-sm font-black leading-tight ${showing ? "" : "text-muted"}`}
          style={showing ? { color: highlight } : undefined}
        >
          {league.tournament}
        </span>
        <span className="mt-auto line-clamp-2 font-display text-2xs font-extrabold leading-tight tracking-tight text-muted uppercase">
          {league.tournamentName}
        </span>
      </button>
      <button
        type="button"
        role="checkbox"
        aria-checked={followed}
        aria-label={`Follow ${league.tournamentName}`}
        onClick={onFollow}
        className="absolute top-1.5 right-1.5 grid size-6 place-items-center transition-opacity duration-150 hover:opacity-75"
        style={{ color: highlight }}
      >
        {followed ? <CheckBoxIcon size={18} /> : <CheckBoxBlankIcon size={18} />}
      </button>
    </div>
  );
}

/**
 * A club to pick; tiles of a league that isn't followed sit dimmer. `badge`
 * replaces the club's crest.
 */
export function ClubTile({
  team,
  selected,
  dim,
  badge,
  onClick,
}: {
  team: Team;
  selected: boolean;
  dim: boolean;
  badge?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative flex aspect-[0.92] w-full flex-col items-center justify-center gap-1.75 px-1.5 py-2 transition-[transform,border-color,background-color,box-shadow] duration-150 hover:-translate-y-px active:translate-y-0 motion-reduce:transform-none ${selected ? "border-2 border-lime bg-surface text-foreground" : `border border-line-subtle text-muted hover:border-line-strong ${dim ? "bg-surface/58" : "bg-surface"}`}`}
      style={{
        boxShadow: selected
          ? `0 0 14px -2px ${withAlpha(accent(true), 0.18)}`
          : undefined,
      }}
    >
      {selected ? (
        <span
          aria-hidden
          className="absolute top-0 left-0 grid size-5 place-items-center bg-lime text-inverse"
        >
          <CheckIcon size={13} />
        </span>
      ) : null}
      {badge ?? <ClubCrest team={team} />}
      <span className="w-full truncate text-center font-display text-2xs font-extrabold tracking-tight uppercase">
        {team.name}
      </span>
    </button>
  );
}

/** A 40px octagon monogram in the club's colour. */
function ClubCrest({ team }: { team: Team }) {
  return (
    <span
      aria-hidden
      className={`grid size-10 shrink-0 place-items-center font-display font-black ${team.code.length > 2 ? "text-2xs" : "text-md"}`}
      style={{
        clipPath: octagonClipPath,
        background: `color-mix(in srgb, ${team.color} 22%, var(--ds-color-background-primary))`,
        color: team.color,
      }}
    >
      {team.code}
    </span>
  );
}

const accent = (followed: boolean) => accentVar(followed ? "lime" : "cyan");
