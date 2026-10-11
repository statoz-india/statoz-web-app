import type { Team } from "@/lib/models/common/team-model";
import type { TournamentSummary } from "@/lib/models/common/tournament-model";

export type FutureChoice = {
  _id: string;
  choiceId: string;
  choiceName: string;
  choiceCoins: number;
  initialCoinsOnChoice: number;
  odds: number;
  /** A choice with `false` must not be displayed. */
  isVisible: boolean;
  placeholderColor: string;
  textColor: string;
  /** Null when the choice is not a team. */
  teamDetails: Team | null;
  createdAt: string;
  updatedAt: string;
};

export type Future = {
  _id: string;
  futureId: string;
  eventName: string;
  eventDescription: string;
  eventImage: string;
  futureStatus: string;
  pickType: "FUTURE";
  entryStartTime: string;
  entryCloseTime: string;
  totalCoinsPlaced: number;
  /** Null or missing until settled, then the winning choice. */
  correctChoice?: FutureChoice | null;
  tournamentData: TournamentSummary;
  /** Sorted by `odds`, highest first. */
  choices: FutureChoice[];
  createdAt: string;
  updatedAt: string;
};
