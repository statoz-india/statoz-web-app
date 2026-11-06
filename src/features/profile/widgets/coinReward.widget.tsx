"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";

import { IMAGES } from "@/config/images";
import { colors } from "@/styles";
import { formatInt } from "@/utils";

import styles from "../css/coinReward.module.css";

/** One timeline `t` runs 0 → 1 over this long; each part has its own window of it. */
const DURATION_MS = 3300;
/** How long the screen stays after it plays out, after a tap mid-way, or with reduced motion. */
const NATURAL_HOLD_MS = 700;
const SKIPPED_HOLD_MS = 1400;
const REDUCED_HOLD_MS = 1600;

/**
 * The welcome bonus: the coin pack rises, slams, bursts and counts up to
 * `amount`, then `onComplete` runs once. A tap jumps to the settled frame.
 */
export function CoinReward({
  amount,
  balance,
  onComplete,
}: {
  amount: number;
  /** The wallet as it stands; nothing is added here. */
  balance: number;
  onComplete: () => void;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const amountEl = useRef<HTMLSpanElement>(null);
  const tRef = useRef(0);
  const frame = useRef(0);
  const timer = useRef<number | null>(null);
  const finished = useRef(false);
  // Read when the screen finishes, so a new callback each render can't restart it.
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  });

  const clearRun = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    clearRun();
    complete.current();
  }, [clearRun]);

  const finishAfter = useCallback(
    (ms: number) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(finish, ms);
    },
    [finish],
  );

  const apply = useCallback(
    (t: number) => {
      const s = scene.current;
      const c = canvas.current;
      if (!s || !c) return;
      tRef.current = t;

      const intro = easeOut(win(t, 0, 0.18));
      const rise = backOut(win(t, 0.04, 0.3));
      const sp = win(t, 0.23, 0.38);
      const shake = Math.sin(sp * Math.PI * 9) * 8 * (1 - sp);
      const slam = backOut(win(t, 0.36, 0.58));
      const count = easeOutCubic(win(t, 0.44, 0.75));
      const settle = backOut(win(t, 0.67, 0.84));
      const flash = clamp(Math.sin(win(t, 0.34, 0.43) * Math.PI));
      // The switch from rising to .72 at t = .36 is the slam.
      const artScale = t < 0.36 ? 0.66 + 0.34 * rise : 0.72 + 0.28 * slam;

      const set = (key: string, value: string | number) =>
        s.style.setProperty(key, String(value));
      set("--intro-opacity", clamp(intro));
      set("--intro-y", `${12 * (1 - intro)}px`);
      set("--art-x", `${shake}px`);
      set("--art-y", `${110 * (1 - rise)}px`);
      set("--art-scale", artScale);
      set("--art-opacity", clamp(rise));
      set("--line-opacity", win(t, 0.42, 0.57));
      set("--line-y", `${16 * (1 - settle)}px`);
      set("--settle-opacity", clamp(settle));
      set("--settle-scale", 0.9 + 0.1 * settle);
      set("--tap-opacity", win(t, 0.76, 0.9));
      set("--flash-opacity", flash * 0.68);

      if (amountEl.current) {
        amountEl.current.textContent = `+${formatInt(Math.round(amount * count))}`;
      }
      paintBurst(c, t);
    },
    [amount],
  );

  useEffect(() => {
    finished.current = false;
    clearRun();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1);
      finishAfter(REDUCED_HOLD_MS);
      return clearRun;
    }
    apply(0);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      apply(t);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else finishAfter(NATURAL_HOLD_MS);
    };
    frame.current = requestAnimationFrame(tick);
    return clearRun;
  }, [apply, clearRun, finishAfter]);

  // Redraws the burst at the current frame when the screen resizes.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const observer = new ResizeObserver(() => paintBurst(c, tRef.current));
    observer.observe(c);
    return () => observer.disconnect();
  }, []);

  const onTap = () => {
    if (finished.current) return;
    if (tRef.current < 0.78) {
      cancelAnimationFrame(frame.current);
      apply(0.82);
      finishAfter(SKIPPED_HOLD_MS);
      return;
    }
    finish();
  };

  return (
    <div ref={scene} className={styles.scene} style={INITIAL}>
      <span className="sr-only" role="status" aria-live="polite">
        {formatInt(amount)} coins credited. Balance {formatInt(balance)} coins.
      </span>
      <canvas ref={canvas} aria-hidden className={styles.canvas} />

      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>WELCOME BONUS</p>
          <p className={styles.systemLabel}>SYS://WALLET LINKED</p>
        </header>
        <div className={styles.spacer} />

        <div className={styles.artMotion}>
          <div className={styles.artFrame}>
            <Image
              src={IMAGES.shop.coins.rookie}
              alt=""
              fill
              priority
              sizes="(max-height: 679px) 184px, 232px"
              className={styles.artImage}
            />
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className={styles.artBorder}
            >
              <path d="M0 0H100V88L88 100H12L0 88Z" />
            </svg>
          </div>
        </div>

        <div className={styles.rewardBlock}>
          <div className={styles.rewardLine}>
            <Coin className={styles.rewardCoin} size={42} />
            <span ref={amountEl} className={styles.rewardAmount}>
              +0
            </span>
          </div>
          <p className={styles.credited}>COINS CREDITED TO WALLET</p>
        </div>

        <div className={styles.balanceOuter}>
          <div className={styles.balancePlate}>
            <span className={styles.balanceLabel}>WALLET BALANCE</span>
            <Coin className={styles.balanceCoin} size={18} />
            <span className={styles.balanceValue}>{formatInt(balance)}</span>
          </div>
        </div>

        <div className={styles.spacer} />
        <p className={styles.continueLabel}>TAP TO CONTINUE</p>
      </div>

      <div aria-hidden className={styles.flash} />
      <button type="button" onClick={onTap} className={styles.tapTarget}>
        <span className="sr-only">Continue to StatOz</span>
      </button>
    </div>
  );
}

