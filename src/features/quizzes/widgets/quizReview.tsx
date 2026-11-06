"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";

import type { QuizDetail, QuizQuestion } from "@/core";
import { CheckIcon, CloseIcon, DoubleArrowUpIcon } from "@/lib/icons";
import { formatInt, matchHref } from "@/utils";

import { optionLetter, optionState, pickFor, totalXp, verdict } from "../adapters";
import styles from "../css/quizDetail.module.css";
import { BackBar, FixtureHeader, LockAndPot, useNow } from "./quizFrame";
import { OptionFace } from "./quizOption";

const PICK_TONE = { correct: "text-success", wrong: "text-danger" };

/** A submitted quiz: one card per question with the player's pick. */
export function QuizReview({ quiz }: { quiz: QuizDetail }) {
  const now = useNow();
  const questions = quiz.questionsArray;
  const answered = questions.filter((q) => pickFor(quiz, q.questionNumber) !== undefined);

  return (
    <div className={`${styles.page} min-h-dvh`}>
      <BackBar quiz={quiz} />
      <FixtureHeader quiz={quiz} />

      <main className="mx-auto w-full max-w-190 pb-4.5">
        <LockAndPot
          quiz={quiz}
          now={now}
          potential={totalXp(answered)}
          total={totalXp(questions)}
        />
        <p className="mx-5 mt-3.5 border border-cyan/28 bg-cyan/8 px-3 py-2.5 text-center font-grotesk text-sm text-subtle">
          {quiz.quizStatus === "SETTLEMENT_DONE"
            ? `Results are in. You earned ${formatInt(quiz.obtainedXP)} XP.`
            : "Picks locked in. Results land after the match."}
        </p>
        <Link
          href={matchHref(quiz.matchId, quiz.gameType)}
          className="mx-5 mt-2.5 block w-fit font-display text-2xs font-black tracking-ultra text-cyan transition-colors hover:text-foreground"
        >
          OPEN SAME-MATCH PICKS
        </Link>
        <ul className="mx-5 flex flex-col gap-2.5">
          {questions.map((question) => (
            <ReviewCard
              key={question._id}
              question={question}
              pick={pickFor(quiz, question.questionNumber)}
            />
          ))}
        </ul>
      </main>
    </div>
  );
}

/** Opens to list every option, with the pick and, once settled, the answer marked. */
function ReviewCard({
  question,
  pick,
}: {
  question: QuizQuestion;
  pick: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const optionsId = useId();
  const result = verdict(question, pick);

  return (
    <li
      className="border border-line"
      style={{ background: "var(--ds-gradient-quiz-panel)" }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={optionsId}
        onClick={() => setOpen((o) => !o)}
        className="block w-full px-3 pt-3 pb-2.75 text-left"
      >
        <span className="flex items-start gap-2.5">
          <span className="grid size-7.5 shrink-0 place-items-center border border-line bg-cyan/14 font-display text-2xs font-black tracking-loose text-cyan">
            Q{question.questionNumber}
          </span>
          <span className="min-w-0 flex-1 font-display text-review font-black leading-snug tracking-tight">
            {question.questionText}
          </span>
          <DoubleArrowUpIcon size={20} className={`${styles.chevron} shrink-0 text-muted`} />
        </span>
        <span className="mt-2.5 flex items-center gap-2">
          <span className="shrink-0 font-display text-micro font-black tracking-ultra text-muted">
            YOUR PICK
          </span>
          <span
            className={`min-w-0 truncate font-grotesk text-sm font-bold ${result ? PICK_TONE[result] : ""}`}
          >
            {pick ?? "—"}
          </span>
          {result === "correct" ? (
            <CheckIcon size={18} className="shrink-0 text-success" />
          ) : result === "wrong" ? (
            <CloseIcon size={18} className="shrink-0 text-danger" />
          ) : null}
        </span>
        {result === "wrong" ? (
          <span className="mt-1.5 flex items-center gap-2">
            <span className="shrink-0 font-display text-micro font-black tracking-ultra text-muted">
              ANSWER
            </span>
            <span className="min-w-0 truncate font-grotesk text-sm font-bold">
              {question.correctAnswer}
            </span>
          </span>
        ) : null}
      </button>

      {open ? (
        <ul id={optionsId} className="flex flex-col gap-2 px-3 pb-3">
          {question.options.map((option, i) => {
            const state = optionState(question, option, pick);
            return (
              <li
                key={option}
                data-state={state}
                className={`${styles.option} flex items-center gap-3 px-2.5 py-2.5`}
                style={{ "--i": i } as CSSProperties}
              >
                <OptionFace letter={optionLetter(i)} label={option} state={state} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
