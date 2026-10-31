import { dataOrThrow, getMatchSportsTypes } from "@/core";
import { useResource } from "@/hooks/useResource";

import { toSportTabs } from "../adapters";

/**
 * The hub's tabs, from the match sports-types list. Until the list arrives
 * there are none.
 */
export function useMatchSports() {
  const list = useResource({
    key: "sports/matchSportsTypes",
    load: () => getMatchSportsTypes().then((result) => dataOrThrow(result)),
  });
  return { ...list, tabs: list.data ? toSportTabs(list.data) : [] };
}
