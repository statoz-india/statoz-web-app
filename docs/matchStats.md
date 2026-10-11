# Match stats for football, cricket, basketball and Formula 1

This guide rebuilds StatOz's match report, the content of the STATS tab on a match page, in another Next.js App Router project. It covers the four sports that have a report of their own: football, cricket, basketball and Formula 1.

It is one file and it stands alone. Each sport is shown with the one StatOz fixture that carries recorded match data:

| Sport      | Fixture                                      | Address in this guide                     |
| ---------- | -------------------------------------------- | ----------------------------------------- |
| Football   | Fulham 2 - 3 Chelsea                         | `/stats/401879318`                        |
| Cricket    | Royal Challengers Bengaluru v Gujarat Titans | `/stats/1535465`                          |
| Basketball | San Antonio Spurs 90 - 94 New York Knicks    | `/stats/basketball-revamp-20260614-ny-sa` |
| Formula 1  | Italian Grand Prix                           | `/stats/600057442`                        |

In StatOz the report is one tab of the match page at `/matches/{id}`. Here it gets a small page of its own, with the fixture header above it, so it can be built and checked without the other tabs. To put it inside a full match page later, see [Using the report elsewhere](#using-the-report-elsewhere).

Every source file is in this guide. Seven files cannot be pasted as text and must be copied from StatOz: four data files, two fonts and one circuit drawing ([step 9](#step-9-the-page-and-the-files-to-copy)).

**Checked on 11 October 2026.** The files in this guide were assembled into a standalone app on Next.js 16.3.2, React 19.2.8 and Tailwind CSS 4.3.3. It type-checks and builds. Every section of every report was then compared with the STATS tab in StatOz, element by element: position, size, text, colours, font, borders and shadows. That is 16 sections at three widths, 48 views, and all 48 were identical. At 390 and 820 pixels the two were compared as they are. At 1280 pixels this guide's column was first set to the width StatOz gives the report (603 pixels), because the two pages lay out differently around it. Only the first view of each section was compared for cricket, basketball and Formula 1; their filters and tap actions were not exercised.

## Contents

1. [What you are building](#what-you-are-building)
2. [What each report shows](#what-each-report-shows)
3. [Links that leave the page](#links-that-leave-the-page)
4. [Requirements](#requirements)
5. [How to use this guide](#how-to-use-this-guide)
6. [Step 1: styles](#step-1-styles)
7. [Step 2: shared helpers](#step-2-shared-helpers)
8. [Step 3: design-system pieces](#step-3-design-system-pieces)
9. [Step 4: data types](#step-4-data-types)
10. [Step 5: the match data](#step-5-the-match-data)
11. [Step 6: pieces every report shares](#step-6-pieces-every-report-shares)
12. [Step 7: the four reports](#step-7-the-four-reports)
13. [Step 8: the fixture header](#step-8-the-fixture-header)
14. [Step 9: the page and the files to copy](#step-9-the-page-and-the-files-to-copy)
15. [Using the report elsewhere](#using-the-report-elsewhere)
16. [Connecting real data](#connecting-real-data)
17. [What differs from StatOz](#what-differs-from-statoz)
18. [Quirks carried over unchanged](#quirks-carried-over-unchanged)
19. [Checklist](#checklist)

## What you are building

```
┌──────────────────────────────┐
│              FT              │  fixture header
│ FUL Fulham  2 - 3  Chel CHE  │
├──────────────────────────────┤
│ OVERVIEW MOMENTUM LINEUPS .. │  section chips, different for each sport
├──────────────────────────────┤
│                              │
│   the selected section       │
│                              │
└──────────────────────────────┘
```

One component draws the report: `<MatchScoreboard match={match} scoreboard={detail.scoreboard} />`. It picks a view by sport.

| Sport      | View                  | Sections                                |
| ---------- | --------------------- | --------------------------------------- |
| Football   | `FootballStatsView`   | OVERVIEW, MOMENTUM, LINEUPS, COMMENTARY |
| Cricket    | `CricketStatsView`    | OVERVIEW, RACE, SCORECARD, MATCH FEED   |
| Basketball | `BasketballStatsView` | OVERVIEW, FLOW, PLAYS, BOX SCORE, TEAMS |
| Formula 1  | `MotorsportStatsView` | RACE, WEEKEND, QUALIFYING               |

Terms used in this guide:

- **Fixture**: one match or race, with its two sides, start time and status.
- **Crest**: the team badge, drawn from the team's colours and short name.
- **Snapshot**: a saved copy of real match data from a sports data provider, stored as a JSON file.
- **Chip**: one of the cut-corner buttons that switches section.

## What each report shows

### All four

- **A row of chips switches section.** Only the selected section is rendered. Arrow keys, Home and End move between chips.
- **Below 1024px the report scrolls inside its column**, under the header. From 1024px the whole page scrolls.
- **A section with nothing to show says so**, for example `Lineups not locked` or `Pressure feed offline`.

### Football

- **OVERVIEW.** A MATCH INTEL card (competition, venue, attendance). TEAM CONTROL: seven stats, each a row with both values and a two-colour bar; tapping a row highlights it. MATCH TIMELINE: goals, cards and substitutions down a centre line, home on the left and away on the right; tapping an event opens a sentence describing it.
- **MOMENTUM.** TERRITORIAL PRESSURE is a chart of each side's pressure through the match with the goals marked. Dragging across it, or the left and right arrow keys, reads off both values at a minute. SHOT MAP plots all 31 attempts on a pitch, with chips for the first half, second half and goals. Tapping a shot opens a card with the minute, the player and a small goal showing where it went.
- **LINEUPS.** One team at a time on a pitch in formation, then the bench. Tapping a player opens a MATCH DOSSIER card with a heat map of touches and the player's figures. Arrows on the card or the arrow keys step through the squad.
- **COMMENTARY.** The play-by-play list, 104 entries.

### Cricket

- **OVERVIEW.** A MATCH INTEL card with the venue, format, toss and result. TEAM COMPARISON: runs, wickets lost, overs, run rate, fours, sixes and extras as two-colour rows.
- **RACE.** INNINGS RACE charts both innings' runs over by over, with chips for the full game, the powerplay and the death overs. INNINGS RUN RATE sits beneath, with a chip for each innings.
- **SCORECARD.** One innings at a time, chosen with a chip per team: a batting table (runs, balls, fours, sixes, strike rate, how out) and a bowling table (overs, maidens, runs, wickets, economy). A player's name is a link where the snapshot has a page for that player.
- **MATCH FEED.** Ball-by-ball commentary, with a chip per team.

The header reads differently for cricket: each side's innings sits under its name (`161/5`, with `18/20 OV, TARGET 156` beneath) and the middle says `vs`.

### Basketball

- **OVERVIEW.** A MATCH INTEL card (venue, attendance, broadcaster, series). BY QUARTER lists each quarter's points. TEAM CONTROL compares shooting percentages, rebounds, assists, steals, blocks, turnovers and more.
- **FLOW.** SCORE RACE charts both teams' scores through the game, with chips for the whole game, each half and the closing minutes. SCORING MAP plots made shots on a court, with chips for all, home, away and three-pointers; one shot's details are shown beneath. SCORING RUNS repeats the quarter scores.
- **PLAYS.** The event log, each entry with the quarter, clock and score.
- **BOX SCORE.** A table per team: minutes, points, field goals, threes, free throws, rebounds, assists, turnovers, steals, blocks and plus-minus. It scrolls sideways on a narrow screen.
- **TEAMS.** Each side's starting five with shirt numbers and positions.

### Formula 1

- **RACE.** The circuit name with its outline, laps, lap length, turns and lap record. The race winner. GAP TO LEADER lists every classified driver with team and gap.
- **WEEKEND.** WEEKEND POSITION TRACK charts one driver's position across the practice sessions, qualifying and the race. SESSION CLASSIFICATIONS lists the top five of each session.
- **QUALIFYING.** The full qualifying order with gaps.

The header for a race shows `FT` and the race name, with no teams or score.

## Links that leave the page

These lead to StatOz pages this guide does not build. They return 404 until the project has them.

| Link                                  | Comes from                                       |
| ------------------------------------- | ------------------------------------------------ |
| `/matches/1535465/players/{playerId}` | Batter and bowler names in the cricket SCORECARD |
| `/matches/600057442/track`            | EXPAND TRACK on the Formula 1 RACE section       |

Both addresses begin with `/matches/`, as in StatOz, not with this guide's `/stats/`.

## Requirements

- **Next.js 15 or later with the App Router.** Built here on 16.3.2 with React 19.2.8.
- **Tailwind CSS v4** through `@tailwindcss/postcss`. Built here on 4.3.3.
- **A `@/` path alias pointing at `src/`**, and `resolveJsonModule` turned on in `tsconfig.json`. A new Next.js project has both.
- **The Onest and Orbitron fonts**, exposed as the CSS variables `--font-onest` and `--font-orbitron` (step 9).
- No other packages. Charts and icons are drawn with inline SVG.

`next.config` needs no changes.

## How to use this guide

Create each file below at the path shown. **Paths match StatOz's own folder layout, so every import works without editing.**

Each file is labelled:

- **Unchanged**: identical to the StatOz file.
- **Trimmed**: StatOz's file holds more. This version keeps the functions, types and style rules the reports use, each copied exactly. A comment at the top of a trimmed file can describe parts that are no longer in it.
- **Adapted**: the StatOz file with a stated change.
- **New**: written for this guide.

This guide has 75 files to create, about 6,700 lines in total: 39 unchanged, 25 trimmed, 9 adapted and 2 new. It also has 7 files to copy.

**If the project already has files from `MATCH_DETAIL.md` or `MATCH_PAGE_FULHAM_CHELSEA.md`**, the same paths appear here. `MATCH_DETAIL.md` already contains all four reports in full, for every fixture, so a project that has it needs nothing from this guide. `MATCH_PAGE_FULHAM_CHELSEA.md` has the football report only; over that project, compare each file before replacing it and keep whatever either version exports. Neither combination was built or tested.

### All files in this guide

Files with no tag are unchanged.

```
├── public/assets/motorsport/
│   └── monza-circuit.svg   [copy]
└── src/
    ├── app/
    │   ├── fonts/
    │   │   ├── onest-latin-variable.woff2   [copy]
    │   │   └── orbitron-latin-variable.woff2   [copy]
    │   ├── globals.css
    │   ├── layout.tsx   [adapted]
    │   └── stats/[matchId]/
    │       └── page.tsx   [new]
    ├── design-system/
    │   ├── components/
    │   │   ├── data-display/
    │   │   │   ├── goal-mouth-diagram/
    │   │   │   │   ├── goal-mouth-diagram.tsx
    │   │   │   │   └── index.ts   [trimmed]
    │   │   │   ├── hud-panel/
    │   │   │   │   ├── hud-panel.tsx
    │   │   │   │   └── index.ts   [trimmed]
    │   │   │   └── interactive-line-chart/
    │   │   │       ├── index.ts   [trimmed]
    │   │   │       ├── interactive-line-chart.module.css
    │   │   │       └── interactive-line-chart.tsx
    │   │   ├── feedback/no-data-state/
    │   │   │   ├── index.ts   [trimmed]
    │   │   │   └── no-data-state.tsx
    │   │   └── navigation/filter-chips/
    │   │       ├── filter-chips.module.css
    │   │       ├── filter-chips.tsx
    │   │       └── index.ts   [trimmed]
    │   ├── icons/
    │   │   ├── glyphs.tsx   [trimmed]
    │   │   ├── icon.tsx
    │   │   └── index.ts   [trimmed]
    │   ├── index.ts   [trimmed]
    │   ├── styles/
    │   │   └── tokens.css
    │   └── tokens/
    │       ├── colors.ts   [trimmed]
    │       └── index.ts   [trimmed]
    ├── domain/
    │   ├── matches/
    │   │   ├── detail.ts   [trimmed]
    │   │   ├── index.ts   [trimmed]
    │   │   ├── match.ts   [trimmed]
    │   │   ├── race.ts
    │   │   └── report.ts
    │   ├── predictions/
    │   │   ├── index.ts   [trimmed]
    │   │   └── quiz.ts   [trimmed]
    │   └── sports/
    │       ├── index.ts
    │       └── sport.ts   [trimmed]
    ├── features/matches/components/
    │   ├── basketball-shot-map.module.css
    │   ├── basketball-shot-map.tsx
    │   ├── basketball-stats-view.tsx
    │   ├── cricket-stats-view.tsx
    │   ├── football-shot-map.module.css
    │   ├── football-shot-map.tsx
    │   ├── football-stats-view.tsx
    │   ├── match-detail.module.css   [trimmed]
    │   ├── match-pitch-view.tsx
    │   ├── match-pitch.module.css
    │   ├── match-player-sheet.module.css
    │   ├── match-player-sheet.tsx
    │   ├── match-report-parts.tsx
    │   ├── match-scoreboard.tsx   [adapted]
    │   ├── match-stats-shell.tsx   [trimmed]
    │   ├── match-stats.module.css   [trimmed]
    │   ├── match-summary-header.tsx
    │   ├── match-trace-chart.tsx
    │   ├── motorsport-stats-view.module.css
    │   ├── motorsport-stats-view.tsx
    │   ├── stats-page.module.css   [new]
    │   ├── team-badge.module.css
    │   └── team-badge.tsx
    ├── mocks/
    │   ├── matches/
    │   │   ├── basketball.ts   [adapted]
    │   │   ├── catalog.ts   [adapted]
    │   │   ├── cricket.ts   [adapted]
    │   │   ├── definitions.ts   [adapted]
    │   │   ├── details/
    │   │   │   ├── basketball-snapshot.ts
    │   │   │   ├── basketball.ts
    │   │   │   ├── cricket-snapshot.ts   [trimmed]
    │   │   │   ├── cricket.ts
    │   │   │   ├── f1.ts
    │   │   │   ├── football-snapshot.ts   [trimmed]
    │   │   │   ├── football.ts
    │   │   │   ├── index.ts   [trimmed]
    │   │   │   ├── motorsport.ts
    │   │   │   ├── report.ts
    │   │   │   ├── shared.ts   [adapted]
    │   │   │   └── tennis.ts
    │   │   ├── football.ts   [adapted]
    │   │   ├── index.ts   [trimmed]
    │   │   └── motorsport.ts   [adapted]
    │   └── snapshots/card-game/
    │       ├── basketball-revamp.json   [copy]
    │       ├── cricket-revamp.json   [copy]
    │       ├── f1-italian-gp.json   [copy]
    │       └── football-revamp.json   [copy]
    └── shared/utils/
        ├── format.ts   [trimmed]
        └── index.ts   [trimmed]
```

## Step 1: styles

`tokens.css` defines every design value as a CSS variable prefixed `--ds-`. `globals.css` imports it and maps those variables to Tailwind class names, which is what makes classes such as `text-muted`, `font-display` and `tracking-ultra` work.

Note that `globals.css` redefines several of Tailwind's built-in sizes, including `text-xs`, `text-sm`, `text-base` and `leading-tight`. If the project already uses those classes, they will change size.

#### `src/design-system/styles/tokens.css`

**Unchanged.**

```css
:root {
  color-scheme: dark;

  /* Backgrounds */
  --ds-color-background-primary: #0d111a;
  --ds-color-background-secondary: #0f172b;
  --ds-color-background-elevated: #1d293d;
  --ds-color-background-muted: #070c1f;
  --ds-color-background-nav: #1a253a;
  --ds-color-background-quiz-hub: #06152b;
  --ds-color-background-data: #10192d;

  /* Text */
  --ds-color-text-default: #ffffff;
  --ds-color-text-muted: #90a1b9;
  --ds-color-text-subtle: #cad5e2;
  --ds-color-text-accent: #5cdfff;
  --ds-color-text-inverse: #081019;
  --ds-color-text-disabled: #6a7282;

  /* Borders */
  --ds-color-border-default: #314158;
  --ds-color-border-muted: #243654;
  --ds-color-border-subtle: #20293e;
  --ds-color-border-strong: #45556c;
  --ds-color-border-active: rgb(173 70 255 / 50%);
  --ds-color-border-inactive: #94a3b8;

  /* Accents */
  --ds-color-accent-white: var(--ds-color-text-default);
  --ds-color-accent-cyan: #5cdfff;
  --ds-color-accent-violet: #c27aff;
  --ds-color-accent-orange: #ff8904;
  --ds-color-accent-lime: #51ff94;
  --ds-color-accent-gold: #fdc700;
  --ds-color-accent-blue: #2b7fff;
  --ds-color-accent-racing: #f42d29;
  --ds-color-accent-pink: #ff94c1;

  /* Rarity — collectible card tiers. Gold and platinum reuse the accents the
     palette already holds rather than growing a second gold. */
  --ds-color-rarity-bronze-light: #e8a45c;
  --ds-color-rarity-bronze-base: #cd7f32;
  --ds-color-rarity-bronze-deep: #5c3a1a;
  --ds-color-rarity-silver-light: #f1f5f9;
  --ds-color-rarity-silver-base: #cbd5e1;
  --ds-color-rarity-silver-deep: #64748b;
  --ds-color-rarity-gold-light: #ffe9a8;
  --ds-color-rarity-gold-base: var(--ds-color-accent-gold);
  --ds-color-rarity-gold-deep: #b8860b;
  --ds-color-rarity-platinum-light: #b9f6ff;
  --ds-color-rarity-platinum-base: var(--ds-color-accent-cyan);
  --ds-color-rarity-platinum-deep: var(--ds-color-accent-violet);

  /* Feedback */
  --ds-color-success: #05df72;
  --ds-color-warning: #fdc700;
  --ds-color-danger: #ff4d4d;
  --ds-color-info: #3c95da;

  /* Overlays */
  --ds-color-overlay-subtle: rgb(255 255 255 / 10%);
  --ds-color-overlay-scrim: rgb(0 0 0 / 84%);
  --ds-color-overlay-plate: rgb(0 0 0 / 60%);
  --ds-color-overlay-shop-footer: rgb(0 0 0 / 88%);
  --ds-color-overlay-shop-ownership: rgb(0 0 0 / 66%);

  /* Fixture-card chrome */
  --ds-color-fixture-shadow: #04060b;
  --ds-color-fixture-base: #141c2b;
  --ds-color-fixture-strip: #0f1826;
  /* The brighter fill a fixture card's call-to-action strip takes. */
  --ds-color-fixture-strip-focal: #173a5e;
  --ds-color-fixture-border: #2a3550;
  --ds-color-fixture-predicted: #2c7a8c;
  --ds-color-fixture-kickoff: #c8a45a;
  --ds-color-fixture-dim-name: #aeb7c5;
  --ds-color-fixture-score: #9fb0c2;
  --ds-color-fixture-result: #bac5d3;

  /* Gradients */
  --ds-gradient-app-background: linear-gradient(
    135deg,
    #010916 0%,
    #0e2646 100%
  );
  --ds-gradient-nav-bar: linear-gradient(
    to top,
    rgb(14 22 43 / 97.6%) 0%,
    rgb(28 40 60 / 97.6%) 100%
  );
  --ds-gradient-arena-backdrop: linear-gradient(
    to bottom,
    #02060f 0%,
    #06121f 46%,
    #01040a 100%
  );
  --ds-gradient-step-passed: linear-gradient(
    to right,
    #00c850 0%,
    #009865 100%
  );
  --ds-gradient-step-current: linear-gradient(
    to right,
    #ffb13d 0%,
    #ff7a1a 100%
  );
  --ds-gradient-step-failed: linear-gradient(
    to right,
    #ff6b6b 0%,
    #c81e30 100%
  );
  --ds-gradient-pack-headline: linear-gradient(
    135deg,
    #5cdfff 0%,
    #d4ff5c 100%
  );
  --ds-gradient-card-nameplate: linear-gradient(
    to right,
    #202836 0%,
    #121824 100%
  );
  --ds-gradient-fixture-card: linear-gradient(
    to bottom,
    #1b2336 0%,
    #121a28 100%
  );
  --ds-gradient-trending-card: linear-gradient(
    to bottom,
    color-mix(
        in srgb,
        var(--ds-color-accent-cyan) 4%,
        var(--ds-color-background-elevated)
      )
      0%,
    var(--ds-color-background-elevated) 100%
  );
  --ds-gradient-league-table: linear-gradient(135deg, #121b30 0%, #0e1628 100%);
  /* The bed a decision sheet is taken on, raked from lit slate to hull dark. */
  --ds-gradient-hud-sheet: linear-gradient(135deg, #152139 0%, #0b101c 100%);
  /* The lit top edge of that sheet: cyan into violet, fading at both ends. */
  --ds-gradient-hud-edge: linear-gradient(
    to right,
    transparent 0%,
    var(--ds-color-accent-cyan) 28%,
    var(--ds-color-accent-violet) 72%,
    transparent 100%
  );
  --ds-gradient-dock-bar: linear-gradient(
    to bottom,
    color-mix(in srgb, #1d293d 88%, transparent) 0%,
    #17233d 100%
  );
  --ds-gradient-streak-milestone: linear-gradient(
    135deg,
    color-mix(in srgb, var(--ds-color-accent-gold) 24%, transparent) 0%,
    var(--ds-color-background-secondary) 50%,
    var(--ds-color-background-elevated) 100%
  );

  /* Elevation */
  --ds-shadow-hard-drop: 0 4px 0 rgb(0 0 0 / 20%);
  --ds-shadow-panel: 0 2px 12px rgb(0 0 0 / 35%);
  --ds-shadow-streak-card: 0 5px 0 var(--ds-color-fixture-shadow);

  /* Shape — StatOz cuts corners instead of rounding them. */
  --ds-shape-signal-cut: 12px;
  --ds-shape-signal-notch: 34px;
  --ds-shape-signal-step: 8px;
  --ds-shape-signal-lift: 6px;
  --ds-shape-fixture-cut: 12px;
  --ds-shape-fixture-notch-width: 96px;
  --ds-shape-fixture-notch-depth: 22px;
  --ds-shape-fixture-notch-slope: 12px;
  --ds-shape-fixture-lift: 6px;
  --ds-shape-tab-chamfer: 16px;
  --ds-shape-field-cut: 10px;
  --ds-shape-panel-cut: 12px;
  --ds-shape-hud-cut: 14px;
  --ds-shape-hud-accent-cut: 4px;
  --ds-shape-hud-sheet-cut: 18px;
  --ds-shape-hud-sheet-accent-cut: 4px;
  --ds-shape-compact-hud-cut: 12px;
  --ds-shape-compact-hud-accent-cut: 3px;
  /* A card scales its chamfer to its own width; these are the resting values a
     card overrides. See cardCuts() in design-system/tokens/shape.ts. */
  --ds-card-cut-big: 14px;
  --ds-card-cut-small: 7px;
  --ds-radius-none: 0;
  --ds-radius-sm: 2px;
  --ds-radius-md: 4px;
  --ds-radius-pill: 999px;

  /* Clip paths — kept in sync with design-system/tokens/shape.ts */
  --ds-clip-signal: polygon(
    12px 0,
    calc(100% - 42px) 0,
    calc(100% - 34px) 8px,
    100% 8px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px),
    0 12px
  );
  --ds-clip-fixture: polygon(
    0 0,
    calc(50% - 60px) 0,
    calc(50% - 48px) 22px,
    calc(50% + 48px) 22px,
    calc(50% + 60px) 0,
    100% 0,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
  --ds-clip-fixture-flat: polygon(
    0 0,
    100% 0,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
  --ds-plate-cut: 9px;
  --ds-clip-octagon-plate: polygon(
    var(--ds-plate-cut) 0,
    calc(100% - var(--ds-plate-cut)) 0,
    100% var(--ds-plate-cut),
    100% calc(100% - var(--ds-plate-cut)),
    calc(100% - var(--ds-plate-cut)) 100%,
    var(--ds-plate-cut) 100%,
    0 calc(100% - var(--ds-plate-cut)),
    0 var(--ds-plate-cut)
  );
  --ds-clip-octagon: polygon(
    15% 0,
    85% 0,
    100% 15%,
    100% 85%,
    85% 100%,
    15% 100%,
    0 85%,
    0 15%
  );
  --ds-clip-field: polygon(
    10px 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    10px 100%,
    0 calc(100% - 10px),
    0 10px
  );
  --ds-clip-chip: polygon(
    8px 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    8px 100%,
    0 calc(100% - 8px),
    0 8px
  );
  --ds-clip-panel: polygon(
    12px 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px),
    0 12px
  );
  --ds-clip-hud: polygon(
    14px 0,
    calc(100% - 4px) 0,
    100% 4px,
    100% calc(100% - 14px),
    calc(100% - 14px) 100%,
    4px 100%,
    0 calc(100% - 4px),
    0 14px
  );
  --ds-clip-hud-sheet: polygon(
    18px 0,
    calc(100% - 4px) 0,
    100% 4px,
    100% calc(100% - 18px),
    calc(100% - 18px) 100%,
    4px 100%,
    0 calc(100% - 4px),
    0 18px
  );
  --ds-clip-compact-hud: polygon(
    12px 0,
    calc(100% - 3px) 0,
    100% 3px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    3px 100%,
    0 calc(100% - 3px),
    0 12px
  );
  /* Only correct at the resting cut sizes above: the cuts in this polygon
     resolve here on :root, so a card that overrides --ds-card-cut-* must use
     cardClipPath from design-system/tokens/shape.ts instead. */
  --ds-clip-card: polygon(
    var(--ds-card-cut-big) 0,
    calc(100% - var(--ds-card-cut-small)) 0,
    100% var(--ds-card-cut-small),
    100% calc(100% - var(--ds-card-cut-big)),
    calc(100% - var(--ds-card-cut-big)) 100%,
    var(--ds-card-cut-small) 100%,
    0 calc(100% - var(--ds-card-cut-small)),
    0 var(--ds-card-cut-big)
  );
  --ds-clip-tab-plate: polygon(
    0 0,
    100% 0,
    100% calc(100% - 16px),
    calc(100% - 16px) 100%,
    16px 100%,
    0 calc(100% - 16px)
  );

  /* Spacing */
  --ds-space-0: 0;
  --ds-space-2: 0.125rem;
  --ds-space-4: 0.25rem;
  --ds-space-6: 0.375rem;
  --ds-space-8: 0.5rem;
  --ds-space-10: 0.625rem;
  --ds-space-12: 0.75rem;
  --ds-space-14: 0.875rem;
  --ds-space-16: 1rem;
  --ds-space-20: 1.25rem;
  --ds-space-24: 1.5rem;
  --ds-space-28: 1.75rem;
  --ds-space-32: 2rem;
  --ds-space-40: 2.5rem;
  --ds-space-48: 3rem;
  --ds-space-64: 4rem;

  /* Typography */
  --ds-font-body: var(--font-onest), "Onest", system-ui, sans-serif;
  --ds-font-display:
    var(--font-orbitron), "Orbitron", var(--font-onest), "Onest", system-ui,
    sans-serif;
  --ds-font-mono: ui-monospace, "SFMono-Regular", monospace;
  --ds-text-nano: 0.5rem;
  --ds-text-micro: 0.5625rem;
  --ds-text-2xs: 0.625rem;
  --ds-text-xs: 0.6875rem;
  --ds-text-compact: 0.75rem;
  --ds-text-sm: 0.8125rem;
  --ds-text-md: 0.875rem;
  --ds-text-base: 0.9375rem;
  --ds-text-lg: 1.0625rem;
  --ds-text-badge: 1.125rem;
  --ds-text-xl: 1.25rem;
  --ds-text-2xl: 1.375rem;
  --ds-text-3xl: 2rem;
  --ds-text-hero: 2.625rem;
  --ds-text-celebration: 3.375rem;
  --ds-text-countdown: 4.5rem;
  --ds-leading-compact: 1;
  --ds-leading-tight: 1.2;
  --ds-leading-body: 1.4;
  --ds-leading-relaxed: 1.6;
  --ds-tracking-tight: 0.02em;
  --ds-tracking-label: 0.05em;
  --ds-tracking-wide: 0.07em;
  --ds-tracking-display: 0.075em;
  --ds-tracking-ultra: 0.12em;
  --ds-tracking-mega: 0.2em;
  --ds-tracking-max: 0.3em;
  --ds-numeric-tabular: "tnum" 1;
}
```

#### `src/app/globals.css`

**Unchanged.**

```css
@import "tailwindcss";
@import "../design-system/styles/tokens.css";

@theme inline {
  /* Surfaces */
  --color-background: var(--ds-color-background-primary);
  --color-surface: var(--ds-color-background-secondary);
  --color-surface-elevated: var(--ds-color-background-elevated);
  --color-surface-muted: var(--ds-color-background-muted);
  --color-surface-nav: var(--ds-color-background-nav);

  /* Text */
  --color-foreground: var(--ds-color-text-default);
  --color-muted: var(--ds-color-text-muted);
  --color-subtle: var(--ds-color-text-subtle);
  --color-inverse: var(--ds-color-text-inverse);
  --color-disabled: var(--ds-color-text-disabled);

  /* Borders */
  --color-line: var(--ds-color-border-default);
  --color-line-muted: var(--ds-color-border-muted);
  --color-line-subtle: var(--ds-color-border-subtle);
  --color-line-strong: var(--ds-color-border-strong);
  --color-line-inactive: var(--ds-color-border-inactive);

  /* Accents */
  --color-accent: var(--ds-color-accent-cyan);
  --color-sport-white: var(--ds-color-accent-white);
  --color-cyan: var(--ds-color-accent-cyan);
  --color-violet: var(--ds-color-accent-violet);
  --color-orange: var(--ds-color-accent-orange);
  --color-lime: var(--ds-color-accent-lime);
  --color-gold: var(--ds-color-accent-gold);
  --color-blue: var(--ds-color-accent-blue);
  --color-racing: var(--ds-color-accent-racing);
  --color-pink: var(--ds-color-accent-pink);

  /* Rarity */
  --color-bronze: var(--ds-color-rarity-bronze-base);
  --color-bronze-light: var(--ds-color-rarity-bronze-light);
  --color-bronze-deep: var(--ds-color-rarity-bronze-deep);
  --color-silver: var(--ds-color-rarity-silver-base);
  --color-silver-light: var(--ds-color-rarity-silver-light);
  --color-silver-deep: var(--ds-color-rarity-silver-deep);
  --color-gold-light: var(--ds-color-rarity-gold-light);
  --color-gold-deep: var(--ds-color-rarity-gold-deep);
  --color-platinum: var(--ds-color-rarity-platinum-base);
  --color-platinum-light: var(--ds-color-rarity-platinum-light);
  --color-platinum-deep: var(--ds-color-rarity-platinum-deep);

  /* Feedback */
  --color-success: var(--ds-color-success);
  --color-warning: var(--ds-color-warning);
  --color-danger: var(--ds-color-danger);
  --color-info: var(--ds-color-info);

  /* Type */
  --font-sans: var(--ds-font-body);
  --font-display: var(--ds-font-display);
  --font-mono: var(--ds-font-mono);
  --text-nano: var(--ds-text-nano);
  --text-micro: var(--ds-text-micro);
  --text-2xs: var(--ds-text-2xs);
  --text-xs: var(--ds-text-xs);
  --text-compact: var(--ds-text-compact);
  --text-sm: var(--ds-text-sm);
  --text-md: var(--ds-text-md);
  --text-base: var(--ds-text-base);
  --text-lg: var(--ds-text-lg);
  --text-badge: var(--ds-text-badge);
  --text-xl: var(--ds-text-xl);
  --text-2xl: var(--ds-text-2xl);
  --text-3xl: var(--ds-text-3xl);
  --text-hero: var(--ds-text-hero);
  --text-celebration: var(--ds-text-celebration);
  --text-countdown: var(--ds-text-countdown);
  --leading-compact: var(--ds-leading-compact);
  --leading-tight: var(--ds-leading-tight);
  --leading-body: var(--ds-leading-body);
  --leading-relaxed: var(--ds-leading-relaxed);
  --tracking-tight: var(--ds-tracking-tight);
  --tracking-label: var(--ds-tracking-label);
  --tracking-wide: var(--ds-tracking-wide);
  --tracking-display: var(--ds-tracking-display);
  --tracking-ultra: var(--ds-tracking-ultra);
  --tracking-mega: var(--ds-tracking-mega);
  --tracking-max: var(--ds-tracking-max);

  /* Shape */
  --radius-sm: var(--ds-radius-sm);
  --radius-md: var(--ds-radius-md);
  --radius-pill: var(--ds-radius-pill);
  --shadow-streak-card: var(--ds-shadow-streak-card);
  --background-image-streak-milestone: var(--ds-gradient-streak-milestone);
}

body {
  background: var(--ds-color-background-primary);
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-body);
}

/* Numbers that sit in columns or animate must not jitter. */
.ds-tabular {
  font-feature-settings: var(--ds-numeric-tabular);
  font-variant-numeric: tabular-nums;
}

:focus-visible {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: 2px;
}

/* InputField paints its own chamfered focus edge; a rectangular browser
   outline would make the two focus treatments compete. */
input[data-ds-input-field]:focus-visible {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Step 2: shared helpers

Date and time formatting in UTC, so the server and the browser print the same text.

#### `src/shared/utils/format.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/**
 * Kick-off clock in 24-hour form. Formatted in UTC so the server and the
 * client agree — a locale-dependent render would mismatch on hydration.
 */
export function formatKickoffTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Short kick-off date, for example "26 AUG". */
export function formatKickoffDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(iso))
    .toUpperCase();
}
```

#### `src/shared/utils/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./format";
```

## Step 3: design-system pieces

General-purpose building blocks. None of them knows anything about matches.

`accentVar("cyan")` returns `var(--ds-color-accent-cyan)`. Icons are inline SVG filled with `currentColor`, so they take the colour of the text around them.

#### `src/design-system/tokens/colors.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/**
 * StatOz semantic color tokens, seeded from the Flutter application's theme.
 * Components should use semantic names instead of raw palette values.
 */
export const colors = {
  background: {
    primary: "#0d111a",
    secondary: "#0f172b",
    elevated: "#1d293d",
    muted: "#070c1f",
    nav: "#1a253a",
    /** Solid navy bed beneath the two-team wash on quiz objective cards. */
    quizHub: "#06152b",
    /** The flat bed under charts and the data rows a report is built from. */
    data: "#10192d",
  },
  text: {
    default: "#ffffff",
    muted: "#90a1b9",
    subtle: "#cad5e2",
    accent: "#5cdfff",
    inverse: "#081019",
    disabled: "#6a7282",
  },
  border: {
    default: "#314158",
    muted: "#243654",
    subtle: "#20293e",
    strong: "#45556c",
    active: "rgba(173, 70, 255, 0.5)",
    /** Neutral edge for inactive streak surfaces. */
    inactive: "#94a3b8",
  },
  accent: {
    /** Neutral sport identity used by cricket; aliases the primary text ink. */
    white: "#ffffff",
    cyan: "#5cdfff",
    violet: "#c27aff",
    orange: "#ff8904",
    lime: "#51ff94",
    gold: "#fdc700",
    blue: "#2b7fff",
    racing: "#f42d29",
    pink: "#ff94c1",
  },
  feedback: {
    success: "#05df72",
    warning: "#fdc700",
    danger: "#ff4d4d",
    info: "#3c95da",
  },
  overlay: {
    subtle: "rgba(255, 255, 255, 0.1)",
    scrim: "rgba(0, 0, 0, 0.84)",
    /** The scrim a label sits on when it lies over card art. */
    plate: "rgba(0, 0, 0, 0.6)",
    /** Near-black action rail shared by purchasable shop cards. */
    shopFooter: "rgba(0, 0, 0, 0.88)",
    /** Dark veil under the tilted OWNED stamp on shop cards. */
    shopOwnership: "rgba(0, 0, 0, 0.66)",
  },
  /** Shared fixture-card chrome, matched to the Flutter match hub. */
  fixture: {
    shadow: "#04060b",
    base: "#141c2b",
    strip: "#0f1826",
    /** The brighter fill a fixture card's call-to-action strip takes. */
    stripFocal: "#173a5e",
    border: "#2a3550",
    predicted: "#2c7a8c",
    kickoff: "#c8a45a",
    dimName: "#aeb7c5",
    score: "#9fb0c2",
    result: "#bac5d3",
  },
  /**
   * Collectible card rarity, bronze through platinum. Each tier is a catch-light,
   * the hue itself, and a deep base — enough to build a metallic fill, an edge,
   * and a glow without reaching for another value.
   *
   * Gold and platinum resolve to accents the palette already holds, so the app
   * reads as one system rather than growing a second gold. The Flutter source
   * carries two disagreeing tier palettes (`tierColor` says #facc15 / #67e8f9,
   * the reveal says #fdc700 / #5cdfff); these are the reveal's.
   */
  rarity: {
    bronze: { light: "#e8a45c", base: "#cd7f32", deep: "#5c3a1a" },
    silver: { light: "#f1f5f9", base: "#cbd5e1", deep: "#64748b" },
    gold: { light: "#ffe9a8", base: "#fdc700", deep: "#b8860b" },
    platinum: { light: "#b9f6ff", base: "#5cdfff", deep: "#c27aff" },
  },
} as const;
export type AccentName = keyof typeof colors.accent;

/** The CSS custom property backing an accent, for inline color props. */
export function accentVar(name: AccentName): string {
  return `var(--ds-color-accent-${name})`;
}
```

#### `src/design-system/tokens/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./colors";
```

#### `src/design-system/icons/glyphs.tsx`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```tsx
import { Icon, type IconProps } from "./icon";

/* -------------------------------------------------------------------------
 * Material Symbols
 *
 * The StatOz app draws these from Flutter's Material icon set, so the paths
 * here are the corresponding Material Symbols glyphs, inlined to keep the
 * project free of an icon dependency. Sports use the filled cut; navigation
 * and status glyphs use outlined or rounded, matching the app.
 * ---------------------------------------------------------------------- */

/** Material Symbols `sports_soccer` (outlined filled). */
export function FootballIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm242 112q26 0 51-4t49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4Zm-90-200h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
    </Icon>
  );
}

/** Material Symbols `signal_wifi_off` (rounded). */
export function SignalOffIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M745-385q-12 12-28 11.5T689-386q-12-12-12-28.5t12-28.5l155-155q-79-60-172-91t-192-31q-29 0-58 3t-58 8q-17 3-30-6t-16-26q-3-16 6-29.5t26-16.5q32-6 64.5-9.5T480-800q125 0 239.5 43.5T928-628q7 5 10 13t3 16q0 8-2.5 15.5T930-570L745-385ZM480-234l67-66-350-350q-21 11-41 24.5T116-598l364 364ZM791-57 604-244l-96 96q-6 6-13 9t-15 3q-8 0-15-3t-13-9L30-570q-6-6-9-13.5T18-599q0-8 3-16t10-14q26-23 53-43t55-36l-84-84q-12-12-11.5-28T56-848q12-12 28.5-12t28.5 12l735 735q12 12 12 28t-12 28q-12 12-28.5 12T791-57ZM512-562Zm-140 87Z" />
    </Icon>
  );
}

/** Material Symbols `chevron_right` (rounded). */
export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
    </Icon>
  );
}

/** Material Symbols `chevron_left` (rounded). */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
    </Icon>
  );
}

/** Material Symbols `fullscreen` (rounded). */
export function FullscreenIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M120-120v-240h80v104l104-104 56 56-104 104h104v80H120Zm480 0v-80h104L600-304l56-56 104 104v-104h80v240H600ZM304-600 200-704v104h-80v-240h240v80H256l104 104-56 56Zm352 0-56-56 104-104H600v-80h240v240h-80v-104L656-600Z" />
    </Icon>
  );
}

/** Material Symbols `fullscreen_exit` (rounded). */
export function FullscreenExitIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" />
    </Icon>
  );
}

/** Material Symbols `grid_view` (rounded). */
export function GridViewIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M200-520q-33 0-56.5-23.5T120-600v-160q0-33 23.5-56.5T200-840h160q33 0 56.5 23.5T440-760v160q0 33-23.5 56.5T360-520H200Zm0 400q-33 0-56.5-23.5T120-200v-160q0-33 23.5-56.5T200-440h160q33 0 56.5 23.5T440-360v160q0 33-23.5 56.5T360-120H200Zm400-400q-33 0-56.5-23.5T520-600v-160q0-33 23.5-56.5T600-840h160q33 0 56.5 23.5T840-760v160q0 33-23.5 56.5T760-520H600Zm0 400q-33 0-56.5-23.5T520-200v-160q0-33 23.5-56.5T600-440h160q33 0 56.5 23.5T840-360v160q0 33-23.5 56.5T760-120H600Z" />
    </Icon>
  );
}

/** Material Symbols `check` (rounded). */
export function CheckIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </Icon>
  );
}

/** Material Symbols `bolt` (filled). */
export function BoltIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M360-360H236q-24 0-35.5-21.5T203-423l299-430q10-14 26-19.5t33 .5q17 6 25 21t6 32l-32 259h155q26 0 36.5 23t-6.5 43L416-100q-11 13-27 17t-31-3q-15-7-23.5-21.5T328-139l32-221Z" />
    </Icon>
  );
}

/** Material Symbols `my_location` (filled). */
export function MyLocationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M440-82v-40q-125-14-214.5-103.5T122-440H82q-17 0-28.5-11.5T42-480q0-17 11.5-28.5T82-520h40q14-125 103.5-214.5T440-838v-40q0-17 11.5-28.5T480-918q17 0 28.5 11.5T520-878v40q125 14 214.5 103.5T838-520h40q17 0 28.5 11.5T918-480q0 17-11.5 28.5T878-440h-40q-14 125-103.5 214.5T520-122v40q0 17-11.5 28.5T480-42q-17 0-28.5-11.5T440-82Zm40-118q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
    </Icon>
  );
}

