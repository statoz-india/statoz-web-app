"use client";

import Image from "next/image";
import { useState } from "react";

import { IMAGES } from "@/config/images";
import { InteractiveLineChart } from "@/lib/components/interactive-line-chart";
import { ChevronRightIcon } from "@/lib/icons";
import { formatOzCompact } from "@/utils";

import { formatAmount } from "../adapters";
import { CountUp, Panel, StatCell } from "../components/surfaces";
import { COIN_RANGES } from "../constants";
import type { CoinRange } from "../types";

const GOLD = "var(--ds-color-accent-gold)";
const gold = (percent: number) =>
  `color-mix(in srgb, ${GOLD} ${percent}%, transparent)`;

/** The balance over time; `ranges` is `null` while the history loads. */
export function CoinTrackerWidget({
  balance,
  ranges,
  failed,
  onRetry,
  onHistory,
}: {
  balance: number;
  ranges: CoinRange[] | null;
  failed: boolean;
  onRetry: () => void;
  onHistory: () => void;
}) {
  const [rangeId, setRangeId] = useState(COIN_RANGES[0].id);
  // `null` follows the latest point.
  const [selected, setSelected] = useState<number | null>(null);
  const range = ranges?.find((r) => r.id === rangeId);
  const shown = range ? range.values[selected ?? range.values.length - 1] : balance;
  const cellFill = `color-mix(in srgb, var(--ds-color-background-secondary) 86%, var(--ds-color-background-elevated))`;

  return (
    <Panel label="Oz Coin tracker" delay={60} className="p-3.5">
      <div className="flex items-center gap-2">
        <Image src={IMAGES.icons.ozCoins} alt="" width={20} height={20} />
        <h3 className="flex-1 font-display text-md font-black tracking-label text-gold">
          OZ COIN TRACKER
        </h3>
        <button
          type="button"
          onClick={onHistory}
          className="flex items-center font-display text-2xs font-black tracking-ultra text-gold transition-colors duration-150 hover:text-foreground"
        >
          HISTORY
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <div role="tablist" aria-label="Range" className="mt-3 grid grid-cols-3 gap-2">
        {COIN_RANGES.map((r) => {
          const active = r.id === rangeId;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setRangeId(r.id);
                setSelected(null);
              }}
              className={`h-11 border font-display text-2xs font-black tracking-wide transition-colors duration-150 ${active ? "text-gold" : "border-line/28 text-muted hover:border-gold/48 hover:text-foreground"}`}
              style={
                active ? { borderColor: gold(72), background: gold(14) } : undefined
              }
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {range ? (
        <InteractiveLineChart
          values={range.values}
          selectedIndex={selected}
          onSelectedIndexChange={setSelected}
          label="Oz Coin balance over time"
          valueText={(value) => `${formatAmount(value)} Oz`}
          accent={GOLD}
          height={176}
          className="mt-3"
        />
      ) : failed ? (
        <div className="mt-3 grid h-44 place-content-center justify-items-center gap-2 border border-line text-center">
          <p className="font-sans text-sm text-muted">
            Couldn&apos;t load your coin history.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="font-display text-2xs font-black tracking-wide text-gold hover:text-foreground"
          >
            TRY AGAIN
          </button>
        </div>
      ) : (
        <div
          role="status"
          aria-label="Loading coin history"
          className="mt-3 h-44 animate-pulse bg-surface-elevated/50"
        />
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-display text-micro font-black tracking-ultra text-muted">
          BALANCE
        </span>
        <span className="ds-tabular font-display text-base font-black text-gold">
          {formatAmount(shown)} OZ
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatCell label="BALANCE" labelColor={gold(90)} fill={cellFill}>
          <CountUp value={balance} format={formatOzCompact} />
        </StatCell>
        <StatCell
          label="EARNED"
          labelColor={gold(90)}
          fill={cellFill}
          valueColor={range?.earned ? "var(--ds-color-success)" : undefined}
        >
          <CountUp value={range?.earned ?? 0} format={formatOzCompact} />
        </StatCell>
        <StatCell
          label="SPENT"
          labelColor={gold(90)}
          fill={cellFill}
          valueColor={range?.spent ? "var(--ds-color-danger)" : undefined}
        >
          <CountUp value={range?.spent ?? 0} format={formatOzCompact} />
        </StatCell>
      </div>
    </Panel>
  );
}
