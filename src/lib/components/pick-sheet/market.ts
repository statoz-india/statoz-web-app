import type { EventStatus, FutureStatus, Pick, PredictionStatus, Team } from "@/core";
import { colors, liftForContrast } from "@/styles";
import { formatKickoffDate, formatKickoffTime, formatOzCompact, toISTDate, todayInIST } from "@/utils";

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
