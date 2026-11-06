import {
  markResultsViewedResponseSchema,
  quizDetailResponseSchema,
  submitQuizResponseSchema,
  type ApiResult,
  type MarkResultsViewedResponse,
  type QuizDetail,
  type SubmitQuizBody,
  type SubmitQuizResponse,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/** One quiz with its questions, vote counts and the player's answers; `id` is its `_id`. */
export function getQuiz(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<QuizDetail>> {
  return authenticatedFetch(
    ENDPOINTS.quiz(id),
    quizDetailResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** Sends the player's answers. Each quiz takes one submission; a second answers 409. */
export function submitQuiz(
  id: string,
  body: SubmitQuizBody,
  options: RequestOptions = {},
): Promise<ApiResult<SubmitQuizResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.submitQuiz(id),
    submitQuizResponseSchema.shape.data,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: options.signal,
    },
  );
}

/**
 * Marks a settled match quiz's results as seen, which takes it out of the home
 * screen's `results`. `id` is the `quizId` code. Safe to call twice.
 */
export function markQuizResultsViewed(
  id: string,
  options: RequestOptions = {},
): Promise<ApiResult<MarkResultsViewedResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.markQuizResultsViewed(id),
    markResultsViewedResponseSchema.shape.data,
    { method: "PATCH", signal: options.signal },
  );
}
