import type { Sport } from "@/config/sports";
import {
  updateUserResponseSchema,
  userPredictionsResponseSchema,
  userQuizzesResponseSchema,
  userStatsResponseSchema,
  type ApiResult,
  type AuthUser,
  type UpdateUserResponse,
  type UserPredictionsResponse,
  type UserQuizzesResponse,
  type UserStatsResponse,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/** Send only what changes; each list replaces the saved one whole. */
export type UpdateUserBody = {
  username?: string;
  sportsType?: Sport[];
  clubAndTeams?: AuthUser["clubAndTeams"];
  ppId?: string;
  pbId?: string;
};

/** The player's match quiz and match prediction totals. */
export function getUserStats(
  options: RequestOptions = {},
): Promise<ApiResult<UserStatsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.userStats,
    userStatsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** Every match quiz the player submitted, newest first. */
export function getUserQuizzes(
  options: RequestOptions = {},
): Promise<ApiResult<UserQuizzesResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.userQuizzes,
    userQuizzesResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** Every match prediction bet the player placed, newest first. */
export function getUserPredictions(
  options: RequestOptions = {},
): Promise<ApiResult<UserPredictionsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.userPredictions,
    userPredictionsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** Updates the signed-in player. If any field is invalid, nothing is saved. */
export function updateUser(
  body: UpdateUserBody,
  options: RequestOptions = {},
): Promise<ApiResult<UpdateUserResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.updateUser,
    updateUserResponseSchema.shape.data,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: options.signal,
    },
  );
}