/** Material Symbols `swap_horiz` (filled). */
export function SwapHorizIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m233-320 75 75q11 11 11 27.5T308-189q-12 12-28.5 12T251-189L108-332q-6-6-8.5-13T97-360q0-8 2.5-15t8.5-13l144-144q12-12 28-11.5t28 12.5q11 12 11.5 28T308-475l-75 75h247q17 0 28.5 11.5T520-360q0 17-11.5 28.5T480-320H233Zm494-240H480q-17 0-28.5-11.5T440-600q0-17 11.5-28.5T480-640h247l-75-75q-11-11-11-27.5t11-28.5q12-12 28.5-12t28.5 12l143 143q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L708-428q-12 12-28 11.5T652-429q-11-12-11.5-28t11.5-28l75-75Z" />
    </Icon>
  );
}

/** Material Symbols `groups` (outlined). */
export function GroupsIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z" />
    </Icon>
  );
}

/** Material Symbols `close` (outlined). */
export function CloseIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </Icon>
  );
}

/** Material Symbols `stadium` (outlined). */
export function StadiumIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M120-680v-160l160 80-160 80Zm600 0v-160l160 80-160 80Zm-280-40v-160l160 80-160 80Zm0 640q-76-2-141.5-12.5t-114-26.5Q136-135 108-156t-28-44v-360q0-25 31.5-46.5t85.5-38q54-16.5 127-26t156-9.5q83 0 156 9.5t127 26q54 16.5 85.5 38T880-560v360q0 23-28 44t-76.5 37q-48.5 16-114 26.5T520-80v-160h-80v160Zm40-440q97 0 167.5-11.5T760-558q0-5-76-23.5T480-600q-128 0-204 18.5T200-558q42 15 112.5 26.5T480-520ZM360-166v-154h240v154q80-8 131-23.5t69-27.5v-271q-55 22-138 35t-182 13q-99 0-182-13t-138-35v271q18 12 69 27.5T360-166Zm120-161Z" />
    </Icon>
  );
}

/** Material Symbols `grid_on` (outlined). */
export function GridOnIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h133v-133H200v133Zm213 0h134v-133H413v133Zm214 0h133v-133H627v133ZM200-413h133v-134H200v134Zm213 0h134v-134H413v134Zm214 0h133v-134H627v134ZM200-627h133v-133H200v133Zm213 0h134v-133H413v133Zm214 0h133v-133H627v133Z" />
    </Icon>
  );
}

/** Material Symbols `style` (outlined). */
export function StyleIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m159-168-34-14q-31-13-41.5-45t3.5-63l72-156v278Zm160 88q-33 0-56.5-23.5T239-160v-240l106 294q3 7 6 13.5t8 12.5h-40Zm206-4q-32 12-62-3t-42-47L243-622q-12-32 2-62.5t46-41.5l302-110q32-12 62 3t42 47l178 488q12 32-2 62.5T827-194L525-84Zm-57.5-487.5Q479-583 479-600t-11.5-28.5Q456-640 439-640t-28.5 11.5Q399-617 399-600t11.5 28.5Q422-560 439-560t28.5-11.5ZM497-160l302-110-178-490-302 110 178 490ZM319-650l302-110-302 110Z" />
    </Icon>
  );
}

/** Material Symbols `insights` (outlined). */
export function InsightsIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M120-160q-33 0-56.5-23.5T40-240q0-33 23.5-56.5T120-320h10.5q4.5 0 9.5 2l182-182q-2-5-2-9.5V-520q0-33 23.5-56.5T400-600q33 0 56.5 23.5T480-520q0 2-2 20l102 102q5-2 9.5-2h21q4.5 0 9.5 2l142-142q-2-5-2-9.5V-560q0-33 23.5-56.5T840-640q33 0 56.5 23.5T920-560q0 33-23.5 56.5T840-480h-10.5q-4.5 0-9.5-2L678-340q2 5 2 9.5v10.5q0 33-23.5 56.5T600-240q-33 0-56.5-23.5T520-320v-10.5q0-4.5 2-9.5L420-442q-5 2-9.5 2H400q-2 0-20-2L198-260q2 5 2 9.5v10.5q0 33-23.5 56.5T120-160Zm40-401-25-54-54-25 54-25 25-54 25 54 54 25-54 25-25 54Zm440-39-38-82-82-38 82-38 38-82 38 82 82 38-82 38-38 82Z" />
    </Icon>
  );
}

/** Material Symbols `show_chart` (outlined). */
export function ShowChartIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m140-220-60-60 300-300 160 160 284-320 56 56-340 384-160-160-240 240Z" />
    </Icon>
  );
}

/** Material Symbols `history` (outlined). */
export function HistoryIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
    </Icon>
  );
}

/** Material Symbols `mic` — commentary that has not started. */
export function MicIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z" />
    </Icon>
  );
}
```

#### `src/design-system/icons/icon.tsx`

**Unchanged.**

```tsx
import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Rendered size in px, applied to both axes. */
  size?: number;
  /** Accessible name. Omit to hide the icon from assistive technology. */
  title?: string;
};

/**
 * Shared shell for every glyph: a square, currentColor-filled canvas that is
 * hidden from assistive technology unless it is given a title.
 *
 * Filled rather than stroked, matching Material Symbols. Stroke-drawn brand
 * glyphs override `fill` and `stroke` themselves.
 */
