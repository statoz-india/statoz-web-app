import {
  signedInTrendingResponseSchema,
  type ApiResult,
  type SignedInTrending,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * The signed-in home screen: the public sections, picked for the player's
 * clubs, plus the settled quizzes whose results they haven't opened.
 */
export function getSignedInTrending(
  options: RequestOptions = {},
): Promise<ApiResult<SignedInTrending>> {
  return authenticatedFetch(
    ENDPOINTS.signedInTrending,
    signedInTrendingResponseSchema.shape.data,
    { signal: options.signal },
  );
}
