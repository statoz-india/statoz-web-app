"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties } from "react";

import { IMAGES } from "@/config/images";
import type { QuizDetail, QuizQuestion } from "@/core";
import { ChevronRightIcon } from "@/lib/icons";

import { isLocked, optionLetter, optionState, totalXp } from "../adapters";
import styles from "../css/quizDetail.module.css";
import { sendAnswers } from "../data/quiz.data";
import { BackBar, FixtureHeader, LockAndPot, useNow } from "./quizFrame";
import { OptionFace } from "./quizOption";

const ACTION =
  "flex min-h-11.5 flex-1 items-center justify-center gap-2 font-display text-xs font-black tracking-broad";

/** One question at a time, for a quiz the player hasn't submitted. */
export function QuizPlay({
  quiz,
  onSubmitted,
}: {
  quiz: QuizDetail;
  /** Once the answers are saved, with the most XP they can earn. */
  onSubmitted: (potentialXp: number) => void;
}) {
  const now = useNow();
  const locked = isLocked(quiz, now);
  const questions = quiz.questionsArray;
  const [current, setCurrent] = useState(0);
  // The picked option's text, by question number.
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[current];
  const picked = picks[question.questionNumber];
  const last = current === questions.length - 1;
  const potential = totalXp(questions.filter((q) => q.questionNumber in picks));

  return (
    <div className={`${styles.page} flex h-dvh flex-col overflow-hidden`}>
      <BackBar quiz={quiz} />
      <FixtureHeader quiz={quiz} />

      <section
        aria-label="Quiz"
        className="relative mx-auto flex min-h-0 w-full max-w-190 flex-1 flex-col"
      >
        <div aria-hidden className={`${styles.art} absolute inset-0`}>
          <Image
            src={IMAGES.backgrounds.predictions.default}
            alt=""
            fill
            sizes="760px"
            className="object-cover object-center"
          />
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <LockAndPot
            quiz={quiz}
            now={now}
            potential={potential}
            total={totalXp(questions)}
          />
          {/* Keyed, so each question's entrance plays again. */}
          <Question
            key={question.questionNumber}
            question={question}
            picked={picked}
            locked={locked}
            onPick={(option) =>
              setPicks((all) => ({ ...all, [question.questionNumber]: option }))
            }
          />
        </div>

        <div className="relative mx-auto w-full max-w-180 shrink-0 px-4 pt-5 pb-6 [@media(max-height:45rem)]:py-3">
          <div aria-hidden className="flex gap-2">
            {questions.map((q, i) => (
              <span
                key={q._id}
                className={`${styles.segment} h-1.25 flex-1`}
                data-state={
                  i === current ? "current" : q.questionNumber in picks ? "answered" : undefined
                }
              />
            ))}
          </div>
          <div className="mt-3.5 flex gap-3.5">
            {current > 0 ? (
              <button
                type="button"
                className={`${styles.action} ${ACTION}`}
                onClick={() => setCurrent((i) => i - 1)}
              >
                PREVIOUS
              </button>
            ) : null}
            {last ? (
              // Disabled while sending, so a double tap can't submit twice.
              <button
                type="button"
                data-primary
                disabled={locked || picked === undefined || sending}
                className={`${styles.action} ${ACTION}`}
                onClick={async () => {
                  setSending(true);
                  setError(null);
                  // On success the screen swaps to the review.
                  const failed = await sendAnswers(quiz, picks);
                  setError(failed);
                  setSending(false);
                  if (!failed) onSubmitted(potential);
                }}
              >
                {locked ? "QUIZ CLOSED" : sending ? "SUBMITTING" : "SUBMIT QUIZ"}
              </button>
            ) : (
              // A closed quiz can still be read through, question by question.
              <button
                type="button"
                data-primary
                disabled={!locked && picked === undefined}
                className={`${styles.action} ${ACTION}`}
                onClick={() => setCurrent((i) => i + 1)}
              >
                NEXT
                <ChevronRightIcon size={16} />
              </button>
            )}
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-center font-grotesk text-compact text-danger">
              {error}
            </p>
          ) : locked ? null : (
            <p className="mt-3 text-center font-grotesk text-compact text-muted">
              Complete all {questions.length} questions
            </p>
          )}
        </div>

        <div key={question.questionNumber} aria-hidden className={styles.flash}>
          <span>{question.questionNumber}</span>
        </div>
      </section>
    </div>
  );
}

function Question({
  question,
  picked,
  locked,
  onPick,
}: {
  question: QuizQuestion;
  picked: string | undefined;
  locked: boolean;
  onPick: (option: string) => void;
}) {
  const titleId = useId();
  return (
    <div className="mx-auto w-full max-w-160 px-5 pb-6">
      <div className="relative pt-7.5">
        <span className="absolute top-4.5 left-3.5 grid size-7.5 place-items-center border border-line bg-cyan/16 font-display text-base font-black text-cyan">
          {question.questionNumber}
        </span>
        <span
          className={`${styles.xpPill} absolute top-0 right-0 flex h-7.5 items-center gap-1 px-2.5 font-display font-black`}
        >
          <span className="ds-tabular text-sm">{question.xp}</span>
          <span className="text-2xs tracking-label">xp</span>
        </span>

        <div className="border border-line bg-background/90 px-4.5 pt-7 pb-4.5">
          <h2
            id={titleId}
            className="flex flex-wrap gap-x-1.25 font-display text-question font-black leading-snug tracking-tight"
          >
            {question.questionText.split(/\s+/).map((word, i) => (
              <span
                key={i}
                className={styles.word}
                style={{ "--i": i } as CSSProperties}
              >
                {word}
              </span>
            ))}
          </h2>
          <div role="group" aria-labelledby={titleId} className="mt-4 flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const state = optionState(question, option, picked);
              return (
                <button
                  key={option}
                  type="button"
                  disabled={locked}
                  aria-pressed={picked === option}
                  data-state={state}
                  onClick={() => onPick(option)}
                  className={`${styles.option} flex w-full items-center gap-3 px-2.5 py-3.25 text-left`}
                  style={{ "--i": i } as CSSProperties}
                >
                  <OptionFace letter={optionLetter(i)} label={option} state={state} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
