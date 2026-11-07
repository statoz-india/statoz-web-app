"use client";

import Image from "next/image";

import { IMAGES } from "@/config/images";
import type { SportMatch, SportTeam } from "@/features/match/types";
import { useNow } from "@/hooks/useNow";
import { CalendarIcon } from "@/lib/icons";
import { formatKickoffTime, formatMatchDate, formatOzCompact } from "@/utils";

import styles from "../../css/match-detail.module.css";
import { TeamBadge } from "../team-badge";

type Side = "home" | "away";

/**
 * The fixture, above the tabs, as a scoreboard: each side's badge with its
 * full name under it, the score or the kick-off time between them with the
 * match state above, then when it starts and the Oz on its markets.
 *
 * Cricket reads differently and says so — an innings does not fit a score
 * slot, so it sits under each side's name and the middle carries only "VS".
 */
export function MatchSummaryHeader({ match }: { match: SportMatch }) {
  if (match.sport === "racing") {
    return <GrandPrixSummary match={match} />;
  }

  const cricket = match.sport === "cricket";
  const winner = winnerOf(match);

  return (
    <section className={styles.summary} aria-label="Match summary">
      <div className={styles.summaryBracket}>
        <p className="text-center font-display text-xs font-black tracking-ultra text-cyan">
          {match.leagueLabel.toUpperCase()}
        </p>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
          <TeamColumn team={match.home} score={match.homeScore} cricket={cricket} lost={winner === "away"} />
          <Centre match={match} cricket={cricket} winner={winner} />
          <TeamColumn team={match.away} score={match.awayScore} cricket={cricket} lost={winner === "home"} />
        </div>

        <div className={`${styles.summarySplit} mt-4`} aria-hidden>
          <span style={{ background: match.home.color }} />
          <span style={{ background: match.away.color, opacity: 0.92 }} />
        </div>

        {match.kickoff ? <Kickoff match={match} /> : null}
        <Volume match={match} />
        {match.promo ? (
          <p className="mt-3 border border-gold/35 bg-gold/8 px-3 py-2.5 text-center font-display text-xs font-black tracking-wide text-gold">
            {match.promo.toUpperCase()}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** The side ahead on a finished match; none on a draw, or for cricket's innings. */
function winnerOf(match: SportMatch): Side | null {
  if (match.status !== "finished" || match.sport === "cricket") return null;
  const home = Number(match.homeScore);
  const away = Number(match.awayScore);
  if (!Number.isFinite(home) || !Number.isFinite(away) || home === away) return null;
  return home > away ? "home" : "away";
}

/** The pill above the score: its words and colours for the match's state. */
function statusPill(match: SportMatch): { text: string; className: string; live?: boolean } {
  if (match.status === "live") {
    return {
      text: match.liveMinute == null ? "LIVE" : `LIVE ${match.liveMinute}'`,
      className: "border-danger/50 bg-danger/10 text-danger",
      live: true,
    };
  }
  if (match.status === "scheduled") {
    return { text: "UPCOMING", className: "border-gold/45 bg-gold/8 text-gold" };
  }
  // Postponed, cancelled or no result: the API's own word, in warning colours.
  const label = match.statusLabel;
  if (match.status === "postponed" || (label && label !== "RESULT")) {
    return { text: label ?? "POSTPONED", className: "border-orange/50 bg-orange/10 text-orange" };
  }
  return {
    text: match.sport === "cricket" ? "RESULT" : "FULL TIME",
    className: "border-line-strong bg-foreground/5 text-foreground",
  };
}

/** The middle: the state, then the score, or the kick-off time before the start. */
function Centre({
  match,
  cricket,
  winner,
}: {
  match: SportMatch;
  cricket: boolean;
  winner: Side | null;
}) {
  const pill = statusPill(match);
  const hasScore = match.homeScore != null || match.awayScore != null;
  const digit = (side: Side) => (winner && winner !== side ? "text-muted" : "text-foreground");

  return (
    <div className="flex flex-col items-center gap-2 pt-1">
      <span
        className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-display text-2xs font-black tracking-ultra whitespace-nowrap ${pill.className}`}
      >
        {pill.live ? <span aria-hidden className="size-1.5 animate-pulse rounded-pill bg-danger" /> : null}
        {pill.text}
      </span>
      {match.status === "scheduled" && match.kickoff ? (
        <time dateTime={match.kickoff} className="flex flex-col items-center">
          <span className="ds-tabular font-display text-2xl font-black text-gold">
            {formatKickoffTime(match.kickoff)}
          </span>
          <span className="font-display text-2xs font-black tracking-ultra text-muted">IST</span>
        </time>
      ) : cricket ? (
        <span className="font-display text-sm font-black tracking-wide text-muted">VS</span>
      ) : hasScore ? (
        <span className="ds-tabular flex items-center gap-2 font-display text-3xl font-black whitespace-nowrap">
          <span className={digit("home")}>{match.homeScore ?? "-"}</span>
          <span className="text-muted">–</span>
          <span className={digit("away")}>{match.awayScore ?? "-"}</span>
        </span>
      ) : (
        <span className="font-display text-xl font-black text-muted">–</span>
      )}
      {match.finish ? (
        <span className="font-display text-2xs font-black tracking-wide text-gold whitespace-nowrap">
          {match.finish === "AET" ? "AFTER EXTRA TIME" : "AFTER PENALTIES"}
        </span>
      ) : null}
    </div>
  );
}

/** A side's badge and full name; cricket's innings ride under the name. */
function TeamColumn({
  team,
  score,
  cricket,
  lost,
}: {
  team: SportTeam;
  score?: number | string;
  cricket: boolean;
  lost: boolean;
}) {
  const innings =
    cricket && score != null && String(score) !== ""
      ? splitCricketScore(String(score))
      : null;
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <TeamBadge team={team} size={56} />
      <span
        className={`line-clamp-2 font-grotesk text-sm font-bold leading-tight ${lost ? "text-muted" : "text-foreground"}`}
      >
        {team.name}
      </span>
      {innings ? (
        <span className="flex flex-col items-center">
          <span className="ds-tabular font-display text-sm font-black text-foreground">{innings.score}</span>
          {innings.qualifier ? (
            <span className="font-display text-2xs font-bold text-muted">{innings.qualifier}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

/** When it starts, in India time, and a countdown until it does. */
function Kickoff({ match }: { match: SportMatch }) {
  const now = useNow();
  const left = now === null ? null : Date.parse(match.kickoff) - now;
  const countdown =
    match.status === "scheduled" && left !== null && Number.isFinite(left)
      ? countdownText(left)
      : null;
  return (
    <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <p className="flex items-center gap-1.5 font-display text-xs font-bold tracking-wide text-foreground">
        <CalendarIcon size={15} className="shrink-0 text-muted" />
        <time dateTime={match.kickoff}>
          {formatMatchDate(match.kickoff)}
          <span className="px-1.5 text-muted">·</span>
          {formatKickoffTime(match.kickoff)} IST
        </time>
      </p>
      {countdown ? (
        <span className="border border-gold/45 bg-gold/8 px-2 py-0.5 font-display text-2xs font-black tracking-wide text-gold">
          {countdown}
        </span>
      ) : null}
    </div>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Days and hours, then hours and minutes, then minutes and seconds. */
function countdownText(ms: number): string {
  if (ms <= 0) return "STARTING NOW";
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `STARTS IN ${days}D ${pad(hours)}H`;
  if (hours > 0) return `STARTS IN ${hours}H ${pad(minutes)}M`;
  return `STARTS IN ${minutes}M ${pad(seconds % 60)}S`;
}

/** The Oz staked across the match's markets. */
function Volume({ match }: { match: SportMatch }) {
  if (!match.volumeOz) return null;
  return (
    <p className="mx-auto mt-3.5 flex w-fit items-center gap-2 border border-line bg-foreground/4 px-3.5 py-2 font-display text-2xs font-black tracking-wide text-muted">
      <Image src={IMAGES.icons.ozCoins} alt="" width={16} height={16} className="shrink-0" />
      <span className="ds-tabular text-sm text-foreground">{formatOzCompact(match.volumeOz)}</span>
      OZ TRADED
    </p>
  );
}

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

function GrandPrixSummary({ match }: { match: SportMatch }) {
  return (
    <section
      className={styles.summary}
      style={{ paddingTop: 12 }}
      aria-label="Race summary"
    >
      <div className={styles.summaryBracket} style={{ paddingTop: 12 }}>
        <span
          className={styles.summaryStatus}
          style={{ color: statusColor(match), fontSize: 14 }}
        >
          {match.statusLabel ??
            (match.status === "scheduled"
              ? "UPCOMING"
              : match.status === "live"
                ? "LIVE"
                : "FT")}
        </span>
        <div className="mt-2.5 line-clamp-2 text-center font-display text-xl font-bold leading-tight">
          {match.home.name.toUpperCase()}
        </div>
        <div className={styles.summarySplit} aria-hidden>
          <span style={{ background: "var(--ds-color-accent-cyan)" }} />
          <span
            style={{ background: "var(--ds-color-danger)", opacity: 0.92 }}
          />
        </div>
      </div>
    </section>
  );
}

function statusColor(match: SportMatch): string {
  if (match.status === "live") return "var(--ds-color-danger)";
  if (match.status === "finished" || match.status === "postponed") {
    return "var(--ds-color-text-muted)";
  }
  return "var(--ds-color-accent-gold)";
}
