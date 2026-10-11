import { isSport, type Sport } from "@/config/sports";
import type {
  FootballSummary,
  Matches,
  MatchStats,
  MotorSportMatches,
  Team,
  TournamentSection,
} from "@/lib";

import type {
  MatchDetailScoreboard,
  MatchShot,
  MatchStatus,
  SportMatch,
  SportTeam,
} from "../types";
import { basketballTeamId, toBasketballScoreboard } from "./basketball";
import { cricketTeamId, toCricketScoreboard } from "./cricket";
import { toRaceReport } from "./race";
import {
  EMPTY_LINEUP,
  emptyScoreboard,
  present,
  side,
  type Side,
} from "./shared";

/**
 * Turns what the public API sends into what the match page draws.
 *
 * Two responses feed one page. The match stats carry the score, the events and
 * the line-ups, but no colours; the day's fixture list carries each team's
 * colours and the competition's short name. Either can be missing, and every
 * field of the stats can be null, so nothing here assumes a value is present.
 */

/** Crest colours for a side whose fixture, and so whose own colours, is unknown. */
const FALLBACK_COLORS = { home: "#5cdfff", away: "#c27aff" } as const;

/* -------------------------------------------------------------------------
 * The fixture
 * ---------------------------------------------------------------------- */

/** What a day's list holds: a team fixture, or a race. */
export type Fixture = Matches | MotorSportMatches;

export function isRace(fixture: Fixture): fixture is MotorSportMatches {
  return !("teamA" in fixture);
}

/** The fixture with this readable id, from whichever loaded list holds it. */
export function findFixture(
  days: (TournamentSection[] | undefined)[],
  matchId: string,
): Fixture | undefined {
  for (const sections of days) {
    for (const section of sections ?? []) {
      const found = (section.matches ?? []).find(
        (match) => match.matchId === matchId,
      );
      if (found) return found;
    }
  }
  return undefined;
}

const fixtureStatuses: Record<string, MatchStatus> = {
  upcoming: "scheduled",
  live: "live",
  ongoing: "live",
};

function teamFromFixture(team: Team, fallback: string): SportTeam {
  const name = team.displayName || team.name;
  return {
    id: team._id,
    name,
    shortName: team.abbreviation || name.slice(0, 3).toUpperCase(),
    color: team.primaryColor || fallback,
    secondaryColor: team.secondaryColor || undefined,
    badgeTextColor: team.textColor || undefined,
    secondaryTextColor: team.secondaryTextColor || undefined,
  };
}

/** Whether two spellings name one club: "Real Madrid" and "Real Madrid CF". */
function sameClub(a: string | null | undefined, b: string | undefined) {
  if (!a || !b) return false;
  const [x, y] = [a.trim().toLowerCase(), b.trim().toLowerCase()];
  return x === y || x.includes(y) || y.includes(x);
}

/* -------------------------------------------------------------------------
 * The match header
 * ---------------------------------------------------------------------- */

/** What a sport's stats say about one side of the match. */
type SideFacts = {
  /** The id the report's own rows name this side by. */
  id?: string;
  name?: string;
  shortName?: string;
  score?: number | string;
};

/** What a sport's stats say about the match itself. */
type StatsFacts = {
  status: MatchStatus;
  kickoff?: string;
  league?: string;
  liveMinute?: number;
  home: SideFacts;
  away: SideFacts;
};

/** A state the stats provider words in its own way, read as one of three. */
function statusFrom(
  completed: boolean | null | undefined,
  ...words: (string | null | undefined)[]
): MatchStatus {
  if (completed) return "finished";
  const text = words.filter(Boolean).join(" ").toLowerCase();
  return /sched|not started|\bpre\b|postponed/.test(text)
    ? "scheduled"
    : "live";
}

