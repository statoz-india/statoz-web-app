import { dataOrThrow, getTrendingMatches } from "@/core";
import { useResource } from "@/hooks/useResource";

/**
 * The trending list, fetched in the visitor's browser and cached there: it is
 * loaded once and reused by every component that asks, until it is 30 seconds
 * old and a screen opens again.
 */
export function useTrendingMatches() {
  return useResource({
    key: "trending/matches",
    load: () => getTrendingMatches().then((result) => dataOrThrow(result)),
  });
}
