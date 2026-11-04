/**
 * Sample data for everything the API doesn't send yet. Swap each block for
 * the real call when its endpoint exists.
 */

import { IMAGES } from "@/config/images";

/** Total XP each level starts at; level 1 starts at 0. */
export const LEVEL_XP = [
  0, 50, 120, 200, 300, 450, 600, 800, 1050, 1350, 1700, 2100, 2600, 3200,
];

/** The coin tracker's ranges; `days: null` is all time. */
export const COIN_RANGES = [
  { id: "7d", label: "7 DAYS", days: 7 },
  { id: "30d", label: "30 DAYS", days: 30 },
  { id: "all", label: "ALL TIME", days: null },
];

/** Readable `ledgerSource`s; an unknown one is spelled out from its code. */
export const COIN_SOURCES: Record<string, string> = {
  PICK: "Pick",
  EVENT: "Event",
  FUTURE: "Future",
  REFUND: "Refund",
  QUIZ_ENTRY: "Quiz entry",
  QUIZ_REWARD: "Quiz reward",
  PROFILE_PIC_PURCHASE: "Profile pic bought",
  BANNER_PURCHASE: "Banner bought",
  CARD_PURCHASE: "Card bought",
  COIN_PURCHASE: "Coins bought",
  IAP_REFUND: "Coin purchase refunded",
  SIGNUP_BONUS: "Signup bonus",
  ADMIN_GIFT: "Gift from StatOz",
  ADMIN_ADJUSTMENT: "Adjustment",
  OPENING_BALANCE: "Opening balance",
};

export const SAMPLE_FRAMES = [
  { id: "none", label: "NONE", color: null },
  { id: "cyan", label: "CYAN", color: "var(--ds-color-accent-cyan)" },
  { id: "violet", label: "VIOLET", color: "var(--ds-color-accent-violet)" },
  { id: "gold", label: "GOLD", color: "var(--ds-color-accent-gold)" },
  { id: "lime", label: "LIME", color: "var(--ds-color-accent-lime)" },
] as const;

export const BANNERS = [
  { id: "default", label: "Default", src: IMAGES.profile.defaultBanner },
  { id: "football", label: "Football", src: IMAGES.backgrounds.hub.football.wide },
  { id: "cricket", label: "Cricket", src: IMAGES.backgrounds.hub.cricket.wide },
  { id: "basketball", label: "Basketball", src: IMAGES.backgrounds.hub.basketball.wide },
  { id: "motorsport", label: "Motorsport", src: IMAGES.backgrounds.hub.motorsport.wide },
];
