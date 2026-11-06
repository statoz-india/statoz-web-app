"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import type { QuizDetail, Team } from "@/core";
import { ArrowLeftIcon, BoltIcon, ScheduleIcon } from "@/lib/icons";
import { hudChamferPath, shape } from "@/styles";
import { matchHref } from "@/utils";

import { fixtureClock, formatCountdown, isLocked } from "../adapters";
import styles from "../css/quizDetail.module.css";

/*
 * A clock that ticks every second, for the lock countdown. It is `null` on
 * the server and while hydrating, so both renders match.
 */
const subscribeToClock = (onTick: () => void) => {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;
const noClock = () => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribeToClock, currentSecond, noClock);
}

export function BackBar({ quiz }: { quiz: QuizDetail }) {
  return (
    <div className="mx-auto flex h-20 w-full max-w-240 shrink-0 items-center px-5 py-4 [@media(max-height:45rem)]:h-15">
      <Link
        href={matchHref(quiz.matchId, quiz.gameType)}
        className="flex min-h-12 items-center gap-5.5 font-grotesk text-badge font-bold text-foreground transition-colors hover:text-cyan"
      >
        <ArrowLeftIcon size={23} className="text-subtle" />
        Back to Matches
      </Link>
    </div>
  );
}

const CLOCK_TONE = { time: "text-gold", live: "text-danger", over: "text-muted" };

/** Kick-off time, both teams and their colours split under them. */
export function FixtureHeader({ quiz }: { quiz: QuizDetail }) {
  const clock = fixtureClock(quiz);
  return (
    <header className="mx-auto w-full max-w-190 shrink-0 px-5 pt-4.5">
      <div className={`${styles.brackets} relative px-2 pt-2.5`}>
        <p
          className={`ds-tabular text-center font-display text-base font-black tracking-broad ${CLOCK_TONE[clock.tone]}`}
        >
          {clock.text}
        </p>
        <div className="flex min-h-16.5 items-center gap-3 [@media(max-height:45rem)]:min-h-14">
          <TeamBadge team={quiz.teamA} />
          <span className="min-w-0 flex-1 truncate font-grotesk text-base font-bold">
            {quiz.teamA.displayName}
          </span>
          <span className="font-display font-black text-muted">-</span>
          <span className="min-w-0 flex-1 truncate text-right font-grotesk text-base font-bold">
            {quiz.teamB.displayName}
          </span>
          <TeamBadge team={quiz.teamB} mirrored />
        </div>
        <div aria-hidden className="flex h-1 gap-0.5 opacity-92">
          <span className="flex-1" style={{ background: quiz.teamA.primaryColor }} />
          <span className="flex-1" style={{ background: quiz.teamB.primaryColor }} />
        </div>
      </div>
    </header>
  );
}

const BADGE_CLIP = hudChamferPath(shape.quizBadgeCut, shape.quizBadgeAccentCut);

/** The away badge is mirrored, so its big cuts face the other way. */
function TeamBadge({ team, mirrored }: { team: Team; mirrored?: boolean }) {
  const cut = { clipPath: BADGE_CLIP, transform: mirrored ? "scaleX(-1)" : undefined };
  return (
    <span className="relative grid size-11 shrink-0 place-items-center">
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          ...cut,
          background: `color-mix(in srgb, ${team.primaryColor} 68%, var(--ds-color-text-default))`,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-px"
        style={{
          ...cut,
          background: `linear-gradient(145deg, ${team.primaryColor}, ${team.secondaryColor})`,
        }}
      />
      <span className="relative font-display text-xs font-black text-foreground">
        {team.abbreviation}
      </span>
    </span>
  );
}

/** The lock countdown, and the XP the answered questions could win. */
export function LockAndPot({
  quiz,
  now,
  potential,
  total,
}: {
  quiz: QuizDetail;
  now: number | null;
  potential: number;
  total: number;
}) {
  const locked = isLocked(quiz, now);
  return (
    <div className="flex flex-col items-center gap-1.75 px-5 pt-3 pb-0.5">
      <p
        className={`ds-tabular flex items-center gap-1.5 font-display text-xs font-black tracking-spread ${locked ? "text-muted" : "text-gold"}`}
      >
        <ScheduleIcon size={13} />
        {locked
          ? "QUIZ LOCKED"
          : `QUIZ LOCKS IN${now === null ? "" : ` ${formatCountdown(Date.parse(quiz.matchStartTime) - now)}`}`}
      </p>
      <p className="flex items-center gap-1.25 font-display font-black">
        <span className="text-micro tracking-spread text-muted">POTENTIAL</span>
        <BoltIcon size={13} className="text-gold" />
        {/* Keyed by the value, so the pop plays each time it changes. */}
        <span
          key={potential}
          className={`ds-tabular text-compact tracking-snug text-gold ${potential ? styles.pop : ""}`}
        >
          {potential}
        </span>
        <span className="text-micro tracking-spread text-muted">/{total} XP</span>
      </p>
    </div>
  );
}
