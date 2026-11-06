import { useSyncExternalStore } from "react";

/*
 * Ticks every second. `null` on the server and while hydrating, so both
 * renders match.
 */
const subscribe = (onTick: () => void) => {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;
const noClock = () => null;

/** The time in ms, to the second, or `null` until hydrated. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, currentSecond, noClock);
}
