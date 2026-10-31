"use client";

import Link from "next/link";
import {
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
} from "react";

import type { Matches, MatchStatus, Team, TrendingFixture } from "@/core";
import { BasketballIcon, CricketIcon, FootballIcon } from "@/lib/icons";

import { TeamBadge } from "../components/team-badge";
import type { SportTeam } from "../types";
import styles from "./trendingMatch.widget.module.css";

type Lifecycle = "scheduled" | "live" | "finished" | "unresolved" | "voided";

const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  scheduled: "OPEN",
  live: "LIVE",
  finished: "FINISHED",
  unresolved: "UNRESOLVED",
  voided: "VOID",
};

const LIFECYCLE_FOR_STATUS: Record<MatchStatus, Lifecycle> = {
  upcoming: "scheduled",
  live: "live",
  result: "finished",
  canceled: "voided",
  abandoned: "voided",
  no_result: "voided",
  postponed: "unresolved",
  unresolved: "unresolved",
  suspended: "unresolved",
};

type SportLook = {
  accent: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

/**
 * A fixture from a day's list, or one from a trending list, which has no
 * banner or volumes and sometimes no status.
 */
type Fixture = Matches | TrendingFixture;

const SPORTS: Record<string, SportLook> = {
  football: { accent: "var(--ds-color-accent-cyan)", icon: FootballIcon },
  cricket: { accent: "var(--ds-color-accent-white)", icon: CricketIcon },
  basketball: { accent: "var(--ds-color-accent-gold)", icon: BasketballIcon },
};

/** A crest colour for a team the API sent none for. */
const CREST_FALLBACK = "var(--ds-color-border-strong)";

function toSportTeam(team: Team): SportTeam {
  const name = team.displayName || team.name;
  return {
    id: team._id,
    name,
    shortName: team.abbreviation || name.slice(0, 3).toUpperCase(),
    color: team.primaryColor || CREST_FALLBACK,
    secondaryColor: team.secondaryColor || undefined,
    badgeTextColor: team.textColor || undefined,
  };
}

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
function scoresOf(match: Fixture): [string | undefined, string | undefined] {
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
  match: Fixture,
  lifecycle: Lifecycle,
  sport: string,
  scores: [string | undefined, string | undefined],
  followed: boolean,
): string {
  if (lifecycle === "live") return "var(--ds-color-danger)";
  if (lifecycle === "finished") {
    // Only a plain goal or point count names a winner; cricket scores do not.
    const [a, b] = scores.map((score) =>
      score !== undefined && /^\d+$/.test(score) ? Number(score) : undefined,
    );
    if (
      (sport === "football" || sport === "basketball") &&
      a !== undefined &&
      b !== undefined &&
      a !== b
    ) {
      return (a > b ? match.teamA : match.teamB).primaryColor;
    }
    return "var(--ds-color-border-default)";
  }
  return followed
    ? "var(--ds-color-accent-cyan)"
    : "var(--ds-color-border-default)";
}

/*
 * The kickoff clock is shown in the visitor's own time zone. The server does
 * not know it, so it renders UTC and the browser corrects it after hydrating.
 */
const noZoneUpdates = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverZone = () => "UTC";

function kickoffClock(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
}

/** "Sat 1 Nov", in the same time zone as the clock. */
function kickoffDate(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone,
    })
    .replace(",", "");
}

const show = (score: string | undefined) => score ?? "—";

export type TrendingMatchWidgetProps = {
  match: Fixture;
  /** Stacked team rows with smaller crests. */
  compact?: boolean;
  /** Tints a scheduled match's corner cyan. */
  followed?: boolean;
  /** Shows the sport icon and the competition label. */
  showCompetition?: boolean;
};

/** A team match as one linked plate: status, both teams, and the score or kickoff. */
export function TrendingMatchWidget({
  match,
  compact = false,
  followed = false,
  showCompetition = true,
}: TrendingMatchWidgetProps) {
  const zone = useSyncExternalStore(noZoneUpdates, browserZone, serverZone);

  const sport = match.gameType.toLowerCase();
  const look = SPORTS[sport];
  const Icon = look?.icon;
  // A trending fixture sent without a status has, so far, always been one yet to start.
  const lifecycle = LIFECYCLE_FOR_STATUS[match.matchStatus ?? "upcoming"];
  const upcoming = lifecycle === "scheduled";
  const scores: [string | undefined, string | undefined] = upcoming
    ? [undefined, undefined]
    : scoresOf(match);
  const home = toSportTeam(match.teamA);
  const away = toSportTeam(match.teamB);
  const stacked =
    !upcoming && (compact || sport === "cricket" || sport === "basketball");
  const resultLine = text(match.matchEvent?.summary);
  const label = LIFECYCLE_LABEL[lifecycle];

  const kickoff = (
    <time dateTime={match.matchStartTime} className={styles.kickoff}>
      <span>{kickoffClock(match.matchStartTime, zone) || "—"}</span>
      <span className={styles.kickoffDate}>
        {kickoffDate(match.matchStartTime, zone)}
      </span>
    </time>
  );

  return (
    <Link
      href={`/match/${encodeURIComponent(match.matchId)}`}
      className={[styles.plate, compact ? styles.compact : ""]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--sport-accent": look?.accent ?? "var(--ds-color-accent-cyan)",
          "--match-accent": accentOf(match, lifecycle, sport, scores, followed),
        } as CSSProperties
      }
      data-sport={sport}
    >
      <span className={styles.chrome} aria-hidden>
        <span className={styles.rail} />
      </span>

      <div
        className={styles.status}
        data-markerless={!showCompetition || undefined}
      >
        {showCompetition && (
          <span className={styles.marker}>
            {Icon && <Icon size={16} aria-hidden />}
            <span>{match.tournament}</span>
          </span>
        )}
        <span className={styles.tag} data-status={lifecycle}>
          {label}
        </span>
        <span className={styles.tagSlot} aria-hidden>
          {label}
        </span>
      </div>

      {stacked ? (
        <div className={styles.scoreRows}>
          {[home, away].map((team, index) => {
            const score = scores[index];
            // A cricket score carries its overs in brackets: "182/4 (20)".
            const bracket =
              sport === "cricket" && score ? score.indexOf("(") : -1;
            return (
              <div className={styles.teamRow} key={team.id}>
                <TeamBadge team={team} size={compact ? 28 : 36} />
                <span className={styles.name}>{team.name}</span>
                <span
                  className={
                    sport === "cricket" && !/[0-9—]/.test(show(score))
                      ? styles.answer
                      : styles.score
                  }
                >
                  {bracket >= 0
                    ? score!.slice(0, bracket).trim()
                    : show(score)}
                </span>
                {bracket >= 0 && (
                  <span className={styles.inningsContext}>
                    {score!.slice(bracket)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.mirrored}>
          <div className={styles.identity} data-side="home">
            <TeamBadge team={home} size={32} />
            <span className={styles.name}>{home.name}</span>
          </div>
          {upcoming ? (
            kickoff
          ) : (
            <span className={styles.score}>
              {`${show(scores[0])} : ${show(scores[1])}`}
            </span>
          )}
          <div className={styles.identity} data-side="away">
            <TeamBadge team={away} size={32} />
            <span className={styles.name}>{away.name}</span>
          </div>
        </div>
      )}

      {resultLine && sport !== "football" && (
        <p className={styles.answer}>{resultLine}</p>
      )}
    </Link>
  );
}
