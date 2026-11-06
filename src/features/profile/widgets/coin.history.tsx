"use client";

import Image from "next/image";
import { useState } from "react";

import { IMAGES } from "@/config/images";
import type { CoinEntry, LedgerType } from "@/core";
import { Button } from "@/lib/components/button";
import type { IconProps } from "@/lib/icons";
import { formatOzCompact } from "@/utils";

import {
  coinMoves,
  coinSource,
  formatAmount,
  formatChange,
  formatDateTime,
} from "../adapters";
import { Overlay } from "../components/overlay";
import { Cut, StatCell } from "../components/surfaces";
import { useCoinFeed, useCoinMap } from "../data/profile.data";

const GOLD = "var(--ds-color-accent-gold)";
const SUCCESS = "var(--ds-color-success)";
const DANGER = "var(--ds-color-danger)";
const gold = (percent: number) =>
  `color-mix(in srgb, ${GOLD} ${percent}%, transparent)`;

const FILTERS: { id: string; label: string; ledgerType?: LedgerType }[] = [
  { id: "all", label: "ALL" },
  { id: "earned", label: "EARNED", ledgerType: "CREDITED" },
  { id: "spent", label: "SPENT", ledgerType: "DEBITED" },
];

/** Every coin change, newest first. `balance` is the player's live balance. */
export function CoinHistorySheet({
  balance,
  onClose,
}: {
  balance: number;
  onClose: () => void;
}) {
  const [filterId, setFilterId] = useState("all");
  const [pages, setPages] = useState(1);
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0];
  const feed = useCoinFeed(filter.ledgerType, pages);
  const map = useCoinMap();

  // All time, so the first change ever counts from 0.
  const allTime = map.data
    ? coinMoves([0, ...map.data.points.map((p) => p.y)])
    : undefined;
  const entries = feed.resources.flatMap((page) => page.data?.items ?? []);
  const last = feed.resources[feed.resources.length - 1];
  const cellFill = `color-mix(in srgb, var(--ds-color-background-secondary) 86%, var(--ds-color-background-elevated))`;

  return (
    <Overlay
      title="OZ COIN HISTORY"
      icon={OzCoinIcon}
      accent={GOLD}
      size="full"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-3 gap-2">
          <StatCell label="BALANCE" labelColor={gold(90)} fill={cellFill}>
            {formatOzCompact(balance)}
          </StatCell>
          <StatCell
            label="EARNED"
            labelColor={gold(90)}
            fill={cellFill}
            valueColor={allTime?.earned ? SUCCESS : undefined}
          >
            {allTime ? formatOzCompact(allTime.earned) : "–"}
          </StatCell>
          <StatCell
            label="SPENT"
            labelColor={gold(90)}
            fill={cellFill}
            valueColor={allTime?.spent ? DANGER : undefined}
          >
            {allTime ? formatOzCompact(allTime.spent) : "–"}
          </StatCell>
        </div>

        <div role="group" aria-label="Filter" className="flex gap-2 pb-1">
          {FILTERS.map((f) => {
            const on = f.id === filter.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setFilterId(f.id);
                  setPages(1);
                }}
                className={`transition-colors duration-150 ${on ? "text-gold" : "text-muted hover:text-foreground"}`}
              >
                <Cut
                  edge={on ? GOLD : "var(--ds-color-border-default)"}
                  fill={
                    on
                      ? `color-mix(in srgb, ${GOLD} 12%, var(--ds-color-background-secondary))`
                      : "var(--ds-color-background-secondary)"
                  }
                  className="flex h-11 items-center px-4 font-display text-2xs font-black tracking-wide"
                >
                  {f.label}
                </Cut>
              </button>
            );
          })}
        </div>

        {entries.length ? (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <CoinEntryRow key={entry._id} entry={entry} />
            ))}
          </ul>
        ) : last.status === "loading" ? (
          <div
            role="status"
            aria-label="Loading coin history"
            className="h-48 animate-pulse bg-surface-elevated/50"
          />
        ) : last.status === "ready" ? (
          <Cut
            edge="var(--ds-color-border-muted)"
            fill="var(--ds-color-background-secondary)"
            className="grid min-h-48 place-items-center p-6 text-center font-display text-xs font-black tracking-label text-muted"
          >
            {map.data?.points.length === 0
              ? "NO COIN HISTORY YET"
              : "NO COIN MOVES MATCH THIS FILTER"}
          </Cut>
        ) : null}

        {last.status === "error" ? (
          <div className="grid justify-items-center gap-3 py-4 text-center">
            <p className="font-sans text-sm text-muted">
              Couldn&apos;t load your coin history.
            </p>
            <Button variant="tonal" size="sm" accent={GOLD} onClick={feed.reload}>
              TRY AGAIN
            </Button>
          </div>
        ) : (
            // A page that's loading after earlier ones keeps the button, pending.
            last.status === "loading" ? entries.length > 0 : last.data?.hasMore
          ) ? (
          <div className="flex justify-center">
            <Button
              variant="tonal"
              accent={GOLD}
              pending={last.status === "loading"}
              onClick={() => setPages((p) => p + 1)}
            >
              LOAD MORE
            </Button>
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}

/** Green when gained, red when spent, gold for the opening balance. */
function CoinEntryRow({ entry }: { entry: CoinEntry }) {
  const change = entry.ledgerType === "CREDITED" ? entry.coins : -entry.coins;
  const source = coinSource(entry.ledgerSource);
  const color =
    entry.ledgerSource === "OPENING_BALANCE"
      ? GOLD
      : change < 0
        ? DANGER
        : SUCCESS;
  return (
    <li>
      <Cut
        edge="var(--ds-color-border-muted)"
        fill="var(--ds-color-background-secondary)"
        className="flex items-center gap-3 p-3.5"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-xs font-black tracking-tight uppercase">
            {entry.title ?? source}
          </span>
          <span className="mt-1.5 block truncate font-sans text-2xs text-muted">
            {entry.title ? `${source} · ` : ""}
            {formatDateTime(entry.date)}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span
            className="ds-tabular block font-display text-md font-black"
            style={{ color }}
          >
            {formatChange(change)}
          </span>
          <span className="ds-tabular mt-1 block font-display text-2xs font-extrabold text-muted">
            {formatAmount(entry.totalCoins)} BAL
          </span>
        </span>
      </Cut>
    </li>
  );
}

/** The overlay's header icon, as the Oz Coin glyph. */
function OzCoinIcon({ size = 20 }: IconProps) {
  return <Image src={IMAGES.icons.ozCoins} alt="" width={size} height={size} />;
}
