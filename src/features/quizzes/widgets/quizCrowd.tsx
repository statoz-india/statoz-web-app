"use client";

import type { ReactNode } from "react";

import type { QuizDetail, QuizQuestion } from "@/core";
import { CheckIcon, CloseIcon, FlagIcon, InsightsIcon, VerifiedIcon } from "@/lib/icons";
import { formatInt } from "@/utils";

import {
  awaitsReveal,
  crowdAccuracy,
  crowdRows,
  isOver,
  settledPick,
  withoutAnswers,
} from "../adapters";
import styles from "../css/quizDetail.module.css";
import { BackBar, FixtureHeader } from "./quizFrame";

/**
 * COMMUNITY // FINAL: any quiz once the match is live or over, or kick-off
 * has passed, for every player. Nothing can be answered; each question shows
 * its real answer, once marked, and how the crowd voted. A player who entered
 * a settled quiz sees no answers until they reveal them with `footer`.
 */
export function QuizCrowd({ quiz, footer }: { quiz: QuizDetail; footer?: ReactNode }) {
  // The match's own status wins; without it, a quiz past kick-off that
  // isn't over yet is taken as live.
  const live = quiz.matchStatus
    ? quiz.matchStatus.toLowerCase() === "live"
    : !isOver(quiz);
  const lead = quiz.isAttempted ? "Your picks are locked." : "You did not enter this quiz.";
  const notice = live
    ? `${lead} Follow the crowd signal while the match plays.`
    : `${lead} Study the final answers and the crowd signal.`;
  const hidden = awaitsReveal(quiz);
  const questions = (hidden ? withoutAnswers(quiz) : quiz).questionsArray;
  return (
    <div className={`${styles.page} flex h-dvh flex-col overflow-hidden`}>
      <BackBar quiz={quiz} />
      <FixtureHeader quiz={quiz} />

      <main className="mx-auto min-h-0 w-full max-w-190 flex-1 overflow-y-auto pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <p className="flex items-center justify-center gap-1.5 px-5 pt-3 pb-0.5 font-display text-xs font-black tracking-spread text-muted">
          {live ? <span aria-hidden>●</span> : <FlagIcon size={13} />}
          {live ? "MATCH LIVE" : "MATCH ENDED"}
        </p>
        <p className="mx-5 mt-3.5 border border-cyan/28 bg-cyan/8 px-3 py-2.5 text-center font-grotesk text-sm text-subtle">
          {notice}
        </p>
        <CrowdSummary questions={questions} />
        <ul className="flex flex-col gap-2.5 px-5 pt-4 pb-4.5">
          {questions.map((question) => (
            <CrowdCard
              key={question._id}
              question={question}
              // Picks are marked only once the player has revealed the results.
              pick={hidden ? null : settledPick(quiz, question.questionNumber)}
            />
          ))}
        </ul>
      </main>
      {footer}
    </div>
  );
}

/** How often the crowd picked the real answers, or why that isn't known yet. */
function CrowdSummary({ questions }: { questions: QuizQuestion[] }) {
  const votes = questions.reduce((sum, q) => sum + q.totalVotes, 0);
  const accuracy = crowdAccuracy(questions);
  const [title, line] = !votes
    ? ["NO CROWD VOTES", "Vote data will appear when the community feed is available."]
    : !accuracy
      ? ["ACCURACY PENDING", "Crowd accuracy appears once the answers are marked."]
      : [
          `${accuracy.total ? Math.round((accuracy.matched / accuracy.total) * 100) : 0}% CROWD ACCURACY`,
          `${formatInt(accuracy.matched)} / ${formatInt(accuracy.total)} votes matched the final answers.`,
        ];
  const tone = votes && accuracy ? "text-cyan" : "text-muted";
  return (
    <section className="mx-5 mt-2 border border-cyan/34 bg-surface p-3">
      <p
        className={`ds-tabular flex items-center gap-2 font-display text-micro font-black tracking-ultra ${tone}`}
      >
        <InsightsIcon size={15} className="shrink-0" />
        COMMUNITY // FINAL
      </p>
      <p className={`ds-tabular mt-2.25 font-display text-base font-black tracking-loose ${tone}`}>
        {title}
      </p>
      <p className="mt-1 font-grotesk text-xs text-muted">{line}</p>
    </section>
  );
}

/**
 * One question: its real answer, the player's settled pick when there is one,
 * then the options with the crowd's share, 0% before any vote.
 */
function CrowdCard({
  question,
  pick,
}: {
  question: QuizQuestion;
  pick: ReturnType<typeof settledPick>;
}) {
  const answer = question.correctAnswer;
  return (
    <li className={styles.crowdCard}>
      <div className="px-3 pt-3 pb-2.75">
        <div className="flex items-start gap-2.5">
          <span
            className={`${styles.crowdIndex} grid size-7.5 shrink-0 place-items-center font-display text-2xs font-black tracking-loose text-cyan`}
          >
            Q{question.questionNumber}
          </span>
          <h3 className="min-w-0 flex-1 font-display text-review font-black leading-snug tracking-tight">
            {question.questionText}
          </h3>
          {answer !== undefined ? (
            <VerifiedIcon size={20} className="shrink-0 text-success" />
          ) : null}
        </div>
        <p className="mt-2.5 flex items-center gap-2">
          <span className="shrink-0 font-display text-micro font-black tracking-ultra text-muted">
            ACTUAL RESULT
          </span>
          <span
            className={`min-w-0 flex-1 truncate font-grotesk text-sm font-bold ${answer !== undefined ? "text-success" : "text-muted"}`}
          >
            {answer ?? "RESULT UNAVAILABLE"}
          </span>
        </p>
        {pick ? (
          <p className="mt-1.5 flex items-center gap-2">
            <span className="shrink-0 font-display text-micro font-black tracking-ultra text-muted">
              YOUR PICK
            </span>
            <span
              className={`min-w-0 truncate font-grotesk text-sm font-bold ${pick.correct ? "text-success" : "text-danger"}`}
            >
              {pick.picked}
            </span>
            {pick.correct ? (
              <CheckIcon size={18} aria-label="Correct" className="shrink-0 text-success" />
            ) : (
              <CloseIcon size={18} aria-label="Wrong" className="shrink-0 text-danger" />
            )}
          </p>
        ) : null}
      </div>
      <div className="border-t border-line-subtle p-3">
        <div className="flex flex-col gap-2">
          <p className="ds-tabular flex justify-between gap-3 font-display text-micro font-black tracking-ultra text-muted">
            <span>CROWD PICK %</span>
            <span>{formatInt(question.totalVotes)} TOTAL VOTES</span>
          </p>
          {crowdRows(question).map((row) => (
            <div key={row.label} className="grid gap-1.25">
              <p className="flex items-center gap-1.5 font-grotesk text-compact font-bold">
                <span
                  className={`min-w-0 flex-1 truncate uppercase ${row.right ? "text-foreground" : "text-muted"}`}
                >
                  {row.label}
                </span>
                {row.right ? (
                  <span className="shrink-0 font-display text-micro font-black tracking-ultra text-success">
                    RIGHT
                  </span>
                ) : null}
                <span className={`ds-tabular shrink-0 ${row.right ? "text-success" : "text-muted"}`}>
                  {row.share}% · {formatInt(row.votes)} VOTES
                </span>
              </p>
              <span aria-hidden className={`${styles.pollTrack} block h-1.75`}>
                <span
                  className={`${styles.pollFill} block h-full ${row.right ? "bg-success" : "bg-muted"}`}
                  style={{ width: `${row.share}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </li>
  );
}
