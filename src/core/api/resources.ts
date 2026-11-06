import { dataOrThrow } from "./client";
import { getMatchSportsTypes, getSportsTypes } from "./public-api";

/**
 * What the screens ask for: each shared read of the API paired with the key
 * the browser store (`@/hooks/useResource`) keeps it under. Two screens that
 * ask for the same thing get the same key, so it is loaded once and shared.
 *
 * Each load resolves to the response's `data` and rejects when the call
 * failed, which is what the store needs to show a screen's error state.
 *
 * Feature folders take the data from here and shape it in their own adapters.
 */

/** Every fixture list's key starts with this. */
export const MATCHES_KEY_PREFIX = "matches/";

/**
 * Every signed-in home screen's key starts with this; one per player. The
 * quiz page reads it to drop a revealed result.
 */
export const SIGNED_IN_TRENDING_KEY_PREFIX = "trending/signed-in/";

export const resources = {
  matchSportsTypes: () => ({
    key: "sports/matchSportsTypes",
    load: () => getMatchSportsTypes().then((r) => dataOrThrow(r)),
  }),
};
