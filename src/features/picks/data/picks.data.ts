import {
  dataOrThrow,
  getEventBets,
  getEventOdds,
  getFutureBets,
  getFutureOdds,
  getPredictionBets,
  getPredictionOdds,
  loadPick,
  pickCode,
  submitPickBet,
  type Pick,
} from "@/core";
import { spendCoins } from "@/features/auth";
import { setResource, useResource } from "@/hooks/useResource";
import { trackBet } from "@/lib/components/pick-sheet";
import type { PickType } from "@/utils";

import type { Bet, OddsPoint, Outcome } from "../adapters";

export type { Pick };

const pickKey = (type: PickType, id: string) => `picks/${type}/${id}`;

/**
 * One prediction, event or future by its code (`predictionId`, `eventId` or
 * `futureId`); nothing until signed in.
 */
export function usePick(type: PickType, code: string, signedIn: boolean) {
  return useResource(
    signedIn ? { key: pickKey(type, code), load: () => loadPick(type, code) } : null,
  );
}

// A pick's bets and odds are asked for, and kept, by its `_id`.
const betsKey = (pick: Pick) => `${pickKey(pick.type, pick.data._id)}/bets`;
const oddsKey = (pick: Pick) => `${pickKey(pick.type, pick.data._id)}/odds`;

const LOAD_BETS: Record<PickType, (id: string) => Promise<Bet[]>> = {
  prediction: (id) =>
    getPredictionBets(id).then((result) =>
      dataOrThrow(result).map((bet) => ({
        id: bet._id,
        key: bet.teamChosen,
        coins: bet.coinsBet,
        price: bet.optionOddsAtBetTime[bet.teamChosen] ?? 0,
        payout: bet.payoutStatus,
      })),
    ),
  event: (id) =>
    getEventBets(id).then((result) =>
      dataOrThrow(result).map((bet) => ({
        id: bet._id,
        key: bet.chosenOption,
        label:
          bet.chosenOption === "Y"
            ? bet.event.yesPlaceholder
            : bet.chosenOption === "N"
              ? bet.event.noPlaceholder
              : bet.event.maybePlaceholder,
        coins: bet.coinsBet,
        price: bet.oddsChoice,
        payout: bet.payoutStatus,
      })),
    ),
  future: (id) =>
    getFutureBets(id).then((result) =>
      dataOrThrow(result).map((bet) => ({
        id: bet._id,
        key: bet.futureChoiceId.choiceId,
        label: bet.futureChoiceId.choiceName,
        coins: bet.coinsBet,
        price: bet.oddsChoice,
        payout: bet.payoutStatus,
      })),
    ),
};

/** A bet with no saved snapshot comes as `{}`, and is skipped. */
const toPoints = (
  points: { odds?: Record<string, number>; createdAt?: string }[],
): OddsPoint[] =>
  points.flatMap(({ odds, createdAt }) =>
    odds && createdAt ? [{ at: Date.parse(createdAt), odds }] : [],
  );

const LOAD_ODDS: Record<PickType, (id: string) => Promise<OddsPoint[]>> = {
  prediction: (id) =>
    getPredictionOdds(id).then((result) =>
      toPoints(dataOrThrow(result).map((p) => ({ odds: p.optionOddsAtBetTime, createdAt: p.createdAt }))),
    ),
  event: (id) =>
    getEventOdds(id).then((result) =>
      toPoints(dataOrThrow(result).map((p) => ({ odds: p.optionOddsAtBetTime, createdAt: p.createdAt }))),
    ),
  future: (id) =>
    getFutureOdds(id).then((result) =>
      toPoints(dataOrThrow(result).map((p) => ({ odds: p.choiceOddsAtBetTime, createdAt: p.createdAt }))),
    ),
};

/** The player's own bets on this pick, newest first; nothing until it loads. */
export function usePickBets(pick: Pick | undefined) {
  return useResource(
    pick ? { key: betsKey(pick), load: () => LOAD_BETS[pick.type](pick.data._id) } : null,
  );
}

/** The pick's odds after each bet, oldest first; nothing until it loads. */
export function usePickOdds(pick: Pick | undefined) {
  return useResource(
    pick ? { key: oddsKey(pick), load: () => LOAD_ODDS[pick.type](pick.data._id) } : null,
  );
}

/** After a bet: its ticket and the odds it moved. A failure keeps what's shown. */
function reloadAfterBet(pick: Pick) {
  void LOAD_BETS[pick.type](pick.data._id)
    .then((bets) => setResource(betsKey(pick), bets))
    .catch(() => {});
  void LOAD_ODDS[pick.type](pick.data._id)
    .then((odds) => setResource(oddsKey(pick), odds))
    .catch(() => {});
}

/**
 * Bets `coins` on `outcome`. The pick on screen takes its new pools and odds
 * from the answer, and the stake leaves the balance. Resolves to the error to
 * show, or `null` once the bet is placed.
 */
export async function placeBet(pick: Pick, outcome: Outcome, coins: number): Promise<string | null> {
  const result = await submitPickBet(pick, outcome.betValue, coins);
  trackBet(pick, outcome, coins, "pick_page", "error" in result ? result.error : null);
  if ("error" in result) return result.error;
  // Kept under the code, which is how the page asked for it.
  setResource<Pick>(pickKey(pick.type, pickCode(pick)), result.pick);
  spendCoins(coins);
  reloadAfterBet(pick);
  return null;
}
