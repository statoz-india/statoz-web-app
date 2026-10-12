import type { Team } from "@/core/domain/models/common/team-model";
import type { GameType } from "@/core/domain/types/game-types";
import type { QuizStatus } from "@/core/domain/types/quiz-types";

import type { MatchEvent } from "./match-model";

/** Carries no questions or answers; those need a login. */
export type Quiz = {
  _id: string;
  quizId: string;
  quizStatus: QuizStatus;
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
