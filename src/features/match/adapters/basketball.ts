import type { BasketballSummary } from "@/core";

import type {
  BasketballScoringEvent,
  MatchDetailLineup,
  MatchDetailScoreboard,
} from "../types";
import {
  EMPTY_LINEUP,
  emptyScoreboard,
  present,
  shown,
  side,
  type Side,
} from "./shared";

/** A basketball game's stats as the STATS tab reads them. */

const BOX_COLUMNS = [
  "MIN",
  "PTS",
  "FG",
  "3PT",
  "FT",
  "REB",
  "AST",
  "TO",
  "STL",
  "BLK",
  "+/-",
];

/** A side's id, as the match header gives it to the report. */
export function basketballTeamId(
  summary: BasketballSummary,
  which: Side,
): string {
  return (
    present(summary.teams).find((team) => team.homeAway === which)?.id ?? which
  );
}

type Shooting = { made: number | null; attempted: number | null } | null;

function madeOf(shooting: Shooting | undefined): string {
  return `${shooting?.made ?? 0}-${shooting?.attempted ?? 0}`;
}

export function toBasketballScoreboard(
  summary: BasketballSummary,
): MatchDetailScoreboard {
  const details = summary.matchDetails;
  const score = details?.score;
  const teams = present(summary.teams);
  const plays = present(summary.playByPlay);
  const turns = present(summary.turningPoints);
  const homeId = basketballTeamId(summary, "home");
  const sideOfTeam = (team: (typeof teams)[number]): Side =>
    side(team.homeAway) ?? (team.id === homeId ? "home" : "away");

  const board = emptyScoreboard();

  const points = [score?.home?.score, score?.away?.score].filter(
    (value): value is number => value != null,
  );
  board.intel = {
    competition: [details?.league, details?.gameNote]
      .filter(Boolean)
      .join(" // "),
    season: details?.season == null ? "" : String(details.season),
    venue: details?.location?.venue ?? "",
    attendance:
      details?.attendance == null
        ? undefined
        : details.attendance.toLocaleString("en-US"),
    facts: [
      ...(details?.broadcast
        ? [{ label: "BROADCAST", value: details.broadcast }]
        : []),
      ...(present(details?.series).at(-1)?.summary
        ? [
            {
              label: "SERIES",
              value: present(details?.series).at(-1)?.summary ?? "",
            },
          ]
        : []),
    ],
    resultNote:
      details?.completed && score?.winner && points.length === 2
        ? `${score.winner} won ${Math.max(...points)}-${Math.min(...points)}`
        : undefined,
  };

  board.stats = present(summary.topStats)
    .filter((stat) => stat.available && stat.home != null && stat.away != null)
    .map((stat) => {
      const percentage = (stat.name ?? "").toLowerCase().includes("pct");
      return {
        label: (stat.label ?? stat.name ?? "").toUpperCase(),
        home: shown(stat.home ?? 0, percentage),
        away: shown(stat.away ?? 0, percentage),
        homeValue: stat.home ?? 0,
        awayValue: stat.away ?? 0,
      };
    });

  const periods = present(summary.lineScore?.periods).length
    ? present(summary.lineScore?.periods)
    : present(details?.periods);
  board.scoreRows = periods.map((period) => ({
    label: period.label ?? `Q${period.period ?? ""}`,
    home: String(period.home ?? "—"),
    away: String(period.away ?? "—"),
  }));

  if (plays.length > 1) {
    // A play that carries no score leaves the score where it was.
    let home = 0;
    let away = 0;
    const scores = plays.map((play) => {
      home = play.homeScore ?? home;
      away = play.awayScore ?? away;
      return { home, away };
    });
    board.trace = {
      title: "SCORE RACE",
      unit: "POINTS",
      ticks: plays.map((play) => `Q${play.period ?? 0} ${play.clock ?? ""}`),
      home: scores.map((entry) => entry.home),
      away: scores.map((entry) => entry.away),
      markers: turns.map((turn, index) => ({
        index: Math.max(
          0,
          plays.findIndex((play) => play.id === turn.playId),
        ),
        label: turn.text ?? "Turning point",
        side: (turn.swing ?? 0) >= 0 ? "home" : "away",
        decisive: index === turns.length - 1,
      })),
    };
  }

  board.timeline = turns.map((turn) => ({
    minute: `Q${turn.period ?? 0} ${turn.clock ?? ""}`.trim(),
    side: (turn.swing ?? 0) >= 0 ? "home" : "away",
    type: "score",
    player: `${turn.homeScore ?? 0}-${turn.awayScore ?? 0}`,
    secondary: turn.text ?? undefined,
  }));

  board.commentary = plays.map((play, index) => ({
    minute: `Q${play.period ?? 0} ${play.clock ?? ""}`.trim(),
    text: play.text ?? "",
    sequence: index,
  }));

  board.leaders = present(details?.leaders).flatMap((group) =>
    present(group.leaders).map((leader) => ({
      name: leader.name ?? "",
      side: group.teamId === homeId ? ("home" as const) : ("away" as const),
      line: String(leader.value ?? "—"),
      note: (leader.label ?? leader.category ?? "").toUpperCase(),
    })),
  );

  const rows = teams.flatMap((team) =>
    present(team.players).map((player) => ({
      name: player.name ?? player.shortName ?? "Unknown player",
      side: sideOfTeam(team),
      values: [
        player.didNotPlay ? "DNP" : String(player.minutes ?? "DNP"),
        String(player.points ?? 0),
        madeOf(player.fieldGoals),
        madeOf(player.threePointFieldGoals),
        madeOf(player.freeThrows),
        String(player.rebounds ?? 0),
        String(player.assists ?? 0),
        String(player.turnovers ?? 0),
        String(player.steals ?? 0),
        String(player.blocks ?? 0),
        (player.plusMinus ?? 0) > 0
          ? `+${player.plusMinus}`
          : String(player.plusMinus ?? 0),
      ],
    })),
  );
  board.boxScore = rows.length ? { columns: BOX_COLUMNS, rows } : undefined;

  const lineup = (which: Side): MatchDetailLineup => {
    const team = teams.find((entry) => sideOfTeam(entry) === which);
    if (!team) return EMPTY_LINEUP;
    const players = present(team.players);
    const entry = (player: (typeof players)[number], bench: boolean) => ({
      name: player.name ?? player.shortName ?? "Unknown player",
      shortName: player.shortName ?? undefined,
      number: Number(player.jersey) || 0,
      role: (bench ? player.reason : null) ?? player.position ?? "",
    });
    return {
      formation: "STARTING 5",
      confirmed: true,
      players: players
        .filter((player) => player.starter)
        .map((player) => entry(player, false)),
      substitutes: players
        .filter((player) => !player.starter)
        .map((player) => entry(player, true)),
    };
  };
  board.homeLineup = lineup("home");
  board.awayLineup = lineup("away");

  board.basketballShots = plays.flatMap(
    (play, index): BasketballScoringEvent[] => {
      const spot = play.coordinate;
      if (!play.shootingPlay || spot?.x == null || spot.y == null) return [];
      if (play.points !== 2 && play.points !== 3) return [];
      return [
        {
          id: play.id ?? String(index),
          period: play.period ?? 0,
          clock: play.clock ?? "",
          side: side(play.side) ?? "home",
          player: present(play.players)[0] ?? "Unknown player",
          text: play.text ?? "",
          made: Boolean(play.made),
          points: play.points,
          x: spot.x,
          y: spot.y,
        },
      ];
    },
  );

  return board;
}
