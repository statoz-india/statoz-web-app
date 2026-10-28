import Link from "next/link";
import type { CSSProperties } from "react";

import {
  formatKickoffDate,
  formatKickoffTime,
  formatOzCompact,
  toISTDate,
} from "@/utils";

import type { SportFixture, SportTeam } from "../../types";
import styles from "./sport-fixture-card.module.css";
import { TeamBadge } from "./team-badge";

export type SportFixtureCardProps = {
  match: SportFixture;
  /** Keeps feed cards unchanged while Trending opts into its shared chrome. */
  appearance?: "default" | "trending";
  /**
   * Today in India time, for a card that is not listed under its own day. A
   * fixture on any other day then shows its date in place of its kick-off.
   */
  today?: string | null;
};

/** The fixture surface shared by every sport: a card with a status notch. */
export function SportFixtureCard({
  match,
  appearance = "default",
  today,
}: SportFixtureCardProps) {
  const trending = appearance === "trending";
  const stateColor = trending
    ? "var(--ds-color-fixture-predicted)"
    : match.status === "live"
      ? "var(--ds-color-danger)"
      : match.status === "finished"
        ? "var(--ds-color-fixture-border)"
        : "var(--ds-color-fixture-predicted)";
  const kickoff = kickoffLabel(match, today);
  const state = statusLabel(match, kickoff);
  const label = match.away
    ? `${match.home.name} versus ${match.away.name}, ${state}`
    : `${match.home.name}, ${state}`;

  return (
    <article
      className={`${styles.shell} ${trending ? styles.trending : ""}`}
      style={{ "--fixture-state": stateColor } as CSSProperties}
    >
      <div aria-hidden className={styles.lift} />
      <div className={styles.frame}>
        <div className={styles.inner}>
          <div className={styles.body}>
            {match.away ? (
              <Teams match={match} away={match.away} />
            ) : (
              <RaceIdentity match={match} />
            )}
            {showsResultSummary(match) ? (
              <p className="mt-3 text-center text-xs font-semibold leading-body text-[var(--ds-color-fixture-result)]">
                {match.resultLine}
              </p>
            ) : null}
          </div>
          <StatusStrip match={match} />
        </div>
      </div>
      <div className={styles.tag}>
        <StatusTag match={match} kickoff={kickoff} />
      </div>
      <Link
        href={match.href}
        aria-label={label}
        className={styles.stretchedLink}
      />
    </article>
  );
}

/** What stands in the notch before the start: a clock, a date, or neither. */
function kickoffLabel(match: SportFixture, today?: string | null): string {
  if (!match.kickoff) return "TBC";
  return today && toISTDate(new Date(match.kickoff)) !== today
    ? formatKickoffDate(match.kickoff)
    : formatKickoffTime(match.kickoff);
}

function StatusTag({
  match,
  kickoff,
}: {
  match: SportFixture;
  kickoff: string;
}) {
  if (match.status === "live") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-extrabold tracking-label text-danger">
        <span aria-hidden className={styles.liveDot} />
        LIVE
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="truncate text-xs font-semibold tracking-tight text-muted">
        {match.statusNote ?? "Finished"}
      </span>
    );
  }
  return (
    <time
      dateTime={match.kickoff}
      className="ds-tabular text-sm font-bold tracking-label text-[var(--ds-color-fixture-kickoff)]"
    >
      {kickoff}
    </time>
  );
}

function Teams({ match, away }: { match: SportFixture; away: SportTeam }) {
  const cricket = match.sport === "cricket";
  const hasScore = match.homeScore != null || match.awayScore != null;
  const homeValue = scoreValue(match.homeScore);
  const awayValue = scoreValue(match.awayScore);
  const hasWinner =
    match.status === "finished" &&
    homeValue != null &&
    awayValue != null &&
    homeValue !== awayValue;
  const homeWinner = hasWinner ? homeValue > awayValue : null;
  const awayWinner = hasWinner ? awayValue > homeValue : null;
  return (
    <div className="flex min-w-0 items-start">
      <TeamColumn
        team={match.home}
        dim={match.status === "finished" && homeWinner === false}
        winner={homeWinner}
        score={cricket ? match.homeScore : undefined}
      />
      <div className="flex shrink-0 flex-col items-center px-2 pt-2">
        {!cricket && hasScore ? (
          <span className="ds-tabular whitespace-nowrap font-display text-2xl font-black tracking-tight">
            <span
              className={
                homeWinner === false ? "text-muted" : "text-foreground"
              }
            >
              {match.homeScore ?? "-"}
            </span>
            <span className="text-muted"> - </span>
            <span
              className={
                awayWinner === false ? "text-muted" : "text-foreground"
              }
            >
              {match.awayScore ?? "-"}
            </span>
          </span>
        ) : (
          <span className="font-display text-lg font-black text-muted">-</span>
        )}
      </div>
      <TeamColumn
        team={away}
        alignEnd
        dim={match.status === "finished" && awayWinner === false}
        winner={awayWinner}
        score={cricket ? match.awayScore : undefined}
      />
    </div>
  );
}

