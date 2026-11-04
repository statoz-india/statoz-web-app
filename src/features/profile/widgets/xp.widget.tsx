"use client";

import { useState } from "react";

import type { XpEntry } from "@/core";
import { InteractiveLineChart } from "@/lib/components/interactive-line-chart";
import { ShowChartIcon } from "@/lib/icons";
import { accentVar, withAlpha } from "@/styles";
import { formatInt } from "@/utils";

import {
  formatAmount,
  formatChange,
  formatXpTime,
  signedXp,
  xpTrack,
} from "../adapters";
import { Cut, Panel, StatCell } from "../components/surfaces";
import styles from "../css/profile.module.css";
import type { Profile } from "../types";

const CYAN = accentVar("cyan");
const SUCCESS = "var(--ds-color-success)";
const DANGER = "var(--ds-color-danger)";
const onPage = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, var(--ds-color-background-primary))`;

export function XpLevelCard({ level }: { level: Profile["level"] }) {
  const { next } = level;
  return (
    <Panel label="Current level" className="p-4">
      <div className="flex items-end justify-between gap-3 max-[24rem]:items-start">
        <div>
          <p className="font-display text-micro font-black leading-compact tracking-wide text-muted">
            CURRENT LEVEL
          </p>
          <p className="ds-tabular mt-0.5 font-display text-3xl font-black leading-compact text-cyan">
            {level.level}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate font-display text-2xs font-black leading-compact tracking-wide">
            {formatAmount(level.xp)} TOTAL XP
          </p>
          <p className="ds-tabular mt-1.5 font-display text-sm font-black leading-tight tracking-tight text-cyan max-[24rem]:text-xs">
            {next === null
              ? "MAX LEVEL"
              : `${formatAmount(next - level.xp)} XP TO LEVEL ${level.level + 1}`}
          </p>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label="Progress to the next level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level.progress * 100)}
        className="mt-3 h-1.5 overflow-hidden rounded-sm bg-background/70"
      >
        <div
          className={`${styles.grow} h-full bg-cyan`}
          style={{ width: `${level.progress * 100}%` }}
        />
      </div>
      <div className="ds-tabular mt-2 flex justify-between font-display text-micro font-black tracking-wide text-muted">
        <span>{formatAmount(level.xp - level.start)} XP</span>
        {next === null ? null : <span>{formatAmount(next - level.start)} XP</span>}
      </div>
    </Panel>
  );
}

const RANGES = [
  { id: "all", label: "ALL" },
  { id: "week", label: "WEEK" },
  { id: "day", label: "DAY" },
] as const;

/** Running total XP, scrubbable; `series` is `null` while it loads. */
export function XpHistoryCard({
  series,
  failed,
  onRetry,
}: {
  series: Record<(typeof RANGES)[number]["id"], number[]> | null;
  failed: boolean;
  onRetry: () => void;
}) {
  const [rangeId, setRangeId] = useState<(typeof RANGES)[number]["id"]>("all");
  // `null` follows the latest point.
  const [selected, setSelected] = useState<number | null>(null);
  const values = series?.[rangeId] ?? [];
  const shown = values[selected ?? values.length - 1] ?? 0;

  return (
    <Panel label="XP history" className="p-3.5">
      <h3 className="flex items-center gap-2 font-display text-md font-black leading-compact tracking-label text-cyan">
        <ShowChartIcon size={20} />
        XP HISTORY
      </h3>

      <div role="tablist" aria-label="Range" className="mt-3 grid grid-cols-3 gap-2">
        {RANGES.map((r) => {
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
              className={`h-11 border font-display text-2xs font-black tracking-wide transition-colors duration-150 ${active ? "border-cyan/72 bg-cyan/14 text-cyan" : "border-line-strong/28 text-muted hover:text-foreground"}`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {series ? (
        <InteractiveLineChart
          values={values}
          selectedIndex={selected}
          onSelectedIndexChange={setSelected}
          label="Total XP over time"
          valueText={(value) => `${formatAmount(value)} XP`}
          accent={CYAN}
          height="clamp(11rem, 22vw, 14rem)"
          className="mt-3"
        />
      ) : failed ? (
        <div className="mt-3 grid h-44 place-content-center justify-items-center gap-2 border border-line text-center">
          <p className="font-sans text-sm text-muted">
            Couldn&apos;t load your XP history.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="font-display text-2xs font-black tracking-wide text-cyan hover:text-foreground"
          >
            TRY AGAIN
          </button>
        </div>
      ) : (
        <div
          role="status"
          aria-label="Loading XP history"
          className="mt-3 h-44 animate-pulse bg-surface-elevated/50"
        />
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-display text-micro font-black tracking-wide text-muted">
          TOTAL XP
        </span>
        <span className="ds-tabular font-display text-base font-black leading-compact text-cyan">
          {formatAmount(shown)}
        </span>
      </div>
    </Panel>
  );
}

/** Earned, lost and net over the entries shown. */
export function XpTotals({ earned, lost }: { earned: number; lost: number }) {
  const net = earned - lost;
  const label = withAlpha(CYAN, 0.9);
  const fill = `color-mix(in srgb, var(--ds-color-background-secondary) 86%, var(--ds-color-background-elevated))`;
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCell
        label="EARNED"
        labelColor={label}
        fill={fill}
        valueColor={earned > 0 ? SUCCESS : undefined}
      >
        {formatAmount(earned)}
      </StatCell>
      <StatCell
        label="LOST"
        labelColor={label}
        fill={fill}
        valueColor={lost > 0 ? DANGER : undefined}
      >
        {formatAmount(lost)}
      </StatCell>
      <StatCell
        label="NET"
        labelColor={label}
        fill={fill}
        valueColor={net < 0 ? DANGER : SUCCESS}
      >
        {formatChange(net)}
      </StatCell>
    </div>
  );
}

export type XpChip = { id: string; label: string; count?: number };

/** A sideways-scrolling row of filter chips. */
export function XpChips({
  label,
  chips,
  active,
  onSelect,
}: {
  label: string;
  chips: XpChip[];
  active: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-2 overflow-x-auto pt-px pb-1 scrollbar-none"
    >
      {chips.map((chip) => {
        const on = chip.id === active;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(chip.id)}
            className={`shrink-0 transition-[transform,color] duration-150 hover:-translate-y-px motion-reduce:transform-none ${on ? "text-cyan" : "text-muted hover:text-foreground"}`}
          >
            <Cut
              edge={on ? onPage(CYAN, 72) : onPage("var(--ds-color-border-strong)", 28)}
              fill={on ? onPage(CYAN, 14) : "var(--ds-color-background-primary)"}
              className="flex h-11 items-center gap-1.5 px-3"
            >
              <span className="font-display text-xs font-black tracking-label">
                {chip.label}
              </span>
              {chip.count === undefined ? null : (
                <span className="ds-tabular font-display text-micro opacity-70">
                  {formatInt(chip.count)}
                </span>
              )}
            </Cut>
          </button>
        );
      })}
    </div>
  );
}

/** One XP change: green when gained, red when lost, cyan for the opening balance. */
export function XpEntryRow({ entry }: { entry: XpEntry }) {
  const change = signedXp(entry);
  const { label, icon: Icon } = xpTrack(entry);
  const color =
    entry.xpSource === "OPENING_BALANCE" ? CYAN : change < 0 ? DANGER : SUCCESS;
  return (
    <li className="flex items-center gap-3 border border-line bg-surface p-3.5 max-[24rem]:flex-wrap">
      <span
        aria-hidden
        className="grid size-9.5 shrink-0 place-items-center border"
        style={{
          borderColor: withAlpha(color, 0.55),
          background: withAlpha(color, 0.12),
          color,
        }}
      >
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-black leading-compact tracking-label uppercase">
          {entry.title ?? `${label} XP`}
        </span>
        <span className="mt-1.5 block truncate font-sans text-xs leading-compact text-muted">
          {formatXpTime(entry.date)}
        </span>
      </span>
      <span className="shrink-0 text-right max-[24rem]:flex max-[24rem]:w-full max-[24rem]:items-baseline max-[24rem]:justify-between max-[24rem]:pl-12.5">
        <span
          className="ds-tabular block font-display text-base font-black leading-compact"
          style={{ color }}
        >
          {formatChange(change)}
        </span>
        <span className="ds-tabular mt-1.5 block font-display text-micro font-black tracking-wide text-muted">
          {formatAmount(entry.scopeXP)} {label} XP
        </span>
      </span>
    </li>
  );
}
