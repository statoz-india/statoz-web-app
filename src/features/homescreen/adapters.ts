import { isSport, type Sport } from "@/config/sports";
import type {
  Matches,
  MatchEvent,
  MotorSportMatches,
  MatchSportsType,
  Team,
  Tournament,
} from "@/core";

import type {
  LeagueGroup,
  SportFixture,
  SportHubSelection,
  SportTeam,
} from "./types";
import type { TournamentSection } from "@/core/models";

/**
 * Turns the public API's responses into what the hub draws. A record the hub
 * could not draw, such as a fixture without a team, is left out rather than
 * allowed to take the whole feed down.
 */

/** A crest for a team or race whose colour the API does not have. */
const CREST_FALLBACK = "var(--ds-color-border-strong)";

function toSport(gameType: string | undefined): Sport | undefined {
  const value = gameType?.toLowerCase();
  return isSport(value) ? value : undefined;
}

/** The page of a match, addressed by its readable id and nothing else. */
function matchHref(matchId: string): string {
  return `/match/${encodeURIComponent(matchId)}`;
}

function text(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

/** "no_result" becomes "NO RESULT". */
function statusText(status: string): string {
  return status.replace(/[_-]+/g, " ").trim().toUpperCase();
}

function toTeam(team: Team): SportTeam {
  const name = team.displayName || team.name;
  return {
    id: team._id,
    name,
    shortName: team.abbreviation || name.slice(0, 3).toUpperCase(),
    color: team.primaryColor || CREST_FALLBACK,
    secondaryColor: team.secondaryColor || undefined,
    badgeTextColor: team.textColor || undefined,
  };
}

/* -------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------- */

type FixtureState = Pick<SportFixture, "status" | "statusNote">;

/** A team fixture's statuses are lower case; a race's are capitalised. */
const fixtureStates: Record<string, FixtureState> = {
  upcoming: { status: "scheduled" },
  live: { status: "live" },
  ongoing: { status: "live" },
  result: { status: "finished" },
  finished: { status: "finished" },
  unresolved: { status: "finished" },
  canceled: { status: "finished", statusNote: "Cancelled" },
  cancelled: { status: "finished", statusNote: "Cancelled" },
  abandoned: { status: "finished", statusNote: "Abandoned" },
  no_result: { status: "finished", statusNote: "No result" },
  postponed: { status: "finished", statusNote: "Postponed" },
  suspended: { status: "finished", statusNote: "Suspended" },
};

/** Whether a start time is still ahead of now. An unreadable time is not. */
function isAhead(startTime: string | undefined): boolean {
  const start = startTime ? Date.parse(startTime) : NaN;
  return Number.isFinite(start) && start > Date.now();
}

function stateOf(
  matchStatus: string | undefined,
  startTime: string | undefined,
): FixtureState {
  // A match that has not started is upcoming, whatever status it carries.
  if (isAhead(startTime)) return { status: "scheduled" };
  const key = String(matchStatus).toLowerCase();
  // A status this app has not seen is shown in the server's own words.
  return (
    fixtureStates[key] ?? { status: "finished", statusNote: statusText(key) }
  );
}

/**
 * Whether a live-score object's `home` or `away` names this team. The API does
 * not say what those two hold, so a name, an abbreviation and an id all count,
 * whether given directly or as a field of an object.
 */
function refersTo(reference: unknown, team: Team): boolean {
  const candidates: unknown[] =
    typeof reference === "object" && reference !== null
      ? ["id", "_id", "name", "displayName", "shortName", "abbreviation"].map(
          (field) => (reference as Record<string, unknown>)[field],
        )
      : [reference];
  const names = [team._id, team.name, team.displayName, team.abbreviation]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  return candidates.some(
    (candidate) =>
      typeof candidate === "string" &&
      names.includes(candidate.trim().toLowerCase()),
  );
}

/** Each team's score, with `teamA` first whichever side it is playing on. */
function scores(
  event: MatchEvent | null,
  teamA: Team,
  teamB: Team,
): [string | undefined, string | undefined] {
  if (!event) return [undefined, undefined];
  const home = text(event.homeTeamScore);
  const away = text(event.awayTeamScore);
  const teamAIsAway =
    refersTo(event.home, teamB) && !refersTo(event.home, teamA);
  return teamAIsAway ? [away, home] : [home, away];
}

export function toFixture(match: Matches): SportFixture | null {
  if (!match.teamA || !match.teamB) return null;
  const state = stateOf(match.matchStatus, match.matchStartTime);
  // The live-score object exists before kick-off too, with both scores at 0.
  const [homeScore, awayScore] =
    state.status === "scheduled"
      ? [undefined, undefined]
      : scores(match.matchEvent, match.teamA, match.teamB);
  return {
    id: match.matchId,
    href: matchHref(match.matchId),
    sport: toSport(match.gameType),
    leagueLabel: match.tournament,
    ...state,
    kickoff: match.matchStartTime,
    home: toTeam(match.teamA),
    away: toTeam(match.teamB),
    homeScore,
    awayScore,
    resultLine: text(match.matchEvent?.summary),
    volumeOz: "totalVolume" in match ? match.totalVolume : undefined,
    hasQuiz: Boolean(match.quizIds?.length),
    hasPick: Boolean(match.predictionIds?.length),
  };
}

/** A race has no teams, so its crest is the series it belongs to. */
function toRaceFixture(
  race: MotorSportMatches,
  tournament: Tournament | null,
): SportFixture {
  return {
    id: race.matchId,
    href: matchHref(race.matchId),
    sport: "racing",
    leagueLabel: race.tournament,
    ...stateOf(race.matchStatus, race.raceStartTime),
    kickoff: race.raceStartTime,
    home: {
      id: race.matchId,
      name: race.name,
      shortName: race.tournament,
      color: tournament?.primaryColor || CREST_FALLBACK,
      secondaryColor: tournament?.secondaryColor || undefined,
      badgeTextColor: tournament?.textColor || undefined,
    },
    resultLine: text(race.summary) ?? text(race.description),
    hasQuiz: false,
    hasPick: false,
  };
}

function isRace(
  match: Matches | MotorSportMatches,
): match is MotorSportMatches {
  return !("teamA" in match);
}

/** One day's sections, in the order the API sent them. */
export function toLeagueGroups(sections: TournamentSection[]): LeagueGroup[] {
  return sections
    .map((section) => ({
      id: section.tournament,
      shortCode: section.tournament,
      name: section.tournamentData?.tournamentName || section.tournament,
      accent: section.tournamentData?.primaryColor || undefined,
      fixtures: (section.matches ?? [])
        .map((match) =>
          isRace(match)
            ? toRaceFixture(match, section.tournamentData)
            : toFixture(match),
        )
        .filter((fixture) => fixture !== null),
    }))
    .filter((group) => group.fixtures.length > 0);
}

export function countFixtures(groups: LeagueGroup[]): {
  total: number;
  live: number;
} {
  const fixtures = groups.flatMap((group) => group.fixtures);
  return {
    total: fixtures.length,
    live: fixtures.filter((fixture) => fixture.status === "live").length,
  };
}

/* -------------------------------------------------------------------------
 * Sports lists
 * ---------------------------------------------------------------------- */

/** The hub's tabs, in the API's order. An entry the app has no feed for is left out. */
export function toSportTabs(items: MatchSportsType[]): SportHubSelection[] {
  return items
    .map((item) => item.gameType.toLowerCase())
    .filter(isSportHubSelection);
}

export function isSportHubSelection(
  value: unknown,
): value is SportHubSelection {
  return value === "trending" || isSport(value);
}
