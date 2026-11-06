import type { EventStatus, FutureStatus, PredictionStatus, Team } from "@/core";
import { colors, liftForContrast } from "@/styles";
import { formatKickoffDate, formatKickoffTime, formatOzCompact, toISTDate, todayInIST } from "@/utils";

import type { Pick } from "./data/picks.data";

/** The market's state, as its status pill. */
export type Tag = "open" | "live" | "unresolved" | "settled" | "void";

// Closed but not yet settled reads as unresolved; `null` is never shown.
const PREDICTION_TAG: Record<PredictionStatus, Tag | null> = {
  UPCOMING: "open",
  ACTIVE: "open",
  LIVE: "live",
  FINISHED: "unresolved",
  WINNING_TEAM_UPDATED: "unresolved",
  SUSPENDED: "unresolved",
  NOT_ENOUGH_DATA: "unresolved",
  POSTPONED: "unresolved",
  UNRESOLVED: "unresolved",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  ABANDONED: "void",
  NO_RESULT: "void",
  NOT_VISIBLE: null,
  ADMIN_VISIBLE: null,
};

const EVENT_TAG: Record<EventStatus, Tag | null> = {
  UPCOMING: "open",
  ACTIVE: "live",
  FINISHED: "unresolved",
  WINNING_OPTION_UPDATED: "unresolved",
  SUSPENDED: "unresolved",
  NOT_ENOUGH_DATA: "unresolved",
  POSTPONED: "unresolved",
  UNRESOLVED: "unresolved",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  ABANDONED: "void",
  NO_RESULT: "void",
  DELETED: null,
};

const FUTURE_TAG: Record<FutureStatus, Tag | null> = {
  UPCOMING: "open",
  ACTIVE: "open",
  FINISHED: "unresolved",
  WINNING_OPTION_UPDATED: "unresolved",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  DELETED: null,
};

export type Outcome = {
  /** A side (`A`), an option (`Y`) or a choice's `choiceId`. */
  key: string;
  /** What a bet sends: the key, or a future choice's `_id`. */
  betValue: string;
  label: string;
  /** Rounded share of the pool, 0–100. */
  percent: number;
  color: string;
};

export type Market = {
  kind: "match" | "event" | "future";
  tag: Tag;
  league: string;
  question: string;
  /** Empty for a future, which has no fixture. */
  context: string;
  volume: string;
  closes: string;
  /** When it stops taking picks, whatever its status says. */
  closeTime: string;
  outcomes: Outcome[];
  /** The fixture behind it, for the quiz link. */
  matchId: string | null;
  /** Its sport, for the link; an event's response doesn't carry one. */
  gameType: string | null;
};

/**
 * Only an open or live market takes entries, and only before its close
 * time. `now` is `null` until the clock starts, when the status alone counts.
 */
export const isTrading = (market: Market, now: number | null) =>
  (market.tag === "open" || market.tag === "live") &&
  (now === null || now < Date.parse(market.closeTime));

/** An event closes at kick-off or its entry close, whichever comes first. */
const earlier = (a: string, b: string | null | undefined) =>
  b && Date.parse(b) < Date.parse(a) ? b : a;

const teamName = (team: Team) => team.displayName || team.name;

// A colour too dark for the page is lightened toward white until it stands out.
const outcome = (
  key: string,
  label: string,
  odds: number,
  color: string | null,
  betValue = key,
): Outcome => ({
  key,
  betValue,
  label,
  percent: Math.round(odds),
  color: liftForContrast(color || colors.accent.cyan, {
    against: colors.background.primary,
    ratio: 2.2,
  }),
});

/** `04:00` when it's today in India time, else `5 NOV 04:00`. */
function closesLabel(iso: string): string {
  const time = formatKickoffTime(iso);
  return toISTDate(new Date(iso)) === todayInIST() ? time : `${formatKickoffDate(iso)} ${time}`;
}

/** The detail screen's view of a pick; `null` for a status the app never shows. */
export function marketOf(pick: Pick): Market | null {
  if (pick.type === "prediction") {
    const p = pick.data;
    const tag = PREDICTION_TAG[p.predictionStatus];
    if (tag === null) return null;
    const outcomes = [
      outcome("A", teamName(p.teamA), p.oddsTeamA, p.teamA.primaryColor),
      outcome("B", teamName(p.teamB), p.oddsTeamB, p.teamB.primaryColor),
    ];
    // The draw sits between the teams, in neutral slate.
    if (p.oddsDraw !== null) {
      outcomes.splice(1, 0, outcome("D", "Draw", p.oddsDraw, colors.rarity.silver.deep));
    }
    return {
      kind: "match",
      tag,
      league: p.tournamentData.tournament || p.tournament,
      question: `${teamName(p.teamA)} vs ${teamName(p.teamB)} result`,
      context: p.tournamentData.tournamentName,
      volume: `${formatOzCompact(p.totalCoins)} Oz`,
      // A prediction closes at kick-off.
      closes: closesLabel(p.matchStartTime),
      closeTime: p.matchStartTime,
      outcomes,
      matchId: p.matchId,
      gameType: p.gameType,
    };
  }

  if (pick.type === "event") {
    const e = pick.data;
    const tag = EVENT_TAG[e.eventStatus];
    if (tag === null) return null;
    const outcomes = [
      outcome("Y", e.yesPlaceholder, e.oddsYes, e.yesPlaceholderColor),
      outcome("N", e.noPlaceholder, e.oddsNo, e.noPlaceholderColor),
    ];
    if (e.haveThreeOptions && e.oddsMaybe !== null) {
      outcomes.push(
        outcome("M", e.maybePlaceholder ?? "Maybe", e.oddsMaybe, e.maybePlaceholderColor),
      );
    }
    return {
      kind: "event",
      tag,
      league: e.tournamentData.tournament,
      question: e.eventName,
      context:
        e.teamA && e.teamB
          ? `${teamName(e.teamA)} vs ${teamName(e.teamB)}`
          : e.tournamentData.tournamentName,
      volume: `${formatOzCompact(e.totalCoins)} Oz`,
      closes: closesLabel(earlier(e.entryCloseTime, e.matchStartTime)),
      closeTime: earlier(e.entryCloseTime, e.matchStartTime),
      outcomes,
      matchId: e.matchId ?? null,
      gameType: null,
    };
  }

  const f = pick.data;
  const tag = FUTURE_TAG[f.futureStatus];
  if (tag === null) return null;
  return {
    kind: "future",
    tag,
    league: f.tournamentData.tournament,
    question: f.eventName,
    context: "",
    volume: `${formatOzCompact(f.totalCoinsPlaced)} Oz`,
    closes: closesLabel(f.entryCloseTime),
    closeTime: f.entryCloseTime,
    outcomes: f.choices
      .filter((choice) => choice.isVisible)
      .map((choice) =>
        outcome(
          choice.choiceId,
          choice.choiceName,
          choice.odds,
          choice.teamDetails?.primaryColor ?? choice.placeholderColor,
          choice._id,
        ),
      ),
    matchId: null,
    gameType: null,
  };
}

/** Highest price wins; on a tie the earlier outcome stays. */
export const leaderOf = (outcomes: Outcome[]) =>
  outcomes.reduce((leader, o) => (o.percent > leader.percent ? o : leader));

/** 100 ÷ price to two decimals, trailing zeros dropped: 27 → `3.7×`, 50 → `2×`. */
export const multiplier = (percent: number) => `${Number((100 / percent).toFixed(2))}×`;

/** A share costs its price in Oz, at least 1, and pays 100 Oz if right. */
export const sharePrice = (outcome: Outcome) => Math.max(1, outcome.percent);

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
