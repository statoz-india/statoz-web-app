import type { GameType } from "@/core/domain/types/game-types";

/** The tournament fields a trending item carries. */
export type TournamentSummary = {
  tournament: string;
  tournamentName: string;
  tournamentYear: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
};

export type Tournament = TournamentSummary & {
  _id: string;
  gameType: GameType;
  displayOrder: number | null;
};
