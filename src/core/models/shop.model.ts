import { z } from "zod";

import { listOf } from "./list-of";

/** Every team abbreviation with at least one item of a type, A–Z. */
export const shopTeamsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(z.string()),
  message: z.string(),
  success: z.boolean(),
});
export type ShopTeamsResponse = z.infer<typeof shopTeamsResponseSchema>;

/** The fields every shop item shares. Ownership isn't included. */
const shopItemFields = {
  _id: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  coinValue: z.number(),
  isVisible: z.boolean(),
  __v: z.number(),
  /** `true` when `coinValue` is 0. */
  isFree: z.boolean(),
};

export const shopProfilePicSchema = z.object({
  ...shopItemFields,
  /** What `update-user` takes to set the pic. */
  ppId: z.string(),
  ppName: z.string(),
  /** A full image URL. */
  ppUrl: z.string(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ShopProfilePic = z.infer<typeof shopProfilePicSchema>;

/** A banner that costs coins. Ownership isn't included. */
export const paidProfileBannerSchema = z.object({
  _id: z.string(),
  /** What `purchase` and `update-user` take. */
  pbId: z.string(),
  pbName: z.string(),
  /** A full image URL. */
  pbUrl: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  /** Always above 0. */
  coinValue: z.number(),
  isVisible: z.boolean(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});
export type PaidProfileBanner = z.infer<typeof paidProfileBannerSchema>;

/** Newest first, one page at a time. */
export const paidProfileBannersResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    items: listOf(paidProfileBannerSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type PaidProfileBannersResponse = z.infer<
  typeof paidProfileBannersResponseSchema
>;

export const shopPlayerCardSchema = z.object({
  ...shopItemFields,
  playerId: z.string(),
  name: z.string(),
  /** As `M JR`. Not every sport sends it. */
  shortName: z.string().optional(),
  /** A full image URL. */
  image: z.string(),
  drop: z.string(),
  ratings: z.number(),
  /** As `BAT` or `SF`. */
  position: z.string(),
  /** As `SHARPSHOOTER`. Not every sport sends it. */
  trait: z.string().optional(),
  /** As `attacker`. Not every sport sends it. */
  playerType: z.string().optional(),
  /** `bronze`, `silver`, `gold` or `platinum`. */
  cardType: z.string(),
  cardTraining: z.number(),
  finalRating: z.number(),
});
export type ShopPlayerCard = z.infer<typeof shopPlayerCardSchema>;

/** Newest first. An unknown team answers `[]`. */
const itemsResponse = <T extends z.ZodType>(item: T) =>
  z.object({
    statusCode: z.number(),
    data: listOf(item),
    message: z.string(),
    success: z.boolean(),
  });

export const shopProfilePicsResponseSchema =
  itemsResponse(shopProfilePicSchema);

/** A free profile pic. It needs no purchase: `update-user` equips it by `ppId`. */
export const freeProfilePicSchema = z.object({
  _id: z.string(),
  ppId: z.string(),
  ppName: z.string(),
  ppUrl: z.string(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  coinValue: z.number(),
  ppDescription: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  isFree: z.boolean(),
});
export type FreeProfilePic = z.infer<typeof freeProfilePicSchema>;
/** Every free pic at once, newest first; `[]` when there are none. */
export const freeProfilePicsResponseSchema =
  itemsResponse(freeProfilePicSchema);
export type FreeProfilePicsResponse = z.infer<
  typeof freeProfilePicsResponseSchema
>;

/** A free profile banner. It needs no purchase: `update-user` equips it by `pbId`. */
export const freeProfileBannerSchema = z.object({
  _id: z.string(),
  pbId: z.string(),
  pbName: z.string(),
  pbUrl: z.string(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  coinValue: z.number(),
  team: z.string(),
  teamAbbreviation: z.string(),
  isFree: z.boolean(),
});
export type FreeProfileBanner = z.infer<typeof freeProfileBannerSchema>;
/** Every free banner at once, newest first; `[]` when there are none. */
export const freeProfileBannersResponseSchema = itemsResponse(
  freeProfileBannerSchema,
);
export type FreeProfileBannersResponse = z.infer<
  typeof freeProfileBannersResponseSchema
>;
export const shopPlayerCardsResponseSchema =
  itemsResponse(shopPlayerCardSchema);

/*
 * Purchases. Each takes the item's code, charges its `coinValue` (nothing for
 * a free one) and adds it to what the player owns. Buying doesn't equip it.
 */

export type PurchaseProfilePicBody = { ppId: string };
export type PurchaseProfileBannerBody = { pbId: string };
export type PurchasePlayerCardBody = { playerId: string };

const purchasedPicSchema = z.object({
  _id: z.string(),
  ppId: z.string(),
  ppName: z.string(),
  ppUrl: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  coinValue: z.number(),
  isVisible: z.boolean(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

const purchasedBannerSchema = z.object({
  _id: z.string(),
  pbId: z.string(),
  pbName: z.string(),
  pbUrl: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  coinValue: z.number(),
  isVisible: z.boolean(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

/** Everything the player owns: every pic and banner, oldest first, not just the new one. */
export const ownedAssetsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    userId: z.string(),
    __v: z.number(),
    createdAt: z.string(),
    profileBannersPurchased: listOf(
      z.object({
        /** The full banner, despite the name. */
        profileBannerId: purchasedBannerSchema,
        purchasedAt: z.string(),
        /** `0` for a free banner. */
        coinsUsed: z.number(),
        _id: z.string(),
      }),
    ),
    profilePicsPurchased: listOf(
      z.object({
        /** The full pic, despite the name. */
        profilePicId: purchasedPicSchema,
        purchasedAt: z.string(),
        /** `0` for a free pic. */
        coinsUsed: z.number(),
        _id: z.string(),
      }),
    ),
    updatedAt: z.string(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type OwnedAssetsResponse = z.infer<typeof ownedAssetsResponseSchema>;

/** The player's whole card collection, with decks. */
export const cardCollectionResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    userId: z.string(),
    __v: z.number(),
    actionCards: z.array(z.unknown()),
    allDecks: z.array(z.unknown()),
    cards: listOf(
      z.object({
        /** The full card, despite the name. */
        playerCardId: z.object({
          _id: z.string(),
          playerId: z.string(),
          name: z.string(),
          image: z.string(),
          team: z.string(),
          teamAbbreviation: z.string(),
          drop: z.string(),
          sport: z.string(),
          ratings: z.number(),
          position: z.string(),
          playerType: z.string().optional(),
          cardType: z.string(),
          cardTraining: z.number(),
          finalRating: z.number(),
          coinValue: z.number(),
          isVisible: z.boolean(),
          __v: z.number(),
        }),
        acquiredAt: z.string(),
        /** `bought` for purchases. */
        source: z.string(),
        _id: z.string(),
      }),
    ),
    createdAt: z.string(),
    currentDeck: z.object({
      cards: z.array(z.unknown()),
      actionCards: z.array(z.unknown()),
    }),
    nextDrop: z.unknown(),
    updatedAt: z.string(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type CardCollectionResponse = z.infer<
  typeof cardCollectionResponseSchema
>;
