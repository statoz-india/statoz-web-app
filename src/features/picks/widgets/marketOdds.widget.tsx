"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";

import {
  rangeSeries,
  type Market,
  type OddsPoint,
  type Range,
} from "../adapters";
import styles from "../css/pickDetail.module.css";
import { SectionHeading } from "./marketHeader.widget";

const RANGES: { range: Range; label: string }[] = [
  { range: "all", label: "ALL" },
  { range: "week", label: "WEEK" },
  { range: "day", label: "DAY" },
];

/** The chart draws the three highest-priced outcomes. */
const LINES = 3;

/**
 * MARKET ODDS: how the top three outcomes' prices moved, one step per bet,
 * on a fixed 0–100% scale. Dragging or the arrow keys move the point, and
 * the legend reads the prices there.
 */
export function MarketOdds({
  market,
  opening,
  history,
}: {
  market: Market;
  opening: OddsPoint;
  history: OddsPoint[];
}) {
  const [range, setRange] = useState<Range>("all");
  // `null` is the newest bet.
  const [picked, setPicked] = useState<number | null>(null);
  const [now] = useState(() => Date.now());

  const current = Object.fromEntries(market.outcomes.map((o) => [o.key, o.percent]));
  const { points, bets } = rangeSeries(opening, history, range, now, current);
  const lines = [...market.outcomes].sort((a, b) => b.percent - a.percent).slice(0, LINES);
  const leader = lines[0];
  const last = points.length - 1;
  const at = Math.min(picked ?? last, last);

  const x = (i: number) => (last ? (i / last) * 100 : 0);
  const price = (key: string, i: number) => points[i]?.odds[key] ?? 0;
  // Flat until the next bet, then a straight jump.
  const path = (key: string) =>
    points
      .map((_, i) =>
        i === 0 ? `M0 ${100 - price(key, 0)}` : `H${x(i)} V${100 - price(key, i)}`,
      )
      .join(" ");

  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setPicked(Math.round(ratio * last));
  };
  const summary = lines
    .map((o) => `${o.label} ${Math.round(price(o.key, at))}%`)
    .join(", ");

  return (
    <section aria-labelledby="pick-odds" className="flex flex-col gap-2.5">
      <SectionHeading
        id="pick-odds"
        aside={
          <span className="ds-tabular shrink-0 font-display text-micro font-black tracking-ultra text-muted">
            {bets} {bets === 1 ? "BET" : "BETS"}
          </span>
        }
      >
        MARKET ODDS
      </SectionHeading>

      <div className="flex gap-1.75">
        {RANGES.map(({ range: option, label }) => (
          <button
            key={option}
            type="button"
            aria-pressed={range === option}
            onClick={() => {
              setRange(option);
              setPicked(null);
            }}
            className={`${styles.chip} h-7 px-2.75 font-display text-2xs font-black tracking-wide`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`${styles.plot} h-33 p-2`}>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Market odds by bet"
          aria-valuemin={1}
          aria-valuemax={last + 1}
          aria-valuenow={at + 1}
          aria-valuetext={summary}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            scrub(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) scrub(event);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setPicked(Math.max(0, at - 1));
            else if (event.key === "ArrowRight") setPicked(Math.min(last, at + 1));
            else return;
            event.preventDefault();
          }}
          className="relative size-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
        >
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            overflow="visible"
            className="absolute inset-0 size-full"
          >
            {[0, 50, 100].map((y) => (
              <line
                key={y}
                x1={0}
                x2={100}
                y1={y}
                y2={y}
                className={styles.grid}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={`${path(leader.key)} V100 H0 Z`}
              fill={`color-mix(in srgb, ${leader.color} 16%, transparent)`}
            />
            {lines.map((o) => (
              <path
                key={o.key}
                d={path(o.key)}
                fill="none"
                stroke={o.color}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <span
            aria-hidden
            className={`${styles.guide} absolute inset-y-0 -translate-x-1/2`}
            style={{ left: `${x(at)}%` }}
          />
          <span
            aria-hidden
            className={`${styles.ring} absolute grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full`}
            style={
              {
                left: `${x(at)}%`,
                top: `${100 - price(leader.key, at)}%`,
                "--tone": leader.color,
              } as CSSProperties
            }
          >
            <span className="size-2 rounded-full" style={{ background: leader.color }} />
          </span>
        </div>
      </div>

      <ul className="flex flex-wrap gap-3 font-display text-micro font-black tracking-loose">
        {lines.map((o) => (
          <li key={o.key} className="flex items-center gap-1.5">
            <span aria-hidden className="h-0.75 w-2.5" style={{ background: o.color }} />
            <span className="text-muted">{o.label}</span>
            <span className="ds-tabular">{Math.round(price(o.key, at))}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