export function Icon({
  size = 20,
  title,
  children,
  viewBox = "0 -960 960 960",
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
```

#### `src/design-system/icons/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { type IconProps } from "./icon";
export * from "./glyphs";
```

- `FilterChips`: the row of chips that switches section and filters charts.
- `InteractiveLineChart`: a line chart that can be dragged to read values. Cricket's run-rate chart and Formula 1's position chart use it.
- `HudPanel`: a cut-corner panel.
- `NoDataState`: the "nothing here yet" message with an icon.
- `GoalMouthDiagram`: the small goal that shows where a football shot went.

#### `src/design-system/components/data-display/goal-mouth-diagram/goal-mouth-diagram.tsx`

**Unchanged.**

```tsx
import type { CSSProperties } from "react";

export type GoalMouthPlacement = { x: number; y: number; label: string } | null;

export function GoalMouthStructure({
  left = 12,
  right = 88,
  top = 12,
  bottom = 88,
}: {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}) {
  return (
    <g aria-hidden>
      {Array.from({ length: 7 }, (_, index) => {
        const x = left + ((right - left) * index) / 6;
        return (
          <line
            key={`x-${x}`}
            x1={x}
            x2={x}
            y1={top}
            y2={bottom}
            opacity=".18"
          />
        );
      })}
      {Array.from({ length: 5 }, (_, index) => {
        const y = top + ((bottom - top) * index) / 4;
        return (
          <line
            key={`y-${y}`}
            x1={left}
            x2={right}
            y1={y}
            y2={y}
            opacity=".18"
          />
        );
      })}
      <path
        d={`M ${left} ${bottom} L ${left} ${top} L ${right} ${top} L ${right} ${bottom}`}
        fill="none"
        strokeWidth="2.5"
      />
    </g>
  );
}

export function GoalMouthDiagram({
  placement,
  caption,
}: {
  placement: GoalMouthPlacement;
  caption?: string;
}) {
  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={
          placement
            ? `Goal placement: ${placement.label}`
            : (caption ?? "Goal placement unavailable")
        }
        style={
          {
            width: "100%",
            height: 116,
            color: "var(--ds-color-text-default)",
            background: "var(--ds-color-background-muted)",
          } as CSSProperties
        }
      >
        <g stroke="currentColor">
          <GoalMouthStructure />
        </g>
        {placement ? (
          <circle
            cx={placement.x}
            cy={placement.y}
            r="4"
            fill="var(--ds-color-accent-gold)"
            stroke="var(--ds-color-text-inverse)"
            strokeWidth="1.5"
          />
        ) : null}
      </svg>
      <figcaption
        style={{
          minHeight: 20,
          paddingTop: 4,
          color: placement
            ? "var(--ds-color-accent-gold)"
            : "var(--ds-color-text-muted)",
          fontFamily: "var(--ds-font-display)",
          fontSize: "var(--ds-text-2xs)",
          fontWeight: 900,
          textAlign: "center",
          letterSpacing: "var(--ds-tracking-wide)",
        }}
      >
        {placement?.label ?? caption ?? "PLACEMENT NOT PUBLISHED"}
      </figcaption>
    </figure>
  );
}
```

#### `src/design-system/components/data-display/goal-mouth-diagram/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { GoalMouthDiagram } from "./goal-mouth-diagram";
```

#### `src/design-system/components/data-display/hud-panel/hud-panel.tsx`

**Unchanged.**

```tsx
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type HudPanelProps = {
  /** CSS color that drives the panel's edge and its glow. */
  accent: string;
  /** Adds the accent bloom that marks the one featured plate on a surface. */
  glow?: boolean;
  href?: string;
  onClick?: () => void;
  /** Accessible name, required when the panel is interactive. */
  label?: string;
  className?: string;
  children?: ReactNode;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-hud)" };

/**
 * The HUD plate: a strong chamfer on the top-left and bottom-right corners with
 * smaller answering cuts on the other two. Cards and action surfaces share the
 * silhouette so they read as the same piece of hardware.
 *
 * Built as an accent edge with the fill inset a pixel inside it, because a clip
 * path crops a border away. The glow sits on a fourth layer behind everything,
 * since a `box-shadow` would be clipped along with the element that casts it.
 *
 * When interactive, the hit area is a stretched overlay rather than a wrapper,
 * so panel content stays flow-level regardless of which element it uses.
 */
export function HudPanel({
  accent,
  glow = false,
  href,
  onClick,
  label,
  className,
  children,
}: HudPanelProps) {
  const interactive = Boolean(href ?? onClick);
  const style = { "--hud-accent": accent } as CSSProperties;

  return (
    <div className="group relative h-full w-full" style={style}>
      {glow ? (
        <div
          aria-hidden
          className="absolute -inset-0.5 blur-[6px]"
          style={{
            ...clip,
            background:
              "color-mix(in srgb, var(--hud-accent) 22%, transparent)",
          }}
        />
      ) : null}

      <div
        className={[
          "relative h-full w-full transition-transform duration-150",
          interactive
            ? "group-hover:-translate-y-0.5 group-active:translate-y-0"
            : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Accent edge — the inset fill below leaves 1px of it showing. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            ...clip,
            background:
              "color-mix(in srgb, var(--hud-accent) 86%, transparent)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-px"
          style={{
            ...clip,
            background: "var(--ds-color-background-elevated)",
          }}
        />

        {/* Content is clipped so artwork can bleed to the cut edges. */}
        <div
          className="relative z-10 flex h-full w-full flex-col overflow-hidden"
          style={clip}
        >
          {children}
        </div>

        {href ? (
          <Link
            href={href}
            aria-label={label}
            className="absolute inset-0 z-20"
            style={clip}
          />
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="absolute inset-0 z-20"
            style={clip}
          />
        ) : null}
      </div>
    </div>
  );
}
```

#### `src/design-system/components/data-display/hud-panel/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { HudPanel } from "./hud-panel";
```

#### `src/design-system/components/data-display/interactive-line-chart/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { InteractiveLineChart } from "./interactive-line-chart";
```

#### `src/design-system/components/data-display/interactive-line-chart/interactive-line-chart.module.css`

**Unchanged.**

```css
.plot {
  position: relative;
  width: 100%;
  height: 11rem;
  touch-action: none;
  border: 1px solid var(--ds-color-border-default);
  background: color-mix(
    in srgb,
    var(--ds-color-background-secondary) 85%,
    var(--ds-color-background-elevated)
  );
  cursor: crosshair;
  outline: none;
}

.plot:focus-visible {
  box-shadow:
    0 0 0 2px var(--ds-color-background-primary),
    0 0 0 4px var(--line-chart-accent);
}

.canvas {
  position: absolute;
  inset: var(--ds-space-8);
}

.canvas svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.gridLine {
  stroke: color-mix(in srgb, var(--ds-color-border-default) 35%, transparent);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

/* The wash under the leading line, so a stacked chart still reads at a glance. */
.area {
  fill: color-mix(
    in srgb,
    var(--series-color, var(--line-chart-accent)) 16%,
    transparent
  );
  stroke: none;
}

.line {
  fill: none;
  stroke: var(--series-color, var(--line-chart-accent));
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
  vector-effect: non-scaling-stroke;
}

.guide,
.marker {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.annotation {
  position: absolute;
  width: 8px;
  height: 8px;
  translate: -50% -50%;
  rotate: 45deg;
  border: 1px solid var(--annotation-color);
  background: var(--ds-color-background-secondary);
  pointer-events: none;
}

.axisHint {
  position: absolute;
  top: var(--ds-space-4);
  right: var(--ds-space-6);
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-2xs);
  font-weight: 900;
}

.guide {
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: repeating-linear-gradient(
    to bottom,
    color-mix(in srgb, var(--ds-color-text-default) 75%, transparent) 0 6px,
    transparent 6px 11px
  );
}

.marker {
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  border: 3px solid var(--ds-color-text-default);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-color-background-secondary);
  box-shadow: 0 0 9px
    color-mix(in srgb, var(--line-chart-accent) 35%, transparent);
}

.marker::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  border-radius: var(--ds-radius-pill);
  background: var(--line-chart-accent);
  content: "";
}
```

#### `src/design-system/components/data-display/interactive-line-chart/interactive-line-chart.tsx`

**Unchanged.**

```tsx
"use client";

import {
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import styles from "./interactive-line-chart.module.css";

/** One plotted line. Several may share a chart when they share a scale. */
export type LineChartSeries = {
  id: string;
  label: string;
  /** Chronological values, oldest to newest. */
  values: number[];
  /** Identity colour. Falls back to the chart's accent. */
  color?: string;
  /** Washes the area under this line — reserve it for the leading series. */
  fill?: boolean;
};

export type LineChartMarker = {
  index: number;
  value: number;
  label: string;
  color?: string;
};

export type InteractiveLineChartProps = {
  /** Chronological values, oldest to newest. Empty input renders as zero. */
  values?: number[];
  /** Several lines instead of one. Takes precedence over `values`. */
  series?: LineChartSeries[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number) => void;
  /** Accessible name for the scrub control. */
  label: string;
  /** Describes the currently selected value to assistive technology. */
  valueText: (value: number, index: number) => string;
  /**
   * Holds each value until the next one — a price that only moves when a trade
   * lands, rather than drifting between them.
   */
  stepped?: boolean;
  /** Pins the vertical range instead of fitting it to the data. */
  scale?: { min: number; max: number };
  /** Places smaller values at the top, useful for race positions. */
  invertYAxis?: boolean;
  /** Optional annotated moments pinned to exact samples. */
  markers?: LineChartMarker[];
  axisFormatter?: (value: number) => string;
  accent?: string;
  height?: CSSProperties["height"];
  className?: string;
};

const viewBoxWidth = 1000;
const viewBoxHeight = 100;

function clampIndex(index: number | null, pointCount: number): number {
  if (pointCount <= 1) return 0;
  if (index === null) return pointCount - 1;
  return Math.min(Math.max(index, 0), pointCount - 1);
}

/**
 * A scrub-able line graph shared by XP, odds, and any future history surface.
 *
 * The lines use a stretched SVG, but the selected guide and ring are HTML/CSS
 * elements in screen space. A circle inside `preserveAspectRatio="none"` scales
 * into an ellipse; keeping the pointer outside the SVG makes it stay perfectly
 * circular at every responsive aspect ratio.
 */
export function InteractiveLineChart({
  values,
  series,
  selectedIndex,
  onSelectedIndexChange,
  label,
  valueText,
  stepped = false,
  scale,
  invertYAxis = false,
  markers = [],
  axisFormatter,
  accent = "var(--ds-color-accent-cyan)",
  height,
  className,
}: InteractiveLineChartProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const lines: LineChartSeries[] =
    series && series.length > 0
      ? series
      : [
          {
            id: "primary",
            label,
            values: values && values.length > 0 ? values : [0],
          },
        ];

  const pointCount = Math.max(...lines.map((line) => line.values.length), 1);
  const activeIndex = clampIndex(selectedIndex, pointCount);
  const primary = lines[0];
  const activeValue =
    primary.values[Math.min(activeIndex, primary.values.length - 1)] ?? 0;

  const everyValue = lines.flatMap((line) => line.values);
  const padding = Math.max(
    10,
    Math.floor(Math.abs(everyValue.at(-1) ?? 0) / 20),
  );
  const minValue = scale
    ? scale.min
    : Math.max(0, Math.min(...everyValue) - padding);
  const maxValue = scale ? scale.max : Math.max(...everyValue) + padding;
  const spread = Math.max(1, maxValue - minValue);

  const xAt = (index: number) =>
    pointCount === 1 ? viewBoxWidth : (viewBoxWidth * index) / (pointCount - 1);
  const yAt = (value: number) =>
    invertYAxis
      ? ((value - minValue) / spread) * viewBoxHeight
      : viewBoxHeight - ((value - minValue) / spread) * viewBoxHeight;

  /** A stepped line holds its value across to the next point, then jumps. */
  function pathFor(line: LineChartSeries): string {
    const points = line.values.map((value, index) => ({
      x: xAt(index),
      y: yAt(value),
    }));
    if (points.length === 0) return "";
    if (!stepped) return points.map(({ x, y }) => `${x},${y}`).join(" ");
    return points
      .flatMap((point, index) =>
        index === 0
          ? [`${point.x},${point.y}`]
          : [`${point.x},${points[index - 1].y}`, `${point.x},${point.y}`],
      )
      .join(" ");
  }

  const selectedX = (xAt(activeIndex) / viewBoxWidth) * 100;
  const selectedY = (yAt(activeValue) / viewBoxHeight) * 100;

  const selectAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = Math.min(
      Math.max((event.clientX - rect.left) / Math.max(1, rect.width), 0),
      1,
    );
    onSelectedIndexChange(Math.round(percent * (pointCount - 1)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    onSelectedIndexChange(
      Math.min(Math.max(activeIndex + direction, 0), pointCount - 1),
    );
  };

  return (
    <div
      className={[styles.plot, className ?? ""].filter(Boolean).join(" ")}
      style={
        {
          "--line-chart-accent": primary.color ?? accent,
          ...(height === undefined ? {} : { height }),
        } as CSSProperties
      }
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.max(0, pointCount - 1)}
      aria-valuenow={activeIndex}
      aria-valuetext={valueText(activeValue, activeIndex)}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        selectAt(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          selectAt(event);
        }
      }}
      onKeyDown={onKeyDown}
    >
      <div ref={canvasRef} className={styles.canvas} aria-hidden>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="none"
        >
          {[0, 50, 100].map((y) => (
            <line
              key={y}
              x1="0"
              x2={viewBoxWidth}
              y1={y}
              y2={y}
              className={styles.gridLine}
            />
          ))}
          {lines.map((line) =>
            line.fill ? (
              <polygon
                key={`${line.id}-fill`}
                points={`0,${viewBoxHeight} ${pathFor(line)} ${viewBoxWidth},${viewBoxHeight}`}
                className={styles.area}
                style={
                  { "--series-color": line.color ?? accent } as CSSProperties
                }
              />
            ) : null,
          )}
          {lines.map((line) => (
            <polyline
              key={line.id}
              points={pathFor(line)}
              className={styles.line}
              style={
                { "--series-color": line.color ?? accent } as CSSProperties
              }
            />
          ))}
        </svg>

        <span className={styles.guide} style={{ left: `${selectedX}%` }} />
        <span
          className={styles.marker}
          style={{ left: `${selectedX}%`, top: `${selectedY}%` }}
        />
        {markers.map((marker) => (
          <span
            key={`${marker.index}-${marker.label}`}
            className={styles.annotation}
            title={marker.label}
            style={
              {
                left: `${(xAt(marker.index) / viewBoxWidth) * 100}%`,
                top: `${(yAt(marker.value) / viewBoxHeight) * 100}%`,
                "--annotation-color": marker.color ?? accent,
              } as CSSProperties
            }
          />
        ))}
      </div>
      {axisFormatter ? (
        <span className={styles.axisHint} aria-hidden>
          {axisFormatter(activeValue)}
        </span>
      ) : null}
    </div>
  );
}
```

#### `src/design-system/components/feedback/no-data-state/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { NoDataState } from "./no-data-state";
```

#### `src/design-system/components/feedback/no-data-state/no-data-state.tsx`

**Unchanged.**

```tsx
import type { ComponentType, ReactNode } from "react";

import type { IconProps } from "../../../icons/icon";

export type NoDataStateProps = {
  /** The large glyph. Sized and tinted by this component. */
  icon: ComponentType<IconProps>;
  /** Small badge over the glyph's lower right — what the absence is waiting on. */
  spark?: ComponentType<IconProps>;
  title: string;
  message: string;
  /** Tints the glyph. Defaults to cyan. */
  accent?: string;
  /** Optional way out of the empty state. */
  action?: ReactNode;
  className?: string;
};

/**
 * The house empty state: one oversized accent glyph with a white spark riding
 * its corner, a shouted title and a short explanation of what would fill the
 * space.
 *
 * Used wherever a surface has nothing to show — a fixture with no markets, a
 * board before its first entry, a match before its first commentary line — so
 * every nothing on the platform reads the same way.
 */
export function NoDataState({
  icon: Glyph,
  spark: Spark,
  title,
  message,
  accent = "var(--ds-color-accent-cyan)",
  action,
  className,
}: NoDataStateProps) {
  return (
    <div
      className={[
        "grid place-items-center px-7 py-7 text-center",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="grid max-w-77.5 justify-items-center">
        <div className="relative grid h-24 w-29.5 place-items-center">
          <Glyph
            size={78}
            aria-hidden="true"
            style={{ color: `color-mix(in srgb, ${accent} 86%, transparent)` }}
          />
          {Spark ? (
            <Spark
              size={25}
              aria-hidden="true"
              className="absolute right-3 bottom-1.5"
              style={{
                color:
                  "color-mix(in srgb, var(--ds-color-text-default) 82%, transparent)",
              }}
            />
          ) : null}
        </div>

        <strong className="mt-3.5 font-display text-sm font-black tracking-wider text-white">
          {title.toUpperCase()}
        </strong>
        <p className="mt-2 text-[13px] leading-[1.35] font-semibold text-(--ds-color-text-muted)">
          {message}
        </p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
```

#### `src/design-system/components/navigation/filter-chips/filter-chips.module.css`

**Unchanged.**

```css
.list {
  display: flex;
  flex-shrink: 0;
  gap: var(--ds-space-4);
  overflow-x: auto;
  padding: var(--ds-space-6) var(--ds-space-16);
  scroll-padding-inline: var(--ds-space-16);
  scrollbar-width: none;
}

.list::-webkit-scrollbar {
  display: none;
}

.chip {
  --filter-chip-accent: var(--ds-color-accent-cyan);
  --filter-chip-edge: var(--ds-color-border-muted);
  --filter-chip-fill: var(--ds-color-background-muted);

  position: relative;
  isolation: isolate;
  min-height: 44px;
  flex: 0 0 auto;
  border: 0;
  padding: 0 var(--ds-space-16);
  background: transparent;
  color: var(--ds-color-text-muted);
  cursor: pointer;
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-xs);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
  line-height: var(--ds-leading-compact);
  white-space: nowrap;
  transition: color 200ms ease;
}

/*
 * Two clipped layers paint a continuous one-pixel silhouette. An inset border
 * would be cropped by clip-path at the chamfers and make the corners disappear.
 */
.chip::before,
.chip::after {
  position: absolute;
  content: "";
  clip-path: var(--ds-clip-chip);
  transition: background-color 200ms ease;
}

.chip::before {
  z-index: -2;
  inset: var(--ds-space-6) 0;
  background: var(--filter-chip-edge);
}

.chip::after {
  z-index: -1;
  inset: calc(var(--ds-space-6) + 1px) 1px;
  background: var(--filter-chip-fill);
}

.chip[data-active="true"] {
  --filter-chip-edge: var(--filter-chip-accent);
  --filter-chip-fill: color-mix(
    in srgb,
    var(--filter-chip-accent) 14%,
    var(--ds-color-background-muted)
  );

  color: var(--filter-chip-accent);
}

.chip:focus-visible {
  outline-color: var(--filter-chip-accent);
  outline-offset: -3px;
}

@media (hover: hover) {
  .chip:not([data-active="true"]):hover {
    --filter-chip-edge: var(--ds-color-border-strong);

    color: var(--ds-color-text-subtle);
  }
}
```

#### `src/design-system/components/navigation/filter-chips/filter-chips.tsx`

**Unchanged.**

```tsx
"use client";

import type { CSSProperties, KeyboardEvent } from "react";

import styles from "./filter-chips.module.css";

export type FilterChipsProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  accent?: string;
  label: string;
  className?: string;
};

/**
 * A scrollable strip of cut-corner chips.
 *
 * The active chip is the only tinted, outlined element; the rest stay calm
 * muted outlines, and none of them glow. Reach for it where a surface already
 * carries a focal element and the switch itself should stay quiet — a match
 * report's sections, a catalogue's facets.
 */
export function FilterChips({
  options,
  selected,
  onSelect,
  accent = "var(--ds-color-accent-cyan)",
  label,
  className,
}: FilterChipsProps) {
  function moveSelection(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % options.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + options.length) % options.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    onSelect(options[nextIndex]);
    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabs?.[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={[styles.list, className ?? ""].filter(Boolean).join(" ")}
    >
      {options.map((option, index) => {
        const active = option === selected;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(option)}
            onKeyDown={(event) => moveSelection(event, index)}
            className={styles.chip}
            data-active={active || undefined}
            style={
              {
                "--filter-chip-accent": accent,
              } as CSSProperties
            }
          >
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}
```

#### `src/design-system/components/navigation/filter-chips/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { FilterChips } from "./filter-chips";
```

#### `src/design-system/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./tokens";
export * from "./icons";
export * from "./components/data-display/hud-panel";
export * from "./components/data-display/interactive-line-chart";
export * from "./components/data-display/goal-mouth-diagram";
export * from "./components/feedback/no-data-state";
export * from "./components/navigation/filter-chips";
```

## Step 4: data types

`match.ts` describes a fixture and a team. `detail.ts` describes a match's data, gathered into `MatchDetailData`; the report reads its `scoreboard` part, typed `MatchDetailScoreboard`. `report.ts` holds the types for the richer sections: scorecards, box scores, shots and charts. `race.ts` describes a Formula 1 race report.

#### `src/domain/sports/index.ts`

**Unchanged.**

```ts
export * from "./sport";
```

#### `src/domain/sports/sport.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/** Every sport StatOz covers. */
export type Sport =
  | "football"
  | "cricket"
  | "basketball"
  | "tennis"
  | "motorsport";
```

#### `src/domain/matches/detail.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type { Sport } from "@/domain/sports";
import type {
  BoxScore,
  FeedEvent,
  InningsLine,
  MatchIntel,
  MatchPulse,
  MatchScorer,
  MatchTrace,
  StatLeader,
  MatchPlayerDossier,
  MatchShot,
  RunRatePoint,
  BasketballScoringEvent,
} from "./report";
import type {
  MatchPredictionLeaderboardEntry,
  PredictionQuiz,
} from "@/domain/predictions";
import type { F1RaceReport } from "./race";

export type MatchDetailStat = {
  label: string;
  home: string;
  away: string;
  homeValue: number;
  awayValue: number;
};

export type MatchDetailTimelineEvent = {
  minute: string;
  side?: "home" | "away";
  type: "goal" | "yellow" | "red" | "substitution" | "score";
  player: string;
  secondary?: string;
  marker?: boolean;
  label?: string;
  scoreDisplay?: string;
  description?: string;
};

export type MatchDetailCommentary = {
  minute: string;
  text: string;
  sequence?: number;
  kind?: string;
  side?: "home" | "away";
  teamName?: string;
  players?: string[];
};

export type MatchDetailPlayer = {
  name: string;
  shortName?: string;
  number: number;
  role: string;
  captain?: boolean;
  formationPlace?: number;
};

export type MatchDetailLineup = {
  formation: string;
  players: MatchDetailPlayer[];
  /** The bench, in the order a manager would use it. */
  substitutes: MatchDetailPlayer[];
  /** A team sheet the competition has confirmed, rather than a projection. */
  confirmed: boolean;
};

export type MatchDetailScoreboard = {
  facts: Array<{ label: string; value: string }>;
  stats: MatchDetailStat[];
  timeline: MatchDetailTimelineEvent[];
  commentary: MatchDetailCommentary[];
  homeLineup: MatchDetailLineup;
  awayLineup: MatchDetailLineup;
  scoreRows: Array<{ label: string; home: string; away: string }>;
  sessions?: Array<{ label: string; results: string[] }>;
  driverStandings?: string[];
  /** The report the STATS tab leads with. */
  pulse: MatchPulse;
  intel: MatchIntel;
  /** Football momentum, basketball win probability, a cricket run race. */
  trace?: MatchTrace;
  /** Cricket only: the chase against the required rate. */
  chase?: MatchTrace;
  scorers?: MatchScorer[];
  leaders?: StatLeader[];
  boxScore?: BoxScore;
  innings?: InningsLine[];
  feed?: FeedEvent[];
  shots?: MatchShot[];
  runRate?: Array<{
    innings: 1 | 2;
    teamId: string;
    points: RunRatePoint[];
  }>;
  players?: MatchPlayerDossier[];
  basketballShots?: BasketballScoringEvent[];
  race?: F1RaceReport;
};

/** Static, feature-owned data that makes a fixture's match-detail tabs complete. */
export type MatchDetailData = {
  /** The quiz sets the PREDICT tab lists, and the TOPS tab ranks. */
  quizzes: PredictionQuiz[];
  /** quizId -> the rivals already on that quiz's board. */
  leaderboard: Record<string, MatchPredictionLeaderboardEntry[]>;
  scoreboard: MatchDetailScoreboard;
};

/** Presentation data for one fixture competition. Its accent is brand data. */
export type MatchLeague = {
  id: string;
  sport: Sport;
  name: string;
  shortCode: string;
  accent: string;
};
```

#### `src/domain/matches/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./match";
export * from "./detail";
export * from "./report";
export * from "./race";
```

#### `src/domain/matches/match.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type { Sport } from "../sports";

export type MatchStatus = "scheduled" | "live" | "finished";

export type SportTeam = {
  id: string;
  name: string;
  shortName: string;
  /** Identity color, as a hex value. */
  color: string;
  /** Secondary identity color used by two-tone badges. */
  secondaryColor?: string;
  /** Contrast-safe badge label color when white is unsuitable. */
  badgeTextColor?: string;
  /** Contrast-safe supporting label color for two-tone identity surfaces. */
  secondaryTextColor?: string;
};

export type TennisSetScore = {
  homeScore: number;
  awayScore: number;
};

export type SportMatch = {
  id: string;
  sport: Sport;
  leagueId: string;
  /** Short code shown on tiles, for example "EPL". */
  leagueLabel: string;
  home: SportTeam;
  away: SportTeam;
  status: MatchStatus;
  /** ISO 8601 timestamp. */
  kickoff: string;
  /** Display-ready score. Cricket innings include wickets and overs. */
  homeScore?: number | string;
  awayScore?: number | string;
  /** Optional human-readable outcome shown below a finished fixture. */
  resultLine?: string;
  /** Per-set detail for tennis fixtures. */
  tennisSets?: TennisSetScore[];
  /** Minutes played, when live. */
  liveMinute?: number;
  /** XP a correct call on this match is worth. */
  rewardXp: number;
  /** Oz staked across this match's markets. */
  volumeOz: number;
};
```

#### `src/domain/matches/race.ts`

**Unchanged.**

```ts
export type F1WeekendDriver = {
  id: string;
  name: string;
  abbreviation: string;
  constructor: string;
  color: string;
  positions: number[];
};

export type F1ClassificationRow = {
  position: number;
  driverId: string;
  name: string;
  constructor: string;
  color: string;
  grid: number;
  status: string;
  gap?: string;
  fastestLap?: string;
  pitStops?: number;
};

export type F1SessionResult = {
  id: string;
  label: string;
  classification: F1ClassificationRow[];
};

export type F1RaceReport = {
  id: string;
  name: string;
  abbreviation: string;
  season: number;
  circuit: {
    fullName: string;
    asset: string;
    laps: number;
    turns: number;
    lengthKm: number;
    distanceKm: number;
    direction: string;
    established: number;
    lapRecord: string;
    lapRecordDriver: string;
  };
  winner: F1ClassificationRow;
  pole: F1ClassificationRow;
  biggestGain: F1ClassificationRow;
  race: F1ClassificationRow[];
  sessions: F1SessionResult[];
  weekendTicks: string[];
  weekendDrivers: F1WeekendDriver[];
};
```

#### `src/domain/matches/report.ts`

**Unchanged.**

```ts
/**
 * The match report — what the STATS tab reads.
 *
 * Every sport's report is the same handful of shapes: one headline number, an
 * intel block, a trace or two, and whichever list that sport keeps (goals,
 * leaders, innings, a box score, a ball-by-ball feed). Keeping them shared
 * means the panels are shared too, and only the tab list changes per sport.
 */

/** The single most interesting number on a report, sized like a hero. */
export type MatchPulse = {
  /** Pre-formatted, so each sport keeps its own unit (68%, 9.4, 161/5). */
  value: string;
  label: string;
  caption: string;
  /** Whose figure it is; the hero takes that side's colour. */
  side: "home" | "away" | "gold";
  /** The state pill beside the sport: LIVE 67', FULL TIME, PRE-MATCH. */
  statusLabel: string;
  /** Movement chip beside the figure. Zero or absent hides it. */
  delta?: number;
  deltaSuffix?: string;
  deltaDecimals?: number;
  subtitle: string;
  metrics: Array<{ label: string; value: string; gold?: boolean }>;
};

/** The competition, the ground, and the handful of facts around them. */
export type MatchIntel = {
  competition: string;
  season: string;
  venue: string;
  attendance?: string;
  facts: Array<{ label: string; value: string }>;
  /** One line on how it finished, once it has. */
  resultNote?: string;
};

/**
 * A two-sided trace: one sample per tick for each side, with the events that
 * happened along it pinned to their sample.
 */
export type MatchTrace = {
  title: string;
  /** What the two series measure, for the scrub readout. */
  unit: string;
  ticks: string[];
  home: number[];
  away: number[];
  markers?: Array<{
    index: number;
    label: string;
    side: "home" | "away";
    /** The one that decided it; the chart's single focal element. */
    decisive?: boolean;
  }>;
};

export type MatchScorer = {
  minute: string;
  player: string;
  side: "home" | "away";
  note: string;
};

export type StatLeader = {
  name: string;
  side: "home" | "away";
  line: string;
  note: string;
};

export type BoxScore = {
  columns: string[];
  rows: Array<{ name: string; side: "home" | "away"; values: string[] }>;
};

/** One batter's line in an innings. */
export type BattingLine = {
  name: string;
  /** How they were out. Absent while they are still in. */
  dismissal?: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
};

/** One bowler's figures in an innings. */
export type BowlingLine = {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
};

export type InningsLine = {
  team: string;
  side: "home" | "away";
  score: string;
  overs: string;
  runRate: string;
  topBat: string;
  topBowl: string;
  /** The card behind the summary: who batted, and who bowled at them. */
  batting: BattingLine[];
  bowling: BowlingLine[];
  /** Named when this innings is a chase. */
  target?: number;
};

export type FeedEvent = {
  marker: string;
  text: string;
  kind: "score" | "wicket" | "note";
  teamId?: string;
};

export type ShotOutcome = "goal" | "saved" | "blocked" | "missed";

export type GoalPlacement = {
  /** Viewer-left convention used by the broadcast feed. */
  x: number;
  y: number;
  label: string;
} | null;

export type MatchShot = {
  id: string;
  minute: number;
  period: 1 | 2;
  side: "home" | "away";
  player: string;
  x: number;
  y: number;
  outcome: ShotOutcome;
  detail: string;
  goalPlacement: GoalPlacement;
};

export type RunRatePoint = {
  over: number;
  actual: number;
  required?: number;
  boundary?: 4 | 6;
  wicket?: boolean;
};

export type MatchPlayerDossier = {
  id: string;
  name: string;
  shortName?: string;
  teamId: string;
  role: string;
  number?: string;
  image?: string;
  stats: Array<{ label: string; value: string }>;
  heatmap?: Array<{ x: number; y: number; intensity: number; period?: 1 | 2 }>;
  inningsTape?: Array<{
    marker: string;
    text: string;
    kind: "score" | "wicket" | "note";
  }>;
};

export type BasketballScoringEvent = {
  id: string;
  period: number;
  clock: string;
  side: "home" | "away";
  player: string;
  text: string;
  made: boolean;
  points: 2 | 3;
  /** ESPN's half-court frame: x runs 0..50 along the baseline. */
  x: number;
  /** Feet out from the rim, increasing toward half court. */
  y: number;
};
```

`MatchDetailData` also lists a match's prediction quizzes, so their type is needed. Nothing here uses the quizzes themselves.

#### `src/domain/predictions/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./quiz";
```

#### `src/domain/predictions/quiz.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export type QuizQuestionType = "multipleChoice" | "exactScore";

/* ---- Questions and quizzes ------------------------------------------------- */

export type QuizQuestion = {
  id: string;
  text: string;
  /** Empty on an exact-score question, which has a picker instead. */
  options: string[];
  type: QuizQuestionType;
  /** XP credited when this question is called correctly. */
  reward: number;
  /** The right option once the fixture is settled. */
  settledOptionIndex?: number;
  /** The real full-time score once settled, on an exact-score question. */
  settledHomeScore?: number;
  settledAwayScore?: number;
  /**
   * Set when a finished fixture cannot support this question. A void question
   * counts as settled — so the quiz as a whole can still be revealed — but is
   * excluded from scoring, in either direction.
   */
  forcedVoid?: boolean;
  /** Art the question is asked over. A URL, so it is content rather than a token. */
  backgroundAsset?: string;
};

export type PredictionQuiz = {
  id: string;
  matchId: string;
  title: string;
  subtitle?: string;
  prizeLabel?: string;
  questions: QuizQuestion[];
  /** Oz to enter as a paid contest. Zero is a free, XP-only quiz. */
  entryFee: number;
};

/* ---- The in-match board ---------------------------------------------------- */

/**
 * One row on a match's prediction board. Identities come from the shared rival
 * roster, so a player reads the same here as on the season leaderboard.
 */
export type MatchPredictionLeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  correct: number;
  /** >0 climbed, <0 dropped, 0 held. */
  movement: number;
  badge?: string;
  isUser: boolean;
  isNew: boolean;
};
```

## Step 5: the match data

The page calls two functions from `@/mocks/matches`: `matchById(id)` returns the fixture, and `matchDetailFor(match)` returns its data.

### Fixtures

`definitions.ts` holds the leagues and two small builders. Each sport's file lists its two sides and its one fixture.

A team has four colours: `color` and `secondaryColor` for the crest, `badgeTextColor` for the letters on it, and `secondaryTextColor` for text and bars drawn on the dark background. The reports use the last one wherever it is set.

#### `src/mocks/matches/definitions.ts`

**Adapted.** The league list holds the four leagues used here. The runtime lookup in StatOz's generated team-palette file is removed, and `team()` takes the fourth colour, `secondaryTextColor`, as an extra argument instead.

```ts
import type { MatchLeague, SportMatch, SportTeam } from "@/domain/matches";
import type { Sport } from "@/domain/sports";

export const matchLeagues: MatchLeague[] = [
  {
    id: "epl",
    sport: "football",
    name: "Premier League",
    shortCode: "EPL",
    accent: "#5cdfff",
  },
  {
    id: "ipl",
    sport: "cricket",
    name: "Indian Premier League",
    shortCode: "IPL",
    accent: "#c27aff",
  },
  {
    id: "nba",
    sport: "basketball",
    name: "NBA",
    shortCode: "NBA",
    accent: "#f42d29",
  },
  {
    id: "f1",
    sport: "motorsport",
    name: "Formula 1",
    shortCode: "F1",
    accent: "#f42d29",
  },
];

export function team(
  id: string,
  name: string,
  shortName: string,
  color: string,
  secondaryColor: string,
  badgeTextColor = "#ffffff",
  secondaryTextColor?: string,
): SportTeam {
  return {
    id,
    name,
    shortName,
    color,
    secondaryColor,
    badgeTextColor,
    secondaryTextColor,
  };
}

type FixtureExtras = Partial<
  Pick<SportMatch, "homeScore" | "awayScore" | "liveMinute" | "resultLine">
> & { tennisSets?: Array<[number, number]> };

export function fixture(
  id: string,
  sport: Sport,
  leagueId: string,
  home: SportTeam,
  away: SportTeam,
  kickoff: string,
  status: SportMatch["status"],
  rewardXp: number,
  volumeOz: number,
  extras: FixtureExtras = {},
): SportMatch {
  const league = matchLeagues.find((candidate) => candidate.id === leagueId);
  if (!league) throw new Error(`Unknown mock league: ${leagueId}`);
  return {
    id,
    sport,
    leagueId,
    leagueLabel: league.shortCode,
    home,
    away,
    kickoff,
    status,
    rewardXp,
    volumeOz,
    homeScore: extras.homeScore,
    awayScore: extras.awayScore,
    liveMinute: extras.liveMinute,
    resultLine: extras.resultLine,
    tennisSets: extras.tennisSets?.map(([homeScore, awayScore]) => ({
      homeScore,
      awayScore,
    })),
  };
}
```

#### `src/mocks/matches/football.ts`

**Adapted.** StatOz lists every fixture of the sport here. This keeps the one with recorded data, with the team colours StatOz's palette lookup produces written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  fulham: team(
    "370",
    "Fulham",
    "FUL",
    "#000000",
    "#ffffff",
    "#ffffff",
    "#ffffff",
  ),
  chelsea: team(
    "363",
    "Chelsea",
    "CHE",
    "#034694",
    "#ffffff",
    "#ffffff",
    "#3390fb",
  ),
};
export const footballFixtures: SportMatch[] = [
  fixture(
    "401879318",
    "football",
    "epl",
    teams.fulham,
    teams.chelsea,
    "2026-08-24T19:00:00.000Z",
    "finished",
    160,
    98600,
    { homeScore: 2, awayScore: 3 },
  ),
];
```

#### `src/mocks/matches/cricket.ts`

**Adapted.** StatOz lists every fixture of the sport here. This keeps the one with recorded data, with the team colours StatOz's palette lookup produces written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  bengaluru: team(
    "335970",
    "Royal Challengers Bengaluru",
    "RCB",
    "#a50000",
    "#1f0000",
    "#ffffff",
    "#ff4f4f",
  ),
  gujarat: team(
    "1298769",
    "Gujarat Titans",
    "GT",
    "#2f3b6f",
    "#bfa14a",
    "#ffffff",
    "#bfa14a",
  ),
};
export const cricketFixtures: SportMatch[] = [
  fixture(
    "1535465",
    "cricket",
    "ipl",
    teams.bengaluru,
    teams.gujarat,
    "2026-05-31T14:00:00.000Z",
    "finished",
    160,
    92700,
    {
      homeScore: "161/5 (18/20 ov, target 156)",
      awayScore: "155/8 (20 ov)",
      resultLine: "RCB won by 5 wickets (12 balls remaining)",
    },
  ),
];
```

#### `src/mocks/matches/basketball.ts`

**Adapted.** StatOz lists every fixture of the sport here. This keeps the one with recorded data, with the team colours StatOz's palette lookup produces written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  spurs: team(
    "24",
    "San Antonio Spurs",
    "SA",
    "#000000",
    "#c4ced4",
    "#ffffff",
    "#c4ced4",
  ),
  knicks: team(
    "18",
    "New York Knicks",
    "NY",
    "#006bb6",
    "#f58426",
    "#ffffff",
    "#f58426",
  ),
};
export const basketballFixtures: SportMatch[] = [
  fixture(
    "basketball-revamp-20260614-ny-sa",
    "basketball",
    "nba",
    teams.spurs,
    teams.knicks,
    "2026-06-14T00:30:00.000Z",
    "finished",
    120,
    91800,
    { homeScore: 90, awayScore: 94, resultLine: "New York Knicks won 94-90" },
  ),
];
```

#### `src/mocks/matches/motorsport.ts`

**Adapted.** StatOz lists every fixture of the sport here. This keeps the one with recorded data, with the team colours StatOz's palette lookup produces written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  f1Italy: team(
    "formula-1-italy",
    "Italian Grand Prix",
    "F1",
    "#e10600",
    "#009246",
  ),
  field: team("race-field", "Race Field", "GRID", "#314158", "#90a1b9"),
};
export const motorsportFixtures: SportMatch[] = [
  fixture(
    "600057442",
    "motorsport",
    "f1",
    teams.f1Italy,
    teams.field,
    "2026-09-06T13:00:00.000Z",
    "finished",
    200,
    201000,
    {
      homeScore: "P1",
      awayScore: "53 LAPS",
      resultLine: "P1 : Kimi Antonelli",
    },
  ),
];
```

#### `src/mocks/matches/catalog.ts`

**Adapted.** The fixture list leaves out tennis, which has no recorded report.

```ts
import type { SportMatch } from "@/domain/matches";

import { basketballFixtures } from "./basketball";
import { cricketFixtures } from "./cricket";
import { footballFixtures } from "./football";
import { motorsportFixtures } from "./motorsport";

/** Stable reading order for the sport feed and static match routes. */
export const sportFixtures: SportMatch[] = [
  ...footballFixtures,
  ...cricketFixtures,
  ...basketballFixtures,
  ...motorsportFixtures,
];

const matchIndex = new Map(sportFixtures.map((match) => [match.id, match]));
export const allMockMatchIds = sportFixtures.map((match) => match.id);
export function matchById(id: string): SportMatch | undefined {
  return matchIndex.get(id);
}
```

### Reports

`matchDetailFor` works in two passes. `buildMatchDetail` first generates a report from the match id, which is what StatOz shows for a fixture with no recorded data. Then the sport's snapshot replaces it: `applyFootballSnapshot`, `applyCricketSnapshot` and `applyBasketballSnapshot` each fill in their sport's fields, and the Italian Grand Prix gets `italianGpReport` as its `race`. For the four fixtures here, everything the reports show comes from the snapshots.

`report.ts` and `tennis.ts` are StatOz's whole files and still mention tennis, which `index.ts` needs in order to compile. No tennis fixture exists here.

**Copy the four snapshot files listed in step 9** to `src/mocks/snapshots/card-game/`.

#### `src/mocks/matches/details/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type { MatchDetailData, SportMatch } from "@/domain/matches";

import { basketballDetail } from "./basketball";
import { cricketDetail } from "./cricket";
import { footballDetail } from "./football";
import { motorsportDetail } from "./motorsport";
import { buildMatchDetail } from "./shared";
import { tennisDetail } from "./tennis";
import { italianGpReport } from "./f1";
import { applyFootballSnapshot } from "./football-snapshot";
import { applyCricketSnapshot } from "./cricket-snapshot";
import { applyBasketballSnapshot } from "./basketball-snapshot";

const detailBySport = {
  football: footballDetail,
  cricket: cricketDetail,
  basketball: basketballDetail,
  tennis: tennisDetail,
  motorsport: motorsportDetail,
};
export function matchDetailFor(match: SportMatch): MatchDetailData {
  const detail = buildMatchDetail(match, detailBySport[match.sport]);
  applyFootballSnapshot(match, detail.scoreboard);
  applyCricketSnapshot(match, detail.scoreboard);
  applyBasketballSnapshot(match, detail.scoreboard);
  if (match.id === italianGpReport.id) detail.scoreboard.race = italianGpReport;
  return detail;
}
```

#### `src/mocks/matches/details/shared.ts`

**Adapted.** StatOz also builds the fixture's quizzes and leaderboards here, for the PREDICT and TOPS tabs. This returns them empty.

```ts
import type {
  MatchDetailData,
  MatchDetailLineup,
  MatchDetailScoreboard,
  SportMatch,
} from "@/domain/matches";
import { formatKickoffDate, formatKickoffTime } from "@/shared/utils";

import { buildReport } from "./report";

export type DetailConfig = {
  lineup: { formation: string; roles: string[] };
  statLabels: string[];
  scoreRows: (
    match: SportMatch,
    seed: number,
  ) => MatchDetailScoreboard["scoreRows"];
  motorsport?: boolean;
  sessions?: MatchDetailScoreboard["sessions"];
  driverStandings?: string[];
};

export function buildMatchDetail(
  match: SportMatch,
  config: DetailConfig,
): MatchDetailData {
  const seed = stableSeed(`${match.id}:scoreboard`);
  const stats = config.statLabels.map((label, index) =>
    statFor(label, seed, index),
  );
  const scoreRows = config.scoreRows(match, seed);
  const report = buildReport({ match, seed, stats, scoreRows });

  return {
    quizzes: [],
    leaderboard: {},
    scoreboard: {
      facts: [
        {
          label: "STATUS",
          value:
            match.status === "live"
              ? `LIVE ${match.liveMinute ?? ""}`.trim()
              : match.status === "finished"
                ? "FULL TIME"
                : "PRE-MATCH",
        },
        {
          label: "KICKOFF",
          value: `${formatKickoffDate(match.kickoff)} · ${formatKickoffTime(match.kickoff)}`,
        },
        { label: "LEAGUE", value: match.leagueId.toUpperCase() },
        { label: "SPORT", value: match.sport.toUpperCase() },
      ],
      stats,
      timeline: timelineFor(match, config.motorsport === true),
      commentary: commentaryFor(match, config.motorsport === true),
      homeLineup: lineupFor(match.home.name, config.lineup, seed),
      awayLineup: lineupFor(match.away.name, config.lineup, seed + 19),
      scoreRows,
      sessions: config.sessions,
      driverStandings: config.driverStandings,
      ...report,
    },
  };
}

function statFor(label: string, seed: number, index: number) {
  const homeValue = 36 + ((seed + index * 11) % 45);
  const awayValue = 35 + ((seed + index * 17) % 44);
  return {
    label,
    home: String(homeValue),
    away: String(awayValue),
    homeValue,
    awayValue,
  };
}

const lineupNames = [
  "Mason",
  "Jordan",
  "Alex",
  "Riley",
  "Taylor",
  "Morgan",
  "Casey",
  "Cameron",
  "Jamie",
  "Avery",
  "Drew",
  "Quinn",
  "Reese",
  "Sage",
  "Blake",
  "Emery",
  "Rowan",
];

/** The bench roles a squad carries behind whatever it starts with. */
const benchRoles = ["GK", "DF", "DF", "MF", "MF", "FW"];

function lineupFor(
  team: string,
  config: DetailConfig["lineup"],
  seed: number,
): MatchDetailLineup {
  const prefix = team.split(" ")[0];
  const player = (role: string, index: number) => ({
    name: `${prefix} ${lineupNames[index % lineupNames.length]}`,
    number: 1 + ((seed + index * 7) % 45),
    role,
    captain: index === 2,
  });
  return {
    formation: config.formation,
    players: config.roles.map(player),
    substitutes: benchRoles.map((role, index) =>
      player(role, config.roles.length + index),
    ),
    // A fixture still to start is a projection; once it is under way the sheet
    // is what the teams actually named.
    confirmed: seed % 3 !== 0,
  };
}

function timelineFor(match: SportMatch, motorsport: boolean) {
  if (match.status === "scheduled") return [];
  if (motorsport) {
    return [
      {
        minute: "LAP 12",
        side: "home" as const,
        type: "score" as const,
        player: "Fastest lap posted",
      },
      {
        minute: "LAP 27",
        side: "away" as const,
        type: "substitution" as const,
        player: "Pit window opens",
      },
    ];
  }
  return [
    {
      minute: "18'",
      side: "home" as const,
      type: "goal" as const,
      player: match.home.name,
    },
    {
      minute: "34'",
      side: "away" as const,
      type: "yellow" as const,
      player: match.away.name,
    },
    {
      minute: "67'",
      side: "home" as const,
      type: "substitution" as const,
      player: "Impact substitute",
      secondary: "Tactical change",
    },
  ];
}

function commentaryFor(match: SportMatch, motorsport: boolean) {
  if (match.status === "scheduled") return [];
  const first = motorsport ? "LAP 12" : "18'";
  const second = motorsport ? "LAP 27" : "34'";
  return [
    {
      minute: first,
      text: `${match.home.name} take control with a decisive phase of play.`,
    },
    {
      minute: second,
      text: `${match.away.name} respond as the pace of the match rises.`,
    },
    {
      minute: match.status === "live" ? "LIVE" : "FT",
      text:
        match.status === "live"
          ? "Live data remains active as the fixture develops."
          : (match.resultLine ?? "Final match data has been recorded."),
    },
  ];
}

function stableSeed(value: string): number {
  let hash = 17;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return hash;
}
```

#### `src/mocks/matches/details/report.ts`

**Unchanged.**

```ts
import type {
  BattingLine,
  BowlingLine,
  BoxScore,
  FeedEvent,
  InningsLine,
  MatchDetailStat,
  MatchIntel,
  MatchPulse,
  MatchScorer,
  MatchTrace,
  SportMatch,
  StatLeader,
} from "@/domain/matches";

import { matchLeagues } from "../definitions";

/**
 * The demo match report behind the STATS tab.
 *
 * The app reads a live provider package per sport; the web has fixtures, so
 * every figure here is either read straight off the fixture or expanded from
 * its seed. That keeps a report stable between renders and consistent with the
 * scoreline it sits under — a trace never disagrees with the final score.
 */

const venues: Record<
  string,
  { venue: string; city: string; country: string; capacity: number }
> = {
  epl: {
    venue: "Stamford Bridge",
    city: "London",
    country: "England",
    capacity: 40173,
  },
  fifa: {
    venue: "MetLife Stadium",
    city: "East Rutherford",
    country: "USA",
    capacity: 82500,
  },
  ipl: {
    venue: "Wankhede Stadium",
    city: "Mumbai",
    country: "India",
    capacity: 33108,
  },
  t20i: {
    venue: "Melbourne Cricket Ground",
    city: "Melbourne",
    country: "Australia",
    capacity: 100024,
  },
  wnba: {
    venue: "College Park Center",
    city: "Arlington",
    country: "USA",
    capacity: 7000,
  },
  nba: {
    venue: "Crypto.com Arena",
    city: "Los Angeles",
    country: "USA",
    capacity: 19068,
  },
  wimbledon: {
    venue: "Centre Court",
    city: "London",
    country: "England",
    capacity: 14979,
  },
  atp: {
    venue: "Court Philippe-Chatrier",
    city: "Paris",
    country: "France",
    capacity: 15225,
  },
  wta: {
    venue: "Court Philippe-Chatrier",
    city: "Paris",
    country: "France",
    capacity: 15225,
  },
  f1: {
    venue: "Circuit de Spa-Francorchamps",
    city: "Stavelot",
    country: "Belgium",
    capacity: 70000,
  },
  indy: {
    venue: "World Wide Technology Raceway",
    city: "Madison",
    country: "USA",
    capacity: 62000,
  },
};

const seasons: Record<string, string> = {
  epl: "Premier League 2026/27",
  fifa: "FIFA World Cup 2026",
  ipl: "Indian Premier League 2026",
  t20i: "T20 International Series 2026",
  wnba: "WNBA 2026 Regular Season",
  nba: "NBA 2026/27 Regular Season",
  wimbledon: "Wimbledon 2026",
  atp: "ATP Tour 2026",
  wta: "WTA Tour 2026",
  f1: "FIA Formula One World Championship 2026",
  indy: "IndyCar Series 2026",
};

export type ReportInput = {
  match: SportMatch;
  seed: number;
  stats: MatchDetailStat[];
  scoreRows: Array<{ label: string; home: string; away: string }>;
};

export type MatchReport = {
  pulse: MatchPulse;
  intel: MatchIntel;
  trace?: MatchTrace;
  chase?: MatchTrace;
  scorers?: MatchScorer[];
  leaders?: StatLeader[];
  boxScore?: BoxScore;
  innings?: InningsLine[];
  feed?: FeedEvent[];
};

export function buildReport(input: ReportInput): MatchReport {
  switch (input.match.sport) {
    case "football":
      return footballReport(input);
    case "basketball":
      return basketballReport(input);
    case "cricket":
      return cricketReport(input);
    case "tennis":
      return tennisReport(input);
    case "motorsport":
      return motorsportReport(input);
  }
}

/* ---- Shared pieces --------------------------------------------------------- */

function statusLabel(match: SportMatch): string {
  if (match.status === "live")
    return match.liveMinute != null ? `LIVE ${match.liveMinute}'` : "LIVE";
  return match.status === "finished" ? "FULL TIME" : "PRE-MATCH";
}

function leagueName(match: SportMatch): string {
  return (
    matchLeagues.find((league) => league.id === match.leagueId)?.name ??
    match.leagueId.toUpperCase()
  );
}

function ground(match: SportMatch) {
  return (
    venues[match.leagueId] ?? {
      venue: "Venue awaiting feed",
      city: "—",
      country: "—",
      capacity: 0,
    }
  );
}

function intelFor(
  match: SportMatch,
  seed: number,
  extra: Array<{ label: string; value: string }> = [],
): MatchIntel {
  const place = ground(match);
  const attendance =
    match.status === "scheduled" || place.capacity === 0
      ? undefined
      : compact(Math.round(place.capacity * (0.82 + (seed % 17) / 100)));
  return {
    competition: leagueName(match),
    season: seasons[match.leagueId] ?? "Live competition feed",
    venue: `${place.venue} // ${place.city}, ${place.country}`,
    attendance,
    facts: [{ label: "STATUS", value: statusLabel(match) }, ...extra],
    resultNote: match.resultLine,
  };
}

/** The 24-hour clock label a report heads its kickoff metric with. */
function clockLabel(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function compact(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

/** A stable pseudo-random walk, so a trace looks played rather than drawn. */
function walk(
  seed: number,
  length: number,
  start: number,
  swing: number,
): number[] {
  const out: number[] = [];
  let value = start;
  let state = seed | 0;
  for (let index = 0; index < length; index += 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    value += ((state % 1000) / 1000 - 0.5) * swing;
    out.push(Math.round(Math.max(0, value) * 10) / 10);
  }
  return out;
}

/**
 * A cumulative run curve that lands exactly on `total`.
 *
 * A straight line between 0 and the final score is not a worm — the shape is
 * the point. Overs are weighted so the powerplay and the death carry more than
 * the middle, then jittered from the seed and normalised back onto the total.
 */
function runCurve(total: number, overs: number, seed: number): number[] {
  const weights: number[] = [];
  let state = seed | 0;
  for (let over = 0; over < overs; over += 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const phase = over < 6 ? 1.25 : over >= overs - 5 ? 1.4 : 0.85;
    weights.push(phase * (0.6 + (state % 1000) / 1250));
  }
  const sum = weights.reduce((carry, weight) => carry + weight, 0) || 1;
  let running = 0;
  return weights.map((weight, index) => {
    running += (weight / sum) * total;
    return index === overs - 1 ? total : Math.round(running);
  });
}

const firstNames = [
  "Mason",
  "Jordan",
  "Alex",
  "Riley",
  "Taylor",
  "Morgan",
  "Casey",
  "Cameron",
  "Jamie",
  "Avery",
  "Drew",
];

function player(team: string, seed: number, offset: number): string {
  return `${team.split(" ")[0]} ${firstNames[(seed + offset) % firstNames.length]}`;
}

/* ---- Football -------------------------------------------------------------- */

function footballReport({ match, seed, stats }: ReportInput): MatchReport {
  const possession = stats[0] ?? {
    label: "POSSESSION",
    homeValue: 50,
    awayValue: 50,
    home: "50",
    away: "50",
  };
  const total = possession.homeValue + possession.awayValue || 1;
  const homeShare = Math.round((possession.homeValue / total) * 100);
  const homeLeads = homeShare >= 50;
  const homeScore = Number(match.homeScore ?? 0);
  const awayScore = Number(match.awayScore ?? 0);

  const ticks = Array.from({ length: 19 }, (_, index) => `${index * 5}'`);
  const trace: MatchTrace = {
    title: "TERRITORIAL PRESSURE",
    unit: "PRESSURE",
    ticks,
    home: walk(seed, ticks.length, 52, 26),
    away: walk(seed + 977, ticks.length, 48, 26),
    markers: [],
  };

  const scorers: MatchScorer[] = [];
  if (match.status !== "scheduled") {
    const minutes = [12, 27, 38, 54, 63, 71, 78, 84, 90];
    let cursor = 0;
    for (let goal = 0; goal < homeScore; goal += 1) {
      const minute = minutes[(seed + cursor * 3) % minutes.length];
      scorers.push({
        minute: `${minute}'`,
        player: player(match.home.name, seed, goal),
        side: "home",
        note: goal === 0 ? "Opened the scoring" : "Assisted",
      });
      cursor += 1;
    }
    for (let goal = 0; goal < awayScore; goal += 1) {
      const minute = minutes[(seed + cursor * 5) % minutes.length];
      scorers.push({
        minute: `${minute}'`,
        player: player(match.away.name, seed, goal + 4),
        side: "away",
        note: "From open play",
      });
      cursor += 1;
    }
    scorers.sort(
      (a, b) => Number.parseInt(a.minute, 10) - Number.parseInt(b.minute, 10),
    );
    trace.markers = scorers.map((scorer, index) => ({
      index: Math.min(
        ticks.length - 1,
        Math.round(Number.parseInt(scorer.minute, 10) / 5),
      ),
      label: `${scorer.player} ${scorer.minute}`,
      side: scorer.side,
      decisive: index === scorers.length - 1,
    }));
  }

  return {
    pulse: {
      value: `${homeLeads ? homeShare : 100 - homeShare}%`,
      label: `${homeLeads ? match.home.shortName : match.away.shortName} CONTROL`,
      caption: "SHARE OF POSSESSION",
      side: homeLeads ? "home" : "away",
      statusLabel: statusLabel(match),
      delta:
        match.status === "live"
          ? Math.round((homeShare - 50) * 10) / 10
          : undefined,
      deltaSuffix: "PRESSURE",
      deltaDecimals: 1,
      subtitle: seasons[match.leagueId] ?? "Live competition feed",
      metrics: [
        {
          label: "SCORE",
          value: `${match.homeScore ?? "-"} - ${match.awayScore ?? "-"}`,
        },
        { label: "KICKOFF", value: clockLabel(match.kickoff) },
      ],
    },
    intel: intelFor(match, seed, [
      {
        label: "SHOTS",
        value: `${stats[1]?.home ?? "—"} - ${stats[1]?.away ?? "—"}`,
      },
      {
        label: "ON TARGET",
        value: `${stats[2]?.home ?? "—"} - ${stats[2]?.away ?? "—"}`,
      },
    ]),
    trace,
    scorers,
  };
}

/* ---- Basketball ------------------------------------------------------------ */

function basketballReport({
  match,
  seed,
  scoreRows,
}: ReportInput): MatchReport {
  const homeScore = Number(match.homeScore ?? 0);
  const awayScore = Number(match.awayScore ?? 0);
  const margin = homeScore - awayScore;
  const homeFavoured = margin >= 0;
  const probability =
    match.status === "scheduled"
      ? 50 + ((seed % 13) - 6)
      : Math.min(97, Math.max(3, 50 + margin * 3));

  const ticks = ["Q1", "Q1", "Q2", "Q2", "HT", "Q3", "Q3", "Q4", "Q4", "FIN"];
  const home = walk(seed, ticks.length, 50, 18).map((value) =>
    Math.min(97, Math.max(3, value)),
  );
  const trace: MatchTrace = {
    title: "WIN PROBABILITY",
    unit: "%",
    ticks,
    home: [
      ...home.slice(0, -1),
      homeFavoured ? probability : 100 - probability,
    ],
    away: [
      ...home.slice(0, -1).map((value) => 100 - value),
      homeFavoured ? 100 - probability : probability,
    ],
  };

  const leaders: StatLeader[] = [
    {
      name: player(match.home.name, seed, 1),
      side: "home",
      line: `${18 + (seed % 11)} PTS`,
      note: `${4 + (seed % 5)} REB · ${3 + (seed % 4)} AST`,
    },
    {
      name: player(match.away.name, seed, 2),
      side: "away",
      line: `${16 + ((seed >> 2) % 12)} PTS`,
      note: `${5 + (seed % 4)} REB · ${2 + (seed % 6)} AST`,
    },
    {
      name: player(match.home.name, seed, 5),
      side: "home",
      line: `${9 + (seed % 7)} AST`,
      note: "Playmaker of the night",
    },
  ];

  const boxScore: BoxScore = {
    columns: ["MIN", "PTS", "REB", "AST"],
    rows: Array.from({ length: 8 }, (_, index) => {
      const side = index < 4 ? ("home" as const) : ("away" as const);
      const team = side === "home" ? match.home.name : match.away.name;
      return {
        name: player(team, seed, index),
        side,
        values: [
          String(22 + ((seed + index * 3) % 16)),
          String(6 + ((seed + index * 7) % 18)),
          String(1 + ((seed + index * 5) % 9)),
          String((seed + index * 11) % 8),
        ],
      };
    }),
  };

  return {
    pulse: {
      value: `${Math.round(probability)}%`,
      label: `${homeFavoured ? match.home.shortName : match.away.shortName} WIN CHANCE`,
      caption:
        match.status === "finished" ? "FINAL MODEL READ" : "LIVE MODEL READ",
      side: homeFavoured ? "home" : "away",
      statusLabel: statusLabel(match),
      delta: match.status === "live" ? margin : undefined,
      deltaSuffix: "MARGIN",
      subtitle: seasons[match.leagueId] ?? "Live competition feed",
      metrics: [
        {
          label: "SCORE",
          value: `${match.homeScore ?? "-"} - ${match.awayScore ?? "-"}`,
        },
        { label: "PERIOD", value: scoreRows.at(-1)?.label ?? "—" },
      ],
    },
    intel: intelFor(match, seed, [
      {
        label: "MARGIN",
        value: match.status === "scheduled" ? "—" : `${Math.abs(margin)} PTS`,
      },
      { label: "PACE", value: `${92 + (seed % 14)} POSS` },
    ]),
    trace,
    leaders,
    boxScore,
  };
}

/* ---- Cricket --------------------------------------------------------------- */

function parseInnings(
  score: SportMatch["homeScore"],
): { runs: number; wickets: number; overs: number } | null {
  if (typeof score !== "string") return null;
  const parsed = /^(\d+)\/(\d+)(?:\s*\(([\d.]+)\s*ov\))?/.exec(score.trim());
  if (!parsed) return null;
  return {
    runs: Number(parsed[1]),
    wickets: Number(parsed[2]),
    overs: Number(parsed[3] ?? 20),
  };
}

const dismissals = [
  "c & b",
  "b",
  "lbw",
  "c keeper b",
  "run out",
  "st keeper b",
  "c mid-on b",
];

/**
 * The batting card behind an innings summary: the wickets that fell, in order,
 * then whoever is still in. Runs are dealt down from the innings total so the
 * card always adds up to the score above it.
 */
function battingCard(
  batting: string,
  bowling: string,
  seed: number,
  runs: number,
  wickets: number,
): BattingLine[] {
  const out = Math.min(wickets, 9);
  const lines: BattingLine[] = [];
  let left = runs;
  const count = Math.min(out + 2, 11);
  for (let index = 0; index < count; index += 1) {
    const last = index === count - 1;
    const share = last
      ? left
      : Math.max(1, Math.round((left * (3 + ((seed + index * 7) % 5))) / 14));
    const scored = Math.max(0, Math.min(left, share));
    left -= scored;
    lines.push({
      name: player(batting, seed, index + 1),
      dismissal:
        index < out
          ? `${dismissals[(seed + index) % dismissals.length]} ${player(bowling, seed, (index % 4) + 1)}`
          : undefined,
      runs: scored,
      balls: Math.max(1, scored + ((seed + index * 5) % 9) - 3),
      fours: Math.floor(scored / 9),
      sixes: Math.floor(scored / 22),
    });
  }
  return lines;
}

/** Four bowlers, sharing the wickets that fell. */
function bowlingCard(
  bowling: string,
  seed: number,
  runs: number,
  wickets: number,
): BowlingLine[] {
  return Array.from({ length: 4 }, (_, index) => ({
    name: player(bowling, seed, index + 1),
    overs: `${3 + ((seed + index) % 2)}.${(seed + index) % 6}`,
    maidens: (seed + index) % 3 === 0 ? 1 : 0,
    runs: Math.max(6, Math.round(runs / 4) + ((seed + index * 3) % 11) - 5),
    wickets: index < wickets % 4 ? 1 + ((seed + index) % 2) : 0,
  }));
}

function cricketReport({ match, seed }: ReportInput): MatchReport {
  const home = parseInnings(match.homeScore);
  const away = parseInnings(match.awayScore);
  const chasing = home && away && away.runs < home.runs ? "away" : "home";
  const target = home && away ? Math.max(home.runs, away.runs) + 1 : 0;

  const innings: InningsLine[] = [];
  if (home) {
    innings.push({
      team: match.home.name,
      side: "home",
      score: `${home.runs}/${home.wickets}`,
      overs: `${home.overs} ov`,
      runRate: (home.runs / Math.max(1, home.overs)).toFixed(2),
      topBat: `${player(match.home.name, seed, 1)} ${38 + (seed % 30)}`,
      topBowl: `${player(match.away.name, seed, 3)} ${2 + (seed % 3)}/${18 + (seed % 14)}`,
      batting: battingCard(
        match.home.name,
        match.away.name,
        seed,
        home.runs,
        home.wickets,
      ),
      bowling: bowlingCard(match.away.name, seed, home.runs, home.wickets),
    });
  }
  if (away) {
    innings.push({
      team: match.away.name,
      side: "away",
      score: `${away.runs}/${away.wickets}`,
      overs: `${away.overs} ov`,
      runRate: (away.runs / Math.max(1, away.overs)).toFixed(2),
      topBat: `${player(match.away.name, seed, 2)} ${31 + (seed % 26)}`,
      topBowl: `${player(match.home.name, seed, 4)} ${2 + ((seed >> 1) % 3)}/${16 + (seed % 17)}`,
      batting: battingCard(
        match.away.name,
        match.home.name,
        seed + 5,
        away.runs,
        away.wickets,
      ),
      bowling: bowlingCard(match.home.name, seed + 5, away.runs, away.wickets),
      // The side batting second is chasing whatever the first innings set.
      target: home ? home.runs + 1 : undefined,
    });
  }

  const overs = Array.from({ length: 20 }, (_, index) => `${index + 1}`);
  const homeCurve = runCurve(home?.runs ?? 150, overs.length, seed);
  const awayCurve = runCurve(away?.runs ?? 140, overs.length, seed + 613);
  const trace: MatchTrace = {
    title: "RUN RACE",
    unit: "RUNS",
    ticks: overs,
    home: homeCurve,
    away: awayCurve,
    markers: home
      ? Array.from({ length: Math.min(4, home.wickets) }, (_, index) => ({
          index: 3 + ((seed + index * 4) % 15),
          label: `Wicket ${index + 1}`,
          side: "home" as const,
          decisive: index === Math.min(4, home.wickets) - 1,
        }))
      : [],
  };

  const chase: MatchTrace = {
    title: "CHASE VS REQUIRED",
    unit: "RUN RATE",
    ticks: overs,
    // What the chase was actually scoring at, over by over.
    home: awayCurve.map(
      (runs, index) => Math.round((runs / (index + 1)) * 10) / 10,
    ),
    // And what it needed from there — the two lines crossing is the story.
    away: awayCurve.map((runs, index) => {
      const remaining = Math.max(1, overs.length - index - 1);
      return Math.round((Math.max(0, target - runs) / remaining) * 10) / 10;
    }),
  };

  const feed: FeedEvent[] = Array.from({ length: 8 }, (_, index) => {
    const over = 20 - index;
    const runs = (seed + index * 7) % 7;
    const wicket = runs === 5;
    return {
      marker: `${over}.${(index % 6) + 1}`,
      text: wicket
        ? `${player(match.away.name, seed, index)} b ${player(match.home.name, seed, index + 2)}`
        : `${runs} run${runs === 1 ? "" : "s"} to ${player(match.away.name, seed, index)}`,
      kind: wicket ? "wicket" : runs >= 4 ? "score" : "note",
    };
  });

  const chaseRate =
    away && chasing === "away"
      ? away.runs / Math.max(1, away.overs)
      : home
        ? home.runs / Math.max(1, home.overs)
        : 0;

  return {
    pulse: {
      // The hero is the innings itself — runs for wickets, without the overs,
      // which ride the caption instead.
      value:
        chasing === "away" && away
          ? `${away.runs}/${away.wickets}`
          : home
            ? `${home.runs}/${home.wickets}`
            : "—",
      label: `${chasing === "away" ? match.away.shortName : match.home.shortName} INNINGS`,
      caption: target > 0 ? `CHASING ${target}` : "FIRST INNINGS",
      side: chasing,
      statusLabel: statusLabel(match),
      delta: Math.round(chaseRate * 100) / 100,
      deltaSuffix: "RUN RATE",
      deltaDecimals: 2,
      subtitle: seasons[match.leagueId] ?? "Live competition feed",
      metrics: [
        { label: "FORMAT", value: "T20" },
        {
          label: "TARGET",
          value: target > 0 ? String(target) : "—",
          gold: true,
        },
      ],
    },
    intel: intelFor(match, seed, [
      { label: "TOSS", value: `${match.home.shortName} chose to bat` },
      { label: "SITE", value: "HOME" },
    ]),
    trace,
    chase,
    innings,
    feed,
  };
}

/* ---- Tennis ---------------------------------------------------------------- */

function tennisReport({ match, seed, stats }: ReportInput): MatchReport {
  const sets = match.tennisSets ?? [];
  const homeSets = sets.filter((set) => set.homeScore > set.awayScore).length;
  const awaySets = sets.length - homeSets;
  const homeLeads = homeSets >= awaySets;

  const ticks =
    sets.length > 0
      ? sets.map((_, index) => `SET ${index + 1}`)
      : ["SET 1", "SET 2", "SET 3"];
  return {
    pulse: {
      value: sets.length > 0 ? `${homeSets}-${awaySets}` : "0-0",
      label: `${homeLeads ? match.home.shortName : match.away.shortName} SETS`,
      caption: match.status === "finished" ? "MATCH COMPLETE" : "SETS WON",
      side: homeLeads ? "home" : "away",
      statusLabel: statusLabel(match),
      subtitle: seasons[match.leagueId] ?? "Live competition feed",
      metrics: [
        {
          label: "GAMES",
          value: `${sets.reduce((sum, set) => sum + set.homeScore, 0)} - ${sets.reduce((sum, set) => sum + set.awayScore, 0)}`,
        },
        { label: "START", value: clockLabel(match.kickoff) },
      ],
    },
    intel: intelFor(match, seed, [
      {
        label: "ACES",
        value: `${stats[0]?.home ?? "—"} - ${stats[0]?.away ?? "—"}`,
      },
      {
        label: "1ST SERVE",
        value: `${stats[3]?.home ?? "—"}% - ${stats[3]?.away ?? "—"}%`,
      },
    ]),
    trace: {
      title: "GAMES WON BY SET",
      unit: "GAMES",
      ticks,
      home: sets.length > 0 ? sets.map((set) => set.homeScore) : [0, 0, 0],
      away: sets.length > 0 ? sets.map((set) => set.awayScore) : [0, 0, 0],
    },
  };
}

/* ---- Motorsport ------------------------------------------------------------ */

function motorsportReport({ match, seed }: ReportInput): MatchReport {
  const laps = 44 + (seed % 20);
  return {
    pulse: {
      value: match.status === "scheduled" ? "P1" : "1:12.844",
      label: match.status === "scheduled" ? "POLE SITTER" : "FASTEST LAP",
      caption: match.home.name.toUpperCase(),
      side: "gold",
      statusLabel: statusLabel(match),
      subtitle: seasons[match.leagueId] ?? "Live competition feed",
      metrics: [
        { label: "LAPS", value: String(laps) },
        { label: "LIGHTS OUT", value: clockLabel(match.kickoff) },
      ],
    },
    intel: intelFor(match, seed, [
      { label: "LAPS", value: String(laps) },
      {
        label: "PIT WINDOW",
        value: `LAP ${18 + (seed % 8)}-${26 + (seed % 8)}`,
      },
    ]),
  };
}
```

#### `src/mocks/matches/details/basketball-snapshot.ts`

**Unchanged.**

```ts
import type {
  BasketballScoringEvent,
  MatchDetailScoreboard,
  SportMatch,
} from "@/domain/matches";

import snapshot from "../../snapshots/card-game/basketball-revamp.json";

const fixtureId = "basketball-revamp-20260614-ny-sa";
const shown = (value: number, percentage = false) =>
  `${Number.isInteger(value) ? value : value.toFixed(1)}${percentage ? "%" : ""}`;

function scoringEvents(): BasketballScoringEvent[] {
  return snapshot.playByPlay
    .filter(
      (play) =>
        play.shootingPlay &&
        play.coordinate &&
        (play.points === 2 || play.points === 3),
    )
    .map((play) => ({
      id: play.id,
      period: play.period,
      clock: play.clock,
      side: play.side === "home" ? "home" : "away",
      player: play.players[0] ?? "Unknown player",
      text: play.text,
      made: play.made,
      points: play.points as 2 | 3,
      x: play.coordinate!.x,
      y: play.coordinate!.y,
    }));
}

export function applyBasketballSnapshot(
  match: SportMatch,
  scoreboard: MatchDetailScoreboard,
): void {
  if (match.id !== fixtureId) return;
  scoreboard.intel = {
    competition: `${snapshot.matchDetails.league} // ${snapshot.matchDetails.gameNote}`,
    season: String(snapshot.matchDetails.season),
    venue: snapshot.matchDetails.location.venue,
    attendance: snapshot.matchDetails.attendance.toLocaleString("en-US"),
    facts: [
      { label: "BROADCAST", value: snapshot.matchDetails.broadcast },
      {
        label: "SERIES",
        value: snapshot.matchDetails.series.at(-1)?.summary ?? "—",
      },
    ],
    resultNote: `${snapshot.matchDetails.score.winner} won ${snapshot.matchDetails.score.away.score}-${snapshot.matchDetails.score.home.score}`,
  };
  scoreboard.stats = snapshot.topStats
    .filter((stat) => stat.available)
    .map((stat) => ({
      label: stat.label.toUpperCase(),
      home: shown(stat.home, stat.name.toLowerCase().includes("pct")),
      away: shown(stat.away, stat.name.toLowerCase().includes("pct")),
      homeValue: stat.home,
      awayValue: stat.away,
    }));
  scoreboard.scoreRows = snapshot.matchDetails.periods.map((period) => ({
    label: period.label,
    home: String(period.home),
    away: String(period.away),
  }));
  scoreboard.trace = {
    title: "SCORE RACE",
    unit: "POINTS",
    ticks: snapshot.playByPlay.map((play) => `Q${play.period} ${play.clock}`),
    home: snapshot.playByPlay.map((play) => play.homeScore),
    away: snapshot.playByPlay.map((play) => play.awayScore),
    markers: snapshot.turningPoints.map((turn) => {
      const index = Math.max(
        0,
        snapshot.playByPlay.findIndex((play) => play.id === turn.playId),
      );
      return {
        index,
        label: turn.text,
        side: turn.swing >= 0 ? ("home" as const) : ("away" as const),
        decisive: turn === snapshot.turningPoints.at(-1),
      };
    }),
  };
  scoreboard.timeline = snapshot.turningPoints.map((turn) => ({
    minute: `Q${turn.period} ${turn.clock}`,
    side: turn.swing >= 0 ? "home" : "away",
    type: "score",
    player: `${turn.homeScore}-${turn.awayScore}`,
    secondary: turn.text,
  }));
  scoreboard.commentary = snapshot.playByPlay.map((play) => ({
    minute: `Q${play.period} ${play.clock}`,
    text: play.text,
  }));
  scoreboard.leaders = snapshot.matchDetails.leaders.flatMap((group) =>
    group.leaders.map((leader) => ({
      name: leader.name,
      side:
        group.teamId === match.home.id ? ("home" as const) : ("away" as const),
      line: String(leader.value),
      note: leader.label.toUpperCase(),
    })),
  );
  scoreboard.boxScore = {
    columns: [
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
    ],
    rows: snapshot.teams.flatMap((team) =>
      team.players.map((player) => ({
        name: player.name,
        side: team.id === match.home.id ? ("home" as const) : ("away" as const),
        values: [
          String(player.minutes ?? "DNP"),
          String(player.points ?? 0),
          `${player.fieldGoals?.made ?? 0}-${player.fieldGoals?.attempted ?? 0}`,
          `${player.threePointFieldGoals?.made ?? 0}-${player.threePointFieldGoals?.attempted ?? 0}`,
          `${player.freeThrows?.made ?? 0}-${player.freeThrows?.attempted ?? 0}`,
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
    ),
  };
  const lineups = snapshot.teams.map((team) => ({
    formation: "STARTING 5",
    confirmed: true,
    players: team.players
      .filter((player) => player.starter)
      .map((player) => ({
        name: player.name,
        number: Number(player.jersey) || 0,
        role: player.position,
      })),
    substitutes: team.players
      .filter((player) => !player.starter)
      .map((player) => ({
        name: player.name,
        number: Number(player.jersey) || 0,
        role: player.reason ?? player.position,
      })),
  }));
  if (lineups[0]) scoreboard.homeLineup = lineups[0];
  if (lineups[1]) scoreboard.awayLineup = lineups[1];
  scoreboard.basketballShots = scoringEvents();
}
```

#### `src/mocks/matches/details/basketball.ts`

**Unchanged.**

```ts
import type { DetailConfig } from "./shared";
export const basketballDetail: DetailConfig = {
  lineup: {
    formation: "STARTING FIVE",
    roles: ["STARTER", "STARTER", "STARTER", "STARTER", "STARTER"],
  },
  statLabels: ["FIELD GOALS", "3 POINTS", "REBOUNDS", "ASSISTS"],
  scoreRows: (_match, seed) => [
    { label: "Q1", home: "24", away: "19" },
    { label: "Q2", home: "21", away: "25" },
    {
      label: "Q3",
      home: String(18 + (seed % 10)),
      away: String(19 + ((seed >> 2) % 10)),
    },
    { label: "Q4", home: "—", away: "—" },
  ],
};
```

#### `src/mocks/matches/details/cricket-snapshot.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type {
  MatchDetailScoreboard,
  MatchPlayerDossier,
  RunRatePoint,
  SportMatch,
} from "@/domain/matches";

import snapshot from "../../snapshots/card-game/cricket-revamp.json";

const statLabel = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();
const display = (value: number | string | null) =>
  value == null ? "—" : String(value);

function playerDossiers(): MatchPlayerDossier[] {
  return snapshot.teams.flatMap((team) =>
    team.players.map((player) => {
      const values = snapshot.playerStats[
        player.id as keyof typeof snapshot.playerStats
      ] as Array<number | string | null> | undefined;
      const tape = snapshot.commentary
        .filter(
          (ball) => ball.batter === player.name || ball.bowler === player.name,
        )
        .map((ball) => ({
          marker: ball.over,
          text: `${ball.shortText} // ${ball.score}`,
          kind: ball.wicket
            ? ("wicket" as const)
            : ball.boundary
              ? ("score" as const)
              : ("note" as const),
        }));
      return {
        id: player.id,
        name: player.fullName || player.name,
        shortName: player.battingName,
        teamId: team.id,
        role: player.role,
        stats: (values ?? [])
          .map((value, index) => ({
            label: statLabel(
              snapshot.playerStatKeys[index] ?? `STAT ${index + 1}`,
            ),
            value: display(value),
          }))
          .filter((stat) => stat.value !== "—"),
        inningsTape: tape,
      };
    }),
  );
}

function ratePoint(
  point: (typeof snapshot.inningsRateProgress)[number]["points"][number],
  target?: number,
): RunRatePoint {
  const balls = Math.max(1, point.legalBall);
  const overs = balls / 6;
  const remaining = Math.max(1, 120 - balls);
  return {
    over: balls / 6,
    actual: Number((point.runs / overs).toFixed(2)),
    ...(target == null
      ? {}
      : {
          required: Number(
            (Math.max(0, target - point.runs) / (remaining / 6)).toFixed(2),
          ),
        }),
    ...(point.boundary === 4 || point.boundary === 6
      ? { boundary: point.boundary }
      : {}),
  };
}

export function applyCricketSnapshot(
  match: SportMatch,
  scoreboard: MatchDetailScoreboard,
): void {
  if (match.id !== snapshot.espnEventId) return;
  scoreboard.facts = [
    { label: "VENUE", value: snapshot.matchDetails.location.venue },
    {
      label: "TOSS",
      value: `${snapshot.matchDetails.toss.team} chose to ${snapshot.matchDetails.toss.decision}`,
    },
    {
      label: "PLAYER OF THE MATCH",
      value: snapshot.matchDetails.playerOfTheMatch.name,
    },
  ];
  scoreboard.intel = {
    competition: `${snapshot.matchDetails.league} // ${snapshot.matchDetails.stage}`,
    season: String(snapshot.matchDetails.season),
    venue: snapshot.matchDetails.location.venue,
    facts: [
      { label: "FORMAT", value: snapshot.matchDetails.format },
      {
        label: "TOSS",
        value: `${snapshot.matchDetails.toss.team} // ${snapshot.matchDetails.toss.decision.toUpperCase()}`,
      },
    ],
    resultNote: snapshot.matchDetails.result,
  };
  scoreboard.stats = snapshot.teamStats
    .filter((stat) => stat.available)
    .map((stat) => ({
      label: stat.label.toUpperCase(),
      home: display(stat.home),
      away: display(stat.away),
      homeValue: Number(stat.home),
      awayValue: Number(stat.away),
    }));
  scoreboard.scoreRows = snapshot.innings.map((entry) => ({
    label: `${entry.innings === 1 ? "1ST" : "2ND"} INNINGS`,
    home: entry.teamId === match.home.id ? entry.score : "—",
    away: entry.teamId === match.away.id ? entry.score : "—",
  }));
  scoreboard.innings = snapshot.scorecard.map((card) => ({
    team: card.battingTeam,
    side: card.battingTeamId === match.home.id ? "home" : "away",
    score: card.score,
    overs: `${card.overs} ov`,
    runRate: String(card.runRate),
    topBat:
      card.batting.slice().sort((a, b) => b.runs - a.runs)[0]?.score ?? "—",
    topBowl:
      card.bowling.slice().sort((a, b) => b.wickets - a.wickets)[0]?.figures ??
      "—",
    batting: card.batting.map((player) => ({
      name: player.name,
      dismissal: player.notOut ? undefined : player.dismissal,
      runs: player.runs,
      balls: player.balls,
      fours: player.fours,
      sixes: player.sixes,
    })),
    bowling: card.bowling.map((player) => ({
      name: player.name,
      overs: String(player.overs),
      maidens: player.maidens,
      runs: player.runs,
      wickets: player.wickets,
    })),
    ...(card.target == null ? {} : { target: card.target }),
  }));
  const scoreAtOver = (
    entry: (typeof snapshot.inningsProgress)[number],
    over: number,
  ) =>
    entry.points.filter((point) => Number(point.over) <= over).at(-1)?.runs ??
    0;
  const maxOvers = Math.max(
    ...snapshot.inningsProgress.map((entry) =>
      Math.ceil(entry.points.at(-1)?.over ?? 0),
    ),
    1,
  );
  const ticks = Array.from({ length: maxOvers }, (_, index) =>
    String(index + 1),
  );
  const homeProgress = snapshot.inningsProgress.find(
    (entry) => entry.teamId === match.home.id,
  );
  const awayProgress = snapshot.inningsProgress.find(
    (entry) => entry.teamId === match.away.id,
  );
  scoreboard.trace =
    homeProgress && awayProgress
      ? {
          title: "INNINGS RACE",
          unit: "RUNS",
          ticks,
          home: ticks.map((_, index) => scoreAtOver(homeProgress, index + 1)),
          away: ticks.map((_, index) => scoreAtOver(awayProgress, index + 1)),
          markers: [
            ...homeProgress.points.map((point) =>
              point.wicket
                ? {
                    index: Math.max(0, Math.ceil(point.over) - 1),
                    label: `${match.home.shortName} wicket ${point.over}`,
                    side: "home" as const,
                  }
                : null,
            ),
            ...awayProgress.points.map((point) =>
              point.wicket
                ? {
                    index: Math.max(0, Math.ceil(point.over) - 1),
                    label: `${match.away.shortName} wicket ${point.over}`,
                    side: "away" as const,
                  }
                : null,
            ),
          ].filter(
            (value): value is NonNullable<typeof value> => value !== null,
          ),
        }
      : undefined;
  scoreboard.runRate = snapshot.inningsRateProgress.map((entry) => ({
    innings: entry.innings === 1 ? 1 : 2,
    teamId: entry.points[0]?.teamId ?? "",
    points: entry.points.map((point) => ({
      ...ratePoint(
        point,
        entry.innings === 2
          ? (snapshot.matchDetails.innings[1].target ?? undefined)
          : undefined,
      ),
      ...(point.legalBall % 6 === 0 &&
      snapshot.inningsProgress
        .find((progress) => progress.innings === entry.innings)
        ?.points.find((progress) => progress.over === point.legalBall / 6)
        ?.wicket
        ? { wicket: true }
        : {}),
    })),
  }));
  scoreboard.feed = snapshot.commentary.map((ball) => ({
    marker: ball.over,
    text: `${ball.shortText} // ${ball.text}`,
    kind: ball.wicket ? "wicket" : ball.boundary ? "score" : "note",
    teamId: snapshot.matchDetails.innings[1].teamId,
  }));
  scoreboard.players = playerDossiers();
}
```

#### `src/mocks/matches/details/cricket.ts`

**Unchanged.**

```ts
import type { DetailConfig } from "./shared";
export const cricketDetail: DetailConfig = {
  lineup: {
    formation: "PLAYING XI",
    roles: [
      "BAT",
      "BAT",
      "AR",
      "WK",
      "AR",
      "BWL",
      "BWL",
      "BWL",
      "BWL",
      "BWL",
      "BWL",
    ],
  },
  statLabels: ["RUN RATE", "BOUNDARIES", "WICKETS", "DOT BALLS"],
  scoreRows: (match) => [
    { label: "POWERPLAY", home: "52/1", away: "46/2" },
    {
      label: "OVERS",
      home: "20.0",
      away: match.status === "live" ? "17.2" : "20.0",
    },
    { label: "RUN RATE", home: "8.25", away: "7.40" },
  ],
};
```

#### `src/mocks/matches/details/f1.ts`

**Unchanged.**

```ts
import type { F1ClassificationRow, F1RaceReport } from "@/domain/matches";

import racePackage from "../../snapshots/card-game/f1-italian-gp.json";

type RawClassification = {
  position: number;
  driverId: string;
  constructor?: string;
  teamColor?: string;
  grid?: number;
  status?: { description?: string };
  stats: Record<string, Array<string | number>>;
};

function driver(id: string) {
  return racePackage.drivers[id as keyof typeof racePackage.drivers];
}

function constructor(id: string) {
  return racePackage.constructors[id as keyof typeof racePackage.constructors];
}

function row(raw: unknown): F1ClassificationRow {
  const entry = raw as RawClassification;
  const athlete = driver(String(entry.driverId));
  const team = athlete ? constructor(athlete.constructorId) : undefined;
  const stats = entry.stats;
  return {
    position: entry.position,
    driverId: String(entry.driverId),
    name: athlete?.displayName ?? `Driver ${entry.driverId}`,
    constructor: entry.constructor ?? team?.displayName ?? "—",
    color: `#${entry.teamColor || team?.color || "5cdfff"}`,
    grid: entry.grid ?? entry.position,
    status: entry.status?.description ?? "Classified",
    gap: String(
      stats.behindTime?.[1] ??
        stats.behindLaps?.[1] ??
        stats.totalTime?.[1] ??
        "",
    ),
    fastestLap:
      stats.fastestLap?.[1] === undefined
        ? undefined
        : String(stats.fastestLap[1]),
    pitStops:
      stats.pitsTaken?.[0] === undefined
        ? undefined
        : Number(stats.pitsTaken[0]),
  };
}

const sessions = racePackage.sessions.map((session) => ({
  id: String(session.id),
  label: session.type.abbreviation,
  classification: session.classification.map(row),
}));
const race =
  sessions.find((session) => session.label === "Race")?.classification ?? [];
const qualifying =
  sessions.find((session) => session.label === "Qual")?.classification ??
  sessions.find((session) => session.label.toLowerCase().includes("qual"))
    ?.classification ??
  [];
const raceDriverIds = new Set(race.map((entry) => entry.driverId));
const weekendTicks = sessions.map((session) =>
  session.label === "Race" ? "FIN" : session.label,
);

export const italianGpReport: F1RaceReport = {
  id: racePackage.race.id,
  name: racePackage.race.name,
  abbreviation: racePackage.race.abbreviation,
  season: racePackage.race.season,
  circuit: {
    fullName: racePackage.race.circuit.fullName,
    asset: "/assets/motorsport/monza-circuit.svg",
    laps: racePackage.race.circuit.laps,
    turns: racePackage.race.circuit.turns,
    lengthKm: racePackage.race.circuit.lengthKm,
    distanceKm: racePackage.race.circuit.distanceKm,
    direction: racePackage.race.circuit.direction,
    established: racePackage.race.circuit.established,
    lapRecord: racePackage.race.circuit.lapRecord.time,
    lapRecordDriver:
      driver(racePackage.race.circuit.lapRecord.driverId)?.displayName ??
      "Unknown",
  },
  winner: race[0],
  pole:
    qualifying[0] ??
    race.reduce(
      (best, entry) => (entry.grid < best.grid ? entry : best),
      race[0],
    ),
  biggestGain: race.reduce(
    (best, entry) =>
      entry.grid - entry.position > best.grid - best.position ? entry : best,
    race[0],
  ),
  race,
  sessions,
  weekendTicks,
  weekendDrivers: race
    .slice(0, 8)
    .filter((entry) => raceDriverIds.has(entry.driverId))
    .map((entry) => ({
      id: entry.driverId,
      name: entry.name,
      abbreviation:
        driver(entry.driverId)?.abbreviation ??
        entry.name.slice(0, 3).toUpperCase(),
      constructor: entry.constructor,
      color: entry.color,
      positions: sessions.map(
        (session) =>
          session.classification.find(
            (candidate) => candidate.driverId === entry.driverId,
          )?.position ?? 23,
      ),
    })),
};
```

#### `src/mocks/matches/details/football-snapshot.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type {
  MatchDetailScoreboard,
  MatchShot,
  SportMatch,
} from "@/domain/matches";

import snapshot from "../../snapshots/card-game/football-revamp.json";

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

function outcome(kind: string): MatchShot["outcome"] {
  if (kind === "goal") return "goal";
  if (kind.includes("blocked")) return "blocked";
  if (kind.includes("on-target")) return "saved";
  return "missed";
}

function heatmapPoints(values: number[], period: 1 | 2) {
  return values.reduce<
    Array<{ x: number; y: number; intensity: number; period: 1 | 2 }>
  >((points, value, index) => {
    if (index % 2 === 0 && values[index + 1] !== undefined) {
      points.push({
        x: Number(value),
        y: Number(values[index + 1]),
        intensity: 1,
        period,
      });
    }
    return points;
  }, []);
}

const shots: MatchShot[] = snapshot.commentary
  .filter(
    (entry) =>
      entry.fieldPositionX !== null &&
      entry.fieldPositionX !== undefined &&
      (entry.kind === "goal" || String(entry.kind).startsWith("shot-")),
  )
  .map((entry) => ({
    id: String(entry.playId),
    minute: Number.parseInt(entry.minute ?? "0", 10),
    period: entry.period === 2 ? 2 : 1,
    side: entry.side === "away" ? "away" : "home",
    player: entry.players?.[0] ?? "Unknown player",
    x: Number(entry.fieldPositionX),
    y: Number(entry.fieldPositionY),
    outcome: outcome(String(entry.kind)),
    detail: entry.text,
    goalPlacement: placement(entry.text),
  }));

export function applyFootballSnapshot(
  match: SportMatch,
  scoreboard: MatchDetailScoreboard,
): void {
  if (match.id !== snapshot.espnEventId) return;
  scoreboard.facts = [
    { label: "VENUE", value: snapshot.matchDetails.location.venue },
    { label: "ATTENDANCE", value: String(snapshot.matchDetails.attendance) },
  ];
  scoreboard.intel = {
    competition: snapshot.matchDetails.league,
    season: snapshot.matchDetails.season,
    venue: snapshot.matchDetails.location.venue,
    attendance: String(snapshot.matchDetails.attendance),
    facts: [],
  };
  scoreboard.stats = snapshot.topStats
    .filter((stat) => stat.available)
    .map((stat) => ({
      label: stat.label.toUpperCase(),
      home: stat.home.display,
      away: stat.away.display,
      homeValue: stat.home.share,
      awayValue: stat.away.share,
    }));
  scoreboard.timeline = snapshot.timeline
    .filter((entry) => entry.kind !== "start-2nd-half")
    .map((entry) => ({
      minute: entry.minute,
      ...(entry.side === "home" || entry.side === "away"
        ? { side: entry.side }
        : {}),
      type:
        entry.kind === "goal"
          ? "goal"
          : entry.kind === "red-card"
            ? "red"
            : entry.kind === "substitution"
              ? "substitution"
              : "yellow",
      player:
        entry.player ??
        entry.playerIn ??
        entry.team ??
        entry.label ??
        "Match event",
      ...(entry.kind === "substitution" && entry.playerOut
        ? { secondary: entry.playerOut }
        : entry.assist
          ? { secondary: entry.assist }
          : {}),
      marker: entry.marker,
      label: entry.label,
      scoreDisplay: entry.score?.display,
      ...(entry.text ? { description: entry.text } : {}),
    }));
  scoreboard.commentary = snapshot.commentary.map((entry, index) => ({
    minute: entry.minute ?? "—",
    text: entry.text,
    sequence: entry.sequence ?? index,
    ...(entry.kind ? { kind: String(entry.kind) } : {}),
    ...(entry.side === "home" || entry.side === "away"
      ? { side: entry.side }
      : {}),
    ...(entry.team ? { teamName: entry.team } : {}),
    ...(entry.players?.length ? { players: entry.players } : {}),
  }));
  scoreboard.trace = {
    title: "TERRITORIAL PRESSURE",
    unit: "PRESSURE",
    ticks: snapshot.momentum.series.map((entry) => `${entry.minute}'`),
    home: snapshot.momentum.series.map((entry) => entry.home),
    away: snapshot.momentum.series.map((entry) => entry.away),
    markers: snapshot.momentum.goals.map((goal, index) => ({
      index: goal.axis,
      label: `${goal.player} ${goal.clock}`,
      side: goal.side === "away" ? "away" : "home",
      decisive: index === snapshot.momentum.goals.length - 1,
    })),
  };
  scoreboard.shots = shots;
  const lineups = snapshot.teams.map((source) => ({
    formation: source.formation ?? "4-3-3",
    confirmed: source.lineupsConfirmed,
    players: source.players
      .filter((player) => player.starter)
      .map((player) => ({
        name: player.name,
        shortName: player.shortName,
        number: Number(player.jersey) || 0,
        role: player.positionName,
        captain: false,
        formationPlace: Number(player.formationPlace) || undefined,
      })),
    substitutes: source.players
      .filter((player) => !player.starter)
      .map((player) => ({
        name: player.name,
        shortName: player.shortName,
        number: Number(player.jersey) || 0,
        role: player.positionName,
      })),
  }));
  if (lineups[0]) scoreboard.homeLineup = lineups[0];
  if (lineups[1]) scoreboard.awayLineup = lineups[1];
  scoreboard.players = snapshot.teams.flatMap((source) =>
    source.players.map((player) => ({
      id: String(player.id),
      name: player.name,
      shortName: player.shortName,
      teamId: source.id,
      role: player.positionName,
      number: player.jersey,
      stats: snapshot.playerStatKeys
        .map((label, index) => ({
          label: label.replace(/([A-Z])/g, " $1").toUpperCase(),
          value: String(player.stats?.[index] ?? "—"),
        }))
        .filter((stat) => stat.value !== "—"),
      heatmap: [
        ...heatmapPoints(player.t1 ?? [], 1),
        ...heatmapPoints(player.t2 ?? [], 2),
      ],
    })),
  ) as MatchDetailScoreboard["players"];
}
```

#### `src/mocks/matches/details/football.ts`

**Unchanged.**

```ts
import type { DetailConfig } from "./shared";

export const footballDetail: DetailConfig = {
  lineup: {
    formation: "4-3-3",
    roles: ["GK", "RB", "CB", "CB", "LB", "CM", "CM", "RW", "AM", "LW", "ST"],
  },
  statLabels: ["POSSESSION", "SHOTS", "ON TARGET", "PASSES"],
  scoreRows: (match, seed) => [
    {
      label: "FIRST HALF",
      home: match.homeScore == null ? "—" : String(match.homeScore),
      away: match.awayScore == null ? "—" : String(match.awayScore),
    },
    {
      label: "SHOTS",
      home: String(7 + (seed % 7)),
      away: String(5 + ((seed >> 2) % 7)),
    },
    {
      label: "CORNERS",
      home: String(2 + (seed % 5)),
      away: String(1 + ((seed >> 3) % 5)),
    },
  ],
};
```

#### `src/mocks/matches/details/motorsport.ts`

**Unchanged.**

```ts
import type { DetailConfig } from "./shared";
export const motorsportDetail: DetailConfig = {
  lineup: {
    formation: "STARTING FIVE",
    roles: ["STARTER", "STARTER", "STARTER", "STARTER", "STARTER"],
  },
  statLabels: ["TOP SPEED", "LAPS", "PIT STOPS", "TYRE STINT"],
  motorsport: true,
  scoreRows: (match) => [
    {
      label: "RACE",
      home: match.status === "scheduled" ? "PENDING" : "P1",
      away: match.status === "scheduled" ? "PENDING" : "P2",
    },
    { label: "LAPS", home: "44", away: "44" },
    { label: "GAP", home: "â€”", away: "+2.184" },
  ],
  sessions: [
    {
      label: "PRACTICE 1",
      results: [
        "1. Verstappen  1:12.844",
        "2. Norris  +0.184",
        "3. Leclerc  +0.316",
      ],
    },
    {
      label: "QUALIFYING",
      results: ["P1 Verstappen", "P2 Norris", "P3 Leclerc"],
    },
  ],
  driverStandings: [
    "Verstappen · 251",
    "Norris · 221",
    "Leclerc · 188",
    "Piastri · 176",
  ],
};
```

#### `src/mocks/matches/details/tennis.ts`

**Unchanged.**

```ts
import type { DetailConfig } from "./shared";
export const tennisDetail: DetailConfig = {
  lineup: {
    formation: "STARTING FIVE",
    roles: ["STARTER", "STARTER", "STARTER", "STARTER", "STARTER"],
  },
  statLabels: ["ACES", "WINNERS", "BREAK POINTS", "1ST SERVE"],
  scoreRows: (match) => [
    { label: "SET 1", home: "6", away: "4" },
    { label: "SET 2", home: "3", away: "6" },
    {
      label: "SET 3",
      home: match.status === "live" ? "4" : "6",
      away: match.status === "live" ? "4" : "2",
    },
  ],
};
```

#### `src/mocks/matches/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./catalog";
export * from "./details";
```

## Step 6: pieces every report shares

`match-stats.module.css` styles all four reports. `match-stats-shell.tsx` holds the row surface, the comparison row, the team key and the MATCH INTEL card. `match-report-parts.tsx` holds the event log, the commentary list and a plain lineup list. `MatchTraceChart` is the two-sided chart behind football's pressure, cricket's innings race and basketball's score race. `TeamBadge` draws a crest.

#### `src/features/matches/components/match-stats.module.css`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```css
/*
 * The per-sport match report: the pulse header, the market-style data rows the
 * panels are built from, and the two-sided trace chart.
 */

.sectionHeading,
.comparisonHead b,
.comparisonHead small,
.legendMark b,
.legendMark small,
.intelTitle,
.intelCell small,
.traceHead b,
.traceAxis,
.eventMinute,
.tableHead,
.feedMarker {
  font-family: var(--ds-font-display);
  font-weight: 900;
  letter-spacing: 0.08em;
}

/* ---- Scroll body ----------------------------------------------------------- */

.statsView {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
}
.statsScroll {
  min-height: 0;
  flex: 1;
  padding: 14px 16px 28px;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-color: var(--ds-color-border-strong) transparent;
}
.stack {
  display: grid;
  gap: 18px;
}
.tight {
  display: grid;
  gap: 10px;
}

/* ---- Data rows ------------------------------------------------------------- */

.sectionHeading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: color-mix(in srgb, var(--ds-color-accent-cyan) 70%, transparent);
  font-family: var(--ds-font-display);
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2em;
}
.sectionHeading::after {
  height: 1px;
  flex: 1;
  content: "";
  background: color-mix(
    in srgb,
    var(--ds-color-border-strong) 30%,
    transparent
  );
}

.statsRow {
  display: grid;
  width: 100%;
  gap: 8px;
  padding: 10px;
  border: 1px solid
    var(--row-edge, color-mix(in srgb, var(--row-accent) 40%, transparent));
  background: var(--ds-color-background-data);
  text-align: left;
}
button.statsRow {
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease;
}
button.statsRow:hover {
  border-color: var(--row-accent);
}
button.statsRow:focus-visible {
  outline: 2px solid var(--row-accent);
  outline-offset: 2px;
}
.statsRowSelected {
  border-color: var(--row-accent);
  background: color-mix(
    in srgb,
    var(--row-accent) 12%,
    var(--ds-color-background-data)
  );
}

.comparisonHead {
  display: grid;
  grid-template-columns: 62px 1fr 62px;
  align-items: center;
}
.comparisonHead b {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}
.comparisonHead b:last-child {
  text-align: right;
}
.comparisonHead small {
  color: var(--ds-color-text-muted);
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.1em;
}

.splitBar {
  display: flex;
  gap: 3px;
  height: 6px;
}
.splitBar i {
  display: block;
}

.legendRow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.legendMark {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}
.legendMarkEnd {
  flex-direction: row-reverse;
  text-align: right;
}
.legendMark > i {
  display: block;
  width: 4px;
  height: 30px;
  flex: none;
}
.legendMark span {
  display: grid;
  min-width: 0;
}
.legendMark b {
  font-size: 13px;
}
.legendMark small {
  overflow: hidden;
  color: var(--ds-color-text-muted);
  font-size: 8px;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Intel ----------------------------------------------------------------- */

.intelPanel {
  gap: 12px;
  padding: 14px;
}
.intelTitle {
  color: var(--ds-color-text-default);
  font-size: 15px;
}
.intelSeason {
  margin: -8px 0 0;
  color: var(--ds-color-text-muted);
  font-size: 12px;
}
.intelCells {
  display: grid;
  grid-template-columns: 1fr 96px;
  gap: 8px;
}
.intelCell {
  display: grid;
  gap: 4px;
  padding: 10px;
  background: color-mix(
    in srgb,
    var(--ds-color-background-elevated) 56%,
    transparent
  );
}
.intelCell small {
  color: var(--ds-color-text-muted);
  font-size: 8px;
  letter-spacing: 0.12em;
}
.intelCell b {
  color: var(--ds-color-text-default);
  font-size: 11px;
  font-weight: 700;
}
.intelFacts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin: 0;
}
.intelFacts div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  background: color-mix(in srgb, var(--ds-color-text-default) 4%, transparent);
}
.intelFacts dt {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.1em;
}
.intelFacts dd {
  margin: 0;
  color: var(--ds-color-text-default);
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.intelResult {
  margin: 0;
  color: var(--ds-color-accent-cyan);
  font-family: var(--ds-font-display);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

/* ---- Trace ----------------------------------------------------------------- */

.tracePanel {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--ds-color-border-muted);
  background: var(--ds-color-background-secondary);
}
.traceHead {
  display: grid;
  gap: 6px;
}
.traceHead b {
  color: var(--ds-color-text-default);
  font-size: 10px;
  letter-spacing: 0.14em;
}
.traceTitleRow {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.traceActions {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
}
.traceActions small {
  min-width: 56px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-align: right;
}
.traceFullscreen {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--ds-color-accent-cyan);
  cursor: pointer;
}
.traceFullscreen:hover {
  color: var(--ds-color-text-default);
}
.traceFullscreen:focus-visible {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: -4px;
}
.traceModes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ds-space-6);
  padding: 0;
}
.traceModes > button {
  width: 100%;
  padding-right: var(--ds-space-8);
  padding-left: var(--ds-space-8);
  font-size: var(--ds-text-2xs);
}
.traceReadout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: var(--ds-font-display);
  font-size: 11px;
  font-weight: 900;
}
.traceReadout small {
  color: var(--ds-color-text-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.traceCanvas {
  position: relative;
  height: 170px;
  cursor: ew-resize;
  touch-action: none;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--ds-color-accent-cyan) 5%, transparent),
    transparent
  );
}
.traceCanvas svg {
  width: 100%;
  height: 100%;
}
.traceCanvas:focus-visible {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: 2px;
}

.traceGuide {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: color-mix(in srgb, var(--ds-color-text-default) 45%, transparent);
  pointer-events: none;
}
.traceMarker {
  position: absolute;
  bottom: 6px;
  width: 9px;
  height: 9px;
  transform: translateX(-50%) rotate(45deg);
  background: var(--marker-color);
  pointer-events: none;
}
.traceMarkerFocal {
  box-shadow: 0 0 12px var(--marker-color);
}

.traceAxis {
  display: flex;
  justify-content: space-between;
  color: var(--ds-color-text-muted);
  font-size: 8px;
  letter-spacing: 0.12em;
}

.tracePanel:fullscreen {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  grid-template-rows: auto minmax(0, 1fr) auto;
  padding: max(var(--ds-space-16), env(safe-area-inset-top))
    max(var(--ds-space-16), env(safe-area-inset-right))
    max(var(--ds-space-16), env(safe-area-inset-bottom))
    max(var(--ds-space-16), env(safe-area-inset-left));
  border: 0;
  background: var(--ds-color-background-secondary);
}
.tracePanel:fullscreen .traceCanvas {
  height: auto;
  min-height: 0;
}

/* ---- Lists ----------------------------------------------------------------- */

.eventRow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.eventMinute {
  min-width: 42px;
  color: var(--ds-color-accent-cyan);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.eventCopy {
  min-width: 0;
  flex: 1;
}
.eventCopy strong {
  display: block;
  overflow: hidden;
  color: var(--ds-color-text-default);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.eventCopy small {
  display: block;
  margin-top: 2px;
  color: var(--ds-color-text-muted);
  font-size: 10px;
}
.eventSide {
  width: 6px;
  align-self: stretch;
}

/* ---- Football event spine ------------------------------------------------- */

.matchTimeline {
  --timeline-spine: 60px;
  display: grid;
  gap: var(--ds-space-12);
}
.timelineMoments {
  display: grid;
}
.timelinePeriod {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: var(--ds-space-8);
  color: var(--ds-color-accent-cyan);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-micro);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-ultra);
  text-align: center;
}
.timelinePeriod > i {
  height: 1px;
  flex: 1;
  background: color-mix(in srgb, var(--ds-color-accent-cyan) 24%, transparent);
}
.timelineTarget {
  width: 11px;
  height: 11px;
  flex: none;
  border: 2px solid var(--ds-color-accent-cyan);
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px var(--ds-color-background-primary);
  background: var(--ds-color-accent-cyan);
}
.timelinePeriod b {
  white-space: nowrap;
}
.timelineMoment {
  min-width: 0;
}
.timelineMain {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) var(--timeline-spine) minmax(0, 1fr);
  align-items: stretch;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}
button.timelineMain {
  cursor: pointer;
}
button.timelineMain:hover .timelineEventCopy > strong:first-child {
  color: var(--event-accent);
}
button.timelineMain:focus-visible {
  outline: 1px solid var(--event-accent);
  outline-offset: 2px;
}
.timelineTeamCell {
  min-width: 0;
}
.timelineSpine {
  position: relative;
  display: grid;
  min-height: 48px;
  align-self: stretch;
  place-items: center;
}
.timelineSpine::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  content: "";
  background: color-mix(
    in srgb,
    var(--ds-color-border-default) 32%,
    transparent
  );
}
.timelineSpine > b {
  position: relative;
  display: grid;
  width: 48px;
  height: 28px;
  padding: 1px;
  clip-path: var(--ds-clip-field);
  background: color-mix(in srgb, var(--event-accent) 30%, transparent);
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-2xs);
  font-variant-numeric: tabular-nums;
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
}
.timelineSpine > b > span {
  display: grid;
  place-items: center;
  clip-path: inherit;
  background: var(--ds-color-background-data);
}
.timelineSpine[data-goal] > b {
  background: color-mix(in srgb, var(--event-accent) 72%, transparent);
  color: var(--event-accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--event-accent) 28%, transparent);
}
.timelineSpine[data-goal] > b > span {
  background: color-mix(
    in srgb,
    var(--event-accent) 12%,
    var(--ds-color-background-data)
  );
}
.timelineBody {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: var(--ds-space-8);
  padding-block: var(--ds-space-10);
}
.timelineBody[data-side="home"] {
  justify-content: flex-end;
  text-align: right;
}
.timelineBody[data-side="away"] {
  justify-content: flex-start;
  text-align: left;
}
.timelineEventCopy {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: var(--ds-space-2);
}
.timelineEventCopy strong,
.timelineEventCopy b,
.timelineEventCopy small {
  display: block;
  overflow-wrap: anywhere;
}
.timelineEventCopy strong {
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-xs);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-label);
  line-height: var(--ds-leading-tight);
}
.timelineEventCopy b {
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-2xs);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--ds-tracking-wide);
}
.timelineEventCopy small {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-nano);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
  line-height: var(--ds-leading-tight);
}
.timelineEventCopy strong[data-in] {
  color: var(--ds-color-accent-lime);
}
.timelineEventCopy strong[data-out] {
  color: var(--ds-color-danger);
}
.timelineGlyph {
  display: grid;
  width: 30px;
  height: 30px;
  flex: none;
  padding: 1px;
  clip-path: var(--ds-clip-field);
  background: color-mix(in srgb, var(--event-tone) 42%, transparent);
  color: var(--event-tone);
}
.timelineGlyph > span {
  display: grid;
  place-items: center;
  clip-path: inherit;
  background: color-mix(
    in srgb,
    var(--event-tone) 10%,
    var(--ds-color-background-data)
  );
}
.timelineCard {
  display: block;
  width: 9px;
  height: 13px;
  rotate: 10deg;
  border: 1px solid
    color-mix(in srgb, var(--ds-color-background-primary) 60%, transparent);
  background: var(--event-tone);
}
.timelineReport {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--timeline-spine) minmax(0, 1fr);
  padding-bottom: var(--ds-space-10);
}
.timelineReport p {
  margin: 0;
  padding: var(--ds-space-8) var(--ds-space-10);
  background: var(--ds-color-background-data);
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
  line-height: var(--ds-leading-body);
}
.timelineReport[data-side="home"] p {
  grid-column: 1;
  border-right: 2px solid var(--event-accent);
  text-align: right;
}
.timelineReport[data-side="away"] p {
  grid-column: 3;
  border-left: 2px solid var(--event-accent);
}

