import type { ComponentType } from "react";

import type {
  AuthUser,
  FreeProfileBanner,
  FreeProfilePic,
  SignupSport,
  SignupTeam,
  Team as MatchTeam,
  UserPrediction,
  UserQuiz,
  UserAssetsResponse,
  UserStatsResponse,
  XpEntry,
} from "@/core";
import { isSport, sportModules, type Sport } from "@/config/sports";
import {
  BasketballIcon,
  BoltIcon,
  FootballIcon,
  HistoryIcon,
  PsychologyIcon,
  StadiumIcon,
  type IconProps,
} from "@/lib/icons";
import { accentVar } from "@/styles";

import { COIN_RANGES, COIN_SOURCES, LEVEL_XP } from "./constants";
import type { CoinRange, LookChoice, Profile, StatBand, Team } from "./types";

/**
 * The level `xp` reaches on `table`, 1-based, the XP that level starts at, and
 * the XP the next one needs.
 */
function levelOn(table: number[], xp: number) {
  const level = table.filter((start) => xp >= start).length;
  const start = table[level - 1] ?? 0;
  const next = table[level] ?? null;
  const progress = next === null ? 1 : (xp - start) / (next - start);
  return { level, xp, start, next, progress };
}

/** A Google account photo, which the profile never shows. */
function isGooglePhoto(url: string): boolean {
  try {
    return /(^|\.)googleusercontent\.com$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function toProfile(user: AuthUser): Profile {
  return {
    name: (user.userName ?? user.email.split("@")[0]).toUpperCase(),
    // A Google photo counts as none, so the default avatar shows instead.
    avatarUrl: user.avatarUrl && !isGooglePhoto(user.avatarUrl) ? user.avatarUrl : null,
    bannerUrl: user.bannerUrl ?? null,
    coins: user.coins,
    level: levelOn(LEVEL_XP, user.xp.totalXP),
  };
}

type UserAssets = UserAssetsResponse["data"];

/** A free item the player bought is in both lists; it shows once, as owned. */
const once = (choices: LookChoice[]) =>
  choices.filter((choice, i) => choices.findIndex((c) => c.id === choice.id) === i);

/** Bought pics first, then the free ones; a pic deleted from the store is skipped. */
export function avatarChoices(assets: UserAssets, free: FreeProfilePic[]): LookChoice[] {
  const owned = assets.profilePicsPurchased.flatMap((entry) =>
    entry.profilePicId ? [entry.profilePicId] : [],
  );
  return once(
    [...owned, ...free].map((pic) => ({
      id: pic.ppId,
      label: pic.ppName,
      src: pic.ppUrl,
    })),
  );
}

/** Bought banners first, then the free ones; a deleted banner is skipped. */
export function bannerChoices(assets: UserAssets, free: FreeProfileBanner[]): LookChoice[] {
  const owned = assets.profileBannersPurchased.flatMap((entry) =>
    entry.profileBannerId ? [entry.profileBannerId] : [],
  );
  return once(
    [...owned, ...free].map((banner) => ({
      id: banner.pbId,
      label: banner.pbName,
      src: banner.pbUrl,
    })),
  );
}

/** A share as a whole percent, 0 when nothing was played. */
const percent = (part: number, whole: number) =>
  whole ? Math.round((part / whole) * 100) : 0;

/** PREDICTS is the match quiz; PICKS the match prediction, once settled. */
export function toStatBands(stats: UserStatsResponse["data"]): StatBand[] {
  return [
    {
      id: "predicts",
      title: "PREDICTS",
      accent: "cyan",
      cells: [
        { label: "QUIZZES", value: stats.totalQuizzesPlayed },
        { label: "QUESTIONS", value: stats.totalQuestionsPlayed },
        { label: "CORRECT", value: stats.totalCorrectAnswers },
        {
          label: "ACCURACY",
          value: percent(stats.totalCorrectAnswers, stats.totalQuestionsPlayed),
          suffix: "%",
        },
      ],
    },
    {
      id: "picks",
      title: "PICKS",
      accent: "lime",
      cells: [
        { label: "PICKS", value: stats.totalPredictionsPlayed },
        {
          label: "WIN RATE",
          value: percent(
            stats.totalCorrectPredictions,
            stats.totalPredictionsPlayed,
          ),
          suffix: "%",
        },
      ],
    },
  ];
}

/** The sports this app knows that have tournaments, in the API's order. */
export function followableSports(data: SignupSport[]) {
  return data.flatMap(({ sportsType: sport, tournamentList }) =>
    isSport(sport) && tournamentList.length
      ? [{ sport, tournaments: tournamentList }]
      : [],
  );
}

/** A team has no colour of its own until the backend sets one. */
/** How many clubs are followed, across every league. */
export const clubCount = (picks: AuthUser["clubAndTeams"]) =>
  picks.reduce((count, league) => count + league.teams.length, 0);

export const toTeam = (sport: Sport, team: SignupTeam): Team => ({
  id: team._id,
  code: team.abbreviation,
  name: team.displayName,
  league: team.tournament,
  color: team.primaryColor ?? accentVar(sportModules[sport].accent),
});

/** The followed teams per sport; a followed league alone still shows its sport. */
export function followedGroups(
  data: SignupSport[],
  picks: AuthUser["clubAndTeams"],
) {
  return followableSports(data).flatMap(({ sport, tournaments }) => {
    const followed = tournaments.flatMap((tournament) => {
      const pick = picks.find((p) => p.tournament === tournament._id);
      return pick ? [{ tournament, teams: pick.teams }] : [];
    });
    if (!followed.length) return [];
    const teams = followed.flatMap(({ tournament, teams: ids }) =>
      tournament.teams
        .filter((team) => ids.includes(team._id))
        .map((team) => toTeam(sport, team)),
    );
    return [{ sport, teams }];
  });
}

const DAY_MS = 86_400_000;

/**
 * Each range's balance line, one point per change, starting from the balance
 * before the range. Earned and spent add up its rises and falls; the first
 * change ever counts from 0.
 */
export function coinRanges(
  points: { x: string; y: number }[],
  balance: number,
  now: number,
): CoinRange[] {
  return COIN_RANGES.map(({ id, label, days }) => {
    const from = days === null ? -Infinity : now - days * DAY_MS;
    const start = points.findIndex((p) => Date.parse(p.x) >= from);
    const inRange = start === -1 ? [] : points.slice(start);
    const before = points[(start === -1 ? points.length : start) - 1];
    const values = points.length
      ? [before?.y ?? 0, ...inRange.map((p) => p.y)]
      : [balance];
    return { id, label, values, ...coinMoves(values) };
  });
}

/** What a balance line gained and lost, step by step. */
export function coinMoves(values: number[]) {
  let earned = 0;
  let spent = 0;
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) earned += change;
    else spent -= change;
  }
  return { earned, spent };
}

