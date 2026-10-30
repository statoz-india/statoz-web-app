import type { Sport } from "@/config/sports";
import { BentoSpan } from "@/lib/components/bento-grid";

/**
 * What the sports hub draws. The API's responses are turned into these in
 * `adapters.ts`, so a component never reads a response shape directly.
 */

/** A tab in the sport strip: the Trending feed, or one sport's fixtures. */
export type SportHubSelection = Sport | "trending";

/** A crest is drawn from these alone. The colours are the team's own data. */
export type SportTeam = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** The stripe along the bottom of the crest. */
  secondaryColor?: string;
  badgeTextColor?: string;
};

export type FixtureStatus = "scheduled" | "live" | "finished";

export type SportFixture = {
  id: string;
  href: string;
  /** Missing when the API names a sport this app does not know. */
  sport?: Sport;
  /** Short competition code shown on tiles, for example "IPL". */
  leagueLabel: string;
  status: FixtureStatus;
  /** How a fixture ended when it was not played out, for example "Postponed". */
  statusNote?: string;
  /** ISO timestamp. A race without a session time yet has none. */
  kickoff?: string;
  /** On a race, the race itself. */
  home: SportTeam;
  /** Missing on a race. */
  away?: SportTeam;
  /** Display-ready. Cricket innings include wickets and overs. */
  homeScore?: string;
  awayScore?: string;
  /** The line under the teams: a result, or a race's venue. */
  resultLine?: string;
  /** Coins on this fixture's markets. The trending list does not carry it. */
  volumeOz?: number;
  /** Whether the fixture has a prediction quiz, and a market to pick in. */
  hasQuiz: boolean;
  hasPick: boolean;
};

/** One competition's fixtures on a day, in start order. */
export type LeagueGroup = {
  id: string;
  shortCode: string;
  name: string;
  /** The competition's own colour, when the API has its record. */
  accent?: string;
  fixtures: SportFixture[];
};

/** A prediction quiz on a fixture. */
export type PredictMission = {
  id: string;
  href: string;
  sport?: Sport;
  leagueLabel: string;
  home: SportTeam;
  away: SportTeam;
  statusLabel: string;
};

export type MarketOutcome = {
  id: string;
  label: string;
  /** Implied probability, 0 to 100. */
  probabilityPercent: number;
};

export type PickMarket = {
  id: string;
  href: string;
  /** Only known when the market belongs to a fixture or a race. */
  sport?: Sport;
  leagueLabel: string;
  question: string;
  /** Only the outcomes that may be shown. */
  outcomes: MarketOutcome[];
  volumeOz: number;
  /** MARKET OPEN, SETTLED, or the market's own status. */
  statusLabel: string;
};

/** One tile of the MATCH trending grid. */
export type TrendingTile =
  | { id: string; kind: "match"; span: BentoSpan; fixture: SportFixture }
  | { id: string; kind: "predict"; span: BentoSpan; mission: PredictMission }
  | {
      id: string;
      /** `future` is a long-range outright; `pick` is a near-term call. */
      kind: "pick" | "future";
      span: BentoSpan;
      market: PickMarket;
    };
