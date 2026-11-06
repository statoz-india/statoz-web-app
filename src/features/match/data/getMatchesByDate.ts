import type { Sport } from "@/config/sports";
import { dataOrThrow, getMatches, MATCHES_KEY_PREFIX } from "@/core";
import { useResource } from "@/hooks/useResource";

/**
 * One sport's fixtures for a day (YYYY-MM-DD in India time). A day with
 * nothing on it is `[]`. The key matches the other fixture lists', so a day
 * already loaded is not asked for again.
 */
export function useMatchesByDate<G extends Sport>(
  gameType: G,
  istDate: string,
) {
  return useResource({
    key: `${MATCHES_KEY_PREFIX}${gameType}/${istDate}`,
    load: () =>
      getMatches(gameType, istDate).then((result) => dataOrThrow(result, [])),
  });
}
