import type { GameType } from "@/core/domain/types/game-types";

/* -------------------------------------------------------------------------
 * Sports lists and games
 * ---------------------------------------------------------------------- */

/** An entry in a sports list. `icon` is a Material icon name. */
export type SportTab = {
  gameType: GameType;
  icon: string;
};

export type Game = {
  _id: string;
  title: string;
  subtitle: string;
  /** Unique text key for the game. */
  key: string;
  gameType: GameType;
  isQuickPlay: boolean;
  isLive: boolean;
  message: string | null;
  /** Position within its sport, or null for an unordered game. */
  displayOrder: number | null;
};

/** One sport's games. A sport with none still appears, with `games: []`. */
export type GameSection = SportTab & {
  games: Game[];
};
