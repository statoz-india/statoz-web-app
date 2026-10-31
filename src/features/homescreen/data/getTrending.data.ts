import { dataOrThrow, getSportsTypes, getTrendingMatches } from "@/core";
import { useResource } from "@/hooks/useResource";

export function useTrendingMatches() {
  return useResource({
    key: "trending/matches",
    load: () => getTrendingMatches().then((result) => dataOrThrow(result)),
  });
}

/** Every sport the API covers, each with its icon name. */
export function useSportsTypes() {
  return useResource({
    key: "sports/sportsTypes",
    load: () => getSportsTypes().then((result) => dataOrThrow(result)),
  });
}
