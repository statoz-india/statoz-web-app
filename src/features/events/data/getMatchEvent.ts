import { dataOrThrow, getMatchEvents } from "@/core";
import { useResource } from "@/hooks/useResource";

/**
 * A match's events, by its readable id such as "EPL-M23". A match with no
 * event is `[]`.
 */
export function useMatchEvents(matchId: string) {
  return useResource({
    key: `events/match/${matchId}`,
    load: () =>
      getMatchEvents(matchId).then((result) => dataOrThrow(result, [])),
  });
}
