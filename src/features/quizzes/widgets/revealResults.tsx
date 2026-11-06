"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";

import type { QuizDetail } from "@/core";
import { useScrollLock } from "@/hooks/useScrollLock";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "@/lib/icons";
import { formatInt } from "@/utils";

import { revealRows, type RevealRow } from "../adapters";
import styles from "../css/revealResults.module.css";

/** The header holds alone this long, then a row lands every step. */
const HEADER_HOLD_MS = 1100;
const STEP_MS = 820;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const prefersReduced = () => matchMedia(REDUCED_MOTION).matches;
const subscribeMotion = (change: () => void) => {
  const query = matchMedia(REDUCED_MOTION);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};

/** REVEAL RESULTS at the foot of an unrevealed settled quiz. */
export function RevealDock({
  pending,
  error,
  onReveal,
}: {
  pending: boolean;
  error: string | null;
  onReveal: () => void;
}) {
  return (
    <div className={styles.dock}>
      {/* As wide as the quiz column above it. */}
      <div className="mx-auto w-full max-w-180">
        {error ? (
          <p role="alert" className="mb-3 text-center font-grotesk text-sm text-danger">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={onReveal}
          className={styles.cta}
        >
          {pending ? "REVEALING…" : "REVEAL RESULTS"}
        </button>
      </div>
    </div>
  );
}

/**
 * RESULTS ARE IN: each answer is marked one at a time while the XP adds up,
 * then PREDICTION SETTLED (or PERFECT QUIZ) with CONTINUE. A tap during the
 * count skips to the summary; only CONTINUE closes it.
 */
export function RevealOverlay({
  quiz,
  xp,
  onDone,
}: {
  quiz: QuizDetail;
  /** What the API credited, shown as the summary's XP EARNED. */
  xp: number;
  onDone: () => void;
}) {
  useScrollLock();
  const rows = revealRows(quiz);
  const summary = rows.length + 1;
  // With reduced motion it opens straight on the summary.
  const reduced = useSyncExternalStore(subscribeMotion, prefersReduced, () => false);
  // Stage 0 is the header alone, stage k shows k rows, then the summary.
  const [counting, setStage] = useState(0);
  const stage = reduced ? summary : counting;
  const onSummary = stage >= summary;

  useEffect(() => {
    if (onSummary) return;
    const timer = window.setTimeout(
      () => setStage((s) => s + 1),
      stage === 0 ? HEADER_HOLD_MS : STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [stage, onSummary]);

  // Each row's XP joins the header when the next row lands.
  const counted = rows
    .slice(0, Math.max(0, stage - 1))
    .reduce((sum, row) => sum + row.xp, 0);
  const correct = rows.filter((row) => row.correct).length;
  const perfect = rows.length > 0 && correct === rows.length;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Prediction settled"
      className={styles.overlay}
      onClick={() => {
        if (!onSummary) setStage(summary);
      }}
    >
      {onSummary ? (
        <div className={styles.sheet}>
          <header className={styles.head}>
            <h2
              className={styles.title}
              style={perfect ? undefined : { color: "var(--ds-color-text-default)" }}
            >
              {perfect ? "PERFECT QUIZ" : "PREDICTION SETTLED"}
            </h2>
            <p className={styles.sub}>
              {correct} / {rows.length} CORRECT
            </p>
          </header>
          <dl className={styles.totals}>
            <Cell label="XP EARNED" value={`+${formatInt(xp)}`} color="var(--ds-color-accent-gold)" />
            <Cell label="CORRECT" value={`${correct}/${rows.length}`} />
          </dl>
          {/* Focused so Enter or Space continues straight away. */}
          <button type="button" autoFocus onClick={onDone} className={styles.cta}>
            CONTINUE <ArrowRightIcon size={16} aria-hidden />
          </button>
        </div>
      ) : (
        <div className={styles.sheet}>
          <header className={styles.head}>
            <h2 className={styles.title} style={{ color: "var(--ds-color-text-default)" }}>
              RESULTS ARE IN
            </h2>
            <p className={styles.sub}>
              {quiz.teamA.abbreviation} vs {quiz.teamB.abbreviation}
            </p>
            <p className={styles.sub}>
              SETTLING {rows.length} FUTURES{"  ·  "}
              <b>+{formatInt(counted)} XP</b>
            </p>
          </header>
          <div className={styles.list}>
            {rows.slice(0, Math.min(stage, rows.length)).map((row, i) => (
              <VerdictRow key={i} index={i + 1} row={row} />
            ))}
          </div>
          <p className={`${styles.sub} text-center`}>TAP TO SKIP</p>
        </div>
      )}
    </div>
  );
}

function VerdictRow({ index, row }: { index: number; row: RevealRow }) {
  const accent = row.correct ? "var(--ds-color-success)" : "var(--ds-color-danger)";
  return (
    <div className={styles.row} style={{ "--accent": accent } as CSSProperties}>
      <span className={styles.index}>Q{index}</span>
      <span className={styles.copy}>
        <span className={styles.question}>{row.question}</span>
        <span className={styles.answer}>
          {row.correct ? row.picked : `${row.picked} → ${row.answer}`}
        </span>
      </span>
      {row.correct ? (
        <CheckIcon size={16} aria-label="Right" className={styles.mark} />
      ) : (
        <CloseIcon size={16} aria-label="Wrong" className={styles.mark} />
      )}
      <span className={styles.stamp}>{row.correct ? `+${formatInt(row.xp)}` : "0"}</span>
    </div>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className={styles.cell} style={{ "--cell": color } as CSSProperties}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
