import {
  signupTournamentsResponseSchema,
  type ApiResult,
  type SignupTournamentsResponse,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/** The tournaments and teams a player can follow, grouped by sport. */
export function getSignupTournaments(
  options: RequestOptions = {},
): Promise<ApiResult<SignupTournamentsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.signupTournaments,
    signupTournamentsResponseSchema.shape.data,
    { signal: options.signal },
  );
}