/* ---- Live commentary ------------------------------------------------------ */

.commentary {
  display: grid;
  gap: var(--ds-space-8);
}
.logHeader {
  display: flex;
  align-items: center;
  gap: var(--ds-space-10);
}
.logHeader h3,
.logHeader span,
.commentaryStamp,
.commentaryCopy strong,
.commentaryCopy small {
  font-family: var(--ds-font-display);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
}
.logHeader h3 {
  margin: 0;
  color: var(--ds-color-accent-cyan);
  font-size: var(--ds-text-2xs);
  white-space: nowrap;
}
.logHeader::after {
  height: 1px;
  flex: 1;
  order: 2;
  content: "";
  background: color-mix(
    in srgb,
    var(--ds-color-border-strong) 30%,
    transparent
  );
}
.logHeader span {
  order: 3;
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-nano);
  white-space: nowrap;
}
.commentaryList {
  display: grid;
  gap: var(--ds-space-8);
  margin: 0;
  padding: 0;
  list-style: none;
}
.commentaryRow {
  display: grid;
  grid-template-columns: 48px 1px minmax(0, 1fr);
  gap: var(--ds-space-8) var(--ds-space-10);
  align-items: start;
  padding-block: var(--ds-space-8);
}
.commentaryStamp {
  display: grid;
  gap: var(--ds-space-4);
  align-content: start;
}
.commentaryStamp b {
  color: var(--ds-color-accent-cyan);
  font-size: var(--ds-text-xs);
  font-variant-numeric: tabular-nums;
}
.commentaryStamp small {
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-nano);
  font-variant-numeric: tabular-nums;
}
.commentaryRule {
  width: 1px;
  min-height: 42px;
  align-self: stretch;
  background: color-mix(
    in srgb,
    var(--ds-color-border-strong) 22%,
    transparent
  );
}
.commentaryCopy {
  display: grid;
  min-width: 0;
  gap: var(--ds-space-4);
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-compact);
  line-height: var(--ds-leading-body);
}
.commentaryCopy strong {
  color: var(--ds-color-accent-cyan);
  font-size: var(--ds-text-nano);
}
.commentaryCopy small {
  overflow-wrap: anywhere;
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-nano);
}