function factsOf(stats: MatchStats): StatsFacts | null {
  switch (stats.gameType) {
    case "football": {
      const summary = stats.matchSummary;
      const details = summary.matchDetails;
      const teams = present(summary.teams);
      const facts = (which: Side): SideFacts => {
        const lineup = teams.find((entry) => entry.homeAway === which);
        const scored = details?.score?.[which];
        return {
          // The line-up's id, so a player's `teamId` finds their team.
          id: lineup?.id ?? undefined,
          name: lineup?.name ?? scored?.team ?? undefined,
          shortName: lineup?.abbreviation ?? scored?.abbreviation ?? undefined,
          score: scored?.score ?? undefined,
        };
      };
      return {
        status: statusFrom(details?.completed, details?.status),
        kickoff: details?.kickoff ?? undefined,
        league: details?.league ?? undefined,
        liveMinute:
          present(summary.momentum?.series).at(-1)?.minute ?? undefined,
        home: facts("home"),
        away: facts("away"),
      };
    }
    case "cricket": {
      const summary = stats.matchSummary;
      const details = summary.matchDetails;
      const facts = (which: Side): SideFacts => {
        const scored = details?.score?.[which];
        return {
          id: cricketTeamId(summary, which),
          name: scored?.team ?? undefined,
          shortName: scored?.abbreviation ?? undefined,
          // An innings reads "161/5 (18/20 ov, target 156)", not a number.
          score: scored?.score ?? undefined,
        };
      };
      return {
        status: statusFrom(details?.completed, details?.state, details?.status),
        kickoff: details?.start ?? undefined,
        league: details?.leagueAbbreviation ?? details?.league ?? undefined,
        home: facts("home"),
        away: facts("away"),
      };
    }
    case "basketball": {
      const summary = stats.matchSummary;
      const details = summary.matchDetails;
      const facts = (which: Side): SideFacts => {
        const scored = details?.score?.[which];
        return {
          id: basketballTeamId(summary, which),
          name: scored?.team ?? undefined,
          shortName: scored?.abbreviation ?? undefined,
          score: scored?.score ?? undefined,
        };
      };
      return {
        status: statusFrom(details?.completed, details?.status),
        kickoff: details?.tipoff ?? undefined,
        league: details?.leagueAbbreviation ?? details?.league ?? undefined,
        home: facts("home"),
        away: facts("away"),
      };
    }
    default:
      return null;
  }
}

/**
 * The match as the header and the facts panel read it. The stats win on the
 * score and the state, because they are the fresher of the two; the fixture
 * supplies the colours. Null when neither names both sides.
 */
export function toMatch(
  id: string,
  stats: MatchStats | null | undefined,
  fixture: Matches | undefined,
): SportMatch | null {
  const facts = stats ? factsOf(stats) : null;

  // The fixture lists its teams as A and B. Which of them is at home is read
  // off the stats when they name one, and is otherwise taken to be A.
  const aIsAway =
    fixture !== undefined &&
    sameClub(facts?.home.name, fixture.teamB?.name) &&
    !sameClub(facts?.home.name, fixture.teamA?.name);
  const fixtureHome = aIsAway ? fixture?.teamB : fixture?.teamA;
  const fixtureAway = aIsAway ? fixture?.teamA : fixture?.teamB;

  const team = (which: Side, fromFixture: Team | undefined): SportTeam | null => {
    const told = facts?.[which];
    const base = fromFixture
      ? teamFromFixture(fromFixture, FALLBACK_COLORS[which])
      : null;
    const name = base?.name ?? told?.name;
    if (!name) return null;
    return {
      ...(base ?? { color: FALLBACK_COLORS[which] }),
      id: told?.id ?? base?.id ?? which,
      name,
      shortName:
        base?.shortName ?? told?.shortName ?? name.slice(0, 3).toUpperCase(),
    };
  };

  const home = team("home", fixtureHome);
  const away = team("away", fixtureAway);
  if (!home || !away) return null;

  const sportName = (stats?.gameType ?? fixture?.gameType)?.toLowerCase();
  const sport: Sport = isSport(sportName) ? sportName : "football";
  const status: MatchStatus =
    facts?.status ??
    fixtureStatuses[String(fixture?.matchStatus).toLowerCase()] ??
    "finished";

  return {
    id,
    sport,
    leagueLabel: fixture?.tournament || facts?.league || "MATCH",
    home,
    away,
    status,
    kickoff: fixture?.matchStartTime ?? facts?.kickoff ?? "",
    // Before the start the feed already reports 0 - 0; that is not a score yet.
    homeScore: status === "scheduled" ? undefined : facts?.home.score,
    awayScore: status === "scheduled" ? undefined : facts?.away.score,
    liveMinute: status === "live" ? facts?.liveMinute : undefined,
    volumeOz: fixture?.totalVolume,
  };
}

