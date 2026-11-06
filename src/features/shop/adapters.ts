import { isSport, sportModules } from "@/config/sports";
import type { PaidProfileBanner, ShopPlayerCard, ShopProfilePic } from "@/core";
import type { RarityName } from "@/styles";
import { accentVar } from "@/styles";

/** The banner's accent: its sport's colour, cyan when the sport is unknown. */
export const sportAccent = (sport: string) =>
  isSport(sport) ? accentVar(sportModules[sport].accent) : accentVar("cyan");

/** `FTBL`, or the first four letters of a sport this app doesn't know. */
export const sportTag = (sport: string) =>
  isSport(sport) ? sportModules[sport].shortLabel : sport.slice(0, 4).toUpperCase();

export const rarityOf = (cardType: string): RarityName =>
  cardType === "silver" || cardType === "gold" || cardType === "platinum"
    ? cardType
    : "bronze";

/** A card tile's accent by rarity: platinum gold, gold violet, silver cyan. */
export const CARD_TILE_ACCENT: Record<RarityName, string> = {
  platinum: accentVar("gold"),
  gold: accentVar("violet"),
  silver: accentVar("cyan"),
  bronze: "var(--ds-color-border-inactive)",
};

/** `SF - SHARPSHOOTER`, or just the position when there's no trait. */
export const cardRole = (position: string, trait?: string) => ({
  label: trait ? `${position} - ${trait}` : position,
  color: accentVar("cyan"),
});

/** Something in the shop that can be bought. */
export type ShopItem =
  | { kind: "avatar"; pic: ShopProfilePic }
  | { kind: "banner"; banner: PaidProfileBanner }
  | { kind: "card"; card: ShopPlayerCard };

/** The overlay's accent: cyan for an avatar, the banner's own, a card's rarity. */
export function itemAccent(item: ShopItem): string {
  if (item.kind === "avatar") return accentVar("cyan");
  if (item.kind === "banner") return sportAccent(item.banner.sport);
  return CARD_TILE_ACCENT[rarityOf(item.card.cardType)];
}

export const itemName = (item: ShopItem) =>
  item.kind === "avatar" ? item.pic.ppName : item.kind === "banner" ? item.banner.pbName : item.card.name;

export const itemPrice = (item: ShopItem) =>
  item.kind === "avatar" ? item.pic.coinValue : item.kind === "banner" ? item.banner.coinValue : item.card.coinValue;

const ROLE_COLOR: Record<string, string> = {
  attacker: accentVar("cyan"),
  defender: accentVar("violet"),
  goalkeeper: accentVar("gold"),
};

/** A selected card's edge and bloom: its role's colour, cyan without one. */
export const roleColor = (playerType?: string) =>
  (playerType && ROLE_COLOR[playerType]) || accentVar("cyan");
