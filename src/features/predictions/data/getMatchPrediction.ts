import { dataOrThrow, getMatchPredictions } from "@/core";
import { useResource } from "@/hooks/useResource";

/**
 * A match's predictions, by its readable id such as "EPL-M23". A match with
 * no prediction is `[]`.
 */
export function useMatchPredictions(matchId: string) {
  return useResource({
    key: `prediction/match/${matchId}`,
    load: () =>
      getMatchPredictions(matchId).then((result) => dataOrThrow(result, [])),
  });
}
