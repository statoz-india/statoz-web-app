import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";

// Renamed: the component below already has this name.
import type { QuizStatus, Team, TrendingQuiz as QuizItem } from "@/core";
import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  MotorsportIcon,
} from "@/lib/icons";

import styles from "./trendingQuiz.module.css";

type Tag = "open" | "live" | "closed" | "unresolved" | "settled" | "void";

const TAG_LABEL: Record<Tag, string> = {
  open: "OPEN",
  live: "LIVE",
  closed: "CLOSED",
  unresolved: "UNRESOLVED",
  settled: "SETTLED",
  void: "VOID",
};

/** `null` for a status the card never shows. */
const TAG_FOR_STATUS: Record<QuizStatus, Tag | null> = {
  UPCOMING: "open",
  ENTRYNOTSTARTED: "open",
  LIVE: "live",
  ENTRYCLOSED: "closed",
  SUSPENDED: "closed",
  // The match is over but the answers are not marked yet.
  FINISHED: "unresolved",
  ANSWER_UPDATED: "unresolved",
  NO_RESULT: "unresolved",
  NOT_ENOUGH_DATA: "unresolved",
  POSTPONED: "unresolved",
  UNRESOLVED: "unresolved",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  ABANDONED: "void",
  NOT_VISIBLE: null,
  ADMIN_VISIBLE: null,
};

type Sport = {
  accent: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const SPORTS: Record<string, Sport> = {
  football: { accent: "var(--ds-color-accent-cyan)", icon: FootballIcon },
  cricket: { accent: "var(--ds-color-accent-white)", icon: CricketIcon },
  basketball: { accent: "var(--ds-color-accent-gold)", icon: BasketballIcon },
  racing: { accent: "var(--ds-color-accent-racing)", icon: MotorsportIcon },
};

const BADGE_SIZE = 32;

/** An octagon crest: the team's colour, a stripe of its second colour, and its code. */
function TeamBadge({ team }: { team: Team }) {
  const name = team.displayName || team.name;
  const code = team.abbreviation || name.slice(0, 3).toUpperCase();
  const style = {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    "--primary": team.primaryColor || "var(--ds-color-border-strong)",
    "--secondary":
      team.secondaryColor || team.primaryColor || "var(--ds-color-border-strong)",
    "--ink": team.textColor || "var(--ds-color-text-default)",
    "--lift": `${Math.max(3, Math.round(BADGE_SIZE * 0.11))}px`,
    // Longer codes get a smaller size so they still fit the face.
    "--code-size": `${Math.max(8, Math.round(BADGE_SIZE * (code.length > 3 ? 0.2 : 0.24)))}px`,
  } as CSSProperties;

  return (
    <span className={styles.badge} style={style} role="img" aria-label={name}>
      <span className={styles.badgeShadow} aria-hidden />
      <span className={styles.badgeFace} aria-hidden>
        {code}
      </span>
    </span>
  );
}

export type QuizProgress = {
  /** e.g. "0 / 3 answered", or "2 / 3 correct" once settled. */
  text: string;
  /** How many segments are filled. */
  answered: number;
  /** One segment per question. */
  total: number;
};

export type TrendingQuizProps = {
  /** A quiz with or without its `matchBanner`, which the card does not show. */
  quiz: QuizItem;
  /** The status line text. A history card shows the quiz title instead. */
  label?: string;
  /** Not on the quiz itself; the progress block is hidden without it. */
  progress?: QuizProgress;
  /** e.g. "Up to 230 XP", or "+150 XP" once settled. Hidden without it. */
  reward?: string;
};

/** A match quiz as one linked card: both teams, the progress, and the XP on offer. */
export function TrendingQuiz({
  quiz,
  label = "XP prediction",
  progress,
  reward,
}: TrendingQuizProps) {
  const tag = TAG_FOR_STATUS[quiz.quizStatus];
  if (tag === null || !quiz.isVisible) return null;

  const sport = SPORTS[quiz.gameType.toLowerCase()];
  const Icon = sport?.icon;

  return (
    // No aria-label: it would replace the status, progress and reward for screen readers.
    <Link
      href={`/match/${encodeURIComponent(quiz.matchId)}/predict/${encodeURIComponent(quiz.quizId)}`}
      className={styles.card}
      style={
        {
          "--sport-accent": sport?.accent ?? "var(--ds-color-accent-cyan)",
        } as CSSProperties
      }
    >
      <span className={styles.etch} aria-hidden>
        <span className={styles.rail} />
      </span>

      <div className={styles.status}>
        <span className={styles.label}>
          {Icon ? (
            <Icon size={16} aria-hidden />
          ) : (
            <span className={styles.signal} aria-hidden />
          )}
          <span>{label}</span>
        </span>
        <span className={styles.tag} data-status={tag}>
          {TAG_LABEL[tag]}
        </span>
        <span className={styles.tagSpace} aria-hidden>
          {TAG_LABEL[tag]}
        </span>
      </div>

      <div className={styles.teams}>
        <TeamBadge team={quiz.teamA} />
        <span className={styles.versus}>VS</span>
        <TeamBadge team={quiz.teamB} />
      </div>

      {progress && (
        <div className={styles.progress}>
          <p className={styles.progressText}>{progress.text}</p>
          <div className={styles.steps} aria-hidden>
            {Array.from({ length: Math.max(0, progress.total) }, (_, i) => (
              <span key={i} data-complete={i < progress.answered || undefined} />
            ))}
          </div>
        </div>
      )}

      {reward && <p className={styles.reward}>{reward}</p>}
    </Link>
  );
}
