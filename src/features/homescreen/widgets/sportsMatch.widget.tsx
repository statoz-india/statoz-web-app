"use client";

import Link from "next/link";
import {
  useId,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

import type {
  Matches,
  MatchStatus,
  MotorSportMatches,
  Team,
  TournamentSection,
} from "@/core";
import { TrendingRaceWidget } from "@/features/match/widgets/trendingRace.widget";
import { ChevronRightIcon } from "@/lib/icons";

import styles from "../css/sportsMatch.widget.module.css";

/** A league block shows at most this many cards until "View more" is pressed. */
const PREVIEW_COUNT = 3;

/** Badges are smaller where the teams face each other than in a stacked row. */
const BADGE_SIZE = 32;
const STACKED_BADGE_SIZE = 36;

/** These switch to one row per team once under way; football keeps its centred score. */
const STACKED_SPORTS = new Set(["cricket", "basketball"]);

type Lifecycle = "open" | "live" | "finished" | "unresolved" | "voided";

const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  open: "OPEN",
  live: "LIVE",
  finished: "FINISHED",
  unresolved: "UNRESOLVED",
  voided: "VOID",
};

const LIFECYCLE_FOR_STATUS: Record<MatchStatus, Lifecycle> = {
  upcoming: "open",
  live: "live",
  result: "finished",
  canceled: "voided",
  abandoned: "voided",
  no_result: "voided",
  postponed: "unresolved",
  unresolved: "unresolved",
  suspended: "unresolved",
};

/** The top rail's colour for each sport. */
const RAIL: Record<string, string> = {
  football: "var(--ds-color-accent-cyan)",
  cricket: "var(--ds-color-accent-white)",
  basketball: "var(--ds-color-accent-gold)",
};

/** A crest colour for a team the API sent none for. */
const CREST_FALLBACK = "var(--ds-color-border-strong)";