const raceStatuses: Record<string, MatchStatus> = {
  upcoming: "scheduled",
  ongoing: "live",
  finished: "finished",
};

/**
 * A race as the header reads it. A race has no sides, so its name stands in
 * for both, and the header for a race draws only the name.
 */
export function toRaceMatch(
  id: string,
  stats: MatchStats | null | undefined,
  race: MotorSportMatches,
): SportMatch {
  const summary = stats?.gameType === "racing" ? stats.matchSummary : undefined;
  const name: SportTeam = {
    id,
    name: summary?.name ?? race.name,
    shortName: race.tournament,
    color: "var(--ds-color-accent-racing)",
  };
  return {
    id,
    sport: "racing",
    leagueLabel: race.tournament || "RACE",
    home: name,
    away: name,
    status: summary
      ? statusFrom(summary.completed, summary.status)
      : (raceStatuses[String(race.matchStatus).toLowerCase()] ?? "finished"),
    kickoff: race.raceStartTime ?? summary?.startDate ?? "",
  };
}

/* -------------------------------------------------------------------------
 * The STATS tab
 * ---------------------------------------------------------------------- */

/**
 * A match's stats as its sport's report reads them. Undefined when there is
 * nothing a report could draw: no stats, or a race with no finishing order.
 */
export function toScoreboard(
  id: string,
  stats: MatchStats | null | undefined,
): MatchDetailScoreboard | undefined {
  if (!stats?.matchSummary) return undefined;
  switch (stats.gameType) {
    case "football":
      return toFootballScoreboard(stats.matchSummary);
    case "cricket":
      return toCricketScoreboard(stats.matchSummary);
    case "basketball":
      return toBasketballScoreboard(stats.matchSummary);
    case "racing": {
      const race = toRaceReport(id, stats.matchSummary);
      return race ? { ...emptyScoreboard(), race } : undefined;
    }
    default:
      return undefined;
  }
}

/** Where a shot crossed the goal, as far as its description says. */
function placement(text: string): MatchShot["goalPlacement"] {
  if (/blocked/i.test(text)) return null;
  const horizontal = /left/i.test(text) ? 24 : /right/i.test(text) ? 76 : 50;
  const vertical = /top|high/i.test(text)
    ? 24
    : /bottom|low/i.test(text)
      ? 76
      : 50;
  const label = [
    /top/i.test(text) ? "TOP" : /bottom/i.test(text) ? "BOTTOM" : "CENTRE",
    /left/i.test(text) ? "LEFT" : /right/i.test(text) ? "RIGHT" : "CENTRE",
  ].join(" ");
  return { x: horizontal, y: vertical, label };
}

function outcome(kind: string, goal: boolean | null): MatchShot["outcome"] {
  if (goal || kind === "goal" || kind.includes("scored")) return "goal";
  if (kind.includes("blocked")) return "blocked";
  if (kind.includes("on-target")) return "saved";
  return "missed";
}

function timelineType(kind: string | null, card: string | null) {
  if (kind === "goal" || kind?.includes("scored")) return "goal" as const;
  if (kind === "red-card" || card === "red") return "red" as const;
  if (kind === "substitution") return "substitution" as const;
  return "yellow" as const;
}

/** A name the API sends either as text or inside an object. */
function nameOf(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "object" && value !== null) {
    const { name, displayName, shortName } = value as Record<string, unknown>;
    return nameOf(name) ?? nameOf(displayName) ?? nameOf(shortName);
  }
  return undefined;
}

