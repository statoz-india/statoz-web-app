import { z } from "zod";

import { gameTypeSchema } from "./game-type";
import { listOf } from "./list-of";

/* -------------------------------------------------------------------------
 * Sports lists and games
 * ---------------------------------------------------------------------- */

/** An entry in a sports list. `icon` is a Material icon name. */
export const sportTabSchema = z.object({
  gameType: gameTypeSchema,
  icon: z.string(),
});
export type SportTab = z.infer<typeof sportTabSchema>;

export const gameSchema = z.object({
  _id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  /** Unique text key for the game. */
  key: z.string(),
  gameType: gameTypeSchema,
  isQuickPlay: z.boolean(),
  isLive: z.boolean(),
  message: z.string().nullable(),
  /** Position within its sport, or null for an unordered game. */
  displayOrder: z.number().nullable(),
});
export type Game = z.infer<typeof gameSchema>;

/** One sport's games. A sport with none still appears, with `games: []`. */
export const gameSectionSchema = sportTabSchema.extend({
  games: listOf(gameSchema),
});
export type GameSection = z.infer<typeof gameSectionSchema>;
