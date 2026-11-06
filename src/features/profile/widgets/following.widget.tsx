import { sportModules, type Sport } from "@/config/sports";
import { octagonClipPath } from "@/styles";

import {
  EditButton,
  onPanel,
  Panel,
  SPORT_ICONS,
  sportColor,
} from "../components/surfaces";
import type { Team } from "../types";

/** The sports and teams the player follows, one sport chip per group. */
export function FollowingWidget({
  groups,
  onEdit,
}: {
  groups: { sport: Sport; teams: Team[] }[];
  onEdit: () => void;
}) {
  return (
    <Panel
      label="Following"
      delay={0}
      className="flex items-start gap-2.5 px-3.5 pt-3 pb-3.5"
    >
      {groups.length ? (
        <ul className="flex flex-1 flex-wrap gap-2.5">
          {groups.map(({ sport, teams }) => (
            <li key={sport} className="contents">
              <SportChip sport={sport} />
              {teams.map((team) => (
                <TeamChip key={team.id} team={team} />
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex-1 self-center font-sans text-sm text-muted">
          Pick the teams and clubs you follow.
        </p>
      )}
      <EditButton label="Edit clubs and teams" onClick={onEdit} tint="cyan" />
    </Panel>
  );
}

function SportChip({ sport }: { sport: Sport }) {
  const color = sportColor(sport);
  const Icon = SPORT_ICONS[sport];
  return (
    <div
      className="flex min-w-19 items-center gap-1.75 border px-2.25 py-2"
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 58%, transparent)`,
      }}
    >
      <Icon size={20} style={{ color }} />
      <span className="font-display font-black leading-compact">
        <span className="block text-sm">{sportModules[sport].shortLabel}</span>
        <span className="mt-0.5 block text-nano tracking-wide text-muted">
          MODULE
        </span>
      </span>
    </div>
  );
}

function TeamChip({ team }: { team: Team }) {
  return (
    <div
      className="flex min-w-21.5 items-center gap-2 border border-line-strong px-2.25 py-2"
      style={{
        background: onPanel("var(--ds-color-background-secondary)", 56),
      }}
      title={team.name}
    >
      <Crest team={team} />
      <span className="font-display font-black leading-compact">
        <span className="block max-w-14.5 truncate text-sm">{team.code}</span>
        <span className="mt-0.5 block text-nano tracking-wide text-muted">
          {team.league}
        </span>
      </span>
    </div>
  );
}

/** A 30px octagon monogram in the team's colour. */
export function Crest({ team }: { team: Team }) {
  return (
    <span
      aria-hidden
      className="grid size-7.5 shrink-0 place-items-center font-display text-nano font-black"
      style={{
        clipPath: octagonClipPath,
        background: `color-mix(in srgb, ${team.color} 30%, var(--ds-color-background-elevated))`,
        color: team.color,
        boxShadow: `inset 0 0 0 1px ${team.color}`,
      }}
    >
      {team.code.slice(0, 3)}
    </span>
  );
}
