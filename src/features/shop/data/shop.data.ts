import {
  dataOrThrow,
  getPaidProfileBanners,
  getShopPlayerCards,
  getShopProfilePics,
  getShopTeams,
  purchasePlayerCard,
  purchaseProfileBanner,
  purchaseProfilePic,
  type ApiResult,
  type PaidProfileBannersResponse,
  type ShopCatalog,
} from "@/core";
import { spendCoins } from "@/features/auth";
import { useResource, useResources } from "@/hooks/useResource";
import { track } from "@/lib/analytics";
import { formatInt } from "@/utils";

import { itemParams, itemPrice, type ShopItem } from "../adapters";

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

/**
 * Buys `item` and takes its price off the balance on screen. Resolves to the
 * message to show, or `null` once it's bought.
 */
export async function buyItem(item: ShopItem): Promise<string | null> {
  try {
    const result =
      item.kind === "avatar"
        ? await purchaseProfilePic({ ppId: item.pic.ppId })
        : item.kind === "banner"
          ? await purchaseProfileBanner({ pbId: item.banner.pbId })
          : await purchasePlayerCard({ playerId: item.card.playerId });
    if (!result.success) {
      const reason = purchaseError(result);
      track("web_shop_purchase_failed", { ...itemParams(item), reason });
      return reason;
    }
    const price = itemPrice(item);
    spendCoins(price);
    track("web_shop_purchase", itemParams(item));
    if (price > 0) {
      track("web_spend_virtual_currency", { virtual_currency_name: "Oz", value: price, item_name: item.kind });
    }
    return null;
  } catch {
    const reason = "Couldn't complete the purchase. Try again.";
    track("web_shop_purchase_failed", { ...itemParams(item), reason });
    return reason;
  }
}

function purchaseError(result: Exclude<ApiResult<unknown>, { success: true }>) {
  // "Insufficient coins" puts its reason and the amounts in `data`.
  const data = "data" in result ? result.data : null;
  if (
    typeof data === "object" &&
    data !== null &&
    "availableCoins" in data &&
    "requiredCoins" in data &&
    typeof data.availableCoins === "number" &&
    typeof data.requiredCoins === "number"
  ) {
    return `You need ${formatInt(data.requiredCoins - data.availableCoins)} more coins.`;
  }
  // "Profile pic already purchased", "Player card already owned", …
  if (/already (purchased|owned)/i.test(result.message)) return "You already own this.";
  return result.message;
}
