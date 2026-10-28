import { sportModuleFor, type Sport } from "@/config/sports";
import type { AccentName } from "@/styles";

import type { GameSceneId } from "./types";

/**
 * How a game is dressed: its colour, illustration, labels and destination.
 * The API sends a game's title, subtitle and sport; nothing here is data.
 */
export type GamePresentation = {
  accent: AccentName;
  scene?: GameSceneId;
  badgeLabel?: string;
  ctaLabel?: string;
  glow?: boolean;
  href: string;
};

/** The games this app has artwork for, by the API's `key`. */
const knownGames: Record<string, GamePresentation> = {
  /* ---- football ------------------------------------------------------- */
  "pitch-duel": {
    accent: "cyan",
    scene: "pitch-duel",
    badgeLabel: "FEATURED // TACTICAL",
    ctaLabel: "ENTER THE DUEL",
    glow: true,
    href: "/play/pitch-duel",
  },
  "penalty-shootout": {
    accent: sportModuleFor("football").accent,
    scene: "penalty-shootout",
    badgeLabel: "SUDDEN DEATH",
    ctaLabel: "TAKE THE SHOT",
    href: "/play/penalty-shootout",
  },
  "football-chess": {
    accent: sportModuleFor("football").accent,
    scene: "football-chess",
    badgeLabel: "FEATURED // 5V5",
    ctaLabel: "MAKE YOUR MOVE",
    href: "/play/football-chess",
  },
  "football-quiz": {
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/football",
  },
  // Orange keeps it distinct from the cyan football games it sits beside.
  "football-bingo": {
    accent: "orange",
    scene: "bingo",
    href: "/play/football-bingo",
  },
  // Pink is the family colour every mystery game uses.
  "guess-player": {
    accent: "pink",
    scene: "guess-player",
    href: "/play/guess-player",
  },

  /* ---- cricket -------------------------------------------------------- */
  "final-over": {
    accent: sportModuleFor("cricket").accent,
    scene: "final-over",
    badgeLabel: "FEATURED // THREE OVERS",
    ctaLabel: "START THE CHASE",
    href: "/play/final-over",
  },
  "cricket-quiz": {
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/cricket",
  },
  "cricket-guess-player": {
    accent: "pink",
    scene: "guess-player",
    href: "/play/guess-player/cricket",
  },

  /* ---- basketball ----------------------------------------------------- */
  "hoop-duel": {
    accent: "gold",
    scene: "hoop-duel",
    badgeLabel: "FEATURED // STREET",
    ctaLabel: "HIT THE COURT",
    href: "/play/basketball",
  },
  "basketball-quiz": {
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/basketball",
  },
  "basketball-guess-player": {
    accent: "pink",
    scene: "guess-player",
    href: "/play/guess-player/basketball",
  },

  /* ---- tennis --------------------------------------------------------- */
  "tennis-rally": {
    accent: "lime",
    scene: "tennis-rally",
    badgeLabel: "FEATURED // NEW",
    ctaLabel: "STEP ON COURT",
    href: "/play/tennis",
  },
  "tennis-quiz": {
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/tennis",
  },
  "tennis-guess-winner": {
    accent: "cyan",
    scene: "guess-winner",
    href: "/play/guess-winner",
  },

  /* ---- motorsport ----------------------------------------------------- */
  "grand-prix-dash": {
    accent: "racing",
    scene: "grand-prix-dash",
    badgeLabel: "FEATURED // RACE",
    ctaLabel: "RACE NOW",
    href: "/play/grand-prix",
  },
  "motorsport-quiz": {
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/motorsport",
  },
  "guess-driver": {
    accent: "pink",
    scene: "guess-driver",
    href: "/play/guess-driver",
  },
};

/** The formats that repeat across sports, recognised by a word in the key. */
const formats: Array<{ match: RegExp; scene: GameSceneId; accent: AccentName }> =
  [
    { match: /quiz/, scene: "quiz", accent: "violet" },
    { match: /bingo/, scene: "bingo", accent: "orange" },
    { match: /guess.*driver/, scene: "guess-driver", accent: "pink" },
    { match: /guess.*winner/, scene: "guess-winner", accent: "cyan" },
    { match: /guess/, scene: "guess-player", accent: "pink" },
  ];

/**
 * A known game gets its own look. Any other one still gets a tile: the shared
 * artwork of its format if the key names one, and its sport's colour if not.
 */
export function presentationFor(key: string, sport?: Sport): GamePresentation {
  const normalized = key.trim().toLowerCase();
  const known = knownGames[normalized];
  if (known) return known;

  const format = formats.find((candidate) => candidate.match.test(normalized));
  return {
    accent: format?.accent ?? (sport ? sportModuleFor(sport).accent : "cyan"),
    scene: format?.scene,
    href: `/play/${encodeURIComponent(normalized)}`,
  };
}
