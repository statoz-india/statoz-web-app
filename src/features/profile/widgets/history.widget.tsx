import type { Team as MatchTeam, UserPrediction, UserQuiz } from "@/core";
import { Button } from "@/lib/components/button";
import { CheckIcon, CloseIcon } from "@/lib/icons";

import {
  answerResult,
  formatAmount,
  formatChange,
  formatDateTime,
  pickLabel,
  pickResult,
  statusLabel,
  toMatchTeam,
} from "../adapters";
import { Cut } from "../components/surfaces";
import { Crest } from "./following.widget";

const SUCCESS = "var(--ds-color-success)";
const DANGER = "var(--ds-color-danger)";

/** Both crests and `MI vs CSK`. */
function Matchup({ teamA, teamB }: { teamA: MatchTeam; teamB: MatchTeam }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Crest team={toMatchTeam(teamA)} />
      <span className="truncate font-display text-sm font-black leading-compact tracking-label">
        {teamA.abbreviation}
        <span className="px-1.5 text-muted">vs</span>
        {teamB.abbreviation}
      </span>
      <Crest team={toMatchTeam(teamB)} />
    </span>
  );
}

/** One match quiz: the XP once settled, and each answer marked when known. */
export function QuizEntry({ quiz }: { quiz: UserQuiz }) {
  const { quizData } = quiz;
  return (
    <li className="border border-line bg-surface p-3.5">
      <div className="flex items-center gap-3">
        <Matchup teamA={quizData.teamA} teamB={quizData.teamB} />
        <span
          className={`ds-tabular ml-auto shrink-0 font-display font-black ${quiz.obtainedXP === undefined ? "text-2xs tracking-wide text-muted" : "text-base text-cyan"}`}
        >
          {quiz.obtainedXP === undefined
            ? statusLabel(quizData.quizStatus)
            : `${formatChange(quiz.obtainedXP)} XP`}
        </span>
      </div>
      <p className="mt-1.5 truncate font-sans text-xs text-muted">
        {quizData.tournament} · {quizData.matchId} ·{" "}
        {formatDateTime(quizData.matchStartTime)}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {quiz.answers.map((answer) => {
          const right = answerResult(quiz, answer);
          return (
            <li
              key={answer._id}
              className="flex items-center gap-1 border px-2 py-1 font-display text-2xs font-black"
              style={{
                borderColor:
                  right === null
                    ? "var(--ds-color-border-default)"
                    : right
                      ? SUCCESS
                      : DANGER,
              }}
            >
              <span className="text-muted">Q{answer.questionNumber}</span>
              {answer.selectedAnswer}
              {right === null ? null : right ? (
                <CheckIcon size={13} title="Right" style={{ color: SUCCESS }} />
              ) : (
                <CloseIcon size={13} title="Wrong" style={{ color: DANGER }} />
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

/** One prediction bet: what was picked and staked, and how it ended. */
export function PickEntry({ pick }: { pick: UserPrediction }) {
  const { predictionData: match } = pick;
  const result = pickResult(pick);
  const chosen =
    pick.teamChosen === "A"
      ? match.teamA.abbreviation
      : pick.teamChosen === "B"
        ? match.teamB.abbreviation
        : "DRAW";
  return (
    <li className="border border-line bg-surface p-3.5">
      <div className="flex items-center gap-3">
        <Matchup teamA={match.teamA} teamB={match.teamB} />
        <span
          className="ds-tabular ml-auto shrink-0 font-display text-base font-black"
          style={{
            color:
              result === "won" ? SUCCESS : result === "lost" ? DANGER : undefined,
          }}
        >
          {result === "won"
            ? formatChange(pick.coinsWon)
            : result === "lost"
              ? formatChange(-pick.coinsBet)
              : formatAmount(pick.coinsBet)}
        </span>
      </div>
      <p className="mt-1.5 truncate font-sans text-xs text-muted">
        {match.tournament} · {match.matchId} · {formatDateTime(pick.submissionTime)}
      </p>
      <p className="mt-2.5 flex items-center justify-between gap-3 font-display text-2xs font-black tracking-wide">
        <span>
          PICKED <span className="text-lime">{chosen}</span> ·{" "}
          {formatAmount(pick.coinsBet)} OZ
        </span>
        <span className="text-muted">{pickLabel(pick)}</span>
      </p>
    </li>
  );
}

/** The box shown when a list is empty. */
export function HistoryEmpty({ message }: { message: string }) {
  return (
    <Cut
      edge="var(--ds-color-border-muted)"
      fill="var(--ds-color-background-secondary)"
      className="grid min-h-48 place-items-center p-6 text-center font-display text-xs font-black tracking-label text-muted"
    >
      {message}
    </Cut>
  );
}

/** Loading, or a failure with a retry, before the history arrives. */
export function HistoryState({
  failed,
  label,
  onRetry,
}: {
  failed: boolean;
  label: string;
  onRetry: () => void;
}) {
  return failed ? (
    <div className="grid justify-items-center gap-3 py-7 text-center">
      <p className="font-sans text-sm text-muted">Couldn&apos;t load {label}.</p>
      <Button variant="tonal" size="sm" onClick={onRetry}>
        TRY AGAIN
      </Button>
    </div>
  ) : (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      className="h-80 animate-pulse bg-surface-elevated/50"
    />
  );
}
