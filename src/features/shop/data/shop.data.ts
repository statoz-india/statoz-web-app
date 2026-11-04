import {
  dataOrThrow,
  getPaidProfileBanners,
  getShopPlayerCards,
  getShopProfilePics,
  getShopTeams,
  type PaidProfileBannersResponse,
  type ShopCatalog,
} from "@/core";
import { useResource, useResources } from "@/hooks/useResource";

/** The teams that have items in `catalog`, A–Z. */
export function useShopTeams(catalog: ShopCatalog) {
  return useResource({
    key: `shop/${catalog}/teams`,
    load: () => getShopTeams(catalog).then((result) => dataOrThrow(result)),
  });
}

/** One team's profile pics; nothing until a team is chosen. */
export function useShopProfilePics(team: string | null) {
  return useResource(
    team === null
      ? null
      : {
          key: `shop/profile-pics/${team}`,
          load: () =>
            getShopProfilePics(team).then((result) => dataOrThrow(result)),
        },
  );
}

export const BANNER_PAGE_SIZE = 50;

/** The first `pages` pages of paid banners, newest first. */
export function usePaidBanners(pages: number) {
  return useResources<PaidProfileBannersResponse["data"]>(
    Array.from({ length: pages }, (_, i) => ({
      key: `shop/profile-banners/paid?${i + 1}`,
      load: () =>
        getPaidProfileBanners({ page: i + 1, limit: BANNER_PAGE_SIZE }).then(
          (result) => dataOrThrow(result),
        ),
    })),
  );
}

/** One team's player cards. */
export function useShopPlayerCards(team: string | null) {
  return useResource(
    team === null
      ? null
      : {
          key: `shop/player-cards/${team}`,
          load: () =>
            getShopPlayerCards(team).then((result) => dataOrThrow(result)),
        },
  );
}