/** The first frame, so nothing flashes before the timeline starts. */
const INITIAL = {
  "--intro-opacity": 0,
  "--intro-y": "12px",
  "--art-x": "0px",
  "--art-y": "110px",
  "--art-scale": 0.66,
  "--art-opacity": 0,
  "--line-opacity": 0,
  "--line-y": "16px",
  "--settle-opacity": 0,
  "--settle-scale": 0.9,
  "--tap-opacity": 0,
  "--flash-opacity": 0,
} as CSSProperties;

function Coin({ className, size }: { className: string; size: number }) {
  return (
    <Image
      src={IMAGES.icons.ozCoins}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}

/* ---- Timeline helpers ---- */

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** How far `t` is through the window `start → end`, 0 to 1. */
function win(t: number, start: number, end: number) {
  return clamp((t - start) / (end - start));
}

/** A CSS cubic-bezier in JS (Newton's method); the y values may overshoot. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const sample = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  const slope = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * a + 6 * (1 - t) * t * (b - a) + 3 * t * t * (1 - b);
  return (value: number) => {
    const x = clamp(value);
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t = clamp(t - (sample(x1, x2, t) - x) / d);
    }
    return sample(y1, y2, t);
  };
}

const easeOut = cubicBezier(0, 0, 0.58, 1);
const backOut = cubicBezier(0.175, 0.885, 0.32, 1.275);
const easeOutCubic = cubicBezier(0.215, 0.61, 0.355, 1);

/* ---- Canvas burst ---- */

/** `#fdc700` at `alpha`; a canvas can't read the CSS tokens. */
function tint(hex: string, alpha: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${clamp(alpha)})`;
}
const gold = (alpha: number) => tint(colors.accent.gold, alpha);
const cyan = (alpha: number) => tint(colors.accent.cyan, alpha);

/** The gold glow, spokes and rings, then the shockwaves and flying coins. */
function paintBurst(canvas: HTMLCanvasElement, t: number) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w <= 0 || h <= 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.43;
  const R = Math.min(w, h) * 0.74;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  glow.addColorStop(0, gold(0.09 + t * 0.05));
  glow.addColorStop(1, gold(0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.lineWidth = 1;
  ctx.strokeStyle = gold(0.08);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const inner = R * 0.48;
    const outer = R * (i % 2 === 0 ? 0.94 : 0.82);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = cyan(0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  const p = win(t, 0.35, 0.72);
  if (p <= 0 || p >= 1) return;
  const eased = easeOut(p);
  const maxR = Math.min(w, h) * 0.58;

  for (const delay of [0, 0.18]) {
    const wave = clamp((p - delay) / (1 - delay));
    if (wave <= 0 || wave >= 1) continue;
    ctx.strokeStyle = gold((1 - wave) * 0.58);
    ctx.lineWidth = 2.4 * (1 - wave) + 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * easeOut(wave), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = gold((1 - p) * 0.9);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 24; i++) {
    const angle = i * ((Math.PI * 2) / 24) + (i % 2 === 1 ? 0.07 : 0);
    const reach = maxR * (i % 2 === 0 ? 0.92 : 0.72);
    const x = cx + Math.cos(angle) * eased * reach;
    const y = cy + Math.sin(angle) * eased * reach;
    const r = 2.5 + (i % 3) * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.45, y);
    ctx.lineTo(x + r * 0.45, y);
    ctx.stroke();
  }
}
