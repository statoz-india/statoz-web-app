import { isSport, sportModules } from "@/config/sports";
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
