import { GameType } from "@/lib/types/game-types";

/**
 * Every sport StatOz covers. The ids are the API's `gameType` values, so a
 * sport can be sent to an endpoint and read back from a response as it is.
 */
export type Sport = Exclude<GameType, "trending">;

/** The sports with fixtures. Tennis has games only. */
export type MatchSport = Exclude<Sport, "tennis">;

/** Design-system accent token name a sport is identified by. */
export type SportAccent = "white" | "cyan" | "lime" | "gold" | "racing";

export type SportModule = {
  sport: Sport;
  label: string;
  /** Four-or-so character code used where space is tight. */
  shortLabel: string;
  accent: SportAccent;
};

export const sportModules: Record<Sport, SportModule> = {
  football: {
    sport: "football",
    label: "Football",
    shortLabel: "FTBL",
    accent: "cyan",
  },
  cricket: {
    sport: "cricket",
    label: "Cricket",
    shortLabel: "CRKT",
    accent: "white",
  },
  basketball: {
    sport: "basketball",
    label: "Basketball",
    shortLabel: "BALL",
    accent: "gold",
  },
  tennis: {
    sport: "tennis",
    label: "Tennis",
    shortLabel: "TENNIS",
    accent: "lime",
  },
  racing: {
    sport: "racing",
    label: "Motorsport",
    shortLabel: "MOTOR",
    accent: "racing",
  },
};

/** Browse order for the sport strip and the all-sports selector. */
export const sportOrder: Sport[] = [
  "football",
  "cricket",
  "basketball",
  "tennis",
  "racing",
];

/** The sports the MATCH tab offers until the API's own list has loaded. */
export const matchSports: MatchSport[] = [
  "football",
  "cricket",
  "basketball",
  "racing",
];

export function sportModuleFor(sport: Sport): SportModule {
  return sportModules[sport];
}

/** Narrows a value from a URL or a response to a sport this app knows. */
export function isSport(value: unknown): value is Sport {
  return typeof value === "string" && Object.hasOwn(sportModules, value);
}

export function isMatchSport(value: unknown): value is MatchSport {
  return isSport(value) && value !== "tennis";
}
