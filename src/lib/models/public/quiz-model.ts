import type { Team } from "@/lib/models/common/team-model";
import type { GameType } from "@/lib/models/types";

import type { MatchEvent } from "./match-model";

/** Carries no questions or answers; those need a login. */
export type Quiz = {
  _id: string;
  quizId: string;
  quizStatus: string;
  isVisible: boolean;
  matchId: string;
  matchStartTime: string;
  matchEvent: MatchEvent | null;
  matchEventEspnId: string | null;
  matchBanner: string | null;
  tag: string;
  gameType: GameType;
  espnLeagueName: string;
  tournament: string;
  teamA: Team;
  teamB: Team;
  entryStartTime: string;
  entryStopTime: string;
  createdAt: string;
};
