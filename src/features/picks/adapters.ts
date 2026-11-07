import type { Pick } from "@/core";
import { multiplier, type Outcome } from "@/lib/components/pick-sheet";

// The market's view and pricing are shared with the cards' quick pick.
export {
  isTrading,
  leaderOf,
  marketOf,
  multiplier,
  sharePrice,
  type Market,
  type Outcome,
  type Tag,
} from "@/lib/components/pick-sheet";

/** "At 41%, every share costs 41 Oz and pays 100 Oz (2.44×) if correct." */
export function priceRule(percent: number): string {
  const payout = percent > 0 ? ` (${multiplier(percent)})` : "";
  return `At ${percent}%, every share costs ${percent} Oz and pays 100 Oz${payout} if correct.`;
}

/** One of the player's bets, as the tickets read it. */
export type Bet = {
  /** The bet's own `_id`. */
  id: string;
  /** The outcome's `key`. */
  key: string;
  /** The outcome's name as the bet carries it, if it does. */
  label?: string;
  coins: number;
  /** The outcome's price (%) when the bet was placed. */
  price: number;
  /** `PENDING` / `ONGOING` until settled, then `PAID` or `LOST`. */
  payout: string;
};

export type Ticket = {
  id: string;
  /** The outcome's `key`. */
  key: string;
  label: string;
  stake: number;
  shares: number;
  status: "PENDING" | "WON" | "LOST";
};

/**
 * One ticket per bet, as the API sends them (newest first), including bets
 * on outcomes the market doesn't list. A bet's shares are the whole shares
 * its stake bought at its price; the rest of an odd stake buys none.
 */
export function ticketsOf(outcomes: Outcome[], bets: Bet[]): Ticket[] {
  return bets.map((bet) => ({
    id: bet.id,
    key: bet.key,
    label: outcomes.find((o) => o.key === bet.key)?.label ?? bet.label ?? bet.key,
    stake: bet.coins,
    shares: Math.floor(bet.coins / Math.max(1, Math.round(bet.price))),
    status: bet.payout === "PAID" ? "WON" : bet.payout === "LOST" ? "LOST" : "PENDING",
  }));
}

/** The odds (%) by outcome `key` at one moment. */
export type OddsPoint = { at: number; odds: Record<string, number> };

/** Each pool's share of the seeds: the odds before the first bet, at creation. */
export function openingOdds(pick: Pick): OddsPoint {
  const pools: Record<string, number> =
    pick.type === "prediction"
      ? {
          A: pick.data.initialCoinsOnTeamA,
          B: pick.data.initialCoinsOnTeamB,
          D: pick.data.initialCoinsOnDraw,
        }
      : pick.type === "event"
        ? {
            Y: pick.data.initialCoinsOnYes,
            N: pick.data.initialCoinsOnNo,
            M: pick.data.initialCoinsOnMaybe ?? 0,
          }
        : Object.fromEntries(
            pick.data.choices.map((c) => [c.choiceId, c.initialCoinsOnChoice]),
          );
  const total = Object.values(pools).reduce((sum, coins) => sum + coins, 0);
  return {
    at: Date.parse(pick.data.createdAt),
    odds: Object.fromEntries(
      Object.entries(pools).map(([key, coins]) => [key, total ? (coins / total) * 100 : 0]),
    ),
  };
}

export type Range = "all" | "week" | "day";

const RANGE_MS: Record<Range, number> = {
  all: Infinity,
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

/**
 * The points a range draws, and how many bets it holds. A range starts at
 * the odds in effect when it begins (the opening odds for ALL); one with no
 * bets is a flat line at the current odds.
 */
export function rangeSeries(
  opening: OddsPoint,
  history: OddsPoint[],
  range: Range,
  now: number,
  current: Record<string, number>,
): { points: OddsPoint[]; bets: number } {
  const start = now - RANGE_MS[range];
  const inRange = history.filter((p) => p.at >= start);
  if (!inRange.length) {
    const flat = { at: now, odds: current };
    return { points: [flat, flat], bets: 0 };
  }
  const before = [opening, ...history].filter((p) => p.at < start).at(-1);
  return { points: [before ?? opening, ...inRange], bets: inRange.length };
}
