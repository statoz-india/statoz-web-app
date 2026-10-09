// Single source of truth for every image in /public.
// Always reference images through IMAGES; never hardcode "/assets/..." paths.

export const IMAGES = {
  icons: {
    appLogo: "/assets/icons/app_logo.png",
    coin: "/assets/icons/coin.svg",
    game: "/assets/icons/game.svg",
    match: "/assets/icons/match.svg",
    ozCoins: "/assets/icons/oz_coins.svg",
    pick: "/assets/icons/pick.svg",
    streak: "/assets/icons/streak.svg",
  },

  games: {
    bingo: "/assets/games/bingo.svg",
    finalOver: "/assets/games/final-over.svg",
    footballChess: "/assets/games/football-chess.svg",
    grandPrixDash: "/assets/games/grand-prix-dash.svg",
    guessDriver: "/assets/games/guess-driver.svg",
    guessPlayer: "/assets/games/guess-player.svg",
    guessWinner: "/assets/games/guess-winner.svg",
    homeStadium: "/assets/games/home-stadium.png",
    hoopArena: "/assets/games/hoop-arena.jpg",
    hoopDuel: "/assets/games/hoop-duel.svg",
    matchStadium: "/assets/games/match-stadium.png",
    penaltyShootout: "/assets/games/penalty-shootout.svg",
    pitchDuel: "/assets/games/pitch-duel.svg",
    quiz: "/assets/games/quiz.svg",
    tennisRally: "/assets/games/tennis-rally.svg",
  },

  backgrounds: {
    onboarding: {
      desktopPoster: "/assets/backgrounds/onboarding/desktop-poster.webp",
      mobilePoster: "/assets/backgrounds/onboarding/mobile-poster.webp",
    },

    // Keys match the file names (prediction type codes), so a prediction's
    // type can be used to look up its background directly.
    predictions: {
      both_teams_to_score: "/assets/backgrounds/predictions/both_teams_to_score.webp",
      default: "/assets/backgrounds/predictions/default.webp",
      first_goal_before_30: "/assets/backgrounds/predictions/first_goal_before_30.webp",
      first_goal_team_mcq: "/assets/backgrounds/predictions/first_goal_team_mcq.webp",
      first_scorer_wins: "/assets/backgrounds/predictions/first_scorer_wins.webp",
      halftime_leader_mcq: "/assets/backgrounds/predictions/halftime_leader_mcq.webp",
      halftime_leader_wins: "/assets/backgrounds/predictions/halftime_leader_wins.webp",
      match_ends_in_draw: "/assets/backgrounds/predictions/match_ends_in_draw.webp",
      match_has_red_card: "/assets/backgrounds/predictions/match_has_red_card.webp",
      match_over_4_yellow_cards: "/assets/backgrounds/predictions/match_over_4_yellow_cards.webp",
      match_over_8_corners: "/assets/backgrounds/predictions/match_over_8_corners.webp",
      match_result_mcq: "/assets/backgrounds/predictions/match_result_mcq.webp",
      penalty_arena: "/assets/backgrounds/predictions/penalty_arena.png",
      team_clean_sheet: "/assets/backgrounds/predictions/team_clean_sheet.webp",
      team_five_plus_shots_on_target: "/assets/backgrounds/predictions/team_five_plus_shots_on_target.webp",
      team_gets_red_card: "/assets/backgrounds/predictions/team_gets_red_card.webp",
      team_goals_range_mcq: "/assets/backgrounds/predictions/team_goals_range_mcq.webp",
      team_possession_over_60: "/assets/backgrounds/predictions/team_possession_over_60.webp",
      team_shots_range_mcq: "/assets/backgrounds/predictions/team_shots_range_mcq.webp",
      team_ten_plus_fouls: "/assets/backgrounds/predictions/team_ten_plus_fouls.webp",
      team_wins_match: "/assets/backgrounds/predictions/team_wins_match.webp",
      total_goals_range_mcq: "/assets/backgrounds/predictions/total_goals_range_mcq.webp",
      total_yellow_cards_range_mcq: "/assets/backgrounds/predictions/total_yellow_cards_range_mcq.webp",
    },
  },

  shop: {
    coins: {
      starter: "/assets/shop/coins/starter.png",
      rookie: "/assets/shop/coins/rookie.png",
      pro: "/assets/shop/coins/pro.png",
      elite: "/assets/shop/coins/elite.png",
      champion: "/assets/shop/coins/champion.png",
      legendary: "/assets/shop/coins/legendary.png",
    },
    packs: {
      starter: "/assets/shop/packs/starter.png",
      bronze: "/assets/shop/packs/bronze.png",
      silver: "/assets/shop/packs/silver.png",
      gold: "/assets/shop/packs/gold.png",
      platinum: "/assets/shop/packs/platinum.png",
      elite: "/assets/shop/packs/elite.png",
    },
  },
} as const;

export type PredictionBackgroundType = keyof typeof IMAGES.backgrounds.predictions;

// Falls back to the default background for prediction types without their own image.
export function getPredictionBackground(type: string): string {
  const backgrounds = IMAGES.backgrounds.predictions;
  return Object.hasOwn(backgrounds, type)
    ? backgrounds[type as PredictionBackgroundType]
    : backgrounds.default;
}