.statTable {
  width: 100%;
  border-collapse: collapse;
}
.statTable th,
.statTable td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--ds-color-border-subtle);
  text-align: right;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.statTable th {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.12em;
}
.statTable th:first-child,
.statTable td:first-child {
  text-align: left;
}
.statTable td:first-child {
  color: var(--ds-color-text-default);
  font-weight: 700;
}
.tableHead {
  color: var(--ds-color-text-default);
}

.feedMarker {
  min-width: 44px;
  color: var(--ds-color-accent-cyan);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* The innings a card is showing. */
.inningsTabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.inningsTabs::-webkit-scrollbar {
  display: none;
}
.inningsTab {
  flex: none;
  min-height: 34px;
  padding: 0 16px;
  border: 1px solid var(--ds-color-border-default);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-color-background-secondary);
  color: var(--ds-color-text-muted);
  font-size: 13px;
  cursor: pointer;
}
.inningsTabActive {
  border-color: var(--ds-color-accent-cyan);
  background: color-mix(in srgb, var(--ds-color-accent-cyan) 20%, transparent);
  color: var(--ds-color-accent-cyan);
  font-weight: 700;
}
.inningsTab:focus-visible {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: 2px;
}

.inningsHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.inningsHead strong {
  display: block;
  color: var(--ds-color-text-default);
  font-size: 13px;
  font-weight: 700;
}
.inningsHead small {
  display: block;
  margin-top: 2px;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.09em;
}
.inningsScore {
  text-align: right;
}
.inningsScore b {
  display: block;
  font-family: var(--ds-font-display);
  font-size: 13px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

/* Batting and bowling: a name that can carry a second line, then the figures. */
.card {
  width: 100%;
  border-collapse: collapse;
  background: var(--ds-color-background-data);
}
.card th,
.card td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--ds-color-border-subtle);
  text-align: right;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.card th {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.12em;
}
.card th:first-child,
.card td:first-child {
  width: 42%;
  text-align: left;
}
.card td strong {
  display: block;
  overflow: hidden;
  color: var(--ds-color-text-default);
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card td small {
  display: block;
  overflow: hidden;
  color: var(--ds-color-text-muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card td b {
  color: var(--ds-color-text-default);
  font-weight: 800;
}
.card tbody tr:last-child th,
.card tbody tr:last-child td {
  border-bottom: 0;
}

/* ---- Desktop --------------------------------------------------------------- */

@media (width >= 900px) {
  .statsScroll {
    padding-right: 24px;
    padding-left: 24px;
  }
}

@media (width >= 1024px) {
  .statsView {
    height: auto;
  }
  .statsScroll {
    min-height: 560px;
    height: auto;
    padding-bottom: 24px;
    overflow: visible;
  }
}
```

#### `src/features/matches/components/match-stats-shell.tsx`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```tsx
"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";

import {
  NoDataState,
  SignalOffIcon,
  accentVar,
  type IconProps,
} from "@/design-system";
import type { MatchDetailStat, MatchIntel, SportMatch } from "@/domain/matches";

import styles from "./match-stats.module.css";

export function SectionHeading({ label }: { label: string }) {
  return <h3 className={styles.sectionHeading}>{label}</h3>;
}

/**
 * The flat data surface every stat row, event card and roster row sits on —
 * the market detail's outcome-row container. Tinting is opt-in, and it never
 * glows.
 */
export function StatsRow({
  accent,
  selected = false,
  onSelect,
  className,
  children,
}: {
  accent?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}) {
  // An untinted row keeps the neutral edge at full strength; a tinted one
  // shows its accent at 40%, as the app's shell does.
  const style = {
    "--row-accent": accent ?? "var(--ds-color-border-default)",
    "--row-edge": accent ? undefined : "var(--ds-color-border-default)",
  } as CSSProperties;
  const classes = [
    styles.statsRow,
    selected ? styles.statsRowSelected : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!onSelect) {
    return (
      <div className={classes} style={style}>
        {children}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

/**
 * One home-vs-away metric, shaped like a market outcome row: the two values as
 * big tabular figures either side of the label, over a meter split at the home
 * side's share.
 */
export function StatComparisonRow({
  stat,
  homeColor,
  awayColor,
  selected,
  onSelect,
}: {
  stat: MatchDetailStat;
  homeColor: string;
  awayColor: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const total = stat.homeValue + stat.awayValue;
  const share = total <= 0 ? 0.5 : stat.homeValue / total;
  const homeLeads = share >= 0.5;
  const homeFlex = Math.min(995, Math.max(5, Math.round(share * 1000)));

  return (
    <StatsRow
      accent={homeLeads ? homeColor : awayColor}
      selected={selected}
      onSelect={onSelect}
    >
      <span className={styles.comparisonHead}>
        <b
          style={{
            color: homeLeads ? homeColor : "var(--ds-color-text-default)",
          }}
        >
          {stat.home}
        </b>
        <small>{stat.label.toUpperCase()}</small>
        <b
          style={{
            color: homeLeads ? "var(--ds-color-text-default)" : awayColor,
          }}
        >
          {stat.away}
        </b>
      </span>
      <span className={styles.splitBar}>
        <i style={{ flexGrow: homeFlex, background: homeColor }} />
        <i style={{ flexGrow: 1000 - homeFlex, background: awayColor }} />
      </span>
    </StatsRow>
  );
}

/** The home/away identity pair that heads a comparison block. */
export function TeamLegendRow({ match }: { match: SportMatch }) {
  return (
    <div className={styles.legendRow}>
      <TeamLegendMark
        name={match.home.name}
        short={match.home.shortName}
        color={match.home.secondaryTextColor ?? match.home.color}
      />
      <TeamLegendMark
        name={match.away.name}
        short={match.away.shortName}
        color={match.away.secondaryTextColor ?? match.away.color}
        alignEnd
      />
    </div>
  );
}

function TeamLegendMark({
  name,
  short,
  color,
  alignEnd = false,
}: {
  name: string;
  short: string;
  color: string;
  alignEnd?: boolean;
}) {
  return (
    <span
      className={[styles.legendMark, alignEnd ? styles.legendMarkEnd : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <i style={{ background: color }} />
      <span>
        <b style={{ color }}>{short.toUpperCase()}</b>
        <small>{name.toUpperCase()}</small>
      </span>
    </span>
  );
}

/** The competition, ground and facts block every report carries. */
export function MatchIntelPanel({
  match,
  intel,
}: {
  match: SportMatch;
  intel: MatchIntel;
}) {
  const statusColor =
    match.status === "live"
      ? "var(--ds-color-danger)"
      : match.status === "finished"
        ? accentVar("cyan")
        : accentVar("gold");
  return (
    <StatsRow accent={statusColor} className={styles.intelPanel}>
      <b className={styles.intelTitle}>{intel.competition.toUpperCase()}</b>
      <p className={styles.intelSeason}>{intel.season}</p>
      <div className={styles.intelCells}>
        <span className={styles.intelCell}>
          <small>VENUE</small>
          <b>{intel.venue}</b>
        </span>
        <span className={styles.intelCell}>
          <small>ATTENDANCE</small>
          <b className="ds-tabular">{intel.attendance ?? "—"}</b>
        </span>
      </div>
      <dl className={styles.intelFacts}>
        {intel.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {intel.resultNote ? (
        <p className={styles.intelResult}>{intel.resultNote.toUpperCase()}</p>
      ) : null}
    </StatsRow>
  );
}

/**
 * A section with nothing in it yet. The same empty state the rest of the
 * platform uses, so a report waiting on a feed reads like every other absence.
 */
export function EmptyPanel({
  title,
  message,
  icon = SignalOffIcon,
  spark,
  accent,
}: {
  title: string;
  message: string;
  icon?: ComponentType<IconProps>;
  spark?: ComponentType<IconProps>;
  accent?: string;
}) {
  return (
    <NoDataState
      icon={icon}
      spark={spark}
      title={title}
      message={message}
      accent={accent}
    />
  );
}
```

#### `src/features/matches/components/match-report-parts.tsx`

**Unchanged.**

```tsx
"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import {
  CheckIcon,
  FootballIcon,
  GridViewIcon,
  HistoryIcon,
  InsightsIcon,
  MicIcon,
  SwapHorizIcon,
  accentVar,
} from "@/design-system";
import type {
  MatchDetailCommentary,
  MatchDetailScoreboard,
  MatchDetailTimelineEvent,
  SportMatch,
} from "@/domain/matches";

import { EmptyPanel, SectionHeading, StatsRow } from "./match-stats-shell";
import styles from "./match-stats.module.css";
import detail from "./match-detail.module.css";

/**
 * The three sections every sport's report shares: the event log, the
 * play-by-play, and the two lineups.
 */

export function TimelineList({
  match,
  events,
}: {
  match: SportMatch;
  events: MatchDetailTimelineEvent[];
}) {
  if (events.length === 0) {
    return (
      <EmptyPanel
        icon={HistoryIcon}
        spark={FootballIcon}
        title="Event log pending"
        message="Goals, cards and substitutions will be tracked here."
      />
    );
  }
  if (match.sport === "football") {
    return <FootballTimeline match={match} events={events} />;
  }
  return (
    <div className={styles.tight}>
      <SectionHeading label="MATCH EVENT LOG" />
      {events.map((event) => {
        const color =
          event.side === "home" ? match.home.color : match.away.color;
        return (
          <StatsRow key={`${event.minute}-${event.player}`} accent={color}>
            <span className={styles.eventRow}>
              <i
                className={styles.eventSide}
                style={{ background: color }}
                aria-hidden="true"
              />
              <b className={styles.eventMinute}>{event.minute}</b>
              <span className={styles.eventCopy}>
                <strong>{event.player}</strong>
                {event.secondary ? <small>{event.secondary}</small> : null}
              </span>
              <EventGlyph type={event.type} />
            </span>
          </StatsRow>
        );
      })}
    </div>
  );
}

function EventGlyph({ type }: { type: MatchDetailTimelineEvent["type"] }) {
  if (type === "goal" || type === "score")
    return <FootballIcon size={16} aria-hidden="true" />;
  if (type === "substitution")
    return (
      <CheckIcon
        size={16}
        aria-hidden="true"
        style={{ color: accentVar("lime") }}
      />
    );
  return (
    <span
      aria-hidden="true"
      style={{
        width: "12px",
        height: "16px",
        background:
          type === "red"
            ? "var(--ds-color-danger)"
            : "var(--ds-color-accent-gold)",
      }}
    />
  );
}

export function CommentaryView({
  commentary,
  match,
}: {
  commentary: MatchDetailCommentary[];
  match?: SportMatch;
}) {
  if (commentary.length === 0) {
    return (
      <EmptyPanel
        icon={MicIcon}
        spark={InsightsIcon}
        title="Match comms silent"
        message="The play-by-play channel opens once commentary is available."
      />
    );
  }
  return (
    <div className={styles.commentary}>
      <header className={styles.logHeader}>
        <h3>LIVE MATCH COMMS</h3>
        <span>{commentary.length} ENTRIES</span>
      </header>
      <ol className={styles.commentaryList}>
        {commentary.map((item, index) => {
          const sequence = item.sequence ?? index;
          const teamName =
            item.teamName ??
            (item.side === "home"
              ? match?.home.name
              : item.side === "away"
                ? match?.away.name
                : undefined);
          const channel = [teamName, item.kind?.replaceAll("-", " ")]
            .filter(Boolean)
            .join(" // ")
            .toUpperCase();
          return (
            <li
              key={`${sequence}-${item.minute}-${item.text}`}
              className={styles.commentaryRow}
            >
              <span className={styles.commentaryStamp}>
                <b>{item.minute || "—"}</b>
                <small>SEQ {String(sequence).padStart(3, "0")}</small>
              </span>
              <span className={styles.commentaryRule} aria-hidden="true" />
              <span className={styles.commentaryCopy}>
                {channel ? <strong>{channel}</strong> : null}
                <span>{item.text}</span>
                {item.players?.length ? (
                  <small>PLAYERS // {item.players.join(" · ")}</small>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FootballTimeline({
  match,
  events,
}: {
  match: SportMatch;
  events: MatchDetailTimelineEvent[];
}) {
  const homeColor = match.home.secondaryTextColor ?? match.home.color;
  const awayColor = match.away.secondaryTextColor ?? match.away.color;

  return (
    <section className={styles.matchTimeline}>
      <header className={styles.logHeader}>
        <h3>MATCH TIMELINE</h3>
        <span>{String(events.length).padStart(3, "0")} EVENTS</span>
      </header>
      <div className={styles.timelineMoments}>
        {events.map((event, index) =>
          event.marker ? (
            <TimelinePeriod
              key={`${event.label}-${event.minute}-${index}`}
              event={event}
            />
          ) : (
            <TimelineMoment
              key={`${event.minute}-${event.player}-${index}`}
              event={event}
              accent={event.side === "home" ? homeColor : awayColor}
            />
          ),
        )}
      </div>
    </section>
  );
}

function TimelinePeriod({ event }: { event: MatchDetailTimelineEvent }) {
  return (
    <div className={styles.timelinePeriod}>
      <i aria-hidden="true" />
      <span aria-hidden="true" className={styles.timelineTarget} />
      <b>
        {event.label ?? "MATCH EVENT"}
        {event.scoreDisplay ? ` ${event.scoreDisplay}` : ""}
      </b>
      <i aria-hidden="true" />
    </div>
  );
}

function TimelineMoment({
  event,
  accent,
}: {
  event: MatchDetailTimelineEvent;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const isHome = event.side === "home";
  const body = (
    <TimelineEventBody event={event} accent={accent} home={isHome} />
  );
  const cells = (
    <>
      <span className={styles.timelineTeamCell}>{isHome ? body : null}</span>
      <span
        className={styles.timelineSpine}
        data-goal={event.type === "goal" || undefined}
      >
        <b style={{ "--event-accent": accent } as CSSProperties}>
          <span>{event.minute}</span>
        </b>
      </span>
      <span className={styles.timelineTeamCell}>{isHome ? null : body}</span>
    </>
  );

  return (
    <div
      className={styles.timelineMoment}
      style={{ "--event-accent": accent } as CSSProperties}
    >
      {event.description ? (
        <button
          type="button"
          className={styles.timelineMain}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          {cells}
        </button>
      ) : (
        <div className={styles.timelineMain}>{cells}</div>
      )}
      {open && event.description ? (
        <div
          className={styles.timelineReport}
          data-side={isHome ? "home" : "away"}
        >
          <p>{event.description}</p>
        </div>
      ) : null}
    </div>
  );
}

function TimelineEventBody({
  event,
  accent,
  home,
}: {
  event: MatchDetailTimelineEvent;
  accent: string;
  home: boolean;
}) {
  const glyph = <TimelineEventGlyph type={event.type} accent={accent} />;
  return (
    <span className={styles.timelineBody} data-side={home ? "home" : "away"}>
      {home ? null : glyph}
      <span className={styles.timelineEventCopy}>
        {event.type === "substitution" ? (
          <>
            <strong data-in>{event.player.toUpperCase()}</strong>
            {event.secondary ? (
              <strong data-out>{event.secondary.toUpperCase()}</strong>
            ) : null}
          </>
        ) : (
          <>
            <strong>{event.player.toUpperCase()}</strong>
            {event.type === "goal" && event.scoreDisplay ? (
              <b style={{ color: accent }}>{event.scoreDisplay}</b>
            ) : null}
            {event.secondary ? (
              <small>ASSIST {event.secondary.toUpperCase()}</small>
            ) : null}
          </>
        )}
      </span>
      {home ? glyph : null}
    </span>
  );
}

function TimelineEventGlyph({
  type,
  accent,
}: {
  type: MatchDetailTimelineEvent["type"];
  accent: string;
}) {
  let mark: ReactNode;
  if (type === "goal" || type === "score")
    mark = <FootballIcon size={15} aria-hidden="true" />;
  else if (type === "substitution")
    mark = <SwapHorizIcon size={15} aria-hidden="true" />;
  else
    mark = (
      <i className={styles.timelineCard} data-card={type} aria-hidden="true" />
    );
  const tone =
    type === "yellow"
      ? "var(--ds-color-accent-gold)"
      : type === "red"
        ? "var(--ds-color-danger)"
        : type === "substitution"
          ? "var(--ds-color-accent-lime)"
          : accent;
  return (
    <span
      className={styles.timelineGlyph}
      style={{ "--event-tone": tone } as CSSProperties}
    >
      <span>{mark}</span>
    </span>
  );
}

export function LineupsView({
  match,
  scoreboard,
  heading,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
  heading?: string;
}) {
  const label =
    heading ??
    (match.sport === "motorsport"
      ? "STARTING GRID"
      : match.sport === "cricket"
        ? "PLAYING XI"
        : match.sport === "basketball"
          ? "STARTING FIVE"
          : "LINEUPS");
  return (
    <div className={detail.lineupView}>
      <header className={detail.lineupHeader}>
        <GridViewIcon size={18} />
        <span>{label}</span>
      </header>
      <div className={detail.lineupPitch}>
        <LineupColumn
          team={match.home.name}
          shortName={match.home.shortName}
          color={match.home.color}
          lineup={scoreboard.homeLineup}
        />
        <LineupColumn
          team={match.away.name}
          shortName={match.away.shortName}
          color={match.away.color}
          lineup={scoreboard.awayLineup}
          alignEnd
        />
      </div>
    </div>
  );
}

function LineupColumn({
  team,
  shortName,
  color,
  lineup,
  alignEnd = false,
}: {
  team: string;
  shortName: string;
  color: string;
  lineup: MatchDetailScoreboard["homeLineup"];
  alignEnd?: boolean;
}) {
  return (
    <section
      className={[
        detail.lineupColumn,
        alignEnd ? detail.lineupColumnAway : "",
      ].join(" ")}
      style={{ "--team-color": color } as CSSProperties}
    >
      <header>
        <span>{shortName}</span>
        <small>{lineup.formation}</small>
      </header>
      <h2>{team}</h2>
      <ol>
        {lineup.players.map((player) => (
          <li key={`${team}-${player.number}`}>
            <span>{player.number}</span>
            <div>
              <strong>{player.name}</strong>
              <small>
                {player.role}
                {player.captain ? " · C" : ""}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

#### `src/features/matches/components/match-trace-chart.tsx`

**Unchanged.**

```tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

import {
  FilterChips,
  FullscreenExitIcon,
  FullscreenIcon,
} from "@/design-system";

import type { MatchTrace, SportMatch } from "@/domain/matches";

import styles from "./match-stats.module.css";

/**
 * A two-sided trace: both teams on one axis, scrubbable, with the events that
 * happened along it pinned to their sample.
 *
 * The design system's chart draws one series and is shared by XP and odds; a
 * match trace is always a contest between two sides and knows which team each
 * line belongs to, so it lives with the feature that knows that.
 */

const viewWidth = 1000;
const viewHeight = 220;
const inningsModes = ["FULL GAME", "POWERPLAY", "DEATH OVERS"] as const;

type InningsMode = (typeof inningsModes)[number];

function phaseBounds(mode: InningsMode, pointCount: number) {
  if (mode === "POWERPLAY") return { start: 0, end: Math.min(6, pointCount) };
  if (mode === "DEATH OVERS")
    return { start: Math.max(0, pointCount - 4), end: pointCount };
  return { start: 0, end: pointCount };
}

export function MatchTraceChart({
  match,
  trace,
  homeLabel,
  awayLabel,
  showInningsModes = false,
}: {
  match: SportMatch;
  trace: MatchTrace;
  homeLabel?: string;
  awayLabel?: string;
  /** Adds full-game, powerplay, and death-over views plus native fullscreen. */
  showInningsModes?: boolean;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const sourcePoints = Math.max(trace.home.length, trace.away.length, 1);
  const [mode, setMode] = useState<InningsMode>(inningsModes[0]);
  const [selected, setSelected] = useState(sourcePoints - 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { start, end } = phaseBounds(mode, sourcePoints);
  const home = trace.home.slice(start, end);
  const away = trace.away.slice(start, end);
  const ticks = trace.ticks.slice(start, end);
  const markers = (trace.markers ?? [])
    .filter((marker) => marker.index >= start && marker.index < end)
    .map((marker) => ({ ...marker, index: marker.index - start }));
  const points = Math.max(home.length, away.length, 1);
  const index = Math.min(Math.max(selected, 0), Math.max(0, points - 1));
  const homeColor = match.home.secondaryTextColor ?? match.home.color;
  const awayColor = match.away.secondaryTextColor ?? match.away.color;

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === panel.current);
    };
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  const all = [...home, ...away];
  const min = Math.min(...all, 0);
  const max = Math.max(...all, 1);
  const spread = Math.max(1, max - min);
  const x = (i: number) =>
    points <= 1 ? viewWidth : (viewWidth * i) / (points - 1);
  const y = (value: number) =>
    viewHeight - ((value - min) / spread) * viewHeight;
  const path = (values: number[]) =>
    values
      .map(
        (value, i) =>
          `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(value).toFixed(1)}`,
      )
      .join(" ");

  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const rect = canvas.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / Math.max(1, rect.width)),
    );
    setSelected(Math.round(percent * (points - 1)));
  };

  const selectMode = (nextMode: string) => {
    const next = nextMode as InningsMode;
    const bounds = phaseBounds(next, sourcePoints);
    setMode(next);
    setSelected(Math.max(0, bounds.end - bounds.start - 1));
  };

  const toggleFullscreen = async () => {
    if (!panel.current) return;
    try {
      if (document.fullscreenElement === panel.current) {
        await document.exitFullscreen();
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
        await panel.current.requestFullscreen();
      }
    } catch {
      // The browser may reject fullscreen when device policy disables it.
    }
  };

  return (
    <section ref={panel} className={styles.tracePanel}>
      <header className={styles.traceHead}>
        <span className={styles.traceTitleRow}>
          <b>{trace.title}</b>
          {showInningsModes ? (
            <span className={styles.traceActions}>
              <button
                type="button"
                className={styles.traceFullscreen}
                aria-label={
                  isFullscreen
                    ? "Exit run race fullscreen"
                    : "Open run race fullscreen"
                }
                aria-pressed={isFullscreen}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <FullscreenExitIcon size={18} />
                ) : (
                  <FullscreenIcon size={18} />
                )}
              </button>
              <small>{points} OVERS</small>
            </span>
          ) : null}
        </span>
        {showInningsModes ? (
          <FilterChips
            options={[...inningsModes]}
            selected={mode}
            onSelect={selectMode}
            label="Run race period"
            className={styles.traceModes}
          />
        ) : null}
        <span className={styles.traceReadout}>
          <span style={{ color: homeColor }} className="ds-tabular">
            {homeLabel ?? match.home.shortName} {home[index] ?? 0}
          </span>
          <small>{ticks[index] ?? ""}</small>
          <span style={{ color: awayColor }} className="ds-tabular">
            {awayLabel ?? match.away.shortName} {away[index] ?? 0}
          </span>
        </span>
      </header>

      <div
        ref={canvas}
        className={styles.traceCanvas}
        role="slider"
        tabIndex={0}
        aria-label={`${trace.title} scrubber`}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, points - 1)}
        aria-valuenow={index}
        aria-valuetext={`${ticks[index] ?? index}: ${match.home.shortName} ${home[index] ?? 0} ${trace.unit}, ${match.away.shortName} ${away[index] ?? 0} ${trace.unit}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          scrub(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) scrub(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight")
            setSelected((value) => Math.min(points - 1, value + 1));
          if (event.key === "ArrowLeft")
            setSelected((value) => Math.max(0, value - 1));
        }}
      >
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={path(away)}
            fill="none"
            stroke={awayColor}
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path(home)}
            fill="none"
            stroke={homeColor}
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span
          className={styles.traceGuide}
          style={{ left: `${(x(index) / viewWidth) * 100}%` }}
          aria-hidden="true"
        />

        {markers.map((marker) => (
          <span
            key={`${marker.index}-${marker.label}`}
            className={[
              styles.traceMarker,
              marker.decisive ? styles.traceMarkerFocal : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                left: `${(x(Math.min(marker.index, points - 1)) / viewWidth) * 100}%`,
                "--marker-color":
                  marker.side === "home" ? homeColor : awayColor,
              } as CSSProperties
            }
            title={marker.label}
          />
        ))}
      </div>

      <footer className={styles.traceAxis}>
        <span>{ticks[0]}</span>
        <span>{ticks[Math.floor(points / 2)]}</span>
        <span>{ticks.at(-1)}</span>
      </footer>
    </section>
  );
}
```

#### `src/features/matches/components/team-badge.module.css`

**Unchanged.**

```css
.badge {
  position: relative;
  display: inline-grid;
  flex: none;
  place-items: center;
}

.shadow,
.face {
  position: absolute;
  inset: 0;
  clip-path: var(--ds-clip-octagon);
}

.shadow {
  transform: translateY(var(--team-badge-lift));
  background: color-mix(in srgb, var(--team-primary) 42%, black);
}

.face {
  bottom: var(--team-badge-lift);
  display: grid;
  overflow: hidden;
  place-items: center;
  background: var(--team-primary);
  color: var(--team-ink);
  font-family: var(--ds-font-display);
  font-size: var(--team-badge-font-size);
  font-weight: 700;
  line-height: 1;
}

.face::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 11%;
  content: "";
  background: var(--team-secondary);
}
```

#### `src/features/matches/components/team-badge.tsx`

**Unchanged.**

```tsx
import type { CSSProperties } from "react";

import type { SportTeam } from "@/domain/matches";

import styles from "./team-badge.module.css";

export type TeamBadgeProps = {
  team: SportTeam;
  size?: number;
};

/** The layered octagonal team crest used throughout the sport match pages. */
export function TeamBadge({ team, size = 46 }: TeamBadgeProps) {
  const lift = Math.max(3, Math.round(size * 0.11));
  const fontScale = team.shortName.length > 3 ? 0.2 : 0.24;
  const style = {
    width: size,
    height: size,
    "--team-primary": team.color,
    "--team-secondary": team.secondaryColor ?? team.color,
    "--team-ink": team.badgeTextColor ?? "var(--ds-color-text-default)",
    "--team-badge-lift": `${lift}px`,
    "--team-badge-font-size": `${Math.max(8, Math.round(size * fontScale))}px`,
  } as CSSProperties;

  return (
    <span
      className={styles.badge}
      style={style}
      role="img"
      aria-label={team.name}
    >
      <span aria-hidden className={styles.shadow} />
      <span className={styles.face}>{team.shortName}</span>
    </span>
  );
}
```

## Step 7: the four reports

`MatchScoreboard` picks the view.

#### `src/features/matches/components/match-scoreboard.tsx`

**Adapted.** StatOz's file also holds the plain report used for tennis and for races without a full report. This keeps the four sport-specific reports.

```tsx
"use client";

import type { MatchDetailScoreboard, SportMatch } from "@/domain/matches";

import { BasketballStatsView } from "./basketball-stats-view";
import { CricketStatsView } from "./cricket-stats-view";
import { FootballStatsView } from "./football-stats-view";
import { MotorsportStatsView } from "./motorsport-stats-view";

/**
 * The match report. Each sport has a view of its own; this picks one.
 *
 * StatOz also has a plain three-section report for tennis and for a race
 * without a full report. It is left out here, so those return nothing.
 */
export function MatchScoreboard({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  if (match.sport === "football")
    return <FootballStatsView match={match} scoreboard={scoreboard} />;
  if (match.sport === "basketball")
    return <BasketballStatsView match={match} scoreboard={scoreboard} />;
  if (match.sport === "cricket")
    return <CricketStatsView match={match} scoreboard={scoreboard} />;
  if (match.sport === "motorsport" && scoreboard.race)
    return <MotorsportStatsView report={scoreboard.race} />;
  return null;
}
```

### Football

The view, the shot map, the pitch, and the player card.

#### `src/features/matches/components/football-stats-view.tsx`

**Unchanged.**

```tsx
"use client";

import { useRef, useState } from "react";

import {
  BoltIcon,
  FilterChips,
  ShowChartIcon,
  accentVar,
} from "@/design-system";
import type { MatchDetailScoreboard, SportMatch } from "@/domain/matches";

import { CommentaryView, TimelineList } from "./match-report-parts";
import { MatchPitchView } from "./match-pitch-view";
import {
  EmptyPanel,
  MatchIntelPanel,
  SectionHeading,
  StatComparisonRow,
  StatsRow,
  TeamLegendRow,
} from "./match-stats-shell";
import { MatchTraceChart } from "./match-trace-chart";
import { FootballShotMap } from "./football-shot-map";
import styles from "./match-stats.module.css";

/**
 * The football report — the app's five sections, in its order.
 *
 * OVERVIEW leads with territorial control, MOMENTUM is the two-sided pressure
 * trace with the goals riding it, EVENTS is the log, LINEUPS the pitch, and
 * COMMENTARY the play-by-play.
 */

const tabs = ["OVERVIEW", "MOMENTUM", "LINEUPS", "COMMENTARY"];

export function FootballStatsView({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [tab, setTab] = useState(tabs[0]);
  const scroll = useRef<HTMLDivElement>(null);

  const selectTab = (nextTab: string) => {
    setTab(nextTab);
    requestAnimationFrame(() => scroll.current?.scrollTo({ top: 0 }));
  };

  return (
    <div className={styles.statsView}>
      <FilterChips
        options={tabs}
        selected={tab}
        onSelect={selectTab}
        label="Match report sections"
      />
      <div ref={scroll} className={styles.statsScroll}>
        {tab === "OVERVIEW" ? (
          <Overview match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "MOMENTUM" ? (
          <Momentum match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "LINEUPS" ? (
          <MatchPitchView match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "COMMENTARY" ? (
          <CommentaryView match={match} commentary={scoreboard.commentary} />
        ) : null}
      </div>
    </div>
  );
}

function Overview({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [held, setHeld] = useState<string | null>(null);
  return (
    <div className={styles.stack}>
      <section className={styles.tight}>
        <SectionHeading label="MATCH INTEL" />
        <MatchIntelPanel match={match} intel={scoreboard.intel} />
      </section>

      <section className={styles.tight}>
        <SectionHeading label="TEAM CONTROL" />
        <TeamLegendRow match={match} />
        {scoreboard.stats.map((stat) => (
          <StatComparisonRow
            key={stat.label}
            stat={stat}
            homeColor={match.home.secondaryTextColor ?? match.home.color}
            awayColor={match.away.secondaryTextColor ?? match.away.color}
            selected={held === stat.label}
            onSelect={() =>
              setHeld((current) => (current === stat.label ? null : stat.label))
            }
          />
        ))}
      </section>

      <section className={`${styles.tight} spanFull`}>
        <TimelineList match={match} events={scoreboard.timeline} />
      </section>
    </div>
  );
}

function Momentum({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  if (!scoreboard.trace) {
    return (
      <EmptyPanel
        icon={ShowChartIcon}
        spark={BoltIcon}
        title="Pressure feed offline"
        message="Momentum will map the match once enough live actions arrive."
      />
    );
  }
  return (
    <div className={styles.stack}>
      <div className="spanFull">
        <MatchTraceChart match={match} trace={scoreboard.trace} />
      </div>
      <div className="spanFull">
        <FootballShotMap match={match} shots={scoreboard.shots ?? []} />
      </div>
      <section className={`${styles.tight} spanFull`}>
        <SectionHeading label="PRESSURE READ" />
        <StatsRow accent={accentVar("cyan")}>
          <p
            style={{
              margin: 0,
              color: "var(--ds-color-text-muted)",
              fontSize: "12px",
            }}
          >
            Drag the trace to read either side&rsquo;s pressure at any point.
            Goals ride the plot as markers, and the one that decided it carries
            the halo.
          </p>
        </StatsRow>
      </section>
    </div>
  );
}
```

#### `src/features/matches/components/football-shot-map.module.css`

**Unchanged.**

```css
.panel {
  display: grid;
  gap: var(--ds-space-10);
  padding: var(--ds-space-12);
  border: 1px solid var(--ds-color-border-default);
  background: var(--ds-color-background-data);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-12);
}
.header h3,
.header span,
.caption,
.empty,
.outcomes,
.detail header {
  font-family: var(--ds-font-display);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
}
.header h3 {
  margin: 0;
  color: var(--ds-color-accent-cyan);
  font-size: var(--ds-text-2xs);
}
.header span {
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-micro);
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ds-space-6);
  padding: 0;
}
.filters > button {
  width: 100%;
  padding-inline: var(--ds-space-8);
  font-size: var(--ds-text-2xs);
}

.pitch {
  position: relative;
  aspect-ratio: 105 / 68;
  margin: var(--ds-space-8) var(--ds-space-12) 0;
  background: color-mix(
    in srgb,
    var(--ds-color-accent-cyan) 2%,
    var(--ds-color-background-muted)
  );
}
.pitch > svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.pitchLine,
.pitchFaint,
.goalLine {
  fill: none;
  vector-effect: non-scaling-stroke;
}
.pitchLine {
  stroke: var(--ds-color-border-strong);
  stroke-width: 1;
}
.pitchFaint {
  stroke: color-mix(in srgb, var(--ds-color-border-strong) 62%, transparent);
  stroke-width: 1;
}
.pitchSpot {
  fill: var(--ds-color-border-strong);
}
.goalLine {
  stroke: color-mix(in srgb, var(--ds-color-accent-gold) 48%, transparent);
  stroke-width: 1.1;
}

.shot {
  position: absolute;
  display: grid;
  width: 28px;
  height: 28px;
  translate: -50% -50%;
  place-items: center;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}
.shot > span {
  display: block;
  width: 8px;
  height: 8px;
  border: 1.5px solid var(--shot-color);
  border-radius: 50%;
  background: transparent;
  transition:
    scale 140ms ease,
    box-shadow 140ms ease;
}
.shot[data-outcome="goal"] > span {
  width: 11px;
  height: 11px;
  border-color: var(--ds-color-background-muted);
  background: var(--shot-color);
  box-shadow: 0 0 8px color-mix(in srgb, var(--shot-color) 70%, transparent);
}
.shot[data-outcome="saved"] > span {
  background: color-mix(in srgb, var(--shot-color) 90%, transparent);
}
.shot[data-outcome="blocked"] > span {
  width: 7px;
  height: 7px;
  opacity: 0.55;
}
.shot[data-selected] > span {
  scale: 1.3;
  box-shadow:
    0 0 0 4px var(--ds-color-background-muted),
    0 0 0 5px var(--shot-color),
    0 0 12px var(--shot-color);
}
.shot:focus-visible {
  outline-color: var(--shot-color);
  outline-offset: -2px;
}

.empty {
  position: absolute;
  inset: 0;
  display: grid;
  margin: 0;
  place-items: center;
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-nano);
}

.outcomes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ds-space-8) var(--ds-space-14);
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-nano);
}
.outcomes span {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-4);
}
.outcomes i {
  display: block;
  width: 8px;
  height: 8px;
  border: 1px solid currentcolor;
  border-radius: 50%;
}
.outcomes span[data-outcome="goal"] i {
  width: 10px;
  height: 10px;
  border: 0;
  background: currentcolor;
  box-shadow: 0 0 6px currentcolor;
}
.outcomes span[data-outcome="saved"] i {
  border: 0;
  background: currentcolor;
}
.outcomes span[data-outcome="blocked"] i {
  scale: 0.78;
  opacity: 0.55;
}

.detail {
  grid-template-columns: minmax(0, 1fr) minmax(112px, 34%);
  align-items: start;
  gap: var(--ds-space-12);
}
.detailCopy {
  min-width: 0;
}
.detail header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-8);
  color: var(--row-accent);
  font-size: var(--ds-text-micro);
}
.detail h4 {
  margin: var(--ds-space-8) 0 var(--ds-space-4);
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-sm);
}
.detail p {
  margin: 0;
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
  line-height: var(--ds-leading-body);
}

.caption {
  margin: 0;
  color: var(--ds-color-text-muted);
  text-align: center;
  font-size: var(--ds-text-nano);
  line-height: var(--ds-leading-body);
}

@media (width < 27rem) {
  .pitch {
    margin-inline: 0;
  }
  .detail {
    grid-template-columns: 1fr;
  }
}
```

#### `src/features/matches/components/football-shot-map.tsx`

**Unchanged.**

```tsx
"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { FilterChips, GoalMouthDiagram } from "@/design-system";
import type { MatchShot, ShotOutcome, SportMatch } from "@/domain/matches";

import { EmptyPanel, StatsRow, TeamLegendRow } from "./match-stats-shell";
import styles from "./football-shot-map.module.css";

const filters = ["ALL", "1ST", "2ND", "GOALS"];

function shotLabel(outcome: ShotOutcome): string {
  if (outcome === "saved") return "ON TARGET";
  if (outcome === "missed") return "OFF TARGET";
  return outcome.toUpperCase();
}

/**
 * The feed reports every attempt in the shooter's attacking frame. Place the
 * home team on the left and the away team on the right to match the team key.
 */
function pitchPosition(shot: MatchShot): { left: number; top: number } {
  return shot.side === "home"
    ? { left: 100 - shot.x, top: shot.y }
    : { left: shot.x, top: 100 - shot.y };
}

/** Full-pitch attempt plot, matching the football report in the Flutter app. */
export function FootballShotMap({
  match,
  shots,
}: {
  match: SportMatch;
  shots: MatchShot[];
}) {
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const homeColor = match.home.secondaryTextColor ?? match.home.color;
  const awayColor = match.away.secondaryTextColor ?? match.away.color;
  const visible = useMemo(
    () =>
      shots.filter(
        (shot) =>
          filter === "ALL" ||
          (filter === "GOALS" && shot.outcome === "goal") ||
          (filter === "1ST" && shot.period === 1) ||
          (filter === "2ND" && shot.period === 2),
      ),
    [filter, shots],
  );
  const selected = visible.find((shot) => shot.id === selectedId);

  if (!shots.length) {
    return (
      <EmptyPanel
        title="Shot map unavailable"
        message="Tracked shot coordinates were not published for this match."
      />
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h3>SHOT MAP</h3>
        <span>{visible.length} ATTEMPTS</span>
      </header>

      <FilterChips
        options={filters}
        selected={filter}
        onSelect={(value) => {
          setFilter(value);
          setSelectedId(null);
        }}
        label="Shot map period"
        className={styles.filters}
      />

      <div
        className={styles.pitch}
        aria-label={`${visible.length} tracked shots on a full pitch`}
      >
        <svg viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true">
          <rect
            x="0.5"
            y="0.5"
            width="104"
            height="67"
            className={styles.pitchLine}
          />
          <path d="M52.5 .5V67.5" className={styles.pitchLine} />
          <circle cx="52.5" cy="34" r="9.15" className={styles.pitchFaint} />
          <circle cx="52.5" cy="34" r=".65" className={styles.pitchSpot} />
          <path
            d="M.5 13.84H17V54.16H.5M104.5 13.84H88V54.16H104.5"
            className={styles.pitchLine}
          />
          <path
            d="M.5 24.84H6V43.16H.5M104.5 24.84H99V43.16H104.5"
            className={styles.pitchFaint}
          />
          <circle cx="11" cy="34" r=".55" className={styles.pitchSpot} />
          <circle cx="94" cy="34" r=".55" className={styles.pitchSpot} />
          <path
            d="M17 25.9A9.15 9.15 0 0 1 17 42.1M88 25.9A9.15 9.15 0 0 0 88 42.1"
            className={styles.pitchFaint}
          />
          <path
            d="M.5 30.34H-1.5V37.66H.5M104.5 30.34H106.5V37.66H104.5"
            className={styles.goalLine}
          />
        </svg>

        {visible.map((shot) => {
          const color = shot.side === "home" ? homeColor : awayColor;
          const isSelected = selected?.id === shot.id;
          const position = pitchPosition(shot);
          return (
            <button
              key={shot.id}
              type="button"
              className={styles.shot}
              data-outcome={shot.outcome}
              data-selected={isSelected || undefined}
              style={
                {
                  left: `${Math.min(99, Math.max(1, position.left))}%`,
                  top: `${Math.min(98, Math.max(2, position.top))}%`,
                  "--shot-color": color,
                } as CSSProperties
              }
              onClick={() =>
                setSelectedId((current) =>
                  current === shot.id ? null : shot.id,
                )
              }
              aria-pressed={isSelected}
              aria-label={`${shot.player}, ${shotLabel(shot.outcome)}, ${shot.minute} minute`}
            >
              <span />
            </button>
          );
        })}

        {visible.length === 0 ? (
          <p className={styles.empty}>NO PLOTTED ATTEMPTS IN THIS FILTER</p>
        ) : null}
      </div>

      <TeamLegendRow match={match} />
      <div className={styles.outcomes} aria-label="Shot outcome legend">
        {(["goal", "saved", "missed", "blocked"] as const).map((outcome) => (
          <span key={outcome} data-outcome={outcome}>
            <i /> {shotLabel(outcome)}
          </span>
        ))}
      </div>

      {selected ? (
        <StatsRow
          accent={selected.side === "home" ? homeColor : awayColor}
          selected
          className={styles.detail}
        >
          <div className={styles.detailCopy}>
            <header>
              <b>{selected.minute}&prime;</b>
              <span>{shotLabel(selected.outcome)}</span>
            </header>
            <h4>{selected.player}</h4>
            <p>{selected.detail}</p>
          </div>
          <GoalMouthDiagram
            placement={selected.goalPlacement}
            caption={
              selected.outcome === "blocked"
                ? "BLOCKED // NEVER REACHED THE GOAL"
                : undefined
            }
          />
        </StatsRow>
      ) : null}

      <p className={styles.caption}>
        TRACKED SHOT POSITIONS // {match.home.shortName.toUpperCase()} ATTACK
        LEFT // {match.away.shortName.toUpperCase()} ATTACK RIGHT
      </p>
    </section>
  );
}
```

#### `src/features/matches/components/match-pitch.module.css`

**Unchanged.**

```css
/*
 * The team sheet as a board. The surface is drawn in CSS — a survey grid, the
 * boundary, a halfway line and a centre circle, plus the boxes each sport
 * marks — so it scales with the panel instead of being an image.
 */

.view {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  container-type: inline-size;
}

.scroll {
  display: grid;
  min-height: 0;
  flex: 1;
  align-content: start;
  gap: 12px;
  padding: 4px 16px 28px;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}

.panel {
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--team-color) 40%, transparent);
  background: var(--ds-color-background-secondary);
  clip-path: var(--ds-clip-panel);
}

.boardPanel {
  padding: 8px;
}

/* ---- Identity -------------------------------------------------------------- */

.identity {
  display: flex;
  align-items: center;
  gap: 12px;
}
.identityCopy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 4px;
}
.identityCopy strong {
  overflow: hidden;
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.identityCopy small {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 8.5px;
  font-weight: 900;
  letter-spacing: 0.09em;
}

.sheetState {
  flex: none;
  padding: 5px 8px;
  border: 1px solid color-mix(in srgb, var(--state-color) 50%, transparent);
  background: color-mix(in srgb, var(--state-color) 10%, transparent);
  color: var(--state-color);
  font-family: var(--ds-font-display);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.09em;
}

/* ---- The surface ----------------------------------------------------------- */

.pitch {
  position: relative;
  aspect-ratio: 0.66;
  overflow: hidden;
  background: var(--ds-color-background-secondary);
  clip-path: var(--ds-clip-panel);
}
.pitchCourt {
  aspect-ratio: 0.74;
}

/* Every marking is drawn in this one colour. */
.pitch {
  --line: color-mix(in srgb, var(--ds-color-border-strong) 32%, transparent);
}

/* The survey grid, the boundary and the halfway line. */

.markings {
  position: absolute;
  inset: 0;
  background:
    /* Halfway line. */ linear-gradient(var(--line), var(--line)) 0 50% / 100%
    1.2px no-repeat;
  box-shadow: inset 0 0 0 1.2px var(--line);
}

/* The penalty area at each end; the goal area nests inside it. */
.markings::before,
.markings::after {
  position: absolute;
  left: 50%;
  width: 54%;
  height: 15%;
  transform: translateX(-50%);
  content: "";
  box-shadow: inset 0 0 0 1.2px var(--line);
}
.markings::before {
  top: 0;
}
.markings::after {
  bottom: 0;
}

.goalAreas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.goalAreas::before,
.goalAreas::after {
  position: absolute;
  left: 50%;
  width: 26%;
  height: 5.5%;
  transform: translateX(-50%);
  content: "";
  box-shadow: inset 0 0 0 1.2px var(--line);
}
.goalAreas::before {
  top: 0;
}
.goalAreas::after {
  bottom: 0;
}

/* A court marks a key at each end and no goal area. */
.pitchCourt .markings::before,
.pitchCourt .markings::after {
  width: 36%;
  height: 22%;
}
.pitchCourt .goalAreas {
  display: none;
}

/* The centre circle: 15% of the width as a radius, so 30% across. */
.centreCircle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border: 1.2px solid var(--line);
  border-radius: 50%;
}

.centreSpot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: color-mix(in srgb, var(--team-color) 12%, transparent);
}

.rows {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 12px 8px;
}
.row {
  display: flex;
  justify-content: space-evenly;
  gap: 4px;
}

.player {
  display: grid;
  width: 72px;
  min-height: 60px;
  justify-items: center;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  cursor: default;
}
button.player {
  cursor: pointer;
  transition: scale 110ms ease;
}
button.player:hover .playerNumber {
  box-shadow:
    inset 0 0 0 1.5px var(--team-color),
    0 0 9px color-mix(in srgb, var(--team-color) 30%, transparent);
}
button.player:active {
  scale: 0.92;
}
button.player:focus-visible {
  outline-color: var(--team-color);
  outline-offset: 2px;
}

.playerBadge {
  position: relative;
  display: block;
  width: 38px;
  height: 38px;
}

.playerNumber {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  clip-path: var(--ds-clip-octagon);
  background: var(--ds-color-background-secondary);
  box-shadow: inset 0 0 0 1.5px
    color-mix(in srgb, var(--team-color) 78%, transparent);
  color: var(--team-color);
  font-family: var(--ds-font-display);
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.playerName {
  max-width: 100%;
  margin-top: 4px;
  overflow: hidden;
  padding: 3px 4px;
  border: 1px solid
    color-mix(in srgb, var(--ds-color-border-strong) 20%, transparent);
  background: color-mix(
    in srgb,
    var(--ds-color-background-primary) 82%,
    transparent
  );
  color: var(--ds-color-text-default);
  font-size: 8.5px;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playerMarks {
  position: absolute;
  top: -5px;
  right: -8px;
  display: flex;
  gap: 1px;
}
.playerMarks i {
  display: grid;
  width: 14px;
  height: 14px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--mark-color) 75%, transparent);
  border-radius: 50%;
  background: var(--ds-color-background-primary);
  color: var(--mark-color);
}
.playerMarks i[data-tone="goal"] {
  --mark-color: var(--ds-color-accent-gold);
  box-shadow: 0 0 6px
    color-mix(in srgb, var(--ds-color-accent-gold) 50%, transparent);
}
.playerMarks i[data-tone="assist"] {
  --mark-color: var(--ds-color-accent-cyan);
}
.playerMarks i[data-tone="red"] {
  --mark-color: var(--ds-color-danger);
}
.playerMarks i[data-tone="yellow"] {
  --mark-color: var(--ds-color-accent-gold);
}
.playerMarks i[data-tone="sub"] {
  --mark-color: var(--ds-color-text-muted);
}

/* ---- Bench ----------------------------------------------------------------- */

.benchHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  font-family: var(--ds-font-display);
  font-weight: 900;
}
.benchHead b {
  color: var(--team-color);
  font-size: 10px;
  letter-spacing: 0.12em;
}
.benchHead small {
  color: var(--ds-color-text-muted);
  font-size: 8px;
  letter-spacing: 0.08em;
}

.benchEmpty {
  margin: 0;
  color: var(--ds-color-text-muted);
  font-size: 12px;
}

.bench {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.benchTile {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  padding: 8px 9px;
  border: 1px solid
    color-mix(in srgb, var(--ds-color-border-strong) 20%, transparent);
  background: color-mix(
    in srgb,
    var(--ds-color-background-secondary) 48%,
    transparent
  );
  color: inherit;
  text-align: left;
}
button.benchTile {
  cursor: pointer;
  transition:
    border-color 130ms ease,
    background 130ms ease,
    scale 110ms ease;
}
button.benchTile:hover {
  border-color: color-mix(in srgb, var(--team-color) 50%, transparent);
  background: color-mix(
    in srgb,
    var(--team-color) 7%,
    var(--ds-color-background-secondary)
  );
}
button.benchTile:active {
  scale: 0.97;
}
button.benchTile:focus-visible {
  outline-color: var(--team-color);
}
.benchTile > b {
  width: 28px;
  flex: none;
  color: var(--team-color);
  font-family: var(--ds-font-display);
  font-size: 10px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}
.benchTile > span {
  display: grid;
  min-width: 0;
}
.benchTile > .playerMarks {
  position: static;
  display: flex;
  min-width: auto;
  margin-left: auto;
}
.benchTile strong {
  overflow: hidden;
  color: var(--ds-color-text-default);
  font-size: 10px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.benchTile small {
  overflow: hidden;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Desktop --------------------------------------------------------------- */

@container (width >= 52rem) {
  /* The board and the squad read side by side rather than stacked. */
  .scroll {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.7fr);
    grid-template-areas: "identity identity" "board bench";
    padding: 4px 24px 28px;
    overflow: visible;
  }
  .scroll > :first-child {
    grid-area: identity;
  }
  .boardPanel {
    grid-area: board;
  }
  .scroll > :last-child {
    grid-area: bench;
    align-self: start;
  }
  .bench {
    grid-template-columns: minmax(0, 1fr);
  }
  .view {
    height: auto;
  }
}
```

#### `src/features/matches/components/match-pitch-view.tsx`

**Unchanged.**

```tsx
"use client";

import { useState, type CSSProperties } from "react";

import {
  FilterChips,
  FootballIcon,
  GroupsIcon,
  MyLocationIcon,
  NoDataState,
  StadiumIcon,
  StyleIcon,
  SwapHorizIcon,
} from "@/design-system";
import type {
  MatchDetailLineup,
  MatchDetailPlayer,
  MatchDetailScoreboard,
  MatchPlayerDossier,
  SportMatch,
  SportTeam,
} from "@/domain/matches";

import { MatchPlayerSheet } from "./match-player-sheet";
import { TeamBadge } from "./team-badge";
import styles from "./match-pitch.module.css";

/**
 * The team sheet as a board rather than a list: one side at a time, its shape
 * laid out on the surface it plays on, and the bench under it.
 *
 * The formation string is the layout — "4-3-3" is a back four, a midfield
 * three and a front three — so the rows come from the data rather than from a
 * per-fixture arrangement.
 */
export function MatchPitchView({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [showHome, setShowHome] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const home = scoreboard.homeLineup;
  const away = scoreboard.awayLineup;

  if (home.players.length === 0 && away.players.length === 0) {
    return (
      <NoDataState
        icon={GroupsIcon}
        spark={StadiumIcon}
        title="Lineups not locked"
        message="Confirmed formations and squad roles will appear here."
      />
    );
  }

  const team = showHome ? match.home : match.away;
  const lineup = showHome ? home : away;
  const teamColor = team.secondaryTextColor ?? team.color;
  const dossiers = (scoreboard.players ?? []).filter(
    (player) => player.teamId === team.id,
  );

  return (
    <div
      className={styles.view}
      style={{ "--team-color": teamColor } as CSSProperties}
    >
      <FilterChips
        label="Team sheet"
        options={[match.home.shortName, match.away.shortName]}
        selected={team.shortName}
        accent="var(--team-color)"
        onSelect={(value) => {
          setShowHome(value === match.home.shortName);
          setSelectedPlayer(null);
        }}
      />

      <div className={styles.scroll} key={team.id}>
        <IdentityPanel team={team} lineup={lineup} />
        <Board
          lineup={lineup}
          basketball={match.sport === "basketball"}
          players={dossiers}
          onSelect={match.sport === "football" ? setSelectedPlayer : undefined}
        />
        <BenchPanel
          lineup={lineup}
          players={dossiers}
          onSelect={match.sport === "football" ? setSelectedPlayer : undefined}
        />
      </div>
      {selectedPlayer ? (
        <MatchPlayerSheet
          key={`${team.id}-${selectedPlayer}`}
          team={team}
          lineup={lineup}
          dossiers={dossiers}
          selectedName={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      ) : null}
    </div>
  );
}

/** Who is out, in what shape, and whether the sheet is official. */
function IdentityPanel({
  team,
  lineup,
}: {
  team: SportTeam;
  lineup: MatchDetailLineup;
}) {
  const squad = lineup.players.length + lineup.substitutes.length;
  return (
    <section className={styles.panel}>
      <div className={styles.identity}>
        <TeamBadge team={team} size={48} />
        <span className={styles.identityCopy}>
          <strong>{team.name.toUpperCase()}</strong>
          <small>
            {lineup.formation} FORMATION // {squad} PLAYER SQUAD
          </small>
        </span>
        <span
          className={styles.sheetState}
          style={
            {
              "--state-color": lineup.confirmed
                ? "var(--ds-color-success)"
                : "var(--ds-color-accent-gold)",
            } as CSSProperties
          }
        >
          {lineup.confirmed ? "CONFIRMED" : "PROJECTED"}
        </span>
      </div>
    </section>
  );
}

/**
 * The surface and the shape on it. The keeper is a row of one, and every
 * number in the formation is a row after that.
 */
function Board({
  lineup,
  basketball,
  players,
  onSelect,
}: {
  lineup: MatchDetailLineup;
  basketball: boolean;
  players: MatchPlayerDossier[];
  onSelect?: (name: string) => void;
}) {
  const counts = [
    1,
    ...lineup.formation
      .split("-")
      .map((part) => Number.parseInt(part, 10) || 0),
  ];
  const starters = [...lineup.players].sort(
    (a, b) => (a.formationPlace ?? 999) - (b.formationPlace ?? 999),
  );
  const rows: MatchDetailPlayer[][] = [];
  let cursor = 0;
  for (const count of counts) {
    const end = Math.min(cursor + count, starters.length);
    rows.push(starters.slice(cursor, end));
    cursor = end;
  }
  if (cursor < starters.length) rows.push(starters.slice(cursor));

  return (
    <section className={`${styles.panel} ${styles.boardPanel}`}>
      <div
        className={[styles.pitch, basketball ? styles.pitchCourt : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <span aria-hidden className={styles.markings} />
        <span aria-hidden className={styles.goalAreas} />
        <span aria-hidden className={styles.centreCircle} />
        <span aria-hidden className={styles.centreSpot} />
        <div className={styles.rows}>
          {rows.map((row, index) => (
            <div key={index} className={styles.row}>
              {row.map((player) => (
                <PitchPlayer
                  key={`${player.number}-${player.name}`}
                  player={player}
                  dossier={players.find(
                    (candidate) => candidate.name === player.name,
                  )}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PitchPlayer({
  player,
  dossier,
  onSelect,
}: {
  player: MatchDetailPlayer;
  dossier?: MatchPlayerDossier;
  onSelect?: (name: string) => void;
}) {
  const content = (
    <>
      <span className={styles.playerBadge}>
        <b className={styles.playerNumber}>{player.number}</b>
        {dossier ? <PlayerMarks player={dossier} /> : null}
      </span>
      <span className={styles.playerName}>
        {player.shortName ?? shortName(player.name)}
      </span>
    </>
  );
  return onSelect ? (
    <button
      type="button"
      className={styles.player}
      onClick={() => onSelect(player.name)}
      aria-label={`Open ${player.name} match dossier`}
    >
      {content}
    </button>
  ) : (
    <span className={styles.player}>{content}</span>
  );
}

/** "Chelsea Mason" reads as "Mason" on a shirt-sized plate. */
function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

function BenchPanel({
  lineup,
  players,
  onSelect,
}: {
  lineup: MatchDetailLineup;
  players: MatchPlayerDossier[];
  onSelect?: (name: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.benchHead}>
        <b>BENCH UNIT</b>
        <small>
          {String(lineup.substitutes.length).padStart(2, "0")} AVAILABLE
        </small>
      </div>
      {lineup.substitutes.length === 0 ? (
        <p className={styles.benchEmpty}>No substitutes supplied.</p>
      ) : (
        <div className={styles.bench}>
          {lineup.substitutes.map((player) => {
            const dossier = players.find(
              (candidate) => candidate.name === player.name,
            );
            const content = (
              <>
                <b>{player.number}</b>
                <span>
                  <strong>{player.shortName ?? shortName(player.name)}</strong>
                  <small>{player.role.toUpperCase()}</small>
                </span>
                {dossier ? <PlayerMarks player={dossier} /> : null}
              </>
            );
            return onSelect ? (
              <button
                key={`${player.number}-${player.name}`}
                type="button"
                className={styles.benchTile}
                onClick={() => onSelect(player.name)}
              >
                {content}
              </button>
            ) : (
              <span
                key={`${player.number}-${player.name}`}
                className={styles.benchTile}
              >
                {content}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

function statValue(player: MatchPlayerDossier, label: string): number {
  return (
    Number(player.stats.find((stat) => stat.label === label)?.value ?? 0) || 0
  );
}

/** Match marks pinned to a shirt badge, with the goal as the only glow. */
function PlayerMarks({ player }: { player: MatchPlayerDossier }) {
  const goals = Math.min(3, statValue(player, "TOTAL GOALS"));
  const assists = statValue(player, "GOAL ASSISTS");
  const red = statValue(player, "RED CARDS");
  const yellow = statValue(player, "YELLOW CARDS");
  const substitutions = statValue(player, "SUB INS");
  if (!goals && !assists && !red && !yellow && !substitutions) return null;
  return (
    <span className={styles.playerMarks} aria-label="Match events">
      {Array.from({ length: goals }, (_, index) => (
        <i key={`goal-${index}`} data-tone="goal">
          <FootballIcon size={8} />
        </i>
      ))}
      {assists ? (
        <i data-tone="assist">
          <MyLocationIcon size={8} />
        </i>
      ) : null}
      {red ? (
        <i data-tone="red">
          <StyleIcon size={8} />
        </i>
      ) : yellow ? (
        <i data-tone="yellow">
          <StyleIcon size={8} />
        </i>
      ) : null}
      {substitutions ? (
        <i data-tone="sub">
          <SwapHorizIcon size={8} />
        </i>
      ) : null}
    </span>
  );
}
```

#### `src/features/matches/components/match-player-sheet.module.css`

**Unchanged.**

```css
.dialog {
  position: fixed;
  inset: auto 0 0;
  width: min(100%, 640px);
  height: min(90dvh, 850px);
  max-width: none;
  max-height: none;
  margin: auto;
  border: 0;
  padding: 0;
  overflow: visible;
  background: transparent;
  color: var(--ds-color-text-default);
}
.dialog::backdrop {
  background: color-mix(
    in srgb,
    var(--ds-color-overlay-scrim) 86%,
    transparent
  );
}
.edge {
  height: 100%;
  padding: 1px;
  background: color-mix(in srgb, var(--player-accent) 40%, transparent);
  clip-path: var(--ds-clip-hud-sheet);
}
.sheet {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: var(--ds-color-background-primary);
  clip-path: var(--ds-clip-hud-sheet);
}

.sheetHeader {
  display: grid;
  min-height: 48px;
  flex: none;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: var(--ds-space-8) var(--ds-space-16) var(--ds-space-4);
}
.sheetHeader strong {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-micro);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-mega);
}
.sheetHeader i {
  width: 36px;
  height: 3px;
  background: color-mix(in srgb, var(--player-accent) 50%, transparent);
}
.sheetHeader button,
.pager button {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--ds-color-text-muted);
  cursor: pointer;
}
.sheetHeader button {
  justify-self: end;
}
.sheetHeader button:hover,
.pager button:hover {
  color: var(--player-accent);
}

.content {
  min-height: 0;
  flex: 1;
  padding: var(--ds-space-4) var(--ds-space-16) var(--ds-space-8);
  overflow-y: auto;
  overscroll-behavior-y: contain;
}
.content > * + * {
  margin-top: var(--ds-space-16);
}
.identity {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ds-space-12);
  overflow: hidden;
  padding: var(--ds-space-12) var(--ds-space-14);
  border: 1px solid color-mix(in srgb, var(--player-accent) 40%, transparent);
  background: var(--ds-color-background-secondary);
  clip-path: var(--ds-clip-panel);
}
.numberGhost {
  position: absolute;
  top: -20px;
  right: -6px;
  color: color-mix(in srgb, var(--player-accent) 10%, transparent);
  font-family: var(--ds-font-display);
  font-size: 86px;
  font-weight: 900;
  line-height: 1;
}
.identityCopy {
  position: relative;
  display: grid;
  min-width: 0;
  gap: var(--ds-space-4);
}
.identity h2 {
  margin: 0;
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-base);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-tight);
}
.identity p {
  margin: 0;
  overflow: hidden;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-micro);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-ultra);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.statuses {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-6);
  margin-top: var(--ds-space-4);
}
.statuses b {
  padding: var(--ds-space-4) var(--ds-space-6);
  border: 1px solid color-mix(in srgb, var(--player-accent) 48%, transparent);
  background: color-mix(in srgb, var(--player-accent) 10%, transparent);
  color: var(--player-accent);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-nano);
  letter-spacing: var(--ds-tracking-wide);
}
.statuses b[data-muted] {
  border-color: var(--ds-color-border-default);
  background: transparent;
  color: var(--ds-color-text-muted);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ds-space-8);
}
.metrics > span {
  display: grid;
  min-width: 0;
  min-height: 52px;
  align-content: center;
  gap: var(--ds-space-4);
  padding: var(--ds-space-8);
  border: 1px solid var(--ds-color-border-default);
  background: color-mix(
    in srgb,
    var(--ds-color-background-primary) 42%,
    transparent
  );
}
.metrics small {
  overflow: hidden;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-nano);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.metrics b {
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-sm);
  font-weight: 900;
}
.metrics b[data-accent] {
  color: var(--player-accent);
}

.block {
  display: grid;
  gap: var(--ds-space-10);
}
.block > h3,
.noSheet h3 {
  display: flex;
  align-items: center;
  gap: var(--ds-space-10);
  margin: 0;
  color: color-mix(in srgb, var(--ds-color-accent-cyan) 70%, transparent);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-2xs);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-mega);
}
.block > h3::after {
  height: 1px;
  flex: 1;
  content: "";
  background: color-mix(
    in srgb,
    var(--ds-color-border-strong) 30%,
    transparent
  );
}
.rangeTabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ds-space-6);
  padding: 0;
}
.rangeTabs > button {
  width: 100%;
}
.heatPanel {
  display: grid;
  gap: var(--ds-space-8);
  padding: var(--ds-space-10);
  border: 1px solid color-mix(in srgb, var(--player-accent) 40%, transparent);
  background: var(--ds-color-background-secondary);
  clip-path: var(--ds-clip-panel);
}
.heatPanel > small {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-nano);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-ultra);
}
.heatPitch {
  position: relative;
  aspect-ratio: 105 / 68;
  overflow: hidden;
  background: var(--ds-color-background-muted);
}
.heatPitch svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: color-mix(in srgb, var(--ds-color-border-strong) 62%, transparent);
  vector-effect: non-scaling-stroke;
}
.heatPitch > i {
  position: absolute;
  width: 28px;
  height: 28px;
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--player-accent) 65%, var(--ds-color-accent-gold)) 0,
    color-mix(in srgb, var(--ds-color-accent-cyan) 36%, transparent) 45%,
    transparent 72%
  );
  mix-blend-mode: screen;
}
.noTouches {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-micro);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-wide);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
  gap: var(--ds-space-8);
}
.stats > span {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-8);
  padding: var(--ds-space-8) var(--ds-space-10);
  border: 1px solid
    color-mix(in srgb, var(--ds-color-text-muted) 16%, transparent);
  background: var(--ds-color-background-elevated);
  clip-path: var(--ds-clip-compact-hud);
}
.stats small {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-nano);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-ultra);
}
.stats b {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-sm);
}
.stats > span[data-scored] {
  border-color: color-mix(in srgb, var(--player-accent) 40%, transparent);
}
.stats > span[data-scored] b {
  color: var(--player-accent);
}
.noSheet {
  padding: var(--ds-space-24) var(--ds-space-16);
  border: 1px solid var(--ds-color-border-default);
  background: var(--ds-color-background-data);
  text-align: center;
}
.noSheet h3 {
  justify-content: center;
}
.noSheet p {
  margin: var(--ds-space-8) 0 0;
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
}

.pager {
  display: flex;
  min-height: 58px;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-8);
  padding: var(--ds-space-6) var(--ds-space-16) var(--ds-space-12);
}
.pager span {
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-nano);
  font-weight: 900;
  letter-spacing: var(--ds-tracking-ultra);
  text-align: center;
}

