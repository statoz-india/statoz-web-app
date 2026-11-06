import type { CricketSummary } from "@/core";

import type {
  FeedEvent,
  MatchDetailScoreboard,
  MatchTrace,
  RunRatePoint,
} from "../types";
import { emptyScoreboard, present, type Side } from "./shared";

/**
 * A cricket match's stats as the STATS tab reads them.
 *
 * The run race and the run-rate chart are drawn from the ball-by-ball
 * commentary, the only place the API says how an innings unfolded.
 */

type Ball = NonNullable<CricketSummary["commentary"]>[number];

/** A side's id, as the match header gives it to the report. */
export function cricketTeamId(summary: CricketSummary, which: Side): string {
  return summary.matchDetails?.score?.[which]?.teamId ?? which;
}

/** Overs bowled after a ball: "15.1" is fifteen overs and a ball, "15.6" sixteen. */
function oversAfter(ball: Ball): number {
  const [whole, part = "0"] = (ball.over ?? "").split(".");
  if (ball.over && Number.isFinite(Number(whole))) {
    return Number(whole) + Math.min(6, Number(part) || 0) / 6;
  }
  return Math.max(0, (ball.overNumber ?? 1) - 1) + (ball.ball ?? 0) / 6;
}

/** The runs in a score written as "139/5". */
function runsIn(score: string | null): number {
  return Number.parseInt(score ?? "", 10) || 0;
}

export function toCricketScoreboard(
  summary: CricketSummary,
): MatchDetailScoreboard {
  const details = summary.matchDetails;
  const homeId = cricketTeamId(summary, "home");
  const awayId = cricketTeamId(summary, "away");
  const awayName = details?.score?.away?.team;

  /** Which side a team is, by its id and failing that its name. */
  const sideOf = (teamId: string | null, team: string | null): Side =>
    (teamId != null && teamId === awayId) ||
    (teamId == null && team != null && team === awayName)
      ? "away"
      : "home";
  const idOf = (which: Side) => (which === "home" ? homeId : awayId);

  const innings = present(summary.innings);
  const cards = present(summary.scorecard);
  const balls = present(summary.commentary);

  /** The side batting in an innings, by the innings' number. */
  const battingSide = (number: number | null): Side | undefined => {
    const row = innings.find((entry) => entry.innings === number);
    if (row) return sideOf(row.teamId, row.team);
    const card = cards.find((entry) => entry.innings === number);
    return card ? sideOf(card.battingTeamId, card.battingTeam) : undefined;
  };

  const toss = details?.toss;
  const board = emptyScoreboard();
  board.intel = {
    competition: [details?.league, details?.stage].filter(Boolean).join(" // "),
    season: details?.season == null ? "" : String(details.season),
    venue: details?.location?.venue ?? "",
    attendance:
      details?.attendance == null
        ? undefined
        : details.attendance.toLocaleString("en-US"),
    facts: [
      ...(details?.format ? [{ label: "FORMAT", value: details.format }] : []),
      ...(toss?.team
        ? [
            {
              label: "TOSS",
              value: `${toss.team} // ${(toss.decision ?? "").toUpperCase()}`,
            },
          ]
        : []),
    ],
    resultNote: details?.result ?? undefined,
  };

  board.stats = present(summary.teamStats)
    .filter((stat) => stat.available && stat.home != null && stat.away != null)
    .map((stat) => ({
      label: (stat.label ?? stat.name ?? "").toUpperCase(),
      home: String(stat.home ?? 0),
      away: String(stat.away ?? 0),
      homeValue: stat.home ?? 0,
      awayValue: stat.away ?? 0,
    }));

  board.scoreRows = innings.map((entry) => {
    const batting = sideOf(entry.teamId, entry.team);
    return {
      label: `${entry.innings === 1 ? "1ST" : "2ND"} INNINGS`,
      home: batting === "home" ? (entry.score ?? "—") : "—",
      away: batting === "away" ? (entry.score ?? "—") : "—",
    };
  });

  board.innings = cards.map((card) => {
    const batting = present(card.batting);
    const bowling = present(card.bowling);
    return {
      team: card.battingTeam ?? "",
      side: sideOf(card.battingTeamId, card.battingTeam),
      score: card.score ?? "—",
      overs: `${card.overs ?? 0} ov`,
      runRate: String(card.runRate ?? "—"),
      topBat:
        batting.slice().sort((a, b) => (b.runs ?? 0) - (a.runs ?? 0))[0]
          ?.score ?? "—",
      topBowl:
        bowling.slice().sort((a, b) => (b.wickets ?? 0) - (a.wickets ?? 0))[0]
          ?.figures ?? "—",
      batting: batting.map((player) => ({
        name: player.name ?? "Unknown batter",
        dismissal: player.notOut ? undefined : (player.dismissal ?? undefined),
        runs: player.runs ?? 0,
        balls: player.balls ?? 0,
        fours: player.fours ?? 0,
        sixes: player.sixes ?? 0,
      })),
      bowling: bowling.map((player) => ({
        name: player.name ?? "Unknown bowler",
        overs: String(player.overs ?? 0),
        maidens: player.maidens ?? 0,
        runs: player.runs ?? 0,
        wickets: player.wickets ?? 0,
      })),
      ...(card.target == null ? {} : { target: card.target }),
    };
  });

  // Each innings' balls, in the order they were bowled.
  const numbers = [...new Set(balls.map((ball) => ball.innings))].filter(
    (number): number is number => number != null,
  );
  const progress = numbers.map((number) => ({
    number,
    side: battingSide(number),
    points: balls
      .filter((ball) => ball.innings === number)
      .map((ball) => ({
        ball,
        over: oversAfter(ball),
        runs: runsIn(ball.score),
      })),
  }));

  board.trace = raceTrace(progress, summary);

  board.runRate = progress
    .filter(
      (entry) =>
        (entry.number === 1 || entry.number === 2) && entry.points.length > 1,
    )
    .map((entry) => ({
      innings: entry.number === 2 ? 2 : 1,
      teamId: idOf(entry.side ?? "home"),
      points: entry.points.map(({ ball, over, runs }): RunRatePoint => {
        const boundary =
          ball.boundary && (ball.runs === 4 || ball.runs === 6)
            ? ball.runs
            : undefined;
        return {
          over,
          actual:
            ball.runRate ?? (over > 0 ? Number((runs / over).toFixed(2)) : 0),
          ...(ball.required?.runRate == null
            ? {}
            : { required: ball.required.runRate }),
          ...(boundary ? { boundary } : {}),
          ...(ball.wicket ? { wicket: true } : {}),
        };
      }),
    }));

  board.feed = balls.map((ball): FeedEvent => {
    const batting = battingSide(ball.innings);
    return {
      marker: ball.over ?? "",
      text: [ball.shortText, ball.text].filter(Boolean).join(" // "),
      kind: ball.wicket ? "wicket" : ball.boundary ? "score" : "note",
      ...(batting ? { teamId: idOf(batting) } : {}),
    };
  });

  return board;
}

