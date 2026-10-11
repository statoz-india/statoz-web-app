import type { Team } from "@/lib/models/common/team-model";
import type { TournamentSummary } from "@/lib/models/common/tournament-model";
import type { GameType } from "@/lib/models/types";

import type { MatchEvent } from "./match-model";

export type Prediction = {
  _id: string;
  predictionId: string;
  predictionStatus: string;
  isVisible: boolean;
  matchId: string;
  matchStartTime: string;
  matchEvent: MatchEvent | null;
  matchEventEspnId: string | null;
  tag: string;
  gameType: GameType;
  espnLeagueName: string;
  tournament: string;
  tournamentData: TournamentSummary;
  teamA: Team;
  teamB: Team;
  entryStartTime: string;
  coinsOnTeamA: number;
  coinsOnTeamB: number;
  coinsOnDraw: number;
  initialCoinsOnTeamA: number;
  initialCoinsOnTeamB: number;
  initialCoinsOnDraw: number;
  totalCoins: number;
  oddsTeamA: number;
  oddsTeamB: number;
  /** Null unless the match is football. */
  oddsDraw: number | null;
  createdAt: string;
  /** Both appear once the result is set. */
  winningTeam?: unknown;
  winningTeamId?: string;
};
