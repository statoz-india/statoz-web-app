"use client";

import { useState, type ReactNode } from "react";

import { formatInt } from "@/utils";

import { leaderOf, sharePrice, type Market, type Outcome, type Ticket } from "../adapters";
import { BuySheet } from "./buySheet.widget";
import { MarketHeader } from "./marketHeader.widget";
import { PickLocked, type LockedPick } from "./pickLocked.widget";
import { Outcomes } from "./outcomes.widget";

/** The market page: header and odds on the left, outcomes and tickets on the right from 960px. */
export function PickMarket({
  market,
  initialOutcome,
  tickets,
  chart,
  onBuy,
}: {
  market: Market;
  /** Selected first; otherwise the newest ticket's outcome, then the leader. */
  initialOutcome: string | null;
  tickets: Ticket[];
  /** MARKET ODDS, or its loading or error state, under the header. */
  chart: ReactNode;
  /** Places the bet; resolves to the error to show, or `null`. */
  onBuy: (outcome: Outcome, coins: number) => Promise<string | null>;
}) {
  const [picked, setPicked] = useState(initialOutcome);
  const [buying, setBuying] = useState<Outcome | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);
  const [locked, setLocked] = useState<LockedPick | null>(null);
  const leader = leaderOf(market.outcomes);
  const selected =
    market.outcomes.find((o) => o.key === picked) ??
    market.outcomes.find((o) => o.key === tickets[0]?.key) ??
    leader;

  return (
    <div className="mx-auto grid w-full max-w-295 gap-3.5 px-4 pt-1.5 pb-7 min-[60rem]:grid-cols-[1.25fr_minmax(21.25rem,0.85fr)] min-[60rem]:items-start min-[60rem]:gap-5.5 min-[60rem]:px-6 min-[60rem]:pt-3.5 min-[60rem]:pb-8">
      <div className="flex min-w-0 flex-col gap-3.5">
        <MarketHeader market={market} leader={leader} />
        {chart}
      </div>
      <div className="flex min-w-0 flex-col gap-3.5 min-[60rem]:sticky min-[60rem]:top-0">
        <Outcomes
          market={market}
          selected={selected}
          tickets={tickets}
          placed={placed}
          onSelect={setPicked}
          onBuy={(outcome) => {
            setPicked(outcome.key);
            setBuying(outcome);
          }}
        />
      </div>
      {buying ? (
        <BuySheet
          market={market}
          outcome={buying}
          onClose={() => setBuying(null)}
          onBuy={async (coins) => {
            // The share price before this bet moves the odds.
            const shares = Math.floor(coins / sharePrice(buying));
            const failed = await onBuy(buying, coins);
            if (!failed) {
              setPlaced(`Pick placed: ${formatInt(coins)} Oz on ${buying.label}.`);
              setLocked({ outcome: buying.label, stake: coins, shares });
            }
            return failed;
          }}
        />
      ) : null}
      {locked ? <PickLocked pick={locked} onDone={() => setLocked(null)} /> : null}
    </div>
  );
}
