import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import styles from "../css/predictionCard.module.css";

/** The face colour every outcome takes once a market is closed. */
const CLOSED_FILL = "var(--ds-color-text-muted)";
const DARK_INK = "var(--ds-color-text-inverse)";
const LIGHT_INK = "var(--ds-color-text-default)";

export type PredictionOutcome = {
  id: string;
  /** For example "CA". */
  code: string;
  /** For example "Carlos Alcaraz". Read out in the button's label. */
  label: string;
  percent: number;
  /** The face colour, already lifted for contrast against the card. */
  color: string;
  /** From {@link inkFor}. */
  ink: string;
  /** Shown when it is 2 points or more either way. */
  delta?: number;
  held?: boolean;
};

export type PredictionTag = {
  kind: "closes" | "live" | "status";
  text: string;
  /** For a status word only. */
  color?: string;
};

export type PredictionCardProps = {
  href: string;
  league: { code: string; color: string };
  /** For example "MATCH". */
  type: string;
  question: string;
  context?: string;
  tag: PredictionTag;
  /** Only the first 3 show. */
  outcomes: PredictionOutcome[];
  /** A closed market: muted plates that can't be pressed. */
  disabled?: boolean;
  strip: { held?: string; volume: string; claim?: () => void };
  onPick?: (id: string) => void;
};

/**
 * A pick market on the notched fixture panel: the status in the notch, the
 * question, one plate per outcome, the crowd's split and the volume. It only
 * shows the values it is given, so the caller picks the state.
 */
export function PredictionCard({
  href,
  league,
  type,
  question,
  context,
  tag,
  outcomes,
  disabled,
  strip,
  onPick,
}: PredictionCardProps) {
  const total = outcomes.reduce((sum, outcome) => sum + outcome.percent, 0);
  return (
    <article className={styles.shell}>
      <span aria-hidden className={styles.lift} />
      <div className={styles.frame}>
        <div className={styles.inner}>
          <div className={styles.body}>
            <div className={styles.top}>
              <span
                className={styles.league}
                style={{ "--league": league.color } as CSSProperties}
              >
                {league.code}
              </span>
              <span className={styles.type}>{type}</span>
            </div>
            <Link href={href} className={styles.question}>
              {question}
            </Link>
            {context && <p className={styles.context}>{context}</p>}

            <div className={styles.outcomes}>
              {outcomes.slice(0, 3).map((outcome) => (
                <button
                  key={outcome.id}
                  type="button"
                  className={styles.outcome}
                  data-held={outcome.held || undefined}
                  disabled={disabled || !onPick}
                  onClick={() => onPick?.(outcome.id)}
                  aria-label={`Back ${outcome.label} at ${outcome.percent} percent`}
                  style={
                    {
                      "--fill": disabled ? CLOSED_FILL : outcome.color,
                      "--ink": disabled ? DARK_INK : outcome.ink,
                    } as CSSProperties
                  }
                >
                  <span aria-hidden className={styles.base} />
                  <span className={styles.face}>
                    <b className={styles.code}>{outcome.code}</b>
                    <span className={styles.price}>
                      {outcome.delta != null && Math.abs(outcome.delta) >= 2 && (
                        <i className={styles.delta}>
                          {outcome.delta > 0 ? "▲" : "▼"}
                          {Math.abs(outcome.delta)}
                        </i>
                      )}
                      {outcome.percent}%
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {total > 0 && (
            <span className={styles.share} aria-hidden>
              {outcomes.map((outcome) => (
                <i
                  key={outcome.id}
                  style={{ flexGrow: outcome.percent, background: outcome.color }}
                />
              ))}
            </span>
          )}

          {strip.claim ? (
            <button
              type="button"
              className={`${styles.strip} ${styles.focal}`}
              onClick={strip.claim}
            >
              <span className={styles.claim}>★ RESULT READY — TAP TO CLAIM</span>
            </button>
          ) : (
            <div className={styles.strip}>
              {strip.held && <b className={styles.held}>✓ {strip.held}</b>}
              <span className={styles.volume}>{strip.volume}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tag}>
        <NotchTag {...tag} />
      </div>
    </article>
  );
}

/** The notch's text: a countdown, the live marker, or a status word. */
function NotchTag({ kind, text, color }: PredictionTag): ReactNode {
  if (kind === "live") {
    return (
      <span className={styles.live}>
        <i aria-hidden className={styles.dot} />
        {text}
      </span>
    );
  }
  if (kind === "closes") {
    return (
      <span className={styles.closes} data-long={text.length > 10 || undefined}>
        {text}
      </span>
    );
  }
  return (
    <span className={styles.status} style={{ color }}>
      {text}
    </span>
  );
}

/** "Carlos Alcaraz" → "CA"; one word → its first three letters. */
export function outcomeCode(label: string): string {
  const words = label.trim().split(/\s+/);
  return words.length >= 2
    ? words
        .slice(0, 3)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : label.trim().slice(0, 3).toUpperCase();
}

/** The notch countdown: SOON, 45M, 11H or 3D. */
export function closesLabel(closesAt: string, now: number): string {
  const ms = Date.parse(closesAt) - now;
  if (!(ms > 0)) return "SOON";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}M`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}H` : `${Math.floor(hours / 24)}D`;
}

/** Dark ink on a light face (luminance above 0.48), white otherwise. Takes "#rrggbb". */
export function inkFor(hex: string): string {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.48 ? DARK_INK : LIGHT_INK;
}

/** 75200 → "75.2K". */
export function ozCompact(n: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(n)
    .toUpperCase();
}
