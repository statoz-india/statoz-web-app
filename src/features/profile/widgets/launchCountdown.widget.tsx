"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import { accentVar, withAlpha } from "@/styles";

import styles from "../css/launchCountdown.module.css";

const STARTS_AT = 3;
/** How long each number holds, then GO. 3 · 2 · 1 · GO is 3.15s. */
const HOLD_MS = 850;
const GO_HOLD_MS = 600;

const cyan = (alpha: number) => withAlpha(accentVar("cyan"), alpha);

/**
 * 3 · 2 · 1 · GO after profile setup. A tap, click, Enter or Space skips it;
 * `onEnter` runs once either way.
 */
export function LaunchCountdown({ onEnter }: { onEnter: () => void }) {
  const [seconds, setSeconds] = useState(STARTS_AT);
  const entered = useRef(false);
  const skip = useRef<HTMLButtonElement>(null);

  const enter = () => {
    if (entered.current) return;
    entered.current = true;
    onEnter();
  };
  const tick = useEffectEvent(() =>
    seconds > 0 ? setSeconds(seconds - 1) : enter(),
  );

  useEffect(() => {
    skip.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(tick, seconds > 0 ? HOLD_MS : GO_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <p className="font-display text-2xs font-extrabold leading-compact tracking-mega text-cyan">
        SYS://LAUNCH-SEQUENCE
      </p>
      <CountdownRing className="mt-7">
        {seconds > 0 ? String(seconds) : "GO"}
      </CountdownRing>
      <p
        aria-live="polite"
        className="mt-6 font-grotesk text-sm font-bold leading-compact tracking-tight text-cyan/70"
      >
        ENTERING STATOZ…
      </p>
      <button
        ref={skip}
        type="button"
        onClick={enter}
        className="absolute inset-0 z-10 cursor-default"
      >
        <span className="sr-only">Skip the launch countdown</span>
      </button>
    </div>
  );
}

/** Rounded, so the server and the browser print the same coordinates. */
const at = (n: number) => Math.round(n * 100) / 100;

/** 12 ticks every 30°; the four on the axes start further in. */
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 12;
  const inner = i % 3 === 0 ? 52 : 59;
  return {
    x1: at(77 + Math.cos(angle) * inner),
    y1: at(77 + Math.sin(angle) * inner),
    x2: at(77 + Math.cos(angle) * 69),
    y2: at(77 + Math.sin(angle) * 69),
  };
});

/** Keeps a 3px band at the sweep's edge. */
const SWEEP_MASK =
  "radial-gradient(closest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))";

/** A 154px radar ring with the readout in the middle. */
function CountdownRing({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={`${styles.breathe} relative grid size-38.5 shrink-0 place-items-center ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 154 154"
        fill="none"
        className="absolute inset-0 size-full"
      >
        <circle cx="77" cy="77" r="69" stroke={cyan(0.12)} strokeWidth="1" />
        <circle cx="77" cy="77" r="49" stroke={cyan(0.12)} strokeWidth="1" />
        <circle cx="77" cy="77" r="31" stroke={cyan(0.46)} strokeWidth="1.2" />
        {TICKS.map((tick, i) => (
          <line key={i} {...tick} stroke={cyan(0.12)} strokeWidth="1" />
        ))}
        <line x1="77" y1="0" x2="77" y2="154" stroke={cyan(0.18)} strokeWidth="1" />
        <line x1="0" y1="77" x2="154" y2="77" stroke={cyan(0.18)} strokeWidth="1" />
      </svg>
      <div
        aria-hidden
        className={`${styles.sweep} absolute inset-2 rounded-full`}
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${cyan(0.08)} 68%, ${cyan(0.68)} 82%, transparent 100%)`,
          maskImage: SWEEP_MASK,
          WebkitMaskImage: SWEEP_MASK,
        }}
      />
      <span
        className={`relative font-display font-black leading-compact tracking-tight tabular-nums text-cyan ${children.length > 1 ? "text-hero" : "text-countdown"}`}
        style={{ textShadow: `0 0 24px ${cyan(0.85)}, 0 0 42px ${cyan(0.35)}` }}
      >
        {children}
      </span>
    </div>
  );
}
