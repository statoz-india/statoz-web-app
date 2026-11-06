import {
  dataOrThrow,
  getSignedInTrending,
  getSportsTypes,
  getTrendingMatches,
  SIGNED_IN_TRENDING_KEY_PREFIX,
  type SignedInTrending,
} from "@/core";
import { useAuthSession, useCurrentUser } from "@/features/auth";
import { useResource, type ResourceRequest } from "@/hooks/useResource";

/** A guest's home screen, in the signed-in shape; guests have no `results`. */
const publicTrending: ResourceRequest<SignedInTrending> = {
  key: "trending/matches",
  load: () =>
    getTrendingMatches().then((result) => ({ ...dataOrThrow(result), results: [] })),
};

/** The signed-in home screen, kept per player so the next one never sees this one's. */
const signedInTrending = (userId: string): ResourceRequest<SignedInTrending> => ({
  key: `${SIGNED_IN_TRENDING_KEY_PREFIX}${userId}`,
  load: () => getSignedInTrending().then((result) => dataOrThrow(result)),
});

/**
 * The home screen's trending sections: the player's own when signed in, the
 * public ones for a guest. Nothing loads until the session is known.
 */
export function useTrendingMatches() {
  const { status } = useAuthSession();
  const user = useCurrentUser();
  return useResource<SignedInTrending>(
    status === "guest"
      ? publicTrending
      : status === "authenticated" && user
        ? signedInTrending(user._id)
        : null,
  );
}

/** Every sport the API covers, each with its icon name. */
export function useSportsTypes() {
  return useResource({
    key: "sports/sportsTypes",
    load: () => getSportsTypes().then((result) => dataOrThrow(result)),
  });
}
