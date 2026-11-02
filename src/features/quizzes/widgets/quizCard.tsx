"use client";

import type { CSSProperties, ReactNode } from "react";

import type { Quiz, QuizStatus } from "@/core";
import { useRequireAuth } from "@/features/auth";
import {
  BlockIcon,
  BoltIcon,
  CheckIcon,
  InsightsIcon,
  LockIcon,
  ScheduleIcon,
} from "@/lib/icons";

import styles from "../css/quizCard.module.css";

export type QuizChip = {
  icon?: ReactNode;
  label: string;
  /** Any CSS colour, for example `var(--ds-color-accent-cyan)`. */
  color: string;
  filled?: boolean;
};

export type QuizOutcome = "correct" | "wrong" | "void";

export type QuizCardProps = {
  /** 1 shows as "01". */
  index: number;
  title: string;
  subtitle?: string;
  /** For example "OBJECTIVE" or "LOCKED IN". */
  tag: string;
  /** The state's colour: tag, edge, index plate, CTA and chevron. */
  accent: string;
  /** The clubs' colours, which tint the fill from top-left to bottom-right. */
  homeColor: string;
  awayColor: string;
  /** The pill beside the title. Hidden without it. */
  reward?: { text: string; color: string };
  /** The contest strip: the entry chip, then the prize chip. Paid quizzes only. */
  chips?: [QuizChip, QuizChip];
  /** 0 to 1. */
  progress: number;
  /** Defaults to the accent. */
  progressColor?: string;
  cta: { icon: ReactNode; text: string };
  showChevron?: boolean;
  /** One verdict dot per question once settled. Replaces the chevron. */
  outcomes?: QuizOutcome[];
  blocked?: boolean;
  blockedNote?: string;
  glow?: boolean;
  onClick?: () => void;
};

const DOT: Record<QuizOutcome, { color: string; glyph: string }> = {
  correct: { color: "var(--ds-color-success)", glyph: "✓" },
  wrong: { color: "var(--ds-color-danger)", glyph: "✕" },
  void: { color: "var(--ds-color-text-muted)", glyph: "⋯" },
};

/**
 * One quiz on a match's Predict tab. The whole card is one button; it only
 * shows the values it is given, so the caller picks the state.
 */
export function QuizCard({
  index,
  title,
  subtitle,
  tag,
  accent,
  homeColor,
  awayColor,
  reward,
  chips,
  progress,
  progressColor,
  cta,
  showChevron,
  outcomes,
  blocked,
  blockedNote,
  glow,
  onClick,
}: QuizCardProps) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  return (
    <button
      type="button"
      className={styles.card}
      data-blocked={blocked || undefined}
      data-glow={glow || undefined}
      style={
        {
          "--accent": accent,
          "--home": homeColor,
          "--away": awayColor,
        } as CSSProperties
      }
      onClick={onClick}
    >
      <span className={styles.shadow} aria-hidden />
      <span className={styles.frame}>
        <span className={styles.index}>{String(index).padStart(2, "0")}</span>

        <span className={styles.content}>
          <span className={styles.head}>
            <span className={styles.headText}>
              <span className={styles.tag}>{tag}</span>
              <span className={styles.title}>{title}</span>
            </span>
            {reward && (
              <span
                className={styles.reward}
                style={{ "--c": reward.color } as CSSProperties}
              >
                {reward.text}
              </span>
            )}
          </span>

          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}

          {chips && (
            <span className={styles.strip}>
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className={styles.chip}
                  data-filled={chip.filled || undefined}
                  style={{ "--c": chip.color } as CSSProperties}
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </span>
          )}

          <span
            className={styles.track}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i
              style={{
                width: `${pct}%`,
                background: progressColor ?? accent,
              }}
            />
          </span>

          <span className={styles.divider} aria-hidden />

          <span className={styles.cta}>
            {cta.icon}
            <span className={styles.ctaText}>{cta.text}</span>
            {outcomes ? (
              <span className={styles.dots}>
                {outcomes.map((outcome, i) => (
                  <span
                    // Questions have no id here; their order is fixed.
                    key={i}
                    className={styles.dot}
                    style={{ "--c": DOT[outcome].color } as CSSProperties}
                  >
                    {DOT[outcome].glyph}
                  </span>
                ))}
              </span>
            ) : showChevron ? (
              <span className={styles.chevron} aria-hidden>
                ›
              </span>
            ) : null}
          </span>

          {blocked && blockedNote && (
            <span className={styles.note}>{blockedNote}</span>
          )}
        </span>
      </span>
    </button>
  );
}

type MatchQuizLook = {
  tag: string;
  accent: string;
  cta: { icon: ReactNode; text: string };
  showChevron: boolean;
};

