import { dataOrThrow, getTrendingMatches } from "@/core";
import { useResource } from "@/hooks/useResource";

export function useTrendingMatches() {
  return useResource({
    key: "trending/matches",
    load: () => getTrendingMatches().then((result) => dataOrThrow(result)),
  });
}
