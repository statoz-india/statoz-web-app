import { dataOrThrow, getSportsLeaderboard, getSportsTypes } from "@/core";
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