/** A coin change's readable source. */
export const coinSource = (source: string) =>
  COIN_SOURCES[source] ??
  source.charAt(0) + source.slice(1).toLowerCase().replaceAll("_", " ");

const coinWhen = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** `01 JAN, 00:00`, in India time. */
export function formatDateTime(iso: string): string {
  const part = Object.fromEntries(
    coinWhen.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${part.day} ${part.month.toUpperCase()}, ${part.hour}:${part.minute}`;
}

const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** XP and coins keep up to 2 decimals, as the API sends them. */
export const formatAmount = (value: number) => amount.format(value);

/** `+40` or `−10`, with a true minus sign. */
export const formatChange = (value: number) =>
  `${value < 0 ? "\u2212" : "+"}${formatAmount(Math.abs(value))}`;

export const signedXp = (entry: XpEntry) =>
  entry.xpType === "CREDITED" ? entry.xp : -entry.xp;

type XpTrack = { label: string; icon: ComponentType<IconProps> };

const GAME_TRACKS: Record<string, XpTrack> = {
  pitchDuel: { label: "PITCH", icon: FootballIcon },
  penaltyShootout: { label: "SHOOTOUT", icon: StadiumIcon },
  hoopShot: { label: "HOOP", icon: BasketballIcon },
};

/** An entry's track chip and icon. Unknown keys show as themselves. */
export function xpTrack(entry: XpEntry): XpTrack {
  if (entry.xpSource === "OPENING_BALANCE") {
    return { label: "OPENING", icon: HistoryIcon };
  }
  if (entry.scopeKey.endsWith("-kq")) return { label: "QUIZ", icon: PsychologyIcon };
  return (
    GAME_TRACKS[entry.scopeKey] ?? {
      label: entry.scopeKey.toUpperCase(),
      icon: entry.xpSource === "TOURNAMENT" ? PsychologyIcon : BoltIcon,
    }
  );
}

const xpWhen = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** `14 SEPT 18:05`, in India time like the rest of the app. */
export function formatXpTime(iso: string): string {
  const part = Object.fromEntries(
    xpWhen.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${part.day} ${part.month.toUpperCase()} ${part.hour}:${part.minute}`;
}

const nextDay = (day: string) =>
  new Date(Date.parse(day) + 86_400_000).toISOString().slice(0, 10);

/**
 * The running XP total for each chart range: per day since the first XP
 * (ALL), the last 7 days (WEEK), and after each of today's changes (DAY).
 * The map leaves out days with no XP, so those carry the total over.
 */
export function xpSeries(
  points: { x: string; y: number }[],
  today: string,
  todayChanges: number[],
) {
  const byDay = new Map(points.map((p) => [p.x, p.y]));
  const daily: number[] = [];
  let total = 0;
  for (let day = points[0]?.x; day && day <= today; day = nextDay(day)) {
    total += byDay.get(day) ?? 0;
    daily.push(total);
  }
  let running = total - (byDay.get(today) ?? 0);
  return {
    all: daily.length ? daily : [0],
    week: [...Array<number>(Math.max(0, 7 - daily.length)).fill(0), ...daily.slice(-7)],
    day: [running, ...todayChanges.map((change) => (running += change))],
  };
}

/** A match side as the profile's crest shows it. */
export const toMatchTeam = (team: MatchTeam): Team => ({
  id: team._id,
  code: team.abbreviation,
  name: team.displayName,
  league: team.tournament ?? "",
  color: team.primaryColor,
});

const STATUS_LABELS: Record<string, string> = {
  ENTRYNOTSTARTED: "NOT OPEN",
  ENTRYCLOSED: "ENTRY CLOSED",
  SETTLEMENT_DONE: "SETTLED",
};

/** A quiz or prediction status in words, as `ENTRY CLOSED`. */
export const statusLabel = (status: string) =>
  STATUS_LABELS[status] ?? status.replaceAll("_", " ");

export const isQuizSettled = (quiz: UserQuiz) =>
  quiz.quizData.quizStatus === "SETTLEMENT_DONE";

/** Whether an answer was right; `null` until its correct answer is set. */
export function answerResult(
  quiz: UserQuiz,
  answer: UserQuiz["answers"][number],
): boolean | null {
  const correct =
    quiz.correctAnswersByQuestionNumber[String(answer.questionNumber)];
  return correct === undefined ? null : correct === answer.selectedAnswer;
}

/** A bet's outcome; payouts still in progress or failed count as pending. */
export function pickResult(pick: UserPrediction): "won" | "lost" | "pending" {
  if (pick.payoutStatus === "PAID" || pick.payoutStatus === "COMPLETED") {
    return "won";
  }
  return pick.payoutStatus === "LOST" ? "lost" : "pending";
}

/** What a settled bet made or lost; 0 while pending. */
export const pickNet = (pick: UserPrediction) =>
  ({ won: pick.coinsWon, lost: -pick.coinsBet, pending: 0 })[pickResult(pick)];

const PAYOUT_LABELS: Record<string, string> = {
  PENDING: "PENDING",
  PAID: "WON",
  COMPLETED: "WON",
  LOST: "LOST",
  PROCESSING: "PAYING OUT",
  FAILED: "PAYOUT FAILED",
};

/** A bet's state in words; a cancelled match wins over its payout. */
export const pickLabel = (pick: UserPrediction) =>
  pick.predictionData.predictionStatus === "CANCELLED"
    ? "CANCELLED"
    : (PAYOUT_LABELS[pick.payoutStatus] ?? statusLabel(pick.payoutStatus));
