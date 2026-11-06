import type { ComponentType } from "react";

import {
  BasketballIcon,
  BoltIcon,
  EditIcon,
  FlameIcon,
  FlashOnIcon,
  FootballIcon,
  FormatListNumberedIcon,
  GridOnIcon,
  GridViewIcon,
  GroupsIcon,
  HeartIcon,
  HistoryIcon,
  InsightsIcon,
  MedalIcon,
  MyLocationIcon,
  PaidIcon,
  PremiumIcon,
  QuizIcon,
  ScheduleIcon,
  SellIcon,
  ShieldIcon,
  ShowChartIcon,
  StyleIcon,
  SwapHorizIcon,
  SyncAltIcon,
  TimerIcon,
  TrendingUpIcon,
  TrophyIcon,
  TuneIcon,
  WarningIcon,
  type IconProps,
} from "@/lib/icons";

type Icon = ComponentType<IconProps>;

export type Guide = {
  /** The URL segment: `/profile/how-to-play/<id>`. */
  id: string;
  title: string;
  tagline: string;
  subtitle: string;
  purpose: string;
  /** CSS colour the page is drawn in. */
  accent: string;
  icon: Icon;
  overview: { label: string; sub: string; icon: Icon; accent: string }[];
  steps: { title: string; body: string }[];
  facts: { label: string; body: string; icon: Icon }[];
};

const CYAN = "var(--ds-color-accent-cyan)";
const LIME = "var(--ds-color-accent-lime)";
const VIOLET = "var(--ds-color-accent-violet)";
const ORANGE = "var(--ds-color-accent-orange)";
const GOLD = "var(--ds-color-accent-gold)";
const RED = "var(--ds-color-danger)";

const XP_ONLY = {
  label: "XP Only",
  body: "This mode rewards XP for progression. Coins stay in the shop.",
  icon: PremiumIcon,
};