function TeamColumn({
  team,
  alignEnd = false,
  dim,
  winner,
  score,
}: {
  team: SportTeam;
  alignEnd?: boolean;
  dim: boolean;
  winner: boolean | null;
  score?: string;
}) {
  const cricketScore = score == null ? null : splitCricketScore(score);
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col ${alignEnd ? "items-end text-right" : "items-start text-left"}`}
    >
      <span
        className={`flex items-center gap-2 ${alignEnd ? "flex-row-reverse" : ""}`}
      >
        <TeamBadge team={team} />
        {cricketScore ? (
          <b
            className={`ds-tabular font-display text-lg font-black ${dim ? "text-muted" : "text-foreground"}`}
          >
            {cricketScore.score}
          </b>
        ) : null}
      </span>
      <span
        className={`mt-2 line-clamp-2 max-w-full text-base font-bold leading-tight ${dim ? "text-[var(--ds-color-fixture-dim-name)]" : "text-foreground"}`}
      >
        {team.name}
      </span>
      {cricketScore?.qualifier ? (
        <span
          className={`ds-tabular mt-0.75 max-w-full text-xs font-semibold leading-tight ${winner ? "text-foreground" : "text-muted"}`}
        >
          {cricketScore.qualifier}
        </span>
      ) : null}
    </div>
  );
}

/** "161/5 (18/20 ov, target 156)" is a score and the line that qualifies it. */
function splitCricketScore(value: string): {
  score: string;
  qualifier: string;
} {
  const index = value.indexOf("(");
  return index < 0
    ? { score: value.trim(), qualifier: "" }
    : {
        score: value.slice(0, index).trim(),
        qualifier: value
          .slice(index)
          .trim()
          .replace(/^\(|\)$/g, ""),
      };
}

/** The leading number of a score, which is the runs of a cricket innings. */
function scoreValue(value: string | undefined): number | null {
  const match = (value ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function RaceIdentity({ match }: { match: SportFixture }) {
  return (
    <div className="flex flex-col items-center text-center">
      <TeamBadge team={match.home} />
      <span className="mt-2 line-clamp-2 text-base font-bold leading-tight text-foreground">
        {match.home.name}
      </span>
    </div>
  );
}

/** Football and basketball say it all in the score. */
function showsResultSummary(match: SportFixture): boolean {
  return (
    Boolean(match.resultLine) &&
    match.sport !== "football" &&
    match.sport !== "basketball"
  );
}

/** What is open on a fixture that has not started: a quiz, a market, or both. */
function openLabel(match: SportFixture): string {
  if (match.hasQuiz && match.hasPick) return "PREDICT + PICK";
  if (match.hasQuiz) return "PREDICT";
  if (match.hasPick) return "PICK";
  return "UPCOMING";
}

function StatusStrip({ match }: { match: SportFixture }) {
  return (
    <div className={styles.footer}>
      {match.status === "live" ? (
        <span className="flex items-center gap-1.5 font-display text-2xs font-extrabold tracking-ultra text-danger">
          <span aria-hidden className={styles.liveDot} />
          IN PLAY
        </span>
      ) : match.status === "finished" ? (
        <span className="min-w-0 truncate font-display text-2xs font-extrabold tracking-wide text-muted">
          {match.statusNote?.toUpperCase() ??
            (match.away ? "FULL TIME" : "FINISHED")}
        </span>
      ) : (
        <span className="ds-tabular min-w-0 flex-1 truncate font-display text-2xs font-extrabold tracking-wide text-cyan/85">
          {openLabel(match)}
        </span>
      )}
      {match.volumeOz !== undefined ? (
        <span className="ds-tabular ml-auto shrink-0 font-display text-2xs font-semibold tracking-label text-muted">
          VOL {formatOzCompact(match.volumeOz)} OZ
        </span>
      ) : null}
    </div>
  );
}

function statusLabel(match: SportFixture, kickoff: string): string {
  if (match.status === "live") return "live";
  if (match.status === "finished") {
    return (match.statusNote ?? "finished").toLowerCase();
  }
  return kickoff;
}
