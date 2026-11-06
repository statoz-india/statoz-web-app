import type { CSSProperties, ReactNode } from "react";

import { accentVar, feedbackVar } from "@/styles";

import type { Market, Outcome, Tag } from "../adapters";
import styles from "../css/pickDetail.module.css";

const KIND: Record<Market["kind"], { label: string; tone: string }> = {
  match: { label: "MATCH", tone: accentVar("cyan") },
  future: { label: "FUTURE", tone: accentVar("violet") },
  event: { label: "EVENT", tone: accentVar("gold") },
};

const STATUS: Record<Tag, { label: string; tone: string }> = {
  open: { label: "OPEN", tone: accentVar("gold") },
  live: { label: "LIVE", tone: feedbackVar("danger") },
  unresolved: { label: "UNRESOLVED", tone: accentVar("orange") },
  settled: { label: "SETTLED", tone: feedbackVar("success") },
  void: { label: "VOID", tone: "var(--ds-color-text-muted)" },
};

/** Type and status pills, the question, the leading price, and volume and close time. */
export function MarketHeader({ market, leader }: { market: Market; leader: Outcome }) {
  return (
    <header className="flex flex-col gap-3 py-3.5">
      <div className="flex items-center gap-2">
        <Pill {...KIND[market.kind]} />
        <Pill {...STATUS[market.tag]} />
        <span className="ml-auto truncate font-display text-2xs font-black tracking-loose text-muted">
          {market.league}
        </span>
      </div>
      <h1 className="font-display text-badge font-black tracking-firm">{market.question}</h1>
      <div className="flex items-center gap-3">
        <span
          className="ds-tabular font-display text-price font-black leading-compact"
          style={{ color: leader.color }}
        >
          {leader.percent}%
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-2xs font-black tracking-broad uppercase">
            {leader.label}
          </span>
          <span className="mt-1 block font-display text-nano font-black tracking-spread text-muted/80">
            CHANCE
          </span>
        </span>
      </div>
      {/* Empty for a future, but it keeps its gap, as designed. */}
      <p className="font-grotesk text-compact font-bold text-muted">{market.context}</p>
      <div className="grid grid-cols-2 gap-2.5">
        <Metric label="VOLUME" value={market.volume} />
        <Metric label="CLOSES" value={market.closes} />
      </div>
    </header>
  );
}

function Pill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`${styles.pill} px-2 py-1.25 font-display text-micro font-black tracking-loose`}
      style={{ "--tone": tone } as CSSProperties}
    >
      {label}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${styles.box} flex h-11.25 flex-col justify-center gap-1.25 px-2.25`}>
      <span className="font-display text-micro font-black tracking-loose text-muted">{label}</span>
      <span className="ds-tabular font-grotesk text-xs font-bold">{value}</span>
    </div>
  );
}

/** `MARKET ODDS` or `OUTCOMES`, a rule filling the row, then `aside`. */
export function SectionHeading({
  id,
  aside,
  children,
}: {
  id?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 id={id} className="font-display text-2xs font-bold tracking-mega text-cyan/70">
        {children}
      </h2>
      <span aria-hidden className={`${styles.rule} flex-1`} />
      {aside}
    </div>
  );
}