@media (width >= 60rem) {
  .dialog {
    inset: 5dvh auto auto 50%;
    width: min(760px, calc(100% - 48px));
    translate: -50% 0;
  }
}

@media (width < 27rem) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .identity {
    align-items: flex-start;
  }
}
```

#### `src/features/matches/components/match-player-sheet.tsx`

**Unchanged.**

```tsx
"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  FilterChips,
} from "@/design-system";
import type {
  MatchDetailLineup,
  MatchDetailPlayer,
  MatchPlayerDossier,
  SportTeam,
} from "@/domain/matches";

import { TeamBadge } from "./team-badge";
import styles from "./match-player-sheet.module.css";

type SquadPlayer = {
  roster: MatchDetailPlayer;
  dossier?: MatchPlayerDossier;
};

const ranges = ["FULL", "1ST", "2ND"];

export function MatchPlayerSheet({
  team,
  lineup,
  dossiers,
  selectedName,
  onClose,
}: {
  team: SportTeam;
  lineup: MatchDetailLineup;
  dossiers: MatchPlayerDossier[];
  selectedName: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const accent = team.secondaryTextColor ?? team.color;
  const squad = useMemo<SquadPlayer[]>(
    () =>
      [...lineup.players, ...lineup.substitutes].map((roster) => ({
        roster,
        dossier: dossiers.find((candidate) => candidate.name === roster.name),
      })),
    [dossiers, lineup.players, lineup.substitutes],
  );
  const selectedIndex = squad.findIndex(
    (player) => player.roster.name === selectedName,
  );
  const [index, setIndex] = useState(selectedIndex < 0 ? 0 : selectedIndex);
  const [range, setRange] = useState("FULL");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
  }, [selectedName]);

  const player = squad[index];
  const move = (direction: -1 | 1) => {
    if (!squad.length) return;
    setIndex((current) => (current + direction + squad.length) % squad.length);
    setRange("FULL");
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
      style={{ "--player-accent": accent } as CSSProperties}
    >
      <div className={styles.edge}>
        <div className={styles.sheet}>
          <header className={styles.sheetHeader}>
            <strong id={titleId}>MATCH DOSSIER</strong>
            <i aria-hidden="true" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close match dossier"
            >
              <CloseIcon size={16} />
            </button>
          </header>

          {player ? (
            <PlayerCard
              key={player.roster.name}
              player={player}
              team={team}
              range={range}
              onRange={setRange}
            />
          ) : null}

          <footer className={styles.pager}>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous player"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span>
              BROWSE NEXT PLAYER // {index + 1} OF {squad.length}
            </span>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next player"
            >
              <ChevronRightIcon size={16} />
            </button>
          </footer>
        </div>
      </div>
    </dialog>
  );
}

