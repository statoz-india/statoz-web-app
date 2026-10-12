import { useSyncExternalStore } from "react";

import { todayInIST } from "@/core/data/public-endpoints";

const subscribe = () => () => {};
const getServerSnapshot = () => null;

/**
 * Today's date in India time, as YYYY-MM-DD, or `null` until the component has
 * hydrated. The server never answers, because near midnight its clock and the
 * browser's can land on different days and the two renders would not match.
 */
export function useTodayInIST(): string | null {
  return useSyncExternalStore(subscribe, todayInIST, getServerSnapshot);
}