const CTA_ICON_SIZE = 14;

const OPEN: MatchQuizLook = {
  tag: "OBJECTIVE",
  accent: "var(--ds-color-accent-cyan)",
  cta: { icon: <BoltIcon size={CTA_ICON_SIZE} />, text: "TAP TO PREDICT" },
  showChevron: true,
};
const LIVE: MatchQuizLook = {
  tag: "LIVE",
  accent: "var(--ds-color-danger)",
  cta: {
    icon: <LockIcon size={CTA_ICON_SIZE} />,
    text: "LOCKED PICKS · MATCH IN PROGRESS",
  },
  showChevron: false,
};
const CLOSED: MatchQuizLook = {
  tag: "CLOSED",
  accent: "var(--ds-color-text-muted)",
  cta: {
    icon: <ScheduleIcon size={CTA_ICON_SIZE} />,
    text: "PREDICTIONS CLOSED",
  },
  showChevron: false,
};
const VERIFYING: MatchQuizLook = {
  tag: "RESULT VERIFYING",
  accent: "var(--ds-color-warning)",
  cta: {
    icon: <InsightsIcon size={CTA_ICON_SIZE} />,
    text: "VIEW CROWD SIGNAL",
  },
  showChevron: true,
};
const SETTLED: MatchQuizLook = {
  tag: "SETTLED",
  accent: "var(--ds-color-text-muted)",
  cta: { icon: <CheckIcon size={CTA_ICON_SIZE} />, text: "VIEW RESULTS" },
  showChevron: true,
};
const VOID: MatchQuizLook = {
  tag: "VOID",
  accent: "var(--ds-color-text-muted)",
  cta: { icon: <BlockIcon size={CTA_ICON_SIZE} />, text: "QUIZ VOIDED" },
  showChevron: false,
};

/** `null` for a quiz players never see. */
const LOOK_FOR_STATUS: Record<QuizStatus, MatchQuizLook | null> = {
  UPCOMING: OPEN,
  ENTRYNOTSTARTED: OPEN,
  LIVE,
  ENTRYCLOSED: CLOSED,
  SUSPENDED: CLOSED,
  // The match is over, or on hold, and the answers are not marked yet.
  FINISHED: VERIFYING,
  ANSWER_UPDATED: VERIFYING,
  NO_RESULT: VERIFYING,
  NOT_ENOUGH_DATA: VERIFYING,
  POSTPONED: VERIFYING,
  UNRESOLVED: VERIFYING,
  SETTLEMENT_DONE: SETTLED,
  CANCELLED: VOID,
  ABANDONED: VOID,
  NOT_VISIBLE: null,
  ADMIN_VISIBLE: null,
};

/** Whether a match's quiz is shown at all. */
export function isShownQuiz(quiz: Quiz): boolean {
  return quiz.isVisible && LOOK_FOR_STATUS[quiz.quizStatus] !== null;
}

/** "Make Predictions and Earn 40 XP" → "+40 XP". The API sends no XP field. */
function rewardFromTag(tag: string): string | undefined {
  const xp = /(\d[\d,]*)\s*XP/i.exec(tag)?.[1];
  return xp ? `+${xp} XP` : undefined;
}

/**
 * A match's quiz as a {@link QuizCard}. Its look follows the quiz's status
 * alone: a player's own answers need a login. A tap asks a guest to log in.
 */
export function MatchQuizCard({ quiz, index }: { quiz: Quiz; index: number }) {
  const requireAuth = useRequireAuth();
  const look = LOOK_FOR_STATUS[quiz.quizStatus];
  if (look === null || !quiz.isVisible) return null;

  const reward = rewardFromTag(quiz.tag);
  return (
    <QuizCard
      index={index}
      title="Match Events Quiz"
      subtitle={quiz.tag}
      tag={look.tag}
      accent={look.accent}
      homeColor={quiz.teamA.primaryColor}
      awayColor={quiz.teamB.primaryColor}
      reward={
        reward ? { text: reward, color: "var(--ds-color-accent-gold)" } : undefined
      }
      progress={0}
      cta={look.cta}
      showChevron={look.showChevron}
      // There is no quiz screen yet, so a signed-in player's tap does nothing.
      onClick={() => requireAuth({ intent: "play this quiz" })}
    />
  );
}

/** The column the quiz cards sit in. */
export function QuizCardList({ children }: { children: ReactNode }) {
  return <div className={styles.list}>{children}</div>;
}

/** The countdown line above the list, for example "QUIZ LOCKS IN 14:59:46". */
export function LockLine({
  text,
  icon,
  color,
}: {
  text: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <span className={styles.lockLine} style={{ color }} role="status">
      {icon}
      <span suppressHydrationWarning>{text}</span>
    </span>
  );
}