function text(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

/**
 * Whether the live feed's `home` names this team. The feed does not say what
 * it holds, so a name, an abbreviation or an id all count, directly or as a
 * field of an object.
 */
function refersTo(reference: unknown, team: Team): boolean {
  const candidates: unknown[] =
    typeof reference === "object" && reference !== null
      ? ["id", "_id", "name", "displayName", "shortName", "abbreviation"].map(
          (field) => (reference as Record<string, unknown>)[field],
        )
      : [reference];
  const names = [team._id, team.name, team.displayName, team.abbreviation]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  return candidates.some(
    (candidate) =>
      typeof candidate === "string" &&
      names.includes(candidate.trim().toLowerCase()),
  );
}

/** Team A's score, then team B's, whichever side of the feed each is on. */
function scoresOf(match: Matches): [string | undefined, string | undefined] {
  const event = match.matchEvent;
  if (!event) return [undefined, undefined];
  const home = text(event.homeTeamScore);
  const away = text(event.awayTeamScore);
  const teamAIsAway =
    refersTo(event.home, match.teamB) && !refersTo(event.home, match.teamA);
  return teamAIsAway ? [away, home] : [home, away];
}

/** The corner glow: red while live, the winner's colour once finished. */
function accentOf(
  match: Matches,
  lifecycle: Lifecycle,
  scores: [string | undefined, string | undefined],
): string {
  if (lifecycle === "live") return "var(--ds-color-danger)";
  if (lifecycle !== "finished") return "var(--ds-color-border-default)";
  // Only a plain goal or point count names a winner; cricket scores do not.
  const [a, b] = scores.map((score) =>
    score !== undefined && /^\d+$/.test(score) ? Number(score) : undefined,
  );
  if (a === undefined || b === undefined || a === b) {
    return "var(--ds-color-border-default)";
  }
  return (a > b ? match.teamA : match.teamB).primaryColor || CREST_FALLBACK;
}

/*
 * The kickoff is shown in the visitor's own time zone. The server does not
 * know it, so the zone is `null` there and while hydrating, and the time reads
 * "—" until the browser fills it in.
 */
const noZoneUpdates = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const noZone = () => null;

function kickoffClock(iso: string, timeZone: string | null): string {
  if (timeZone === null) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
}

const teamName = (team: Team) => team.displayName || team.name;

/** A stacked row's score: the big figure, the overs under it, and whether it holds no runs. */
type ScoreText = { value: string; detail?: string; muted?: boolean };

/** "164/6 (17.2 ov)" reads as 164/6 with "(17.2 ov)" under it; other sports show the figure as is. */
function scoreText(raw: string | undefined, cricket: boolean): ScoreText {
  if (!raw) return { value: "—" };
  if (!cricket) return { value: raw };
  const cut = raw.indexOf("(");
  const value = (cut < 0 ? raw : raw.slice(0, cut)).trim();
  return {
    value,
    detail: cut < 0 ? undefined : raw.slice(cut),
    // Text such as "Yet to bat" has no runs to show large.
    muted: !/[0-9—]/.test(value),
  };
}

/** A race has no teams, so it gets the race card instead of the match card. */
const isRace = (
  match: Matches | MotorSportMatches,
): match is MotorSportMatches => match.gameType === "racing";

/** An octagon crest: the team's colour, a stripe of its second colour, and its code. */
function TeamBadge({ team, size = BADGE_SIZE }: { team: Team; size?: number }) {
  const name = teamName(team);
  const code = team.abbreviation || name.slice(0, 3).toUpperCase();
  const style = {
    width: size,
    height: size,
    "--primary": team.primaryColor || CREST_FALLBACK,
    "--secondary": team.secondaryColor || team.primaryColor || CREST_FALLBACK,
    "--ink": team.textColor || "var(--ds-color-text-default)",
    "--lift": `${Math.max(3, Math.round(size * 0.11))}px`,
    // Longer codes get a smaller size so they still fit the face.
    "--code-size": `${Math.max(8, Math.round(size * (code.length > 3 ? 0.2 : 0.24)))}px`,
  } as CSSProperties;

  return (
    <span className={styles.badge} style={style} role="img" aria-label={name}>
      <span className={styles.badgeShadow} aria-hidden />
      <span className={styles.badgeFace} aria-hidden>
        {code}
      </span>
    </span>
  );
}

/**
 * One fixture. Before it starts, the teams face each other with the kickoff
 * between them. Once under way, football keeps that layout with the score in
 * the middle, while cricket and basketball list one row per team with its
 * score on the right.
 */
function MatchCard({ match }: { match: Matches }) {
  const zone = useSyncExternalStore(noZoneUpdates, browserZone, noZone);

  // A later day's fixtures come without a status; they are all still to start.
  const lifecycle = LIFECYCLE_FOR_STATUS[match.matchStatus ?? "upcoming"];
  const scores: [string | undefined, string | undefined] =
    lifecycle === "open" ? [undefined, undefined] : scoresOf(match);
  const sport = match.gameType.toLowerCase();
  const rail = RAIL[sport];
  const stacked = lifecycle !== "open" && STACKED_SPORTS.has(sport);

  return (
    <Link
      href={`/match/${encodeURIComponent(match.matchId)}`}
      className={styles.card}
      style={
        {
          ...(rail && { "--rail": rail }),
          "--accent": accentOf(match, lifecycle, scores),
        } as CSSProperties
      }
    >
      <span className={styles.etch} aria-hidden>
        <span className={styles.rail} />
      </span>
      <div className={styles.status}>
        <span className={styles.tag} data-status={lifecycle}>
          {LIFECYCLE_LABEL[lifecycle]}
        </span>
      </div>
      {stacked ? (
        <div className={styles.rows}>
          {[match.teamA, match.teamB].map((team, index) => {
            const score = scoreText(scores[index], sport === "cricket");
            return (
              <div className={styles.row} key={team._id}>
                <TeamBadge team={team} size={STACKED_BADGE_SIZE} />
                <span className={styles.name}>{teamName(team)}</span>
                <span
                  className={score.muted ? styles.mutedScore : styles.rowScore}
                >
                  {score.value}
                </span>
                {score.detail && (
                  <span className={styles.detail}>{score.detail}</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.team}>
            <TeamBadge team={match.teamA} />
            <span className={styles.name}>{teamName(match.teamA)}</span>
          </div>
          {lifecycle === "open" ? (
            <time dateTime={match.matchStartTime} className={styles.kickoff}>
              {kickoffClock(match.matchStartTime, zone) || "—"}
            </time>
          ) : (
            <span className={styles.score}>
              {`${scores[0] ?? "—"} : ${scores[1] ?? "—"}`}
            </span>
          )}
          <div className={styles.team} data-side="away">
            <TeamBadge team={match.teamB} />
            <span className={styles.name}>{teamName(match.teamB)}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

export type SportsMatchWidgetProps = {
  /** One tournament's fixtures (or races) for a day, from `getMatches`, already in order. */
  section: TournamentSection;
};

/**
 * A league's block on a sport's match feed: the league code linking to its
 * standings, up to three match cards, and "View more", which lists the rest
 * in the same grid.
 */
export function SportsMatchWidget({ section }: SportsMatchWidgetProps) {
  // League codes can hold spaces, which an id cannot.
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);
  if (section.matches.length === 0) return null;

  const league = section.tournament;
  const leagueName = section.tournamentData?.tournamentName || league;
  const shown = expanded
    ? section.matches
    : section.matches.slice(0, PREVIEW_COUNT);
  const hidden = section.matches.length - shown.length;

  return (
    <section
      aria-labelledby={headingId}
      className={styles.section}
      style={
        {
          ...(section.tournamentData?.primaryColor && {
            "--league": section.tournamentData.primaryColor,
          }),
        } as CSSProperties
      }
    >
      <div className={styles.header}>
        <h3 id={headingId} className={styles.code}>
          {league}
        </h3>
        <span aria-hidden className={styles.line} />
      </div>
      <ul className={styles.grid}>
        {shown.map((match) => (
          <li key={match._id}>
            {isRace(match) ? (
              <TrendingRaceWidget race={match} />
            ) : (
              <MatchCard match={match} />
            )}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={styles.more}
          aria-label={`View ${hidden} more ${leagueName} games`}
        >
          VIEW MORE <ChevronRightIcon size={14} aria-hidden />
        </button>
      )}
    </section>
  );
}
