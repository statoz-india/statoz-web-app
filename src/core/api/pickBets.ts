import {
  eventOptionSchema,
  predictionSideSchema,
  type ApiResult,
  type EventDetail,
  type FutureDetail,
  type PredictionDetail,
} from "@/core/models";
import type { PickType } from "@/utils";

import { dataOrThrow } from "./client";
import {
  getEvent,
  getFuture,
  getPrediction,
  submitEventBet,
  submitFutureBet,
  submitPrediction,
} from "./picks";

/** One prediction, event or future market, with its pools and odds. */
export type Pick =
  | { type: "prediction"; data: PredictionDetail }
  | { type: "event"; data: EventDetail }
  | { type: "future"; data: FutureDetail };

/** The code a pick is addressed by: its `predictionId`, `eventId` or `futureId`. */
export const pickCode = (pick: Pick) =>
  pick.type === "prediction"
    ? pick.data.predictionId
    : pick.type === "event"
      ? pick.data.eventId
      : pick.data.futureId;

/**
 * One market by its code (`predictionId`, `eventId` or `futureId`). Rejects
 * when the call fails, which is what the resource store expects.
 */
export function loadPick(type: PickType, code: string): Promise<Pick> {
  if (type === "prediction") {
    return getPrediction(code).then((result) => ({ type, data: dataOrThrow(result) }));
  }
  if (type === "event") {
    return getEvent(code).then((result) => ({ type, data: dataOrThrow(result) }));
  }
  return getFuture(code).then((result) => ({ type, data: dataOrThrow(result) }));
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
 * Bets `coins` on the outcome whose bet value is `betValue`. Resolves to the
 * market with the pools and odds the answer moved, or the error to show.
 */
export async function submitPickBet(
  pick: Pick,
  betValue: string,
  coins: number,
): Promise<{ pick: Pick } | { error: string }> {
  try {
    if (pick.type === "prediction") {
      const result = await submitPrediction(pick.data._id, {
        teamChosen: predictionSideSchema.parse(betValue),
        coinsBet: coins,
      });
      if (!result.success) return { error: betError(result) };
      const { coinsOnTeamA, coinsOnTeamB, coinsOnDraw, totalCoins, oddsTeamA, oddsTeamB, oddsDraw, predictionStatus } =
        result.data;
      return {
        pick: {
          type: "prediction",
          data: { ...pick.data, coinsOnTeamA, coinsOnTeamB, coinsOnDraw, totalCoins, oddsTeamA, oddsTeamB, oddsDraw, predictionStatus },
        },
      };
    }
    if (pick.type === "event") {
      const result = await submitEventBet(pick.data._id, {
        chosenOption: eventOptionSchema.parse(betValue),
        coinsBet: coins,
      });
      if (!result.success) return { error: betError(result) };
      const next = result.data;
      return {
        pick: {
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
        },
      };
    }
    const result = await submitFutureBet(pick.data._id, {
      futureChoiceId: betValue,
      coinsBet: coins,
    });
    if (!result.success) return { error: betError(result) };
    const { future, submission } = result.data;
    return {
      pick: {
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
      },
    };
  } catch {
    return { error: "Couldn't place your pick. Try again." };
  }
}
