import {
  dataOrThrow,
  getLeaderboardTournaments,
  getSportsLeaderboard,
  getSportsTypes,
  getTournamentLeaderboard,
} from "@/core";
import { useResource } from "@/hooks/useResource";

/**
 * The sports a leaderboard can be opened for. The key is the trending feed's,
 * so the list loads once for both.
 */
export function useLeaderboardSports() {
  return useResource({
    key: "sports/sportsTypes",
    load: () => getSportsTypes().then((result) => dataOrThrow(result)),
  });
}

/** One sport's leaderboard. `null` when the API has none for it. */
export function useSportLeaderboard(gameType: string) {
  return useResource({
    key: `leaderboard/sport/${gameType}`,
    load: async () =>
      getSportsLeaderboard(gameType).then((result) =>
        dataOrThrow(result, null),
      ),
  });
}

/** A sport's tournaments, most players first; nothing for a guest. */
export function useLeaderboardTournaments(gameType: string, signedIn: boolean) {
  return useResource(
    signedIn
      ? {
          key: `leaderboard/tournaments/${gameType}`,
          load: () =>
            getLeaderboardTournaments(gameType).then((result) => dataOrThrow(result)),
        }
      : null,
  );
}

/** One tournament's top 100, by its code. */
export function useTournamentLeaderboard(tournament: string) {
  return useResource({
    key: `leaderboard/tournament/${tournament}`,
    load: () =>
      getTournamentLeaderboard(tournament).then((result) => dataOrThrow(result)),
  });
}
