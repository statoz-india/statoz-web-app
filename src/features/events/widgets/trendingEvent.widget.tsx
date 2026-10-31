"use client";

import Link from "next/link";
import {
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
} from "react";

import type { EventStatus, TrendingEvent } from "@/core";
import { colors, liftForContrast } from "@/styles/colors";

import styles from "./trendingEvent.widget.module.css";

/** The panel shows at most this many events. */
const MAX_ROWS = 3;

type Tag = "open" | "live" | "unresolved" | "settled" | "closed" | "void";

const TAG_LABEL: Record<Tag, string> = {
  open: "OPEN",
  live: "LIVE",
  unresolved: "UNRESOLVED",
  settled: "SETTLED",
  closed: "CLOSED",
  void: "VOID",
};

/** `null` for a status the panel never shows. */
const TAG_FOR_STATUS: Record<EventStatus, Tag | null> = {
  UPCOMING: "open",
  ACTIVE: "live",
  FINISHED: "closed",
  WINNING_OPTION_UPDATED: "closed",
  SUSPENDED: "closed",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  ABANDONED: "void",
  NO_RESULT: "void",
  NOT_ENOUGH_DATA: "unresolved",
  POSTPONED: "unresolved",
  UNRESOLVED: "unresolved",
  DELETED: null,
};

const ACCENT: Record<string, string> = {
  cricket: "var(--ds-color-accent-white)",
  basketball: "var(--ds-color-accent-gold)",
  motorsport: "var(--ds-color-accent-racing)",
};

type Option = { label: string; odds: number; color: string };

/** Yes, no, and maybe when the event has three options. */
function optionsOf(event: TrendingEvent): Option[] {
  const options: Option[] = [
    {
      label: event.yesPlaceholder,
      odds: event.oddsYes,
      color: event.yesPlaceholderColor,
    },
    {
      label: event.noPlaceholder,
      odds: event.oddsNo,
      color: event.noPlaceholderColor,
    },
  ];
  if (event.haveThreeOptions && event.oddsMaybe != null) {
    options.push({
      label: event.maybePlaceholder ?? "Maybe",
      odds: event.oddsMaybe,
      color: event.maybePlaceholderColor ?? colors.accent.cyan,
    });
  }
  return options;
}

/** Highest odds wins; on a tie the earlier option stays. */
function leadingOption(event: TrendingEvent): Option {
  return optionsOf(event).reduce((leader, option) =>
    option.odds > leader.odds ? option : leader,
  );
}

/** "Closes in 19h 0m", only while the event takes entries. */
function closesIn(
  event: TrendingEvent,
  tag: Tag,
  now: number | null,
): string {
  if (now === null || (tag !== "open" && tag !== "live")) return "";
  const remaining = Date.parse(event.entryCloseTime) - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return "";
  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `Closes in ${minutes}m`;
  if (minutes < 1440)
    return `Closes in ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `Closes in ${Math.ceil(minutes / 1440)}d`;
}

/*
 * A clock that ticks once a minute, which is as fine as the countdown reads.
 * It is `null` on the server and while hydrating, so both renders match.
 */
const subscribeToClock = (onTick: () => void) => {
  const timer = window.setInterval(onTick, 60_000);
  return () => window.clearInterval(timer);
};
const currentMinute = () => Math.floor(Date.now() / 60_000) * 60_000;
const noClock = () => null;

function useNow(): number | null {
  return useSyncExternalStore(subscribeToClock, currentMinute, noClock);
}

export type TrendingEventWidgetProps = {
  /** Picks the accent for the rail and the league icon. */
  sport: string;
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  /**
   * The first three that can be shown are listed. Nothing renders without one.
   * A trending event, which has no description or images, is enough.
   */
  events: TrendingEvent[];
  /** Lists every event that can be shown, not just the first three. */
  showAll?: boolean;
};

/** The EVENTS panel: one chamfered card of up to three linked events. */
export function TrendingEventWidget({
  sport,
  icon: Icon,
  events,
  showAll = false,
}: TrendingEventWidgetProps) {
  const now = useNow();
  const listable = events.filter(
    (event) => TAG_FOR_STATUS[event.eventStatus] !== null,
  );
  const shown = showAll ? listable : listable.slice(0, MAX_ROWS);
  if (shown.length === 0) return null;

  const accent = {
    "--sport-accent": ACCENT[sport] ?? "var(--ds-color-accent-cyan)",
  } as CSSProperties;

  return (
    <section
      className={styles.panel}
      style={accent}
      aria-label={`${sport} events`}
    >
      <span className={styles.etch} aria-hidden>
        <span className={styles.rail} />
      </span>
      <h3 className={styles.title}>Events</h3>
      {shown.map((event) => {
        // Filtered above, so every event shown has a tag.
        const tag = TAG_FOR_STATUS[event.eventStatus]!;
        const leader = leadingOption(event);
        const timing = closesIn(event, tag, now);
        return (
          <Link
            key={event._id}
            href={`/picks/${encodeURIComponent(event.eventId)}`}
            className={styles.row}
          >
            <div className={styles.status}>
              <span className={styles.league}>
                {Icon ? (
                  <Icon size={16} aria-hidden />
                ) : (
                  <span className={styles.signal} aria-hidden />
                )}
                <span>{event.tournamentData.tournament}</span>
              </span>
              <span className={styles.tag} data-status={tag}>
                {TAG_LABEL[tag]}
              </span>
              <span className={styles.tagSpace} aria-hidden>
                {TAG_LABEL[tag]}
              </span>
              {timing && <span className={styles.timing}>{timing}</span>}
            </div>
            <div className={styles.body}>
              <div>
                <p className={styles.question}>{event.eventName}</p>
                <p className={styles.answer}>{leader.label}</p>
              </div>
              <div className={styles.numbers}>
                <span
                  className={styles.price}
                  style={{
                    color: liftForContrast(leader.color, {
                      against: colors.fixture.strip,
                      ratio: 4.5,
                    }),
                  }}
                >
                  {Math.round(leader.odds)}%
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
