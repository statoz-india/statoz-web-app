import { isSport, type Sport } from "@/config/sports";
import type {
  Event as PickEvent,
  Future,
  Game,
  GameSection,
  Matches,
  MatchEvent,
  MotorSportMatches,
  Prediction,
  Quiz,
  SportTab,
  Team,
  Tournament,
  TrendingItem,
  TrendingMatch,
} from "@/core";

import { presentationFor } from "./game-registry";
import type {
  GameTile,
  LeagueGroup,
  MarketOutcome,
  PickMarket,
  PredictMission,
  SportFixture,
  SportTeam,
  TrendingTile,
} from "./types";
import { TournamentSection } from "@/core/domain/types/game-types";

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
  matchStatus: string,
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

export function toFixture(match: Matches | TrendingMatch): SportFixture | null {
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
 * Trending
 * ---------------------------------------------------------------------- */

/** A market that is taking entries says so; any other state names itself. */
function marketStatus(status: string, settled: boolean): string {
  if (settled) return "SETTLED";
  return status.toUpperCase() === "ACTIVE" ? "MARKET OPEN" : statusText(status);
}

function toMission(quiz: Quiz): PredictMission | null {
  if (!quiz.teamA || !quiz.teamB) return null;
  return {
    id: quiz._id,
    href: matchHref(quiz.matchId),
    sport: toSport(quiz.gameType),
    leagueLabel: quiz.tournament,
    home: toTeam(quiz.teamA),
    away: toTeam(quiz.teamB),
    statusLabel: statusText(quiz.quizStatus),
  };
}

/** The result market on a fixture: either side, and the draw in football. */
function predictionMarket(prediction: Prediction): PickMarket | null {
  if (!prediction.teamA || !prediction.teamB) return null;
  const home = toTeam(prediction.teamA);
  const away = toTeam(prediction.teamB);
  const outcomes: MarketOutcome[] = [
    { id: "a", label: home.name, probabilityPercent: prediction.oddsTeamA },
    { id: "b", label: away.name, probabilityPercent: prediction.oddsTeamB },
  ];
  if (prediction.oddsDraw != null) {
    outcomes.splice(1, 0, {
      id: "draw",
      label: "Draw",
      probabilityPercent: prediction.oddsDraw,
    });
  }
  return {
    id: prediction.predictionId,
    href: `/picks/${encodeURIComponent(prediction.predictionId)}`,
    sport: toSport(prediction.gameType),
    leagueLabel: prediction.tournamentData?.tournament || prediction.tournament,
    question: `${home.name} vs ${away.name}`,
    outcomes,
    volumeOz: prediction.totalCoins,
    statusLabel: marketStatus(
      prediction.predictionStatus,
      prediction.winningTeam != null || prediction.winningTeamId != null,
    ),
  };
}

/** A yes/no market. The third option exists only when the event has three. */
function eventMarket(event: PickEvent): PickMarket {
  const outcomes: MarketOutcome[] = [
    { id: "Y", label: event.yesPlaceholder, probabilityPercent: event.oddsYes },
    { id: "N", label: event.noPlaceholder, probabilityPercent: event.oddsNo },
  ];
  if (event.haveThreeOptions && event.oddsMaybe != null) {
    outcomes.push({
      id: "M",
      label: event.maybePlaceholder ?? "Maybe",
      probabilityPercent: event.oddsMaybe,
    });
  }
  return {
    id: event.eventId,
    href: `/picks/${encodeURIComponent(event.eventId)}`,
    // An event carries no sport of its own, only whether it is a race's.
    sport: event.isRacingMatchEvent ? "racing" : undefined,
    leagueLabel: event.tournamentData?.tournament ?? "",
    question: event.eventName,
    outcomes,
    volumeOz: event.totalCoins,
    statusLabel: marketStatus(event.eventStatus, event.winningOption != null),
  };
}

function futureMarket(future: Future): PickMarket {
  return {
    id: future.futureId,
    href: `/picks/${encodeURIComponent(future.futureId)}`,
    leagueLabel: future.tournamentData?.tournament ?? "",
    question: future.eventName,
    // Already sorted by odds, highest first. Hidden choices must not show.
    outcomes: (future.choices ?? [])
      .filter((choice) => choice.isVisible !== false)
      .map((choice) => ({
        id: choice._id,
        label: choice.choiceName,
        probabilityPercent: choice.odds,
      })),
    volumeOz: future.totalCoinsPlaced,
    statusLabel: marketStatus(
      future.futureStatus,
      future.correctChoice != null,
    ),
  };
}

/** A future with a field of choices takes a tall tile and lists the leaders. */
const OUTCOME_BOARD_MINIMUM = 3;

function toTrendingTile(item: TrendingItem): TrendingTile | null {
  switch (item.type) {
    case "match": {
      const fixture = toFixture(item.data);
      return fixture && { id: item._id, kind: "match", span: "wide", fixture };
    }
    case "quiz": {
      const mission = toMission(item.data);
      return (
        mission && { id: item._id, kind: "predict", span: "square", mission }
      );
    }
    case "prediction": {
      const market = predictionMarket(item.data);
      return market && { id: item._id, kind: "pick", span: "square", market };
    }
    case "event":
      return {
        id: item._id,
        kind: "pick",
        span: "square",
        market: eventMarket(item.data),
      };
    case "future": {
      const market = futureMarket(item.data);
      return {
        id: item._id,
        kind: "future",
        span:
          market.outcomes.length >= OUTCOME_BOARD_MINIMUM ? "tall" : "square",
        market,
      };
    }
    default:
      // A type added to the API after this was written.
      return null;
  }
}

/** The trending list, in the order the API sent it. */
export function toTrendingTiles(items: TrendingItem[]): TrendingTile[] {
  return items
    .map((item) => (item.data ? toTrendingTile(item) : null))
    .filter((tile) => tile !== null);
}

/* -------------------------------------------------------------------------
 * Games and sports lists
 * ---------------------------------------------------------------------- */

function toGameTile(game: Game): GameTile {
  const sport = toSport(game.gameType);
  const presentation = presentationFor(game.key, sport);
  return {
    id: game._id,
    kind: game.isQuickPlay ? "quick" : "hero",
    title: game.title,
    subtitle: game.subtitle,
    sport,
    accent: presentation.accent,
    scene: presentation.scene,
    badgeLabel: presentation.badgeLabel,
    ctaLabel: presentation.ctaLabel ?? "PLAY NOW",
    glow: presentation.glow,
    href: presentation.href,
    playable: game.isLive,
    offlineLabel: game.message?.trim() || "COMING SOON",
  };
}

/**
 * Every game in the response, section after section. A game listed under more
 * than one section is shown once, where it first appears.
 */
export function toGameTiles(sections: GameSection[]): GameTile[] {
  const games = new Map<string, Game>();
  for (const game of sections.flatMap((section) => section.games ?? [])) {
    if (!games.has(game._id)) games.set(game._id, game);
  }
  return [...games.values()].map(toGameTile);
}

/** Each sport's games, already in the order its deck lists them. */
export function toGameDecks(
  sections: GameSection[],
): Partial<Record<Sport, GameTile[]>> {
  const decks: Partial<Record<Sport, GameTile[]>> = {};
  for (const section of sections) {
    const sport = toSport(section.gameType);
    if (sport) decks[sport] = (section.games ?? []).map(toGameTile);
  }
  return decks;
}

/** Whether a sports list offers the Trending destination. */
export function hasTrending(tabs: SportTab[]): boolean {
  return tabs.some((tab) => tab.gameType?.toLowerCase() === "trending");
}

/** The sports in a sports list that this app can show, in the API's order. */
export function toSports(tabs: SportTab[]): Sport[] {
  return tabs
    .map((tab) => toSport(tab.gameType))
    .filter((sport) => sport !== undefined);
}
