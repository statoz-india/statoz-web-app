import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";

import type {
  PredictionSide,
  PredictionStatus,
  Team,
  TrendingPrediction,
} from "@/core";
import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  MotorsportIcon,
} from "@/lib/icons";
import { colors, liftForContrast } from "@/styles/colors";

import styles from "./trendingPredictions.widget.module.css";

/** A featured card shows at most this many outcomes. */
const FEATURED_OUTCOMES = 3;

type Tag = "open" | "live" | "unresolved" | "settled" | "closed" | "void";

const TAG_LABEL: Record<Tag, string> = {
  open: "OPEN",
  live: "LIVE",
  unresolved: "UNRESOLVED",
  settled: "SETTLED",
  closed: "CLOSED",
  void: "VOID",
};

/** `null` for a status the card never shows. */
const TAG_FOR_STATUS: Record<PredictionStatus, Tag | null> = {
  UPCOMING: "open",
  ACTIVE: "open",
  LIVE: "live",
  FINISHED: "closed",
  WINNING_TEAM_UPDATED: "closed",
  SUSPENDED: "closed",
  SETTLEMENT_DONE: "settled",
  CANCELLED: "void",
  ABANDONED: "void",
  NO_RESULT: "void",
  NOT_ENOUGH_DATA: "unresolved",
  POSTPONED: "unresolved",
  UNRESOLVED: "unresolved",
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

/** The neutral slate a draw takes, since it has no team colour. */
const DRAW_COLOR = colors.rarity.silver.deep;

/**
 * Dark ink once the fill's luminance passes 0.179, where dark and white text
 * have equal contrast.
 */
function inkFor(fill: string): string {
  const hex = fill.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return colors.text.default;
  const channel = (value: number) =>
    value / 255 <= 0.03928
      ? value / 255 / 12.92
      : ((value / 255 + 0.055) / 1.055) ** 2.4;
  const lum =
    0.2126 * channel(parseInt(hex.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(hex.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(hex.slice(4, 6), 16));
  return lum > 0.179 ? colors.text.inverse : colors.text.default;
}

type Outcome = { side: PredictionSide; label: string; percent: number; fill: string };

function outcome(
  side: PredictionSide,
  label: string,
  percent: number,
  color: string,
): Outcome {
  // A colour too dark for the card is lightened until it stands out from it.
  const fill = liftForContrast(color || colors.accent.cyan, {
    against: colors.fixture.base,
    ratio: 2.2,
  });
  return { side, label, percent: Math.round(percent), fill };
}

const teamName = (team: Team) => team.displayName || team.name;

/** Team A, the draw when the market has one, then team B. */
function outcomesOf(prediction: TrendingPrediction): Outcome[] {
  const { teamA, teamB } = prediction;
  const outcomes = [
    outcome("A", teamName(teamA), prediction.oddsTeamA, teamA.primaryColor),
    outcome("B", teamName(teamB), prediction.oddsTeamB, teamB.primaryColor),
  ];
  if (prediction.oddsDraw != null) {
    outcomes.splice(1, 0, outcome("D", "Draw", prediction.oddsDraw, DRAW_COLOR));
  }
  return outcomes;
}

export type TrendingPredictionsWidgetProps = {
  /** A pick, or a trending one whose `tournamentData` can be empty. */
  prediction: TrendingPrediction;
  /** Hides the context line and shows at most 3 outcomes. */
  featured?: boolean;
  /** Without it, or once the market stops taking entries, the rows are disabled. */
  onPick?: (side: PredictionSide) => void;
};

/** A match pick card: the question, one row per outcome, and the volume. */
export function TrendingPredictionsWidget({
  prediction,
  featured,
  onPick,
}: TrendingPredictionsWidgetProps) {
  const tag = TAG_FOR_STATUS[prediction.predictionStatus];
  if (tag === null) return null;

  const sport = SPORTS[prediction.gameType.toLowerCase()];
  const Icon = sport?.icon;
  const href = `/picks/${encodeURIComponent(prediction.predictionId)}`;
  const league = prediction.tournamentData.tournament || prediction.tournament;
  const all = outcomesOf(prediction);
  const outcomes = featured ? all.slice(0, FEATURED_OUTCOMES) : all;
  const disabled = !onPick || (tag !== "open" && tag !== "live");

  return (
    <article
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
        <span className={styles.league}>
          {Icon && <Icon size={16} aria-hidden />}
          <span>{league} · Match Pick</span>
        </span>
        <span className={styles.tag} data-status={tag}>
          {TAG_LABEL[tag]}
        </span>
        <span className={styles.tagSpace} aria-hidden>
          {TAG_LABEL[tag]}
        </span>
      </div>

      <Link href={href} className={styles.title}>
        {teamName(prediction.teamA)} vs {teamName(prediction.teamB)}
      </Link>
      {!featured && prediction.tournamentData.tournamentName && (
        <p className={styles.context}>
          {prediction.tournamentData.tournamentName}
        </p>
      )}

      <div className={styles.outcomes}>
        {outcomes.map((option) => (
          <button
            key={option.side}
            type="button"
            className={styles.outcome}
            style={
              { "--fill": option.fill, "--ink": inkFor(option.fill) } as CSSProperties
            }
            disabled={disabled}
            onClick={() => onPick?.(option.side)}
          >
            <span className={styles.outcomeLabel}>{option.label}</span>
            <span className={styles.badge}>{option.percent}%</span>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <span>{prediction.totalCoins.toLocaleString("en-US")} Oz volume</span>
        <Link href={href} className={styles.action}>
          View Pick ↗
        </Link>
      </div>
    </article>
  );
}
