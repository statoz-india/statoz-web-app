import {
  eventDetailResponseSchema,
  eventOddsResponseSchema,
  futureOddsResponseSchema,
  predictionOddsResponseSchema,
  userEventBetsResponseSchema,
  userFutureBetsResponseSchema,
  userPredictionBetsResponseSchema,
  type EventOddsResponse,
  type FutureOddsResponse,
  type PredictionOddsResponse,
  type UserEventBetsResponse,
  type UserFutureBetsResponse,
  type UserPredictionBetsResponse,
  futureDetailResponseSchema,
  predictionDetailResponseSchema,
  submitEventBetResponseSchema,
  submitFutureBetResponseSchema,
  submitPredictionResponseSchema,
  type ApiResult,
  type EventDetail,
  type FutureDetail,
  type PredictionDetail,
  type SubmitEventBetBody,
  type SubmitEventBetResponse,
  type SubmitFutureBetBody,
  type SubmitFutureBetResponse,
  type SubmitPredictionBody,
  type SubmitPredictionResponse,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

// `id` is the item's Mongo `_id`, not its code. The player's bets aren't included.

/** One match prediction with its pools and odds. */
export function getPrediction(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<PredictionDetail>> {
  return authenticatedFetch(
    ENDPOINTS.prediction(id),
    predictionDetailResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** One event with its pools and odds. Cancelled and deleted events answer 404. */
export function getEvent(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<EventDetail>> {
  return authenticatedFetch(
    ENDPOINTS.event(id),
    eventDetailResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** One future with its choices and odds. Cancelled and deleted futures answer 404. */
export function getFuture(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<FutureDetail>> {
  return authenticatedFetch(
    ENDPOINTS.future(id),
    futureDetailResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/*
 * Bets. The coins leave the player's balance as soon as one succeeds. All four
 * submit calls share a budget of 10 a minute, so never send one twice at once.
 */

const post = (body: unknown, signal?: AbortSignal): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
  signal,
});

/** Answers with the prediction's new pools and odds. */
export function submitPrediction(
  id: string,
  body: SubmitPredictionBody,
  options: RequestOptions = {},
): Promise<ApiResult<SubmitPredictionResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.submitPrediction(id),
    submitPredictionResponseSchema.shape.data,
    post(body, options.signal),
  );
}

/** Answers with the event's new pools and odds, and the bet. */
export function submitEventBet(
  id: string,
  body: SubmitEventBetBody,
  options: RequestOptions = {},
): Promise<ApiResult<SubmitEventBetResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.submitEventBet(id),
    submitEventBetResponseSchema.shape.data,
    post(body, options.signal),
  );
}

/** Answers with the future's new pools, without odds, and the bet. */
export function submitFutureBet(
  id: string,
  body: SubmitFutureBetBody,
  options: RequestOptions = {},
): Promise<ApiResult<SubmitFutureBetResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.submitFutureBet(id),
    submitFutureBetResponseSchema.shape.data,
    post(body, options.signal),
  );
}

/** The player's own bets on one prediction, newest first. */
export function getPredictionBets(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<UserPredictionBetsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.predictionBets(id),
    userPredictionBetsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** The player's own bets on one event, newest first. */
export function getEventBets(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<UserEventBetsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.eventBets(id),
    userEventBetsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** The player's own bets on one future, newest first. */
export function getFutureBets(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<UserFutureBetsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.futureBets(id),
    userFutureBetsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** A prediction's odds after each bet, oldest first. An unknown id answers `[]`. */
export function getPredictionOdds(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<PredictionOddsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.predictionOdds(id),
    predictionOddsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** An event's odds after each bet, oldest first. An unknown id answers `[]`. */
export function getEventOdds(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<EventOddsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.eventOdds(id),
    eventOddsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** A future's odds after each bet, oldest first. An unknown id answers `[]`. */
export function getFutureOdds(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<FutureOddsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.futureOdds(id),
    futureOddsResponseSchema.shape.data,
    { signal: options.signal },
  );
}