/** Every game mode's guide, in hub order. */
export const GUIDES: Guide[] = [
  {
    id: "predict",
    title: "PREDICT",
    tagline: "Answer the match quiz, earn XP",
    subtitle: "// MATCH QUIZ · XP ONLY",
    purpose:
      "Study a real fixture, answer a short quiz before kickoff, and earn XP when the match settles.",
    accent: CYAN,
    icon: QuizIcon,
    overview: [
      { label: "ONE AT A TIME", sub: "question per page", icon: StyleIcon, accent: CYAN },
      { label: "BOOSTERS", sub: "2× and 1.5×", icon: BoltIcon, accent: ORANGE },
      { label: "XP ONLY", sub: "never coins", icon: MedalIcon, accent: VIOLET },
    ],
    steps: [
      { title: "Open Matches", body: "Fixtures are grouped by league. Tap a predictable upcoming match to start its quiz." },
      { title: "Answer the quiz", body: "One question per page — exact score or multiple choice. NEXT unlocks once you answer the current question." },
      { title: "Boost your best calls", body: "Place one 2× and one 1.5× booster on answered questions to multiply their XP. Move or remove them until predictions lock." },
      { title: "Lock at kickoff", body: "Answers stay editable until the match starts, then the screen turns read-only and shows crowd vote results." },
      { title: "Reveal the results", body: "When the match finishes, tap REVEAL RESULTS for the settlement cinematic. Correct answers credit XP to your progression." },
    ],
    facts: [
      { label: "XP, never coins", body: "Predictions only ever pay XP into your shared level track.", icon: MedalIcon },
      { label: "Edit until kickoff", body: "Re-open a prediction any time before the match starts to change answers.", icon: EditIcon },
      { label: "Review, not replay", body: "A match you already predicted opens as a review list, not a fresh quiz.", icon: HistoryIcon },
    ],
  },
  {
    id: "pick",
    title: "PICK",
    tagline: "Take a position on outcome markets",
    subtitle: "// OUTCOME MARKETS · OZ COINS",
    purpose:
      "Browse outcome markets, choose a price, and confirm an Oz Coin amount on your call.",
    accent: LIME,
    icon: ShowChartIcon,
    overview: [
      { label: "FILTERS", sub: "sport + market", icon: TuneIcon, accent: LIME },
      { label: "PRICED", sub: "per outcome", icon: SellIcon, accent: CYAN },
      { label: "OZ COINS", sub: "your stake", icon: PaidIcon, accent: GOLD },
    ],
    steps: [
      { title: "Browse markets", body: "Filter by sport (IPL, EPL, NBA…) and by market type — All Picks, Matches, Event, or Futures." },
      { title: "Read the card", body: "Each market shows the league, the question, close time, volume, and a price for every outcome." },
      { title: "Tap an outcome price", body: "A confirmation sheet opens with your pick, its price, and your available balance." },
      { title: "Set your amount", body: "Adjust the stake in price-step increments — it always stays inside your balance." },
      { title: "Confirm the pick", body: "Lock it in. A short success message confirms your position." },
    ],
    facts: [
      { label: "Match market", body: "Pick the result of a live or upcoming match.", icon: FootballIcon },
      { label: "Binary event", body: "A yes/no question — qualification, a player playing, and so on.", icon: QuizIcon },
      { label: "Futures", body: "A longer-range outcome with several possible winners.", icon: TrendingUpIcon },
    ],
  },
  {
    id: "pitch-duel",
    title: "PITCH DUEL",
    tagline: "Tactical 4-round card duel",
    subtitle: "// TACTICAL 4-ROUND DUEL",
    purpose:
      "Turn your card collection into a four-round tactical match — outscore the CPU for XP and coins.",
    accent: VIOLET,
    icon: FootballIcon,
    overview: [
      { label: "4 ROUNDS", sub: "attack ×2 · defend ×2", icon: SyncAltIcon, accent: VIOLET },
      { label: "PLAYER + ACTION", sub: "each round", icon: StyleIcon, accent: CYAN },
      { label: "XP & COINS", sub: "on a win", icon: TrophyIcon, accent: GOLD },
    ],
    steps: [
      { title: "Build a legal deck", body: "2 attackers, 2 defenders, 1 goalkeeper, and 6 action cards." },
      { title: "Toss for role", body: "A coin flip sets who attacks first; roles alternate, so you attack twice and defend twice across the match." },
      { title: "Read the scenario", body: "Each round drops a football scenario — counter, set piece, box defense — that tilts the attack vs defense power." },
      { title: "Pick player + action", body: "Choose a role-appropriate player card and one action card for the round." },
      { title: "Strike the Shot Meter", body: "Tap to stop the sweeping marker. Perfect timing adds up to +20 power to your side." },
      { title: "Resolve and repeat", body: "The power gap becomes a goal, save, block, miss, foul, or red card. Highest score after 4 rounds wins." },
    ],
    facts: [
      { label: "Power formula", body: "Card rating + action power + scenario bonus + a 0–20 swing.", icon: InsightsIcon },
      { label: "Risky actions", body: "Carry a 12% chance of a foul (attack) or a red card (defense).", icon: WarningIcon },
      { label: "Tied at full time", body: "A level match after 4 rounds goes to a penalty shootout.", icon: FootballIcon },
    ],
  },
  {
    id: "penalty-shootout",
    title: "PENALTY SHOOTOUT",
    tagline: "Sudden-death spot kicks",
    subtitle: "// SUDDEN-DEATH SPOT KICKS",
    purpose:
      "Your five-man lineup trades spot kicks with the CPU — outsmart the keeper to win.",
    accent: ORANGE,
    icon: MyLocationIcon,
    overview: [
      { label: "5 KICKS EACH", sub: "then sudden death", icon: FormatListNumberedIcon, accent: ORANGE },
      { label: "L · C · R", sub: "aim your shot", icon: SwapHorizIcon, accent: CYAN },
      { label: "RATINGS MATTER", sub: "tip each duel", icon: ShieldIcon, accent: LIME },
    ],
    steps: [
      { title: "Set your lineup", body: "Your five squad players line up in kick order — higher ratings convert their kicks more often." },
      { title: "Pick a direction", body: "Aim left, center, or right by tapping a goal zone. The keeper dives at the same moment." },
      { title: "Beat the keeper", body: "You score when your direction differs from the keeper's dive." },
      { title: "Trade kicks", body: "You and the CPU alternate kicks. Your keeper guards the net on the CPU's turn." },
      { title: "Sudden death", body: "Level after five kicks each? Sudden-death pairs decide it." },
    ],
    facts: [
      { label: "Ratings tip the duel", body: "A stronger kicker beats the keeper more reliably.", icon: ShieldIcon },
      { label: "Early finish", body: "The round can end as soon as one side can no longer catch up.", icon: FlashOnIcon },
      { label: "Standalone mode", body: "Played on its own from the Games tab — not tied to a card match.", icon: FootballIcon },
    ],
  },
  {
    id: "football-bingo",
    title: "BINGO GRID",
    tagline: "Match the player to the intersecting clubs",
    subtitle: "// DAILY 3X3 GRID",
    purpose:
      "Test your football knowledge by matching the active player to the correct intersecting clubs. Complete the daily 3x3 grid without running out of lives.",
    accent: ORANGE,
    icon: GridOnIcon,
    overview: [
      { label: "9 CELLS", sub: "3x3 daily puzzle", icon: GridViewIcon, accent: ORANGE },
      { label: "5 LIVES", sub: "don't tap wrong", icon: HeartIcon, accent: RED },
      { label: "DAILY", sub: "new grid tomorrow", icon: TimerIcon, accent: CYAN },
    ],
    steps: [
      { title: "Check the Active Player", body: "The panel shows a player. Your goal is to find the one cell they belong to." },
      { title: "Match the criteria", body: "Look at the row and column clubs. The active player must have played senior football for both. Correct picks unlock their route." },
      { title: "Tap to place", body: "Tap the intersecting cell. A correct guess locks the player in and gives you the next one." },
      { title: "Watch your lives", body: "You start with 5 lifelines. A wrong guess burns a life and shows a red error." },
      { title: "Buy a lifeline", body: "Run out of lives? You can buy an extra lifeline for 25 Oz Coins to keep playing." },
      { title: "Complete the grid", body: "Fill all 9 cells to finish the daily puzzle. Archives are view-only." },
    ],
    facts: [
      { label: "Daily Refresh", body: "A new grid unlocks every day.", icon: TimerIcon },
      { label: "Lifeline cost", body: "25 Oz Coins to revive.", icon: PaidIcon },
      { label: "Archive mode", body: "Past grids can be viewed but not played.", icon: HistoryIcon },
    ],
  },
  {
    id: "football-chess",
    title: "FOOTBALL CHESS",
    tagline: "Tactical 5v5 Grid Duel",
    subtitle: "// TURN-BASED MATCH",
    purpose:
      "Chess on a pitch. Take turns to move, pass, dribble, or shoot. Defend using press, tackle, or slide to win back possession and score from the opponent's half.",
    accent: CYAN,
    icon: GridViewIcon,
    overview: [
      { label: "3X4 GRID", sub: "tight tactical pitch", icon: GridOnIcon, accent: CYAN },
      { label: "5V5 SQUAD", sub: "4 outfield + 1 keeper", icon: GroupsIcon, accent: LIME },
      { label: "COOLDOWNS", sub: "manage your tackles", icon: TimerIcon, accent: ORANGE },
    ],
    steps: [
      { title: "Move & Pass", body: "Move a player 1 square in any direction. Pass the ball in a clear straight line to a teammate. Keepers can pass to anyone!" },
      { title: "Dribble", body: "Have the ball? Dribble into an adjacent opponent to beat them and keep possession." },
      { title: "Press & Tackle", body: "Press to move a defender closer to the ball carrier from range. Tackle an adjacent carrier to win the ball back cleanly." },
      { title: "Slide Tackle", body: "Higher chance to win the ball, but risks a foul or a card! Missed slides have a longer cooldown." },
      { title: "Shoot to Score", body: "Once in the opponent's half, you can shoot! Your player's attack is matched against the enemy goalkeeper's defense." },
    ],
    facts: [XP_ONLY],
  },
  {
    id: "hoop-duel",
    title: "HOOP DUEL",
    tagline: "Street 1-on-1 arcade basketball",
    subtitle: "// REAL-TIME DUEL · XP ONLY",
    purpose:
      "Two 45-second halves of half-court 1-on-1. Move with the arrows, and one contextual ACTION pad does everything else — shots, fakes, steals and blocks — depending on where you are and what's happening.",
    accent: GOLD,
    icon: BasketballIcon,
    overview: [
      { label: "2 HALVES", sub: "45s + halftime sub", icon: TimerIcon, accent: GOLD },
      { label: "12s CLOCK", sub: "shoot before it dies", icon: ScheduleIcon, accent: RED },
      { label: "HEAT", sub: "fill it to ignite", icon: FlameIcon, accent: ORANGE },
    ],
    steps: [
      { title: "Move & Drive", body: "Hold ◀ ▶ to move. Double-tap a direction to burst-drive at the rim; double-tap again mid-drive to spin. Quick direction flips are crossovers — they shake defenders but expose the ball for a beat." },
      { title: "Shoot on the meter", body: "Hold ACTION to rise, release at the green band for a PERFECT shot. Feet beyond the arc line = 3 points. Tired legs shrink the perfect window." },
      { title: "Finish inside", body: "Tap ACTION on the move near the rim for a layup. Hold it through a burst-drive for a dunk — dunks always slam home unless a big body meets you up there." },
      { title: "Create space", body: "Tap while standing to pump fake — a defender who bites is left staggering. Swipe the pad away from the rim for a step-back jumper." },
      { title: "Defend with timing", body: "Hold ACTION near the handler for a defensive stance, tap to jab a steal at exposed dribbles, and hold-release as the shooter rises to leap for the block. Whiffed lunges leave you beat." },
      { title: "Crash the boards", body: "Misses are live — track the drop marker and tap ACTION to leap for the rebound. An offensive board opens a quick put-back window; there is no clear-the-ball step." },
    ],
    facts: [
      { label: "Heat", body: "Baskets, defensive stops and offensive boards build heat. Fill the meter — or score 6 unanswered points — for 15 seconds of faster movement, a wider perfect window, steadier stamina and a shot boost. An opponent score ends it.", icon: FlameIcon },
      { label: "Roster of 3", body: "Pick three athletes; one plays at a time. The bench rests to full — sub fresh legs at halftime.", icon: GroupsIcon },
      XP_ONLY,
    ],
  },
];

export function guideFor(id: string): Guide | undefined {
  return GUIDES.find((guide) => guide.id === id);
}
