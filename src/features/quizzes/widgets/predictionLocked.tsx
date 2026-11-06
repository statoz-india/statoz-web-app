"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";

import { formatInt } from "@/utils";

import styles from "../css/predictionLocked.module.css";

/** The whole overlay runs on one clock; it is removed when it ends. */
const HOLD_MS = 4500;
const REDUCED_MS = 400;
/** The XP counts up from 24% of the clock, over 30% of it, as the meter fills. */
const COUNT_FROM = HOLD_MS * 0.24;
const COUNT_SPAN = HOLD_MS * 0.3;

const HEADLINE = "PREDICTION LOCKED";

/**
 * PREDICTION LOCKED: plays once a quiz is submitted, confirming the answers
 * are sealed and the most XP they can earn, then clears itself. The answers
 * are already saved, so nothing on it can be pressed.
 */
export function PredictionLocked({
  count,
  potentialXp,
  onDone,
}: {
  /** The quiz's questions, all answered. */
  count: number;
  potentialXp: number;
  onDone: () => void;
}) {
  const [xp, setXp] = useState(0);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setXp(potentialXp);
      const timer = window.setTimeout(() => done(), REDUCED_MS);
      return () => window.clearTimeout(timer);
    }
    const began = performance.now();
    let frame = requestAnimationFrame(function tick() {
      const elapsed = performance.now() - began;
      const p = Math.min(1, Math.max(0, (elapsed - COUNT_FROM) / COUNT_SPAN));
      setXp(Math.round(potentialXp * (1 - (1 - p) ** 2)));
      if (elapsed < COUNT_FROM + COUNT_SPAN) frame = requestAnimationFrame(tick);
    });
    const timer = window.setTimeout(() => done(), HOLD_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [potentialXp]);

  const letters = [...HEADLINE];
  return (
    <div
      role="status"
      aria-label={`${HEADLINE}. ${count} answers sealed, up to ${potentialXp} XP.`}
      className={`${styles.overlay} fixed inset-0 z-60 grid place-content-center justify-items-center p-6 text-center font-display font-black`}
    >
      <Seal />
      <h2
        aria-hidden
        className={`${styles.headline} mt-6.5 flex max-w-full flex-wrap justify-center text-2xl tracking-wide text-foreground`}
      >
        {letters.map((char, i) => (
          <span
            key={i}
            className={styles.letter}
            style={{ animationDelay: `${HOLD_MS * 0.14 + (i / letters.length) * HOLD_MS * 0.14}ms` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </h2>
      <p aria-hidden className={`${styles.copyIn} mt-3.5 text-xs tracking-mega text-muted`}>
        {count} ANSWERS SEALED
      </p>
      <span aria-hidden className={`${styles.meter} ${styles.copyIn} mt-3 block h-1.5 w-47`}>
        <span className={`${styles.charge} block h-full`} />
      </span>
      <p aria-hidden className={`${styles.copyIn} ds-tabular mt-2.25 text-sm tracking-crisp text-gold`}>
        UP TO {formatInt(xp)} XP
      </p>
    </div>
  );
}

/** The 240px seal: flash and pulse behind a ring, a cut plate, brackets and a check. */
function Seal() {
  const fill = useId();
  return (
    <div aria-hidden className={`${styles.seal} relative grid size-60 place-items-center`}>
      <span className={`${styles.flash} absolute size-50`} />
      <span className={`${styles.pulse} absolute size-37.5`} />
      <svg viewBox="0 0 240 240" overflow="visible" className="absolute size-60">
        <defs>
          <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={styles.fillTop} />
            <stop offset="100%" className={styles.fillBottom} />
          </linearGradient>
        </defs>
        <circle className={styles.track} cx="120" cy="120" r="72" />
        <circle className={styles.sweep} cx="120" cy="120" r="72" />
        <path className={styles.plate} d="M76 76 H151 L164 89 V164 H89 L76 151 Z" fill={`url(#${fill})`} />
        <path
          className={styles.bracket}
          d="M64 78 V64 H78 M176 78 V64 H162 M176 162 V176 H162 M64 162 V176 H78"
        />
        <path className={styles.check} d="M100 121 L114 136 L142 102" />
      </svg>
    </div>
  );
}
