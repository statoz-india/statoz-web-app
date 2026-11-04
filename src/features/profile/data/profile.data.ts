import { useSyncExternalStore } from "react";

import {
  dataOrThrow,
  getCoinMap,
  getCoinTracker,
  getCurrentUser,
  getSignedIn,
  getSignupTournaments,
  getUserPredictions,
  getUserQuizzes,
  getUserStats,
  getXpMap,
  getXpTracker,
  subscribeSession,
  updateUser,
  type AuthUser,
  type CoinTrackerResponse,
  type LedgerType,
  type XpTrackerQuery,
  type XpTrackerResponse,
} from "@/core";
import {
  peekResource,
  setResource,
  useResource,
  useResources,
  type ResourceRequest,
} from "@/hooks/useResource";

/*
 * Bumped whenever a session ends, so the next player's profile loads under a
 * new key instead of showing the last one's from the cache.
 */
let session = 0;
subscribeSession(() => {
  if (getSignedIn() === false) session += 1;
});

/** The session (`null` until the API answers) and the player's profile. */
export function useProfileUser() {
  const signedIn = useSyncExternalStore(
    subscribeSession,
    getSignedIn,
    () => null,
  );
  const user = useResource(
    signedIn === false
      ? null
      : {
          key: userKey(),
          load: () => getCurrentUser().then((result) => dataOrThrow(result)),
        },
  );
  return { signedIn, user };
}

const userKey = () => `user/current-user/${session}`;

/** Match quiz and match prediction totals. */
export function useUserStats() {
  return useResource({
    key: `user/userStats/${session}`,
    load: () => getUserStats().then((result) => dataOrThrow(result)),
  });
}

/** Every match quiz the player submitted, newest first. */
export function useUserQuizzes() {
  return useResource({
    key: `quiz/userQuizzes/${session}`,
    load: () => getUserQuizzes().then((result) => dataOrThrow(result)),
  });
}

/** Every match prediction bet the player placed, newest first. */
export function useUserPredictions() {
  return useResource({
    key: `prediction/userPredictions/${session}`,
    load: () => getUserPredictions().then((result) => dataOrThrow(result)),
  });
}

/** The tournaments and teams the player can follow. */
export function useSignupTournaments() {
  return useResource({
    key: "tournament/trending",
    load: () => getSignupTournaments().then((result) => dataOrThrow(result)),
  });
}

/** Saves the followed tournaments and teams, and shows them on the profile. */
export async function saveClubAndTeams(clubAndTeams: AuthUser["clubAndTeams"]) {
  const result = await updateUser({ clubAndTeams });
  const user = peekResource<AuthUser>(userKey());
  if (result.success && user) {
    setResource(userKey(), { ...user, clubAndTeams: result.data.clubAndTeams });
  }
  return result;
}

/** A type chip's server-side filter. */
export type XpFilter = Pick<XpTrackerQuery, "xpType" | "xpSource">;

// Keyed by session too, so the next player never sees this one's XP.
function xpPage(
  filter: XpFilter,
  page: number,
): ResourceRequest<XpTrackerResponse["data"]> {
  return {
    key: `tracker/xp/${session}?${filter.xpType ?? ""}&${filter.xpSource ?? ""}&${page}`,
    load: () =>
      getXpTracker({ ...filter, page, limit: 20 }).then((result) =>
        dataOrThrow(result),
      ),
  };
}

/** The first `pages` pages of the XP feed for `filter`, newest first. */
export function useXpFeed(filter: XpFilter, pages: number) {
  return useResources(
    Array.from({ length: pages }, (_, i) => xpPage(filter, i + 1)),
  );
}

/** Each filter's first page; its `total` is the chip's count. */
export function useXpCounts(filters: XpFilter[]) {
  return useResources(filters.map((filter) => xpPage(filter, 1)));
}

/** Net XP per IST day, all time. */
export function useXpMap() {
  return useResource({
    key: `tracker/xp/map/${session}`,
    load: () => getXpMap().then((result) => dataOrThrow(result)),
  });
}

/** The first `pages` pages of coin changes, newest first. */
export function useCoinFeed(ledgerType: LedgerType | undefined, pages: number) {
  return useResources<CoinTrackerResponse["data"]>(
    Array.from({ length: pages }, (_, i) => ({
      key: `tracker/coins/${session}?${ledgerType ?? ""}&${i + 1}`,
      load: () =>
        getCoinTracker({ ledgerType, page: i + 1, limit: 20 }).then((result) =>
          dataOrThrow(result),
        ),
    })),
  );
}

/** The balance after every coin change, all time. */
export function useCoinMap() {
  return useResource({
    key: `tracker/coins/map/${session}`,
    load: () => getCoinMap().then((result) => dataOrThrow(result)),
  });
}