function PlayerCard({
  player,
  team,
  range,
  onRange,
}: {
  player: SquadPlayer;
  team: SportTeam;
  range: string;
  onRange: (range: string) => void;
}) {
  const { roster, dossier } = player;
  const heatmap = (dossier?.heatmap ?? []).filter(
    (point) => range === "FULL" || point.period === (range === "1ST" ? 1 : 2),
  );
  const appearances = statNumber(dossier, "APPEARANCES");
  const played = appearances > 0;
  const touches = dossier?.heatmap?.length ?? 0;
  const finalThird = (dossier?.heatmap ?? []).filter(
    (point) => point.x >= 66,
  ).length;
  const territory = touches
    ? Math.round(
        (dossier?.heatmap ?? []).reduce((sum, point) => sum + point.x, 0) /
          touches,
      )
    : null;

  return (
    <div className={styles.content}>
      <section className={styles.identity}>
        <span className={styles.numberGhost} aria-hidden="true">
          {roster.number}
        </span>
        <TeamBadge team={team} size={66} />
        <span className={styles.identityCopy}>
          <h2>{roster.name.toUpperCase()}</h2>
          <p>
            {roster.role.toUpperCase()} {"//"} #{roster.number} {"//"}{" "}
            {team.shortName.toUpperCase()}
          </p>
          <span className={styles.statuses}>
            <b>{lineupRole(roster)}</b>
            <b data-muted>{played ? "MATCH DATA" : "UNUSED"}</b>
          </span>
        </span>
      </section>

      {dossier ? (
        <>
          <section className={styles.metrics} aria-label="Player impact">
            <Metric
              label="TOUCHES"
              value={String(touches)}
              accent={touches > 0}
            />
            <Metric label="xG" value="—" />
            <Metric
              label="FINAL 3RD"
              value={touches ? String(finalThird) : "—"}
            />
            <Metric
              label="TERRITORY"
              value={territory == null ? "—" : `${territory}%`}
            />
          </section>

          <section className={styles.block}>
            <h3>HEAT MAP</h3>
            <FilterChips
              options={ranges}
              selected={range}
              onSelect={onRange}
              label="Heat map period"
              className={styles.rangeTabs}
            />
            <div className={styles.heatPanel}>
              <div className={styles.heatPitch}>
                <PitchMarkings />
                {heatmap.map((point, pointIndex) => (
                  <i
                    key={`${point.x}-${point.y}-${point.period}-${pointIndex}`}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  />
                ))}
                {!heatmap.length ? (
                  <span className={styles.noTouches}>
                    {played ? "NO TRACKED TOUCHES" : "UNUSED SUBSTITUTE"}
                  </span>
                ) : null}
              </div>
              <small>TRACKED TOUCH DENSITY // ATTACKING →</small>
            </div>
          </section>

          <section className={styles.block}>
            <h3>MATCH OUTPUT</h3>
            <div className={styles.stats}>
              {dossier.stats.map((stat) => (
                <span
                  key={stat.label}
                  data-scored={Number(stat.value) > 0 || undefined}
                >
                  <small>{stat.label}</small>
                  <b>{stat.value}</b>
                </span>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.noSheet}>
          <h3>NO MATCH SHEET</h3>
          <p>This fixture has no per-player data from the feed yet.</p>
        </section>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span>
      <small>{label}</small>
      <b data-accent={accent || undefined}>{value}</b>
    </span>
  );
}

function statNumber(
  player: MatchPlayerDossier | undefined,
  label: string,
): number {
  return (
    Number(player?.stats.find((stat) => stat.label === label)?.value ?? 0) || 0
  );
}

function lineupRole(player: MatchDetailPlayer): string {
  return player.formationPlace ? "STARTER" : "SUBSTITUTE";
}

function PitchMarkings() {
  return (
    <svg viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true">
      <rect x=".5" y=".5" width="104" height="67" />
      <path d="M52.5 .5V67.5M.5 13.84H17V54.16H.5M104.5 13.84H88V54.16H104.5" />
      <circle cx="52.5" cy="34" r="9.15" />
    </svg>
  );
}
```

### Cricket

#### `src/features/matches/components/cricket-stats-view.tsx`

**Unchanged.**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import {
  FilterChips,
  GridOnIcon,
  InsightsIcon,
  InteractiveLineChart,
  MicIcon,
  ShowChartIcon,
  accentVar,
} from "@/design-system";
import type { MatchDetailScoreboard, SportMatch } from "@/domain/matches";

import {
  EmptyPanel,
  MatchIntelPanel,
  SectionHeading,
  StatComparisonRow,
  StatsRow,
  TeamLegendRow,
} from "./match-stats-shell";
import { MatchTraceChart } from "./match-trace-chart";
import styles from "./match-stats.module.css";

/**
 * The cricket report: the chase, the two worms side by side, the required rate
 * against the actual one, the card, the ball-by-ball feed, and the squads.
 */

const tabs = ["OVERVIEW", "RACE", "SCORECARD", "MATCH FEED"];

export function CricketStatsView({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className={styles.statsView}>
      <FilterChips
        options={tabs}
        selected={tab}
        onSelect={setTab}
        label="Match report sections"
      />
      <div className={styles.statsScroll}>
        {tab === "OVERVIEW" ? (
          <Overview match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "RACE" ? (
          scoreboard.trace ? (
            <div className={styles.stack}>
              <div className="spanFull">
                <MatchTraceChart
                  match={match}
                  trace={scoreboard.trace}
                  showInningsModes
                />
              </div>
              {scoreboard.runRate?.length ? (
                <CricketRunRateChart match={match} scoreboard={scoreboard} />
              ) : (
                <EmptyPanel
                  icon={ShowChartIcon}
                  title="Run-rate data unavailable"
                  message="Legal-delivery progression was not published for this innings."
                />
              )}
            </div>
          ) : (
            <EmptyPanel
              icon={ShowChartIcon}
              title="Race data unavailable"
              message="Both innings need published scoring samples for this race."
            />
          )
        ) : null}
        {tab === "SCORECARD" ? (
          <Scorecard match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "MATCH FEED" ? (
          <Feed match={match} scoreboard={scoreboard} />
        ) : null}
      </div>
    </div>
  );
}

function Overview({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [held, setHeld] = useState<string | null>(null);
  return (
    <div className={styles.stack}>
      <section className={styles.tight}>
        <SectionHeading label="MATCH INTEL" />
        <MatchIntelPanel match={match} intel={scoreboard.intel} />
      </section>

      <section className={styles.tight}>
        <SectionHeading label="TEAM COMPARISON" />
        <TeamLegendRow match={match} />
        {scoreboard.stats.map((stat) => (
          <StatComparisonRow
            key={stat.label}
            stat={stat}
            homeColor={match.home.color}
            awayColor={match.away.color}
            selected={held === stat.label}
            onSelect={() =>
              setHeld((current) => (current === stat.label ? null : stat.label))
            }
          />
        ))}
      </section>
    </div>
  );
}

/**
 * The card behind the score: one innings at a time, who batted and what they
 * made, then who bowled at them. The phase comparison stays underneath, since
 * it is the only place the two innings are read against each other.
 */
function Scorecard({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const innings = scoreboard.innings ?? [];
  const [selected, setSelected] = useState(0);

  if (innings.length === 0) {
    return (
      <EmptyPanel
        icon={GridOnIcon}
        title="Scorecard unavailable"
        message="Batting and bowling figures have not been published."
      />
    );
  }

  const card = innings[Math.min(selected, innings.length - 1)];
  const accent = card.side === "home" ? match.home.color : match.away.color;

  return (
    <div className={styles.stack}>
      {innings.length > 1 ? (
        <div className={`${styles.inningsTabs} spanFull`}>
          {innings.map((entry, index) => (
            <button
              key={entry.team}
              type="button"
              className={`${styles.inningsTab} ${index === selected ? styles.inningsTabActive : ""}`}
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              {entry.team}
            </button>
          ))}
        </div>
      ) : null}

      <section className={`${styles.tight} spanFull`}>
        <StatsRow accent={accent}>
          <span className={styles.inningsHead}>
            <span>
              <strong>{card.team} Innings</strong>
              <small>
                RR {card.runRate}
                {card.target == null ? "" : ` // TARGET ${card.target}`}
              </small>
            </span>
            <span className={styles.inningsScore}>
              <b style={{ color: accent }}>{card.score}</b>
              <small>{card.overs.toUpperCase()}</small>
            </span>
          </span>
        </StatsRow>
      </section>

      <section className={`${styles.tight} spanFull`}>
        <SectionHeading label="BATTING" />
        <table className={styles.card}>
          <thead>
            <tr>
              <th>BATTER</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>
          <tbody>
            {card.batting.map((line) => (
              <tr key={line.name}>
                <td>
                  {scoreboard.players?.find(
                    (player) =>
                      player.name === line.name ||
                      player.shortName === line.name,
                  ) ? (
                    <Link
                      href={`/matches/${match.id}/players/${scoreboard.players.find((player) => player.name === line.name || player.shortName === line.name)!.id}`}
                    >
                      <strong
                        style={line.dismissal ? undefined : { color: accent }}
                      >
                        {line.name}
                      </strong>
                    </Link>
                  ) : (
                    <strong
                      style={line.dismissal ? undefined : { color: accent }}
                    >
                      {line.name}
                    </strong>
                  )}
                  <small>{line.dismissal ?? "not out"}</small>
                </td>
                <td>
                  <b>{line.runs}</b>
                </td>
                <td>{line.balls}</td>
                <td>{line.fours}</td>
                <td>{line.sixes}</td>
                <td>{strikeRate(line.runs, line.balls)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${styles.tight} spanFull`}>
        <SectionHeading label="BOWLING" />
        <table className={styles.card}>
          <thead>
            <tr>
              <th>BOWLER</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>ECON</th>
            </tr>
          </thead>
          <tbody>
            {card.bowling.map((line) => (
              <tr key={line.name}>
                <td>
                  {scoreboard.players?.find(
                    (player) =>
                      player.name === line.name ||
                      player.shortName === line.name,
                  ) ? (
                    <Link
                      href={`/matches/${match.id}/players/${scoreboard.players.find((player) => player.name === line.name || player.shortName === line.name)!.id}`}
                    >
                      <strong>{line.name}</strong>
                    </Link>
                  ) : (
                    <strong>{line.name}</strong>
                  )}
                </td>
                <td>{line.overs}</td>
                <td>{line.maidens}</td>
                <td>{line.runs}</td>
                <td>
                  <b>{line.wickets}</b>
                </td>
                <td>{economy(line.runs, line.overs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.tight}>
        <SectionHeading label="PHASES" />
        {scoreboard.scoreRows.map((row) => (
          <StatsRow key={row.label} accent={accentVar("cyan")}>
            <span className={styles.comparisonHead}>
              <b className="ds-tabular">{row.home}</b>
              <small>{row.label}</small>
              <b className="ds-tabular">{row.away}</b>
            </span>
          </StatsRow>
        ))}
      </section>
    </div>
  );
}

/** Runs per hundred balls, the way a card prints it. */
function strikeRate(runs: number, balls: number): string {
  return balls === 0 ? "0.00" : ((runs / balls) * 100).toFixed(2);
}

/** Runs per over, from an overs figure written as `3.4`. */
function economy(runs: number, overs: string): string {
  const [whole, balls = "0"] = overs.split(".");
  const bowled = Number(whole) + Number(balls) / 6;
  return bowled === 0 ? "0.00" : (runs / bowled).toFixed(2);
}

function Feed({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [teamId, setTeamId] = useState(match.home.id);
  const allFeed = scoreboard.feed ?? [];
  const feed = allFeed.some((entry) => entry.teamId)
    ? allFeed.filter((entry) => entry.teamId === teamId)
    : allFeed;
  return (
    <div className={styles.stack}>
      {allFeed.some((entry) => entry.teamId) ? (
        <FilterChips
          options={[match.home.shortName, match.away.shortName]}
          selected={
            teamId === match.home.id
              ? match.home.shortName
              : match.away.shortName
          }
          onSelect={(value) =>
            setTeamId(
              value === match.home.shortName ? match.home.id : match.away.id,
            )
          }
          label="Batting innings"
        />
      ) : null}
      {feed.length === 0 ? (
        <EmptyPanel
          icon={MicIcon}
          spark={InsightsIcon}
          title={`${teamId === match.home.id ? match.home.shortName : match.away.shortName} commentary unavailable`}
          message="This committed package does not publish a commentary timeline for that innings."
        />
      ) : (
        <FeedRows feed={feed} />
      )}
    </div>
  );
}

function FeedRows({
  feed,
}: {
  feed: NonNullable<MatchDetailScoreboard["feed"]>;
}) {
  const accentFor = (kind: string) =>
    kind === "wicket"
      ? "var(--ds-color-danger)"
      : kind === "score"
        ? accentVar("gold")
        : accentVar("cyan");
  return (
    <div className={styles.tight}>
      <SectionHeading label="MATCH FEED" />
      {feed.map((event) => (
        <StatsRow
          key={`${event.marker}-${event.text}`}
          accent={accentFor(event.kind)}
        >
          <span className={styles.eventRow}>
            <b
              className={styles.feedMarker}
              style={{ color: accentFor(event.kind) }}
            >
              {event.marker}
            </b>
            <span className={styles.eventCopy}>
              <strong style={{ whiteSpace: "normal", fontWeight: 400 }}>
                {event.text}
              </strong>
            </span>
          </span>
        </StatsRow>
      ))}
    </div>
  );
}

function CricketRunRateChart({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const runRate = scoreboard.runRate ?? [];
  const [innings, setInnings] = useState<1 | 2>(1);
  const current =
    runRate.find((entry) => entry.innings === innings) ?? runRate[0];
  const [selected, setSelected] = useState<number | null>(null);
  if (!current) return null;
  const team = current.teamId === match.home.id ? match.home : match.away;
  const hasRequired = current.points.some((point) => point.required != null);
  return (
    <section className={`${styles.tight} spanFull`}>
      <SectionHeading label="INNINGS RUN RATE" />
      <FilterChips
        options={["1ST INNINGS", "2ND INNINGS"]}
        selected={innings === 1 ? "1ST INNINGS" : "2ND INNINGS"}
        onSelect={(value) => {
          setInnings(value === "2ND INNINGS" ? 2 : 1);
          setSelected(null);
        }}
        label="Run rate innings"
      />
      <InteractiveLineChart
        series={[
          {
            id: "actual",
            label: `${team.shortName} ACTUAL`,
            values: current.points.map((point) => point.actual),
            color: team.color,
          },
          ...(hasRequired
            ? [
                {
                  id: "required",
                  label: "REQUIRED",
                  values: current.points.map((point) => point.required ?? 0),
                  color: "var(--ds-color-accent-pink)",
                },
              ]
            : []),
        ]}
        markers={current.points.flatMap((point, index) => [
          ...(point.boundary
            ? [
                {
                  index,
                  value: point.actual,
                  label: `${point.boundary} at ${point.over.toFixed(1)} ov`,
                  color: "var(--ds-color-accent-gold)",
                },
              ]
            : []),
          ...(point.wicket
            ? [
                {
                  index,
                  value: point.actual,
                  label: `Wicket at ${point.over.toFixed(1)} ov`,
                  color: team.color,
                },
              ]
            : []),
        ])}
        selectedIndex={selected}
        onSelectedIndexChange={setSelected}
        label={`${innings === 1 ? "First" : "Second"} innings run rate`}
        valueText={(value, index) =>
          `${current.points[index]?.over.toFixed(1) ?? "0.0"} overs, ${team.shortName} ${value.toFixed(2)}${current.points[index]?.required == null ? "" : `, required ${current.points[index].required?.toFixed(2)}`}`
        }
        axisFormatter={(value) => `${value.toFixed(2)} RR`}
        height={260}
      />
    </section>
  );
}
```

### Basketball

#### `src/features/matches/components/basketball-stats-view.tsx`

**Unchanged.**

```tsx
"use client";

import { useState } from "react";

import {
  FilterChips,
  GridOnIcon,
  ShowChartIcon,
  accentVar,
} from "@/design-system";
import type { MatchDetailScoreboard, SportMatch } from "@/domain/matches";

import {
  CommentaryView,
  LineupsView,
  TimelineList,
} from "./match-report-parts";
import {
  EmptyPanel,
  MatchIntelPanel,
  SectionHeading,
  StatComparisonRow,
  StatsRow,
  TeamLegendRow,
} from "./match-stats-shell";
import { MatchTraceChart } from "./match-trace-chart";
import { BasketballShotMap } from "./basketball-shot-map";
import styles from "./match-stats.module.css";

/**
 * The basketball report: the model's read, the flow that produced it, the
 * plays, the box score, and the two rosters.
 */

const tabs = ["OVERVIEW", "FLOW", "PLAYS", "BOX SCORE", "TEAMS"];

export function BasketballStatsView({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className={styles.statsView}>
      <FilterChips
        options={tabs}
        selected={tab}
        onSelect={setTab}
        label="Match report sections"
      />
      <div className={styles.statsScroll}>
        {tab === "OVERVIEW" ? (
          <Overview match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "FLOW" ? <Flow match={match} scoreboard={scoreboard} /> : null}
        {tab === "PLAYS" ? (
          <div className={styles.stack}>
            <div className="spanFull">
              <TimelineList match={match} events={scoreboard.timeline} />
            </div>
            <div className="spanFull">
              <CommentaryView commentary={scoreboard.commentary} />
            </div>
          </div>
        ) : null}
        {tab === "BOX SCORE" ? (
          <BoxScoreView match={match} scoreboard={scoreboard} />
        ) : null}
        {tab === "TEAMS" ? (
          <LineupsView match={match} scoreboard={scoreboard} />
        ) : null}
      </div>
    </div>
  );
}

function Overview({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const [held, setHeld] = useState<string | null>(null);
  return (
    <div className={styles.stack}>
      <section className={styles.tight}>
        <SectionHeading label="MATCH INTEL" />
        <MatchIntelPanel match={match} intel={scoreboard.intel} />
      </section>

      <section className={styles.tight}>
        <SectionHeading label="BY QUARTER" />
        {scoreboard.scoreRows.map((row) => (
          <StatsRow key={row.label} accent={accentVar("cyan")}>
            <span className={styles.comparisonHead}>
              <b className="ds-tabular">{row.home}</b>
              <small>{row.label}</small>
              <b className="ds-tabular">{row.away}</b>
            </span>
          </StatsRow>
        ))}
      </section>

      <section className={styles.tight}>
        <SectionHeading label="TEAM CONTROL" />
        <TeamLegendRow match={match} />
        {scoreboard.stats.map((stat) => (
          <StatComparisonRow
            key={stat.label}
            stat={stat}
            homeColor={match.home.color}
            awayColor={match.away.color}
            selected={held === stat.label}
            onSelect={() =>
              setHeld((current) => (current === stat.label ? null : stat.label))
            }
          />
        ))}
      </section>

      <section className={styles.tight}>
        <SectionHeading label="LEADERS" />
        {(scoreboard.leaders ?? []).map((leader) => (
          <StatsRow
            key={leader.name}
            accent={
              leader.side === "home" ? match.home.color : match.away.color
            }
          >
            <span className={styles.eventRow}>
              <i
                className={styles.eventSide}
                style={{
                  background:
                    leader.side === "home"
                      ? match.home.color
                      : match.away.color,
                }}
                aria-hidden="true"
              />
              <span className={styles.eventCopy}>
                <strong>{leader.name}</strong>
                <small>{leader.note}</small>
              </span>
              <b className={styles.eventMinute} style={{ textAlign: "right" }}>
                {leader.line}
              </b>
            </span>
          </StatsRow>
        ))}
      </section>
    </div>
  );
}

function Flow({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const modes = ["GAME", "H1", "H2", "CLUTCH"];
  const [mode, setMode] = useState(modes[0]);
  if (!scoreboard.trace) {
    return (
      <EmptyPanel
        icon={ShowChartIcon}
        title="Flow feed unavailable"
        message="Win probability and scoring coordinates have not arrived."
      />
    );
  }
  const indices = scoreboard.trace.ticks
    .map((tick, index) => ({ tick, index }))
    .filter(({ tick }) => {
      const period = Number.parseInt(tick.match(/Q(\d+)/)?.[1] ?? "0", 10);
      if (mode === "H1") return period <= 2;
      if (mode === "H2") return period >= 3;
      if (mode === "CLUTCH") {
        const clock = tick.match(/(\d+):(\d+)/);
        return (
          period === 4 &&
          Number(clock?.[1] ?? 99) * 60 + Number(clock?.[2] ?? 0) <= 300
        );
      }
      return true;
    })
    .map(({ index }) => index);
  const first = indices[0] ?? 0;
  const last = indices.at(-1) ?? Math.max(0, scoreboard.trace.ticks.length - 1);
  const trace = {
    ...scoreboard.trace,
    ticks: scoreboard.trace.ticks.slice(first, last + 1),
    home: scoreboard.trace.home.slice(first, last + 1),
    away: scoreboard.trace.away.slice(first, last + 1),
    markers: scoreboard.trace.markers
      ?.filter((marker) => marker.index >= first && marker.index <= last)
      .map((marker) => ({ ...marker, index: marker.index - first })),
  };
  return (
    <div className={styles.stack}>
      <div className="spanFull">
        <FilterChips
          options={modes}
          selected={mode}
          onSelect={setMode}
          label="Score race period"
        />
        <MatchTraceChart match={match} trace={trace} />
      </div>
      <BasketballShotMap
        match={match}
        shots={scoreboard.basketballShots ?? []}
      />
      <section className={`${styles.tight} spanFull`}>
        <SectionHeading label="SCORING RUNS" />
        {scoreboard.scoreRows.map((row) => (
          <StatsRow key={row.label} accent={accentVar("orange")}>
            <span className={styles.comparisonHead}>
              <b className="ds-tabular">{row.home}</b>
              <small>{row.label}</small>
              <b className="ds-tabular">{row.away}</b>
            </span>
          </StatsRow>
        ))}
      </section>
    </div>
  );
}

function BoxScoreView({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  const box = scoreboard.boxScore;
  if (!box) {
    return (
      <EmptyPanel
        icon={GridOnIcon}
        title="Box score unavailable"
        message="Player totals have not been published for this fixture."
      />
    );
  }
  return (
    <div className={styles.stack}>
      {(["home", "away"] as const).map((side) => (
        <section key={side} className={styles.tight}>
          <SectionHeading
            label={(side === "home"
              ? match.home.name
              : match.away.name
            ).toUpperCase()}
          />
          <StatsRow
            accent={side === "home" ? match.home.color : match.away.color}
          >
            <table className={styles.statTable}>
              <thead>
                <tr>
                  <th className={styles.tableHead}>PLAYER</th>
                  {box.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {box.rows
                  .filter((row) => row.side === side)
                  .map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      {row.values.map((value, index) => (
                        <td key={box.columns[index]}>{value}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </StatsRow>
        </section>
      ))}
    </div>
  );
}
```

#### `src/features/matches/components/basketball-shot-map.module.css`

**Unchanged.**

```css
.court {
  position: relative;
  aspect-ratio: 50 / 47;
  max-height: 620px;
  margin-top: var(--ds-space-3);
  overflow: hidden;
  border: 1px solid var(--ds-color-border-muted);
  background: color-mix(
    in srgb,
    var(--ds-color-background-data) 92%,
    var(--ds-color-accent-orange)
  );
}
.court > svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleY(-1);
  fill: none;
  stroke: color-mix(in srgb, var(--ds-color-text-default) 42%, transparent);
  stroke-width: 0.22;
  vector-effect: non-scaling-stroke;
}
.court button {
  position: absolute;
  z-index: 1;
  width: 14px;
  height: 14px;
  padding: 0;
  translate: -50% 50%;
  border-radius: 50%;
  border: 2px solid var(--shot-color);
  background: var(--shot-color);
  cursor: pointer;
}
.court button.three {
  background: var(--ds-color-background-base);
}
.court button[aria-pressed="true"] {
  outline: 2px solid var(--ds-color-text-default);
  outline-offset: 3px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-4);
  align-items: center;
  padding: var(--ds-space-3) 0;
  font: 900 var(--ds-text-xs) var(--ds-font-display);
  letter-spacing: var(--ds-tracking-wide);
}
.legend small {
  margin-left: auto;
  color: var(--ds-color-text-muted);
}
.readout {
  padding: var(--ds-space-3);
  border-left: 2px solid var(--ds-color-accent-orange);
  background: var(--ds-color-background-data);
}
.readout b,
.readout span {
  display: block;
}
.readout span,
.readout p {
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
}
.readout p {
  margin-bottom: 0;
}
```

#### `src/features/matches/components/basketball-shot-map.tsx`

**Unchanged.**

```tsx
"use client";
/* eslint-disable react/jsx-no-comment-textnodes */

import { useMemo, useState, type CSSProperties } from "react";

import { FilterChips } from "@/design-system";
import type { BasketballScoringEvent, SportMatch } from "@/domain/matches";

import { EmptyPanel, SectionHeading } from "./match-stats-shell";
import styles from "./basketball-shot-map.module.css";

const filters = ["ALL", "HOME", "AWAY", "3PT"];

export function BasketballShotMap({
  match,
  shots,
}: {
  match: SportMatch;
  shots: BasketballScoringEvent[];
}) {
  const [filter, setFilter] = useState(filters[0]);
  const visible = useMemo(
    () =>
      shots.filter(
        (shot) =>
          filter === "ALL" ||
          (filter === "3PT" && shot.points === 3) ||
          (filter === "HOME" && shot.side === "home") ||
          (filter === "AWAY" && shot.side === "away"),
      ),
    [filter, shots],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = visible.find((shot) => shot.id === selectedId) ?? visible[0];
  if (!shots.length)
    return (
      <EmptyPanel
        title="Scoring map unavailable"
        message="This package does not publish shot coordinates."
      />
    );
  return (
    <section className="spanFull">
      <SectionHeading label="SCORING MAP" />
      <FilterChips
        options={filters}
        selected={filter}
        onSelect={(value) => {
          setFilter(value);
          setSelectedId(null);
        }}
        label="Scoring map filter"
      />
      <div className={styles.court}>
        <svg viewBox="0 0 50 47" preserveAspectRatio="none" aria-hidden="true">
          <path d="M17 0V19H33V0 M17 19A8 8 0 0 0 33 19 M22 5.25A3 3 0 0 0 28 5.25 M3 0V14 A23.75 23.75 0 0 0 47 14V0" />
          <line x1="22" y1="5.25" x2="28" y2="5.25" />
        </svg>
        {visible.map((shot) => (
          <button
            key={shot.id}
            type="button"
            className={shot.points === 3 ? styles.three : styles.two}
            aria-label={`${shot.player}, ${shot.made ? "made" : "missed"} ${shot.points} point shot`}
            aria-pressed={shot.id === selected?.id}
            onClick={() => setSelectedId(shot.id)}
            style={
              {
                left: `${Math.min(100, Math.max(0, (shot.x / 50) * 100))}%`,
                bottom: `${Math.min(100, Math.max(0, ((shot.y + 5.25) / 47) * 100))}%`,
                "--shot-color":
                  shot.side === "home" ? match.home.color : match.away.color,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className={styles.legend}>
        <span style={{ color: match.home.color }}>{match.home.shortName}</span>
        <span style={{ color: match.away.color }}>{match.away.shortName}</span>
        <small>FILLED 2PT // RING 3PT</small>
      </div>
      {selected ? (
        <article className={styles.readout}>
          <b>{selected.player}</b>
          <span>
            Q{selected.period} {selected.clock} //{" "}
            {selected.made ? "MADE" : "MISSED"} {selected.points}PT
          </span>
          <p>{selected.text}</p>
        </article>
      ) : null}
    </section>
  );
}
```

### Formula 1

#### `src/features/matches/components/motorsport-stats-view.module.css`

**Unchanged.**

```css
.view {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
}
.scroll {
  min-height: 0;
  flex: 1;
  padding: 14px 16px 32px;
  overflow-y: auto;
}
.stack {
  display: grid;
  gap: 18px;
}
.circuit {
  display: grid;
  gap: 14px;
  padding: 16px;
}
.pills {
  display: flex;
  gap: 8px;
}
.pills span {
  padding: 4px 8px;
  border: 1px solid
    color-mix(in srgb, var(--ds-color-accent-racing) 48%, transparent);
  color: var(--ds-color-accent-racing);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
  letter-spacing: var(--ds-tracking-wide);
}
.circuit h2 {
  margin: 0;
  font: 900 var(--ds-text-lg) var(--ds-font-display);
  letter-spacing: var(--ds-tracking-display);
}
.mapLink {
  position: relative;
  display: grid;
  min-height: 220px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--ds-color-border-subtle);
  background: var(--ds-color-background-muted);
}
.mapLink img {
  width: 100%;
  height: 100%;
  max-height: 330px;
  object-fit: contain;
}
.mapLink span {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 7px 10px;
  border: 1px solid var(--ds-color-accent-racing);
  background: var(--ds-color-overlay-plate);
  color: var(--ds-color-text-default);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
  letter-spacing: var(--ds-tracking-wide);
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 0;
  background: var(--ds-color-border-subtle);
}
.metrics div {
  padding: 10px;
  background: var(--ds-color-background-secondary);
}
.metrics dt {
  color: var(--ds-color-text-muted);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
}
.metrics dd {
  margin: 5px 0 0;
  font: 900 var(--ds-text-md) var(--ds-font-display);
}
.record {
  margin: 0;
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
}
.record b {
  color: var(--ds-color-accent-gold);
}
.winner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 10px;
  padding: 13px;
  border-left: 3px solid var(--ds-color-accent-gold);
  background: color-mix(in srgb, var(--ds-color-accent-gold) 8%, transparent);
}
.winner span {
  grid-column: 1 / -1;
  color: var(--ds-color-accent-gold);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
}
.winner strong {
  font-family: var(--ds-font-display);
}
.winner b {
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
}
.rows {
  display: grid;
  gap: 1px;
  margin: 0;
  padding: 0;
  background: var(--ds-color-border-subtle);
  list-style: none;
}
.rows li {
  display: grid;
  min-height: 54px;
  grid-template-columns: 4px 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 8px 0;
  background: var(--ds-color-background-data);
}
.rows li > i {
  width: 4px;
  height: 100%;
}
.rows li > b {
  text-align: center;
  font-family: var(--ds-font-display);
}
.rows li > span {
  display: grid;
  min-width: 0;
  font-weight: 800;
}
.rows small {
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-2xs);
}
.rows strong {
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-xs);
}
.up {
  color: var(--ds-color-success);
}
.down {
  color: var(--ds-color-danger);
}
.chartPanel {
  display: grid;
  gap: 12px;
  padding: 14px;
}
.chartReadout {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-xs);
}
.chartReadout span {
  color: var(--ds-color-accent-racing);
}
.chartReadout strong {
  text-align: right;
}
.axis {
  display: flex;
  justify-content: space-between;
  color: var(--ds-color-text-muted);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
}
.session {
  display: grid;
  gap: 1px;
  padding: 12px;
}
.session h3 {
  margin: 0 0 8px;
  color: var(--ds-color-accent-racing);
  font: 900 var(--ds-text-xs) var(--ds-font-display);
}
.session p {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 8px;
  margin: 0;
  padding: 8px;
  background: var(--ds-color-background-data);
  font-size: var(--ds-text-xs);
}
.session p strong {
  color: var(--ds-color-text-muted);
}
.honesty,
.unavailable {
  margin: 0;
  padding: 16px;
  border: 1px solid var(--ds-color-border-subtle);
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-xs);
  line-height: var(--ds-leading-body);
}
@media (width >= 900px) {
  .scroll {
    padding-right: 24px;
    padding-left: 24px;
  }
  .stack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stack > :first-child,
  .stack > :nth-child(2),
  .stack > :last-child {
    grid-column: 1 / -1;
  }
}
```

#### `src/features/matches/components/motorsport-stats-view.tsx`

**Unchanged.**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { FilterChips, HudPanel, InteractiveLineChart } from "@/design-system";
import type { F1RaceReport } from "@/domain/matches";

import { SectionHeading } from "./match-stats-shell";
import styles from "./motorsport-stats-view.module.css";

const tabs = ["RACE", "WEEKEND", "QUALIFYING"];

export function MotorsportStatsView({ report }: { report: F1RaceReport }) {
  const [tab, setTab] = useState("RACE");
  return (
    <div className={styles.view}>
      <FilterChips
        options={tabs}
        selected={tab}
        onSelect={setTab}
        label="Race report sections"
        accent="var(--ds-color-accent-racing)"
      />
      <div className={styles.scroll}>
        {tab === "RACE" ? <RaceView report={report} /> : null}
        {tab === "WEEKEND" ? <WeekendView report={report} /> : null}
        {tab === "QUALIFYING" ? <QualifyingView report={report} /> : null}
      </div>
    </div>
  );
}

function RaceView({ report }: { report: F1RaceReport }) {
  return (
    <div className={styles.stack}>
      <HudPanel
        accent="var(--ds-color-accent-racing)"
        className={styles.circuit}
      >
        <div className={styles.pills}>
          <span>{report.abbreviation}</span>
          <span>SEASON {report.season}</span>
        </div>
        <h2>{report.circuit.fullName}</h2>
        <Link
          href={`/matches/${report.id}/track`}
          className={styles.mapLink}
          aria-label={`Expand ${report.circuit.fullName} track map`}
        >
          <Image
            src={report.circuit.asset}
            alt=""
            width={800}
            height={480}
            unoptimized
          />
          <span>EXPAND TRACK</span>
        </Link>
        <dl className={styles.metrics}>
          <div>
            <dt>LAPS</dt>
            <dd>{report.circuit.laps}</dd>
          </div>
          <div>
            <dt>LAP</dt>
            <dd>{report.circuit.lengthKm} KM</dd>
          </div>
          <div>
            <dt>TURNS</dt>
            <dd>{report.circuit.turns}</dd>
          </div>
        </dl>
        <p className={styles.record}>
          LAP RECORD <b>{report.circuit.lapRecord}</b> ·{" "}
          {report.circuit.lapRecordDriver}
        </p>
        <div className={styles.winner}>
          <span>RACE WINNER</span>
          <strong>{report.winner.name}</strong>
          <b>FROM P{report.winner.grid}</b>
        </div>
      </HudPanel>
      <SectionHeading label="GAP TO LEADER" />
      <ol className={styles.rows}>
        {report.race
          .filter((entry) => !entry.gap?.toLowerCase().includes("lap"))
          .slice(0, 12)
          .map((entry) => (
            <li key={entry.driverId}>
              <i style={{ background: entry.color }} />
              <b>P{entry.position}</b>
              <span>
                {entry.name}
                <small>{entry.constructor}</small>
              </span>
              <strong>
                {entry.position === 1
                  ? entry.gap
                  : `+${String(entry.gap).replace(/^\+/, "")}`}
              </strong>
            </li>
          ))}
      </ol>
      <SectionHeading label="GRID VS FINISH" />
      <ol className={styles.rows}>
        {report.race.slice(0, 12).map((entry) => {
          const delta = entry.grid - entry.position;
          return (
            <li key={entry.driverId}>
              <i style={{ background: entry.color }} />
              <b>P{entry.position}</b>
              <span>
                {entry.name}
                <small>STARTED P{entry.grid}</small>
              </span>
              <strong
                className={
                  delta > 0 ? styles.up : delta < 0 ? styles.down : undefined
                }
              >
                {delta > 0 ? `+${delta}` : delta}
              </strong>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function WeekendView({ report }: { report: F1RaceReport }) {
  const [index, setIndex] = useState(report.weekendTicks.length - 1);
  return (
    <div className={styles.stack}>
      <SectionHeading label="WEEKEND POSITION TRACK" />
      <HudPanel
        accent="var(--ds-color-accent-racing)"
        className={styles.chartPanel}
      >
        <div className={styles.chartReadout}>
          <span>{report.weekendTicks[index]}</span>
          <strong>
            {report.weekendDrivers[0]?.name} · P
            {report.weekendDrivers[0]?.positions[index]}
          </strong>
        </div>
        <InteractiveLineChart
          series={report.weekendDrivers.map((driver, driverIndex) => ({
            id: driver.id,
            label: driver.abbreviation,
            values: driver.positions,
            color:
              driverIndex === 0
                ? "var(--ds-color-accent-racing)"
                : driver.color,
          }))}
          selectedIndex={index}
          onSelectedIndexChange={setIndex}
          label="Weekend position by session"
          valueText={(value, point) =>
            `${report.weekendTicks[point]}, position ${value}`
          }
          invertYAxis
          scale={{ min: 1, max: 22 }}
          axisFormatter={(value) => `P${value}`}
          height={260}
        />
        <div className={styles.axis}>
          {report.weekendTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </HudPanel>
      <SectionHeading label="SESSION CLASSIFICATIONS" />
      {report.sessions
        .filter((session) => session.label !== "Race")
        .map((session) => (
          <HudPanel
            key={session.id}
            accent="var(--ds-color-accent-racing)"
            className={styles.session}
          >
            <h3>{session.label}</h3>
            {session.classification.slice(0, 5).map((entry) => (
              <p key={entry.driverId}>
                <b>P{entry.position}</b>
                <span>{entry.name}</span>
                <strong>{entry.gap || "—"}</strong>
              </p>
            ))}
          </HudPanel>
        ))}
    </div>
  );
}

function QualifyingView({ report }: { report: F1RaceReport }) {
  const qualifying = report.sessions.find((session) =>
    session.label.toLowerCase().includes("qual"),
  );
  if (!qualifying)
    return <p className={styles.unavailable}>QUALIFYING DATA NOT PUBLISHED</p>;
  return (
    <div className={styles.stack}>
      <SectionHeading label="QUALIFYING CLASSIFICATION" />
      <ol className={styles.rows}>
        {qualifying.classification.map((entry) => (
          <li key={entry.driverId}>
            <i style={{ background: entry.color }} />
            <b>P{entry.position}</b>
            <span>
              {entry.name}
              <small>{entry.constructor}</small>
            </span>
            <strong>{entry.gap || entry.status}</strong>
          </li>
        ))}
      </ol>
      <p className={styles.honesty}>
        ESPN publishes session classification, not lap-by-lap or sector
        telemetry. No missing values are estimated.
      </p>
    </div>
  );
}
```

## Step 8: the fixture header

The header above the report. `match-detail.module.css` is StatOz's match page stylesheet, cut down to the header's rules and the few the reports borrow.

#### `src/features/matches/components/match-detail.module.css`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```css
.lineupHeader,
.lineupColumn header {
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-weight: 900;
  letter-spacing: 0.08em;
}

.summary {
  flex: none;
  padding: var(--ds-space-8) var(--ds-space-14) var(--ds-space-14);
  background: transparent;
}

.summaryBracket {
  --summary-bracket: color-mix(
    in srgb,
    var(--ds-color-accent-cyan) 46%,
    transparent
  );
  position: relative;
  padding: var(--ds-space-12) var(--ds-space-8) 0;
  background:
    linear-gradient(var(--summary-bracket), var(--summary-bracket)) left top /
      17px 1px no-repeat,
    linear-gradient(var(--summary-bracket), var(--summary-bracket)) left top /
      1px 17px no-repeat,
    linear-gradient(var(--summary-bracket), var(--summary-bracket)) right top /
      17px 1px no-repeat,
    linear-gradient(var(--summary-bracket), var(--summary-bracket)) right top /
      1px 17px no-repeat;
  background-color: transparent;
}

.summaryStatus {
  display: block;
  min-height: 14px;
  text-align: center;
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.summaryTeams {
  display: flex;
  min-height: 65px;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Both sides take an equal share of what the badges and score leave, so a
   long club name ellipsises instead of crushing the side opposite it. */
.summaryTeam {
  display: grid;
  min-width: 0;
  flex: 1;
  justify-items: start;
  gap: 2px;
}

.summaryTeamEnd {
  justify-items: end;
  text-align: right;
}

.teamName {
  max-width: 100%;
  overflow: hidden;
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-body);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Cricket's innings ride under the name -- 161/5 (18.2) never fits a slot. */
.teamInnings {
  max-width: 100%;
  overflow: hidden;
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summaryScore {
  width: 72px;
  flex: none;
  text-align: center;
  color: var(--ds-color-text-default);
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-size: var(--ds-text-xl);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

/* Nothing to show yet: a lone dash, in the width one takes. */
.summaryScoreEmpty {
  width: 22px;
  color: var(--ds-color-text-muted);
  font-size: 17px;
}

.summaryVs {
  flex: none;
  padding: 0 8px;
  color: var(--ds-color-text-muted);
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 900;
}

.summarySplit {
  display: flex;
  height: 3px;
  gap: 3px;
}
.summarySplit span {
  flex: 1;
}
.teamQualifier {
  max-width: 100%;
  overflow: hidden;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-display);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.lineupView {
  padding: 12px 12px 108px;
}
.lineupHeader {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--ds-color-accent-lime);
  font-size: 10px;
}
.lineupPitch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  padding: 8px;
  background:
    repeating-linear-gradient(
      0deg,
      color-mix(in srgb, var(--ds-color-accent-lime) 8%, transparent) 0 1px,
      transparent 1px 32px
    ),
    var(--ds-color-background-muted);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--ds-color-accent-lime) 27%, transparent);
}
.lineupColumn {
  min-width: 0;
  padding: 8px;
  background: rgb(7 12 31 / 72%);
}
.lineupColumnAway {
  text-align: right;
}
.lineupColumn header {
  display: flex;
  justify-content: space-between;
  color: var(--team-color);
  font-size: 9px;
}
.lineupColumnAway header {
  flex-direction: row-reverse;
}
.lineupColumn h2 {
  min-height: 29px;
  margin: 5px 0;
  color: var(--ds-color-text-default);
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-size: 11px;
  line-height: 1.08;
}
.lineupColumn ol {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.lineupColumn li {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 27px;
}
.lineupColumnAway li {
  flex-direction: row-reverse;
}
.lineupColumn li > span {
  display: inline-grid;
  width: 18px;
  height: 18px;
  flex: none;
  place-items: center;
  clip-path: var(--ds-clip-octagon);
  background: var(--team-color);
  color: var(--ds-color-text-inverse);
  font-size: 8px;
  font-weight: 900;
}
.lineupColumn li div {
  min-width: 0;
}
.lineupColumn li strong,
.lineupColumn li small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lineupColumn li strong {
  color: var(--ds-color-text-subtle);
  font-size: 9px;
}
.lineupColumn li small {
  margin-top: 1px;
  color: var(--ds-color-text-muted);
  font-size: 8px;
}

@media (min-width: 1024px) {
  .summary {
    grid-area: summary;
  }
  .lineupView {
    padding: 18px;
  }
}
```

#### `src/features/matches/components/match-summary-header.tsx`

**Unchanged.**

```tsx
import type { SportMatch, SportTeam } from "@/domain/matches";
import { formatKickoffTime } from "@/shared/utils";

import styles from "./match-detail.module.css";
import { TeamBadge } from "./team-badge";

/**
 * The fixture, above the tabs: the clock or the minute, the two badges either
 * side of the score, and the teams' colours as a split rule under them.
 *
 * Cricket reads differently and says so — an innings does not fit a score
 * slot, so it sits under each side's name and the middle carries only "vs".
 */
export function MatchSummaryHeader({ match }: { match: SportMatch }) {
  if (match.sport === "motorsport") {
    return <GrandPrixSummary match={match} />;
  }

  const cricket = match.sport === "cricket";
  const hasScore = match.homeScore != null || match.awayScore != null;

  return (
    <section className={styles.summary} aria-label="Match summary">
      <div className={styles.summaryBracket}>
        <time
          dateTime={match.status === "scheduled" ? match.kickoff : undefined}
          className={styles.summaryStatus}
          style={{ color: statusColor(match) }}
        >
          {statusText(match)}
        </time>

        <div className={styles.summaryTeams}>
          <TeamBadge team={match.home} size={44} />
          <TeamDetails
            team={match.home}
            score={match.homeScore}
            cricket={cricket}
          />

          {cricket ? (
            <span className={styles.summaryVs}>vs</span>
          ) : (
            <span
              className={`${styles.summaryScore} ${hasScore ? "" : styles.summaryScoreEmpty}`}
            >
              {hasScore
                ? `${match.homeScore ?? "-"} - ${match.awayScore ?? "-"}`
                : "-"}
            </span>
          )}

          <TeamDetails
            team={match.away}
            score={match.awayScore}
            cricket={cricket}
            alignEnd
          />
          <TeamBadge team={match.away} size={44} />
        </div>

        <div className={styles.summarySplit} aria-hidden>
          <span style={{ background: match.home.color }} />
          <span style={{ background: match.away.color, opacity: 0.92 }} />
        </div>
      </div>
    </section>
  );
}

/** A side's name, with its innings under it on cricket fixtures. */
function TeamDetails({
  team,
  score,
  cricket,
  alignEnd = false,
}: {
  team: SportTeam;
  score?: number | string;
  cricket: boolean;
  alignEnd?: boolean;
}) {
  const innings =
    cricket && score != null && String(score) !== ""
      ? splitCricketScore(String(score))
      : null;
  return (
    <span
      className={`${styles.summaryTeam} ${alignEnd ? styles.summaryTeamEnd : ""}`}
    >
      <span className={styles.teamName}>{team.name}</span>
      {innings ? (
        <>
          <span className={styles.teamInnings}>{innings.score}</span>
          {innings.qualifier ? (
            <span className={styles.teamQualifier}>{innings.qualifier}</span>
          ) : null}
        </>
      ) : null}
    </span>
  );
}

function splitCricketScore(value: string): {
  score: string;
  qualifier: string;
} {
  const index = value.indexOf("(");
  return index < 0
    ? { score: value.trim(), qualifier: "" }
    : {
        score: value.slice(0, index).trim(),
        qualifier: value
          .slice(index)
          .trim()
          .replace(/^\(|\)$/g, ""),
      };
}

function GrandPrixSummary({ match }: { match: SportMatch }) {
  return (
    <section
      className={styles.summary}
      style={{ paddingTop: 12 }}
      aria-label="Race summary"
    >
      <div className={styles.summaryBracket} style={{ paddingTop: 12 }}>
        <span
          className={styles.summaryStatus}
          style={{ color: statusColor(match), fontSize: 14 }}
        >
          {match.status === "scheduled"
            ? "UPCOMING"
            : match.status === "live"
              ? "LIVE"
              : "FT"}
        </span>
        <div className="mt-2.5 line-clamp-2 text-center font-display text-xl font-bold leading-tight">
          {match.home.name.toUpperCase()}
        </div>
        <div className={styles.summarySplit} aria-hidden>
          <span style={{ background: "var(--ds-color-accent-cyan)" }} />
          <span
            style={{ background: "var(--ds-color-danger)", opacity: 0.92 }}
          />
        </div>
      </div>
    </section>
  );
}

function statusColor(match: SportMatch): string {
  if (match.status === "live") return "var(--ds-color-danger)";
  if (match.status === "finished") return "var(--ds-color-text-muted)";
  return "var(--ds-color-accent-gold)";
}

function statusText(match: SportMatch): string {
  if (match.status === "live") {
    return match.liveMinute == null ? "LIVE" : `LIVE ${match.liveMinute}'`;
  }
  if (match.status === "finished") return "FT";
  return formatKickoffTime(match.kickoff);
}
```

## Step 9: the page and the files to copy

The page looks the fixture up by id, returns a 404 for an unknown one, and renders the header and the report in a centred column.

#### `src/features/matches/components/stats-page.module.css`

**New.** The page's own layout: a centred column for the header and the report.

```css
/* The column the report sits in. On a phone it fills the screen and the
   report scrolls inside it; from 1024px the page scrolls as a whole. */
.page {
  display: flex;
  height: 100dvh;
  justify-content: center;
  overflow: hidden;
  background: var(--ds-gradient-app-background);
}

.frame {
  display: flex;
  width: 100%;
  max-width: 640px;
  min-height: 0;
  flex-direction: column;
  background: var(--ds-color-background-quiz-hub);
}

.panel {
  min-height: 0;
  flex: 1;
}

@media (min-width: 641px) and (max-width: 1023px) {
  .frame {
    border-right: 1px solid var(--ds-color-border-muted);
    border-left: 1px solid var(--ds-color-border-muted);
  }
}

@media (min-width: 1024px) {
  .page {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
    padding: 30px 20px 44px;
  }

  .frame {
    max-width: 880px;
    background: transparent;
  }
}
```

#### `src/app/stats/[matchId]/page.tsx`

**New.** A page that shows one match's report on its own. In StatOz the report is the STATS tab of the match page.

```tsx
import { notFound } from "next/navigation";

import { MatchScoreboard } from "@/features/matches/components/match-scoreboard";
import { MatchSummaryHeader } from "@/features/matches/components/match-summary-header";
import styles from "@/features/matches/components/stats-page.module.css";
import { allMockMatchIds, matchById, matchDetailFor } from "@/mocks/matches";

export function generateStaticParams() {
  return allMockMatchIds.map((matchId) => ({ matchId }));
}

/** One match's report: the fixture header, then the STATS view for its sport. */
export default async function MatchStatsPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = matchById(matchId);
  if (!match) notFound();
  const detail = matchDetailFor(match);

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <MatchSummaryHeader match={match} />
        <div className={styles.panel}>
          <MatchScoreboard match={match} scoreboard={detail.scoreboard} />
        </div>
      </div>
    </div>
  );
}
```

The root layout loads the two fonts.

#### `src/app/layout.tsx`

**Adapted.** StatOz's root layout also mounts its auth provider and streak celebration. This one loads the fonts and nothing else.

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

/**
 * Onest and Orbitron are self-hosted rather than pulled through
 * `next/font/google`. The Google loader fetches the font at build time and
 * silently substitutes an Arial-metric fallback when that request fails, which
 * left the whole app — body copy and Orbitron display type alike — rendering
 * as Arial on any offline build. Shipping the woff2 files makes the typography
 * deterministic. Both are variable fonts, so one file covers every weight.
 */
const onest = localFont({
  src: "./fonts/onest-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-onest",
  display: "swap",
});

const orbitron = localFont({
  src: "./fonts/orbitron-latin-variable.woff2",
  weight: "400 900",
  style: "normal",
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StatOz",
  description: "Sports predictions, picks, and games.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
```

If you cannot copy the font files, both fonts are on Google Fonts. Replace the two `localFont` calls with the following. This variant was not part of the check above, and it needs network access at build time.

```tsx
import { Onest, Orbitron } from "next/font/google";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});
```

### Files to copy from StatOz

Copy each to the same path.

| File                                                   | Size   |
| ------------------------------------------------------ | ------ |
| `src/mocks/snapshots/card-game/basketball-revamp.json` | 81 KB  |
| `src/mocks/snapshots/card-game/cricket-revamp.json`    | 148 KB |
| `src/mocks/snapshots/card-game/f1-italian-gp.json`     | 149 KB |
| `src/mocks/snapshots/card-game/football-revamp.json`   | 140 KB |

| File                                          | Size  |
| --------------------------------------------- | ----- |
| `src/app/fonts/onest-latin-variable.woff2`    | 33 KB |
| `src/app/fonts/orbitron-latin-variable.woff2` | 12 KB |

| File                                         | Size  |
| -------------------------------------------- | ----- |
| `public/assets/motorsport/monza-circuit.svg` | 45 KB |

Run the app and open `/stats/401879318`. Then work through the [checklist](#checklist).

## Using the report elsewhere

`MatchScoreboard` needs two things from its parent:

1. **Its two props**, `match` and `scoreboard`.
2. **A parent with a fixed height below 1024px.** The report is `height: 100%` and scrolls inside itself on small screens, so its parent must have a height for it to fill. In this guide that is `.panel` inside the full-height `.frame`. From 1024px the report grows with its content and the parent's height does not matter.

To use it as the STATS tab of a match page, render it in the tab's panel. That is what StatOz does, and `MATCH_DETAIL.md` builds that page.

## Connecting real data

Keep `matchById` and `matchDetailFor` and replace what is behind them. Both are called in `page.tsx`, a server component, so they can become `async` functions that fetch.

The report reads these fields of `scoreboard`. `src/domain/matches/detail.ts` and `report.ts` give each one's exact shape.

| Sport      | Fields                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| All        | `intel`, `stats`                                                                         |
| Football   | `timeline`, `commentary`, `trace`, `shots`, `homeLineup`, `awayLineup`, `players`        |
| Cricket    | `innings`, `trace`, `runRate`, `feed`, `scoreRows`, `players`                            |
| Basketball | `scoreRows`, `leaders`, `trace`, `basketballShots`, `timeline`, `commentary`, `boxScore` |
| Formula 1  | `race`                                                                                   |

Each snapshot file under `src/mocks/matches/details/` shows how one provider's data is mapped onto those fields, and is the best model for a real feed.

Set a team's `secondaryTextColor` to a lighter version of a dark team colour. Without it the report falls back to `color`, which can be hard to read on the dark background.

## What differs from StatOz

1. **The report has its own page.** In StatOz it is a tab of `/matches/{id}`, between a tab strip and a Match Circle bar. On a phone that leaves StatOz's report 112 pixels less height than it has here.
2. **Four fixtures, one per sport.** Any other id returns 404.
3. **No plain report.** StatOz draws a simpler three-section report for tennis and for a race with no full report. It is left out, and `MatchScoreboard` returns nothing for those.
4. **Quizzes and leaderboards are returned empty** by `buildMatchDetail`, since no report uses them.
5. **Team colours are written into the fixture files.** StatOz looks them up at runtime in a generated palette file of about 8,000 lines. The values here are the looked-up ones.
6. **From 1024px this guide's column is up to 880px wide.** StatOz's is narrower beside its facts panel. The report stretches to fit either.

## Quirks carried over unchanged

These are in StatOz today and are reproduced as they are. Fix them if you prefer.

1. **The basketball PLAYS list logs a duplicate-key warning in development.** Two plays share the same clock and player, and `TimelineList` in `match-report-parts.tsx` builds each row's key from those two values. Adding the row's index to the key fixes it.
2. **The football player card's xG figure is always a dash.** The snapshot has no expected-goals data.
3. **The cricket header is long on a phone.** `Royal Challengers Bengaluru` is cut off with an ellipsis.

## Checklist

In a phone-sized window:

- [ ] `/stats/401879318` shows `FT`, Fulham `2 - 3` Chelsea, and four chips. OVERVIEW starts with possession at `61.5%` and `38.5%`.
- [ ] MOMENTUM shows the pressure chart and a shot map reading `31 ATTEMPTS`.
- [ ] LINEUPS shows Fulham on a pitch. Tapping `B. Leno` opens a MATCH DOSSIER card, and Escape closes it.
- [ ] `/stats/1535465` shows each innings under its team's name with `vs` in the middle, and the chips OVERVIEW, RACE, SCORECARD, MATCH FEED.
- [ ] SCORECARD shows a batting table and a bowling table for Gujarat Titans, `155/8`.
- [ ] `/stats/basketball-revamp-20260614-ny-sa` shows `90 - 94` and five chips. BOX SCORE lists Victor Wembanyama with 19 points.
- [ ] FLOW shows a SCORE RACE chart and a SCORING MAP court.
- [ ] `/stats/600057442` shows `ITALIAN GRAND PRIX` and the chips RACE, WEEKEND, QUALIFYING. RACE shows the Monza outline and Kimi Antonelli as winner.
- [ ] `/stats/unknown` shows the 404 page.

Finally:

- [ ] `npx tsc --noEmit` reports no errors.
- [ ] `next build` lists four pages under `/stats/[matchId]`.