/** A football match's stats as the STATS tab reads them. */
function toFootballScoreboard(summary: FootballSummary): MatchDetailScoreboard {
  const details = summary.matchDetails;
  const commentary = present(summary.commentary);
  const textByPlay = new Map(
    commentary.map((entry) => [entry.playId, entry.text ?? ""]),
  );

  const located = summary.shotMap?.available
    ? present(summary.shotMap.shots)
    : [];
  const shots: MatchShot[] = located
    .filter((shot) => shot.x != null && shot.y != null)
    .map((shot, index) => {
      const text = textByPlay.get(shot.playId) ?? "";
      return {
        id: shot.playId ?? String(index),
        minute: shot.minute ?? 0,
        period: shot.period === 2 ? 2 : 1,
        side: side(shot.side) ?? "home",
        player: shot.player ?? "Unknown player",
        x: Number(shot.x),
        y: Number(shot.y),
        outcome: outcome(shot.kind ?? "", shot.goal),
        detail: text,
        goalPlacement: placement(text),
      };
    });

  const lineups = (["home", "away"] as const).map((which) => {
    const source = present(summary.teams).find(
      (team) => team.homeAway === which,
    );
    if (!source) return EMPTY_LINEUP;
    const players = present(source.players);
    const entry = (player: (typeof players)[number]) => ({
      name: player.name ?? player.shortName ?? "Unknown player",
      shortName: player.shortName ?? undefined,
      number: Number(player.jersey) || 0,
      role: player.positionName ?? player.position ?? "",
    });
    return {
      formation: source.formation ?? "",
      confirmed: Boolean(source.lineupsConfirmed),
      players: players
        .filter((player) => player.starter)
        .map((player) => ({
          ...entry(player),
          captain: false,
          formationPlace: Number(player.formationPlace) || undefined,
        })),
      substitutes: players
        .filter((player) => !player.starter)
        .map((player) => entry(player)),
    };
  });

  const series = present(summary.momentum?.series);
  const goals = present(summary.momentum?.goals);

  return {
    intel: {
      competition: details?.league ?? "",
      season: details?.season ?? "",
      venue: details?.location?.venue ?? "",
      attendance: details?.attendance
        ? String(details.attendance)
        : undefined,
      facts: [],
    },
    stats: present(summary.topStats)
      .filter((stat) => stat.available && stat.home && stat.away)
      .map((stat) => ({
        label: (stat.label ?? stat.name ?? "").toUpperCase(),
        home: stat.home?.display ?? "—",
        away: stat.away?.display ?? "—",
        homeValue: stat.home?.share ?? 0,
        awayValue: stat.away?.share ?? 0,
      })),
    timeline: present(summary.timeline)
      .filter((entry) => entry.kind !== "start-2nd-half")
      .map((entry) => {
        const playerOut = nameOf(entry.playerOut);
        const assist = nameOf(entry.assist);
        const secondary =
          entry.kind === "substitution" && playerOut ? playerOut : assist;
        return {
          minute: entry.minute ?? "",
          side: side(entry.side),
          type: timelineType(entry.kind, entry.card),
          player:
            entry.player ??
            nameOf(entry.playerIn) ??
            entry.team ??
            entry.label ??
            "Match event",
          secondary,
          marker: entry.marker ?? undefined,
          label: entry.label ?? undefined,
          scoreDisplay: entry.score?.display ?? undefined,
          description: entry.text ?? undefined,
        };
      }),
    commentary: commentary.map((entry, index) => ({
      minute: entry.minute || "—",
      text: entry.text ?? "",
      sequence: entry.sequence ?? index,
      kind: entry.kind ?? undefined,
      side: side(entry.side),
      teamName: entry.team ?? undefined,
      players: present(entry.players).length
        ? present(entry.players)
        : undefined,
    })),
    trace: series.length
      ? {
          title: "TERRITORIAL PRESSURE",
          unit: "PRESSURE",
          ticks: series.map((entry) => `${entry.minute ?? 0}'`),
          home: series.map((entry) => entry.home ?? 0),
          away: series.map((entry) => entry.away ?? 0),
          markers: goals.map((goal, index) => ({
            index: Math.min(series.length - 1, Math.max(0, goal.axis ?? 0)),
            label: `${goal.player ?? "Goal"} ${goal.clock ?? ""}`.trim(),
            side: side(goal.side) ?? "home",
            decisive: index === goals.length - 1,
          })),
        }
      : undefined,
    shots,
    scoreRows: [],
    homeLineup: lineups[0],
    awayLineup: lineups[1],
    players: present(summary.teams).flatMap((source) =>
      present(source.players).map((player, index) => ({
        id: player.id ?? `${source.id}-${index}`,
        name: player.name ?? player.shortName ?? "Unknown player",
        shortName: player.shortName ?? undefined,
        teamId: source.id ?? source.homeAway ?? "",
        role: player.positionName ?? player.position ?? "",
        number: player.jersey ?? undefined,
        // The API sends no per-player figures or touch positions yet.
        stats: [],
        heatmap: [],
      })),
    ),
  };
}
