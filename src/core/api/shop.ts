import {
  cardCollectionResponseSchema,
  freeProfileBannersResponseSchema,
  freeProfilePicsResponseSchema,
  ownedAssetsResponseSchema,
  paidProfileBannersResponseSchema,
  shopPlayerCardsResponseSchema,
  shopProfilePicsResponseSchema,
  shopTeamsResponseSchema,
  type ApiResult,
  type CardCollectionResponse,
  type FreeProfileBannersResponse,
  type FreeProfilePicsResponse,
  type OwnedAssetsResponse,
  type PaidProfileBannersResponse,
  type PurchasePlayerCardBody,
  type PurchaseProfileBannerBody,
  type PurchaseProfilePicBody,
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

/** Every free profile pic, newest first. Free pics are equipped without buying. */
export function getFreeProfilePics(
  options: RequestOptions = {},
): Promise<ApiResult<FreeProfilePicsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.freeProfilePics,
    freeProfilePicsResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** Every free profile banner, newest first. Free banners are equipped without buying. */
export function getFreeProfileBanners(
  options: RequestOptions = {},
): Promise<ApiResult<FreeProfileBannersResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.freeProfileBanners,
    freeProfileBannersResponseSchema.shape.data,
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

/*
 * Purchases. Each item can be bought once: a second try answers 400 and
 * charges nothing, so retrying after a lost answer is safe.
 */

const post = (body: unknown, signal?: AbortSignal): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
  signal,
});

/** Answers with every pic and banner the player owns. */
export function purchaseProfilePic(
  body: PurchaseProfilePicBody,
  options: RequestOptions = {},
): Promise<ApiResult<OwnedAssetsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.shopPurchase("profile-pics"),
    ownedAssetsResponseSchema.shape.data,
    post(body, options.signal),
  );
}

/** Answers with every pic and banner the player owns. */
export function purchaseProfileBanner(
  body: PurchaseProfileBannerBody,
  options: RequestOptions = {},
): Promise<ApiResult<OwnedAssetsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.shopPurchase("profile-banners"),
    ownedAssetsResponseSchema.shape.data,
    post(body, options.signal),
  );
}

/** Answers with the player's whole card collection. */
export function purchasePlayerCard(
  body: PurchasePlayerCardBody,
  options: RequestOptions = {},
): Promise<ApiResult<CardCollectionResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.shopPurchase("player-cards"),
    cardCollectionResponseSchema.shape.data,
    post(body, options.signal),
  );
}
