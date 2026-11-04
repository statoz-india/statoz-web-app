import {
  paidProfileBannersResponseSchema,
  shopPlayerCardsResponseSchema,
  shopProfilePicsResponseSchema,
  shopTeamsResponseSchema,
  type ApiResult,
  type PaidProfileBannersResponse,
  type ShopPlayerCard,
  type ShopProfilePic,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS, type ShopCatalog } from "./endpoints";

export type { ShopCatalog };

/** The teams that have items of `catalog`, A–Z. */
export function getShopTeams(
  catalog: ShopCatalog,
  options: RequestOptions = {},
): Promise<ApiResult<string[]>> {
  return authenticatedFetch(
    ENDPOINTS.shopTeams(catalog),
    shopTeamsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** One team's profile pics; `team` must match the team list exactly. */
export function getShopProfilePics(
  team: string,
  options: RequestOptions = {},
): Promise<ApiResult<ShopProfilePic[]>> {
  return authenticatedFetch(
    ENDPOINTS.shopItems("profile-pics", team),
    shopProfilePicsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** Banners that cost coins, newest first; `limit` is 1–100. */
export function getPaidProfileBanners(
  query: { page: number; limit: number },
  options: RequestOptions = {},
): Promise<ApiResult<PaidProfileBannersResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.paidProfileBanners(query.page, query.limit),
    paidProfileBannersResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** One team's player cards. */
export function getShopPlayerCards(
  team: string,
  options: RequestOptions = {},
): Promise<ApiResult<ShopPlayerCard[]>> {
  return authenticatedFetch(
    ENDPOINTS.shopItems("player-cards", team),
    shopPlayerCardsResponseSchema.shape.data,
    { signal: options.signal },
  );
}
