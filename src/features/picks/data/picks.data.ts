import {
  dataOrThrow,
  eventOptionSchema,
  getEvent,
  getEventBets,
  getEventOdds,
  getFuture,
  getFutureBets,
  getFutureOdds,
  getPrediction,
  getPredictionBets,
  getPredictionOdds,
  predictionSideSchema,
  submitEventBet,
  submitFutureBet,
  submitPrediction,
  type ApiResult,
  type EventDetail,
  type FutureDetail,
  type PredictionDetail,
} from "@/core";
import { spendCoins } from "@/features/auth";
import { setResource, useResource } from "@/hooks/useResource";
import type { PickType } from "@/utils";

import type { Bet, OddsPoint, Outcome } from "../adapters";

export type Pick =
  | { type: "prediction"; data: PredictionDetail }
  | { type: "event"; data: EventDetail }
  | { type: "future"; data: FutureDetail };

const pickKey = (type: PickType, id: string) => `picks/${type}/${id}`;

const LOAD: Record<PickType, (id: string) => Promise<Pick>> = {
  prediction: (id) =>
    getPrediction(id).then((result) => ({ type: "prediction", data: dataOrThrow(result) })),
  event: (id) =>
    getEvent(id).then((result) => ({ type: "event", data: dataOrThrow(result) })),
  future: (id) =>
    getFuture(id).then((result) => ({ type: "future", data: dataOrThrow(result) })),
};

/**
 * One prediction, event or future by its code (`predictionId`, `eventId` or
 * `futureId`); nothing until signed in.
 */
export function usePick(type: PickType, code: string, signedIn: boolean) {
  return useResource(
    signedIn ? { key: pickKey(type, code), load: () => LOAD[type](code) } : null,
  );
}

/** The code a pick is addressed by. */
const codeOf = (pick: Pick) =>
  pick.type === "prediction"
    ? pick.data.predictionId
    : pick.type === "event"
      ? pick.data.eventId
      : pick.data.futureId;

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

const REASONS: Record<string, string> = {
  "Insufficient coins": "Not enough Oz Coins for this stake.",
};

function betError(result: Exclude<ApiResult<unknown>, { success: true }>) {
  // The 429 body is plain text, shared by every submit endpoint.
  if (result.statusCode === 429) return "Too many submissions. Try again in a minute.";
  // A rejected bet puts its reason in `data.error`; other errors in `message`.
  const data = "data" in result ? result.data : null;
  const reason =
    typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
      ? data.error
      : result.message;
  return REASONS[reason] ?? reason;
}

/**
 * Bets `coins` on `outcome`. The pick on screen takes its new pools and odds
 * from the answer, and the stake leaves the balance. Resolves to the error to
 * show, or `null` once the bet is placed.
 */
export async function placeBet(pick: Pick, outcome: Outcome, coins: number): Promise<string | null> {
  // Kept under the code, which is how the page asked for it.
  const key = pickKey(pick.type, codeOf(pick));
  try {
    if (pick.type === "prediction") {
      const result = await submitPrediction(pick.data._id, {
        teamChosen: predictionSideSchema.parse(outcome.betValue),
        coinsBet: coins,
      });
      if (!result.success) return betError(result);
      const { coinsOnTeamA, coinsOnTeamB, coinsOnDraw, totalCoins, oddsTeamA, oddsTeamB, oddsDraw, predictionStatus } =
        result.data;
      setResource<Pick>(key, {
        type: "prediction",
        data: { ...pick.data, coinsOnTeamA, coinsOnTeamB, coinsOnDraw, totalCoins, oddsTeamA, oddsTeamB, oddsDraw, predictionStatus },
      });
    } else if (pick.type === "event") {
      const result = await submitEventBet(pick.data._id, {
        chosenOption: eventOptionSchema.parse(outcome.betValue),
        coinsBet: coins,
      });
      if (!result.success) return betError(result);
      const next = result.data;
      setResource<Pick>(key, {
        type: "event",
        data: {
          ...pick.data,
          coinsOnYes: next.coinsOnYes,
          coinsOnNo: next.coinsOnNo,
          totalCoins: next.totalCoins,
          eventStatus: next.eventStatus,
          // Named `yesOdds`… in this answer.
          oddsYes: next.yesOdds,
          oddsNo: next.noOdds,
          oddsMaybe: next.maybeOdds,
        },
      });
    } else {
      const result = await submitFutureBet(pick.data._id, {
        futureChoiceId: outcome.betValue,
        coinsBet: coins,
      });
      if (!result.success) return betError(result);
      const { future, submission } = result.data;
      setResource<Pick>(key, {
        type: "future",
        data: {
          ...pick.data,
          futureStatus: future.futureStatus,
          totalCoinsPlaced: pick.data.totalCoinsPlaced + submission.coinsBet,
          // The answer's choices carry no odds; the bet's snapshot has them, by `choiceId`.
          choices: pick.data.choices.map((choice) => ({
            ...choice,
            choiceCoins:
              future.choices.find((c) => c._id === choice._id)?.choiceCoins ?? choice.choiceCoins,
            odds: submission.choiceOddsAtBetTime[choice.choiceId] ?? choice.odds,
          })),
        },
      });
    }
    spendCoins(coins);
    reloadAfterBet(pick);
    return null;
  } catch {
    return "Couldn't place your pick. Try again.";
  }
}
