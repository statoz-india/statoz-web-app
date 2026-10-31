"use client";

import Link from "next/link";
import { useSyncExternalStore, type CSSProperties } from "react";

import type { MotorSportMatches, RaceStatus } from "@/core";
import { MotorsportIcon } from "@/lib/icons";

import styles from "../css/trendingRace.widget.module.css";

type Lifecycle = "open" | "live" | "finished" | "voided";

const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  open: "OPEN",
  live: "LIVE",
  finished: "FINISHED",
  voided: "VOID",
};

const LIFECYCLE_FOR_STATUS: Record<RaceStatus, Lifecycle> = {
  Upcoming: "open",
  Ongoing: "live",
  Finished: "finished",
  Cancelled: "voided",
};

/*
 * The start time is shown in the visitor's own time zone. The server does not
 * know it, so the zone is `null` there and while hydrating, and the time reads
 * "—" until the browser fills it in.
 */
const noZoneUpdates = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const noZone = () => null;

function startClock(iso: string | undefined, timeZone: string | null): string {
  if (!iso || timeZone === null) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
}

/** The race's result line, when the API sent one as text. */
function resultOf(summary: unknown): string | undefined {
  return typeof summary === "string" && summary.trim()
    ? summary.trim()
    : undefined;
}

/** The corner glow: red while live, cyan for a followed league, grey otherwise. */
function accentOf(lifecycle: Lifecycle, followed: boolean): string {
  if (lifecycle === "live") return "var(--ds-color-danger)";
  if (lifecycle === "open" && followed) return "var(--ds-color-accent-cyan)";
  return "var(--ds-color-border-default)";
}

export type TrendingRaceWidgetProps = {
  race: MotorSportMatches;
  /** Tints a scheduled race's corner cyan. */
  followed?: boolean;
};

/** A race as one linked plate: status, the race name, and its start time or result. */
export function TrendingRaceWidget({
  race,
  followed = false,
}: TrendingRaceWidgetProps) {
  const zone = useSyncExternalStore(noZoneUpdates, browserZone, noZone);

  const lifecycle = LIFECYCLE_FOR_STATUS[race.matchStatus];
  const label = LIFECYCLE_LABEL[lifecycle];
  const result = lifecycle === "finished" ? resultOf(race.summary) : undefined;

  return (
    <Link
      href={`/match/${encodeURIComponent(race.matchId)}`}
      className={styles.plate}
      style={
        { "--match-accent": accentOf(lifecycle, followed) } as CSSProperties
      }
    >
      <span className={styles.chrome} aria-hidden>
        <span className={styles.rail} />
      </span>

      <div className={styles.status}>
        <span className={styles.league}>
          <MotorsportIcon size={16} aria-hidden />
          <span>{race.tournament}</span>
        </span>
        <span className={styles.tag} data-status={lifecycle}>
          {label}
        </span>
        <span className={styles.tagSlot} aria-hidden>
          {label}
        </span>
      </div>

      <h3 className={styles.title}>{race.name}</h3>

      {lifecycle === "open" && (
        <time dateTime={race.raceStartTime} className={styles.kickoff}>
          {startClock(race.raceStartTime, zone) || "—"}
        </time>
      )}
      {result && <p className={styles.result}>{result}</p>}
    </Link>
  );
}
