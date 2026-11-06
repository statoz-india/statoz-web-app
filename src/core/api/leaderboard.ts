import {
  leaderboardTournamentsResponseSchema,
  tournamentLeaderboardResponseSchema,
  type ApiResult,
  type LeaderboardTournamentsResponse,
  type TournamentLeaderboardResponse,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/** A sport's tournaments, most players first. */
export function getLeaderboardTournaments(
  gameType: string,
  options: RequestOptions = {},
): Promise<ApiResult<LeaderboardTournamentsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.leaderboardTournaments(gameType),
    leaderboardTournamentsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** A tournament's top 100 by XP, by its case-sensitive code such as `IPL`. */
export function getTournamentLeaderboard(
  tournament: string,
  options: RequestOptions = {},
): Promise<ApiResult<TournamentLeaderboardResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.tournamentBoard(tournament),
    tournamentLeaderboardResponseSchema.shape.data,
    { signal: options.signal },
  );
}
