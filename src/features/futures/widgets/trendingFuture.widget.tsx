"use client";

import Link from "next/link";
import {
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
} from "react";

import type { Future, FutureChoice, FutureStatus } from "@/core";
import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  MotorsportIcon,
} from "@/lib/icons";
import { colors, liftForContrast } from "@/styles/colors";

import styles from "./trendingFuture.widget.module.css";

/** A featured card shows at most this many outcomes. */
const FEATURED_OUTCOMES = 3;

type Tag = "open" | "settled" | "closed" | "void";

const TAG_LABEL: Record<Tag, string> = {
  open: "OPEN",
  settled: "SETTLED",
  closed: "CLOSED",
  void: "VOID",
};

/** `null` for a status the card never shows. A new future starts `ACTIVE`, taking entries. */
const TAG_FOR_STATUS: Record<FutureStatus, Tag | null> = {
  UPCOMING: "open",
  ACTIVE: "open",
  FINISHED: "closed",
  WINNING_OPTION_UPDATED: "closed",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  DELETED: null,
};

type Sport = {
  accent: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const SPORTS: Record<string, Sport> = {
  football: { accent: "var(--ds-color-accent-cyan)", icon: FootballIcon },
  cricket: { accent: "var(--ds-color-accent-white)", icon: CricketIcon },
  basketball: { accent: "var(--ds-color-accent-gold)", icon: BasketballIcon },
  racing: { accent: "var(--ds-color-accent-racing)", icon: MotorsportIcon },
};

/**
 * Dark ink once the fill's luminance passes 0.179, where dark and white text
 * have equal contrast.
 */
function inkFor(fill: string): string {
  const hex = fill.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return colors.text.default;
  const channel = (value: number) =>
    value / 255 <= 0.03928
      ? value / 255 / 12.92
      : ((value / 255 + 0.055) / 1.055) ** 2.4;
  const lum =
    0.2126 * channel(parseInt(hex.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(hex.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(hex.slice(4, 6), 16));
  return lum > 0.179 ? colors.text.inverse : colors.text.default;
}

// A colour too dark for the card is lightened until it stands out from it.
const fillOf = (choice: FutureChoice) =>
  liftForContrast(choice.placeholderColor || colors.accent.cyan, {
    against: colors.fixture.base,
    ratio: 2.2,
  });

/** "Closes in 281d", only while the future takes entries. */
function closesIn(future: Future, tag: Tag, now: number | null): string {
  if (now === null || tag !== "open") return "";
  const remaining = Date.parse(future.entryCloseTime) - now;
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

export type TrendingFutureWidgetProps = {
  future: Future;
  /** Sets the icon and the accent; the future itself does not carry one. */
  sport?: string;
  /** Hides the description and shows at most 3 outcomes. */
  featured?: boolean;
  /** The most choices to show, taken in the order the API sent them. `featured` overrides it. */
  maxChoices?: number;
  /** Without it, or once the future stops taking entries, the rows are disabled. */
  onPick?: (choiceId: string) => void;
};

/** A future card: the question, one row per visible choice, and the volume. */
export function TrendingFutureWidget({
  future,
  sport = "football",
  featured,
  maxChoices,
  onPick,
}: TrendingFutureWidgetProps) {
  const now = useSyncExternalStore(subscribeToClock, currentMinute, noClock);
  const tag = TAG_FOR_STATUS[future.futureStatus];
  if (tag === null) return null;

  const look = SPORTS[sport.toLowerCase()];
  const Icon = look?.icon;
  const href = `/picks/${encodeURIComponent(future.futureId)}`;
  const timing = closesIn(future, tag, now);
  // `choices` already come sorted by odds, highest first.
  const visible = future.choices.filter((choice) => choice.isVisible);
  const choices = visible.slice(0, featured ? FEATURED_OUTCOMES : maxChoices);
  const disabled = !onPick || tag !== "open";

  return (
    <article
      className={styles.card}
      style={
        {
          "--sport-accent": look?.accent ?? "var(--ds-color-accent-cyan)",
        } as CSSProperties
      }
    >
      <span className={styles.etch} aria-hidden>
        <span className={styles.rail} />
      </span>

      <div className={styles.status}>
        <span className={styles.league}>
          {Icon && <Icon size={16} aria-hidden />}
          <span>{future.tournamentData.tournament} · Future</span>
        </span>
        <span className={styles.tag} data-status={tag}>
          {TAG_LABEL[tag]}
        </span>
        <span className={styles.tagSpace} aria-hidden>
          {TAG_LABEL[tag]}
        </span>
        {timing && <span className={styles.timing}>{timing}</span>}
      </div>

      <Link href={href} className={styles.title}>
        {future.eventName}
      </Link>
      {!featured && future.eventDescription && (
        <p className={styles.context}>{future.eventDescription}</p>
      )}

      <div className={styles.outcomes}>
        {choices.map((choice) => {
          const fill = fillOf(choice);
          return (
            <button
              key={choice.choiceId}
              type="button"
              className={styles.outcome}
              style={{ "--fill": fill, "--ink": inkFor(fill) } as CSSProperties}
              disabled={disabled}
              onClick={() => onPick?.(choice.choiceId)}
            >
              <span className={styles.outcomeLabel}>{choice.choiceName}</span>
              <span className={styles.badge}>{Math.round(choice.odds)}%</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span>
          {future.totalCoinsPlaced.toLocaleString("en-US")} Oz volume
        </span>
        <Link href={href} className={styles.action}>
          View Future ↗
        </Link>
      </div>
    </article>
  );
}