type Progress = {
  number: number;
  side: Side | undefined;
  points: Array<{ ball: Ball; over: number; runs: number }>;
};

/**
 * Both innings' runs, over by over. It needs each innings from its first
 * over: a feed that only holds the closing overs would draw a side as stuck
 * on nought until then, so that draws nothing instead.
 */
function raceTrace(
  progress: Progress[],
  summary: CricketSummary,
): MatchTrace | undefined {
  const fromTheStart = (entry: Progress | undefined) =>
    entry !== undefined && entry.points.length > 0 && entry.points[0].over <= 1;
  const home = progress.find((entry) => entry.side === "home");
  const away = progress.find((entry) => entry.side === "away");
  if (!home || !away || !fromTheStart(home) || !fromTheStart(away)) {
    return undefined;
  }

  const lastOver = (entry: Progress) =>
    Math.ceil(entry.points.at(-1)?.over ?? 0);
  const overs = Math.max(lastOver(home), lastOver(away), 1);
  const ticks = Array.from({ length: overs }, (_, index) => String(index + 1));
  const runsAfter = (entry: Progress, over: number) =>
    entry.points.filter((point) => point.over <= over + 1e-9).at(-1)?.runs ?? 0;
  const short = (which: Side) =>
    summary.matchDetails?.score?.[which]?.abbreviation ?? which.toUpperCase();
  const wickets = (entry: Progress, which: Side) =>
    entry.points
      .filter((point) => point.ball.wicket)
      .map((point) => ({
        index: Math.max(0, Math.ceil(point.over) - 1),
        label: `${short(which)} wicket ${point.ball.over ?? ""}`.trim(),
        side: which,
      }));

  return {
    title: "INNINGS RACE",
    unit: "RUNS",
    ticks,
    home: ticks.map((_, index) => runsAfter(home, index + 1)),
    away: ticks.map((_, index) => runsAfter(away, index + 1)),
    markers: [...wickets(home, "home"), ...wickets(away, "away")],
  };
}
