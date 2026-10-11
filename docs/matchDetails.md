# The Fulham v Chelsea match page, complete

This guide rebuilds one StatOz page in another Next.js App Router project: `/matches/401879318`, the finished Premier League match Fulham 2 - 3 Chelsea. It covers everything that URL displays to a first-time visitor: the navigation, the top bar, the breadcrumbs, the ad rails, the match header, all four tabs, the facts panel, and the pop-ups the page opens.

It is one file and it stands alone. Every source file is in it. Nine files cannot be pasted as text and must be copied from StatOz: one data file, two fonts and six portraits ([step 14](#step-14-the-route-the-layouts-and-the-files-to-copy)).

**The code is cut down to this page.** StatOz's match page handles five sports and three match states. Here, each file keeps only the parts this football match reaches, and each kept part is copied exactly. `MATCH_DETAIL.md`, `MATCH_PREDICT.md`, `MATCH_PICKS.md` and `MATCH_TOPS.md` hold the full versions for every fixture.

**Checked on 11 October 2026.** The files in this guide were assembled into a standalone app on Next.js 16.3.2, React 19.2.8 and Tailwind CSS 4.3.3. It type-checks and builds. It was then compared with StatOz in a browser, as a visitor who is not logged in. 23 states of the page were compared at four widths (390, 820, 1280 and 1920 pixels), 92 views in all. Each comparison covered every element on the page: its position, size, text, colours, font, borders and shadows. All 92 were identical.

## Contents

1. [What you are building](#what-you-are-building)
2. [What the page shows](#what-the-page-shows)
3. [Links that leave the page](#links-that-leave-the-page)
4. [Requirements](#requirements)
5. [How to use this guide](#how-to-use-this-guide)
6. [Step 1: styles](#step-1-styles)
7. [Step 2: shared helpers and hooks](#step-2-shared-helpers-and-hooks)
8. [Step 3: design-system pieces](#step-3-design-system-pieces)
9. [Step 4: data types](#step-4-data-types)
10. [Step 5: the match data](#step-5-the-match-data)
11. [Step 6: stand-ins for the wallet, streak and player](#step-6-stand-ins-for-the-wallet-streak-and-player)
12. [Step 7: the session and the account prompt](#step-7-the-session-and-the-account-prompt)
13. [Step 8: the app shell](#step-8-the-app-shell)
14. [Step 9: the page frame](#step-9-the-page-frame)
15. [Step 10: the PREDICT tab](#step-10-the-predict-tab)
16. [Step 11: the PICKS tab](#step-11-the-picks-tab)
17. [Step 12: the TOPS tab](#step-12-the-tops-tab)
18. [Step 13: the STATS tab](#step-13-the-stats-tab)
19. [Step 14: the route, the layouts and the files to copy](#step-14-the-route-the-layouts-and-the-files-to-copy)
20. [If the project already has the earlier guides](#if-the-project-already-has-the-earlier-guides)
21. [What differs from StatOz](#what-differs-from-statoz)
22. [Quirks carried over unchanged](#quirks-carried-over-unchanged)
23. [Checklist](#checklist)

## What you are building

```
Below 1024px: the match page covers the whole screen

┌──────────────────────────┐
│            FT            │
│ FUL Fulham 2 - 3 Chel CHE│
├──────────────────────────┤
│ PREDICT PICKS TOPS STATS │
├──────────────────────────┤
│                          │
│   the selected tab,      │
│   scrolling inside       │
│                          │
├──────────────────────────┤
│      Match Circle 3      │
└──────────────────────────┘

From 1024px: the page sits inside the app shell

┌────────┬──────────────────────────────────────────────┐
│ SPORTS │ StatOz                         6    1,000 [+]│  top bar
│ SHOP   ├──────────────────────────────────────────────┤
│ TOP    │ HOME > MATCH DETAILS                         │  breadcrumbs
│ LOG IN ├──────────────────────────────┬───────────────┤
│        │             FT               │ MATCH INTEL   │
│        │ FUL Fulham  2 - 3  Chel CHE  │ EPL           │
│        ├──────────────────────────────┤ STATUS  FINAL │
│        │ PREDICT  PICKS  TOPS  STATS  │ START   ...   │
│        ├──────────────────────────────┤ REWARD  ...   │
│        │                              │ VOLUME  ...   │
│        │   the selected tab           ├───────────────┤
│        │                              │ Match Circle 3│
└────────┴──────────────────────────────┴───────────────┘
  side rail

From 1536px a 160px demo ad rail is added on each side.
```

| Part              | Component             | Shown                                        |
| ----------------- | --------------------- | -------------------------------------------- |
| Side rail         | `PlatformNav`         | From 1024px                                  |
| Top bar           | `PlatformTopBar`      | From 1024px on this page                     |
| Breadcrumbs       | `PlatformBreadcrumbs` | From 1024px                                  |
| Ad rails          | `AdSlot`              | From 1536px                                  |
| Header            | `MatchSummaryHeader`  | Always                                       |
| Tabs              | `MatchTabsView`       | Always                                       |
| Facts panel       | `MatchDetailContext`  | From 1024px                                  |
| Match Circle link | `MatchCircleCta`      | Always                                       |
| Account prompt    | `AuthGateDialog`      | When a guest taps a quiz card or LOG IN      |
| Player card       | `MatchPlayerSheet`    | When a player is tapped on the LINEUPS pitch |

Terms used in this guide:

- **Fixture**: one match, with two teams, a kick-off time and a status.
- **Crest**: the team badge, drawn from the team's colours and short name.
- **Oz**: StatOz's in-app currency. **XP** is the points a correct prediction earns.
- **Snapshot**: a saved copy of real match data from a sports data provider, stored as a JSON file.
- **Guest**: a visitor who is not logged in.
- **Stand-in**: a small file written for this guide that takes the place of a StatOz feature the page only touches.

## What the page shows

### Layout

- **Below 1024px the match page is a full-screen overlay.** It is `position: fixed` over the whole viewport with `z-index: 50`, so it covers the top bar and the bottom navigation, which are still rendered underneath. The content is one column, at most 640px wide. The header and tab strip stay put, the tab panel scrolls inside the column, and the Match Circle link is docked at the bottom.
- **From 1024px it is part of the normal page**, inside the shell. It becomes two columns. The right column, 320px to 352px wide, holds the facts panel and the Match Circle link and stays in view while the left column scrolls.
- **The shell is at most 1280px wide.** From 1536px the two ad rails sit outside it.

### Shell

- **Side rail.** Four items: SPORTS, SHOP, TOP and, for a guest, LOG IN with a lock icon. SPORTS is highlighted in violet, because a match page belongs to it. SPORTS, SHOP and TOP are links. LOG IN opens the account prompt. For a logged-in player the fourth item reads PROFILE and is a link.
- **Top bar.** The title `StatOz`, a flame with the daily streak, a coin with the balance, and a plus button. A new visitor sees a streak of 6 and 1,000 coins.
- **Breadcrumbs.** `HOME > MATCH DETAILS`. HOME is a link.
- **Ad rails.** Each is a dashed 160 by 600 frame reading `DEMO AD SPACE`, `RESPONSIVE DISPLAY`, `160×600`. They are placeholders and load no ad script.

### Header

`FT` in grey, then the Fulham crest and name, `2 - 3`, and the Chelsea name and crest. A rule beneath is split into the two team colours, black and blue.

### Tabs

- Four text tabs: PREDICT, PICKS, TOPS, STATS. A glowing cyan underline marks the selected one.
- **PREDICT is selected on load.** If the URL ends in `#picks`, the page switches to PICKS as soon as it loads. The selected tab is not otherwise kept in the URL.
- **Only the selected tab is rendered.** Leaving a tab discards what it held, such as the open STATS section.
- Arrow keys, Home and End move between tabs.

### PREDICT

- A line reads `MATCH ENDED` with a flag.
- **Two cards**, `01 Scoreline Quiz` and `02 Match Events Quiz`. Each is tagged `FINAL RESULTS`, has a `VIEW` pill and a one-line description, and ends with `VIEW COMMUNITY RESULTS` and an arrow.
- **Each card is one button.** For a guest it opens the account prompt, titled `LOG IN TO PREDICT`. For a logged-in player it goes to the quiz page, which is outside this guide.

### PICKS

A link row, `VIEW ALL PICKS`, then an empty state: `NO PICKS FOR THIS MATCH`. This fixture has no markets.

### TOPS

- **One board per quiz**, chosen with two gold-underlined tabs: SCORELINE QUIZ and MATCH EVENTS QUIZ.
- **Above the board**: `PREDICTIONS 0/4` (0/3 on the second board), `PLAYERS 6`, and the caption `MATCH CLOSED`.
- **The board**: the top three as a podium, first place across the full width and second and third side by side, then one row each for places four to six. Each entry shows a rank, a portrait, a name, points, and where set a `PRO` or `NEW` tag and an arrow with the places moved. Rows slide in one after another.
- **Tapping a rival opens a small card** with their name, rank and points. StatOz opens a full profile there; this guide ships a placeholder.
- **The player's own bar** is docked at the bottom: `Your standing`, `UNRANKED`, `PLAYER ONE`, `PLAY THE QUIZ TO ENTER` and a JOIN label. The whole bar is a button that switches to the PREDICT tab.

### STATS

A row of chips chooses one of four sections. Arrow keys, Home and End move between chips.

- **OVERVIEW.**
  - A MATCH INTEL card: English Premier League, Craven Cottage, attendance 27461.
  - TEAM CONTROL: seven stats, each a row with both values and a two-colour bar. Tapping a row highlights it, and tapping it again clears it.
  - MATCH TIMELINE: 22 entries down a centre line, Fulham's events on the left and Chelsea's on the right. Three of the entries are markers for kick-off, half-time and full time. Goals show the score and the assist, substitutions show the player on in green and the player off in red. Tapping an event opens a sentence describing it.
- **MOMENTUM.**
  - TERRITORIAL PRESSURE: a chart of each side's pressure through the match, with the goals marked on it. Dragging across it, or pressing the left and right arrow keys while it has focus, reads off both values at that minute.
  - SHOT MAP: all 31 attempts on a full pitch. Chips filter to the first half, the second half, or goals. Tapping a shot opens a card with the minute, the player, a description, and a small goal showing where the shot went.
- **LINEUPS.** One team at a time, switched with `FUL` and `CHE` chips. A panel names the team, its formation and squad size and reads `CONFIRMED`. The starters stand on a pitch in formation, with small marks on players who scored, were booked or were substituted. The bench is listed beneath.
  - **Tapping any player opens a MATCH DOSSIER card**: the name, position and number, four figures (touches, xG, final third, territory), a heat map of touches with FULL, 1ST and 2ND chips, and the player's match stats. Arrows on the card, or the left and right arrow keys, step through the squad. Escape, the close button or a click outside closes it.
- **COMMENTARY.** The play-by-play list, 104 entries. Each has a minute, a sequence number, the team and event type, the text, and the players involved.

### Facts panel and Match Circle

- The facts panel lists the league (`EPL`), `STATUS FINAL`, `START 24 AUG · 19:00`, `REWARD UP TO 160 XP` and `VOLUME 98.6K OZ`. It is hidden below 1024px.
- The Match Circle link shows the number of posts in the match's discussion thread, 3 for a new visitor. The count is only known in the browser, so it appears just after the page loads.

### Account prompt

A centred card over a dark backdrop: a lock, `// ACCOUNT REQUIRED`, a title such as `LOG IN TO PREDICT`, one sentence, and two buttons.

- **NOT NOW**, Escape, or a click on the backdrop closes it.
- **LOG IN** goes to `/login?returnTo=` followed by the current address.
- While it is open, the page behind does not scroll and Tab stays inside the card. On closing, focus returns to the control that opened it.

### Accessibility

- The header, tab area and facts panel are labelled regions: `Match summary`, `Match content`, `Match context`.
- Every tab strip and chip row uses `role="tablist"` and `role="tab"` with `aria-selected`.
- Crests have `role="img"` and the team's full name as their label.
- The player card is a native `<dialog>`, so the browser traps focus in it.
- The pressure chart is a `role="slider"` that announces both teams' values.
- Under `prefers-reduced-motion`, animations are shortened to nothing.

## Links that leave the page

These lead to pages this guide does not build. They return 404 until the project has them.

| Link                                                    | Comes from                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/`                                                     | SPORTS in the rail, HOME in the breadcrumbs                                  |
| `/shop`, `/leaderboard`                                 | SHOP and TOP in the rail                                                     |
| `/profile`                                              | PROFILE in the rail, for a logged-in player                                  |
| `/streaks`                                              | The streak in the top bar                                                    |
| `/shop?tab=coins`                                       | The plus button in the top bar                                               |
| `/login?returnTo=...`                                   | LOG IN in the account prompt                                                 |
| `/picks`                                                | VIEW ALL PICKS on the PICKS tab                                              |
| `/matches/401879318/circle`                             | The Match Circle link                                                        |
| `/matches/401879318/predict/main` and `/predict/events` | The quiz cards, for a logged-in player. `MATCH_PREDICT.md` builds this page. |

## Requirements

- **Next.js 15 or later with the App Router.** Built here on 16.3.2 with React 19.2.8.
- **Tailwind CSS v4** through `@tailwindcss/postcss`. Built here on 4.3.3.
- **A `@/` path alias pointing at `src/`**, and `resolveJsonModule` turned on in `tsconfig.json`. A new Next.js project has both.
- **The Onest and Orbitron fonts**, exposed as the CSS variables `--font-onest` and `--font-orbitron` (step 14).
- No other packages. Charts and icons are drawn with inline SVG.

`next.config` needs no changes.

## How to use this guide

Create each file below at the path shown. **Paths match StatOz's own folder layout, so every import works without editing.**

Each file is labelled:

- **Unchanged**: identical to the StatOz file. Such a file can contain branches for other sports or match states that this page never reaches.
- **Trimmed**: StatOz's file holds more. This version keeps the functions, types and style rules this page uses, each copied exactly, and leaves out the rest. A comment at the top of a trimmed file can describe parts that are no longer in it.
- **Adapted**: the StatOz file with a stated change.
- **New**: a stand-in written for this guide.

This guide has 134 files to create, about 10,600 lines in total: 66 unchanged, 51 trimmed, 11 adapted and 6 new. It also has 9 files to copy.

### All files in this guide

Files with no tag are unchanged.

```
├── public/assets/
│   ├── ads/
│   │   └── ad-space-skyscraper.svg
│   ├── avatars/
│   │   ├── adams.webp   [copy]
│   │   ├── bellingham.webp   [copy]
│   │   ├── camavinga.webp   [copy]
│   │   ├── ndiaye.webp   [copy]
│   │   ├── raphinha.webp   [copy]
│   │   └── rodri.webp   [copy]
│   └── icons/
│       └── oz_coins.svg
└── src/
    ├── app/
    │   ├── (platform)/
    │   │   ├── layout.tsx   [adapted]
    │   │   └── matches/[matchId]/
    │   │       └── page.tsx
    │   ├── fonts/
    │   │   ├── onest-latin-variable.woff2   [copy]
    │   │   └── orbitron-latin-variable.woff2   [copy]
    │   ├── globals.css
    │   └── layout.tsx   [adapted]
    ├── design-system/
    │   ├── components/
    │   │   ├── actions/button/
    │   │   │   ├── button.tsx
    │   │   │   └── index.ts   [trimmed]
    │   │   ├── data-display/
    │   │   │   ├── avatar/
    │   │   │   │   ├── avatar.tsx
    │   │   │   │   └── index.ts   [trimmed]
    │   │   │   ├── goal-mouth-diagram/
    │   │   │   │   ├── goal-mouth-diagram.tsx
    │   │   │   │   └── index.ts   [trimmed]
    │   │   │   └── monogram/
    │   │   │       ├── index.ts   [trimmed]
    │   │   │       └── monogram.tsx
    │   │   ├── feedback/no-data-state/
    │   │   │   ├── index.ts   [trimmed]
    │   │   │   └── no-data-state.tsx
    │   │   └── navigation/
    │   │       ├── breadcrumbs/
    │   │       │   ├── breadcrumbs.tsx
    │   │       │   └── index.ts   [trimmed]
    │   │       ├── filter-chips/
    │   │       │   ├── filter-chips.module.css
    │   │       │   ├── filter-chips.tsx
    │   │       │   └── index.ts   [trimmed]
    │   │       ├── nav-rail/
    │   │       │   ├── index.ts   [trimmed]
    │   │       │   └── nav-rail.tsx
    │   │       └── underline-tabs/
    │   │           ├── index.ts   [trimmed]
    │   │           └── underline-tabs.tsx
    │   ├── icons/
    │   │   ├── brand.tsx   [adapted]
    │   │   ├── glyphs.tsx   [trimmed]
    │   │   ├── icon.tsx
    │   │   └── index.ts   [trimmed]
    │   ├── index.ts   [trimmed]
    │   ├── styles/
    │   │   └── tokens.css
    │   └── tokens/
    │       ├── colors.ts   [trimmed]
    │       ├── elevation.ts   [trimmed]
    │       ├── index.ts   [trimmed]
    │       └── shape.ts   [trimmed]
    ├── domain/
    │   ├── matches/
    │   │   ├── circle.ts   [trimmed]
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
    ├── features/
    │   ├── ads/
    │   │   ├── components/
    │   │   │   ├── ad-slot.module.css
    │   │   │   └── ad-slot.tsx
    │   │   ├── index.ts   [trimmed]
    │   │   └── types.ts
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── auth-gate-dialog.tsx
    │   │   │   └── auth-provider.tsx
    │   │   ├── index.ts   [trimmed]
    │   │   ├── return-path.ts
    │   │   ├── state/
    │   │   │   └── auth-session.ts   [new]
    │   │   └── types.ts   [trimmed]
    │   ├── economy/
    │   │   └── index.ts   [new]
    │   ├── leaderboard/
    │   │   ├── components/
    │   │   │   ├── leaderboard.module.css   [trimmed]
    │   │   │   ├── rank-parts.tsx
    │   │   │   ├── rank-plate.tsx
    │   │   │   ├── rank-podium.tsx
    │   │   │   ├── rank-row.tsx
    │   │   │   └── rank-user-bar.tsx
    │   │   └── types.ts   [trimmed]
    │   ├── matches/
    │   │   ├── components/
    │   │   │   ├── football-shot-map.module.css
    │   │   │   ├── football-shot-map.tsx
    │   │   │   ├── football-stats-view.tsx
    │   │   │   ├── match-circle-cta.tsx
    │   │   │   ├── match-detail-context.tsx
    │   │   │   ├── match-detail.module.css   [trimmed]
    │   │   │   ├── match-leaderboard-tab.tsx
    │   │   │   ├── match-pitch-view.tsx
    │   │   │   ├── match-pitch.module.css
    │   │   │   ├── match-player-sheet.module.css
    │   │   │   ├── match-player-sheet.tsx
    │   │   │   ├── match-report-parts.tsx   [trimmed]
    │   │   │   ├── match-scoreboard.tsx   [adapted]
    │   │   │   ├── match-stats-shell.tsx   [trimmed]
    │   │   │   ├── match-stats.module.css   [trimmed]
    │   │   │   ├── match-summary-header.tsx
    │   │   │   ├── match-tabs-view.tsx
    │   │   │   ├── match-trace-chart.tsx
    │   │   │   ├── team-badge.module.css
    │   │   │   └── team-badge.tsx
    │   │   ├── state/
    │   │   │   └── match-circle-store.ts   [trimmed]
    │   │   └── types.ts   [trimmed]
    │   ├── onboarding/
    │   │   ├── index.ts   [trimmed]
    │   │   └── types.ts   [trimmed]
    │   ├── picks/
    │   │   ├── components/
    │   │   │   ├── match-picks-panel.tsx   [adapted]
    │   │   │   └── picks.module.css   [trimmed]
    │   │   └── index.ts   [trimmed]
    │   ├── predictions/
    │   │   ├── components/
    │   │   │   ├── match-predict-tab.tsx   [trimmed]
    │   │   │   ├── predictions.module.css   [trimmed]
    │   │   │   ├── quiz-flow.tsx   [trimmed]
    │   │   │   ├── quiz-hub-card.tsx
    │   │   │   └── quiz-review.tsx   [trimmed]
    │   │   ├── hub-visual.ts
    │   │   ├── index.ts   [trimmed]
    │   │   └── state/
    │   │       └── prediction-store.ts   [trimmed]
    │   ├── profile/
    │   │   ├── components/
    │   │   │   └── rival-dossier.tsx   [new]
    │   │   ├── index.ts   [new]
    │   │   └── state/
    │   │       └── player-standing.ts   [new]
    │   ├── shell/
    │   │   ├── components/
    │   │   │   ├── platform-breadcrumbs.tsx
    │   │   │   ├── platform-nav.tsx
    │   │   │   └── platform-top-bar.tsx
    │   │   └── index.ts   [trimmed]
    │   └── streaks/
    │       └── index.ts   [new]
    ├── mocks/
    │   ├── ads/
    │   │   ├── index.ts
    │   │   └── placements.ts
    │   ├── matches/
    │   │   ├── catalog.ts   [adapted]
    │   │   ├── circle.ts
    │   │   ├── definitions.ts   [adapted]
    │   │   ├── detail-rivals.ts
    │   │   ├── details/
    │   │   │   ├── football-snapshot.ts   [trimmed]
    │   │   │   ├── football.ts
    │   │   │   ├── index.ts   [adapted]
    │   │   │   ├── report.ts   [adapted]
    │   │   │   └── shared.ts
    │   │   ├── football.ts   [adapted]
    │   │   ├── index.ts   [trimmed]
    │   │   └── quizzes/
    │   │       ├── football-bank.ts
    │   │       └── index.ts   [adapted]
    │   ├── onboarding/
    │   │   ├── avatars.ts   [trimmed]
    │   │   └── index.ts   [trimmed]
    │   └── snapshots/card-game/
    │       └── football-revamp.json   [copy]
    └── shared/
        ├── config/
        │   ├── base-path.ts
        │   ├── index.ts
        │   └── navigation.ts
        ├── hooks/
        │   ├── index.ts   [trimmed]
        │   ├── use-clock.ts
        │   ├── use-count-up.ts
        │   ├── use-demo-now.ts
        │   └── use-prefers-reduced-motion.ts
        └── utils/
            ├── format.ts
            ├── hash.ts
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

## Step 2: shared helpers and hooks

`publicAsset` prefixes a path with `NEXT_PUBLIC_BASE_PATH` when the app is served from a sub-path. `navigation.ts` lists the four destinations the rail shows. The format helpers print dates, times and numbers in UTC, so the server and the browser produce the same text. `seedHash` turns a string into a stable number.

#### `src/shared/config/base-path.ts`

**Unchanged.**

```ts
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const basePath = rawBasePath.endsWith("/")
  ? rawBasePath.slice(0, -1)
  : rawBasePath;

export function publicAsset(path: string) {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}
```

#### `src/shared/config/index.ts`

**Unchanged.**

```ts
export * from "./base-path";
export * from "./navigation";
```

#### `src/shared/config/navigation.ts`

**Unchanged.**

```ts
/** Ids of the platform's primary destinations. */
export type NavDestinationId = "sports" | "shop" | "leaderboard" | "profile";

export type NavDestination = {
  id: NavDestinationId;
  label: string;
  href: string;
};

/**
 * The primary destinations, in bar and rail order. Icons and accents are a
 * visual concern and stay with the components that render them.
 */
export const navDestinations: NavDestination[] = [
  { id: "sports", label: "SPORTS", href: "/" },
  { id: "shop", label: "SHOP", href: "/shop" },
  { id: "leaderboard", label: "TOP", href: "/leaderboard" },
  { id: "profile", label: "PROFILE", href: "/profile" },
];
```

#### `src/shared/utils/format.ts`

**Unchanged.**

```ts
/** Thousands-separated integer, for coins, streaks, and counters. */
export function formatInt(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/** Compact Oz volume: 48200 becomes "48.2K". */
export function formatOzCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .toUpperCase();
}

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

#### `src/shared/utils/hash.ts`

**Unchanged.**

```ts
/**
 * A 31-bit hash of a string, used as a seed wherever something has to look
 * random but stay the same every time: which face a rival wears, which career
 * their dossier is scouted from.
 *
 * The `& 0x7fffffff` after every step is what keeps it inside 31 bits, and it
 * is also why this is portable — the same expression in Dart's 64-bit integers
 * and JavaScript's doubles produces the same number, so a name that maps to one
 * face in the app maps to that same face here.
 */
export function seedHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}
```

#### `src/shared/utils/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./format";
export * from "./hash";
```

The hooks deal with time and motion. `useClock` is one shared one-second timer that returns `null` until the page has loaded in the browser. `useDemoNow` is the clock the demo runs on: it starts at a fixed day (step 5) and then ticks in real time. `usePrefersReducedMotion` and `useCountUp` drive the counting numbers on the leaderboard.

#### `src/shared/hooks/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { useCountUp } from "./use-count-up";
export { useDemoNow } from "./use-demo-now";
```

#### `src/shared/hooks/use-clock.ts`

**Unchanged.**

```ts
"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared one-second clock.
 *
 * A countdown has to re-render every second, and a component that ticks its own
 * `Date.now()` into state from an effect both fights the compiler and disagrees
 * with the server render. This is one interval behind a store instead: it
 * reports `null` until the client subscribes, so the first paint matches the
 * server, and every countdown on the page ticks on the same beat.
 */

let current: number | null = null;
let timer: number | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (timer == null) {
    current = Date.now();
    timer = window.setInterval(() => {
      current = Date.now();
      for (const notify of listeners) notify();
    }, 1000);
  }
  // The first subscriber arrives after hydration, so publishing the clock now
  // is what moves every reader off the server's placeholder.
  listener();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer != null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

/** Milliseconds since the epoch, or null before the client has hydrated. */
export function useClock(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
```

#### `src/shared/hooks/use-count-up.ts`

**Unchanged.**

```ts
"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const countUpMs = 600;

/**
 * Eases a figure up from zero once, on mount — the profile's telemetry cells
 * and the leaderboard's scores both land this way.
 *
 * The state held is how far the run has got, not the figure itself, so a value
 * with nothing to count to — a zero, or a viewer who asked for less motion —
 * simply renders its target and never schedules a frame. The page-wide reduced
 * motion rule only flattens CSS, so a number ticking in JavaScript would
 * otherwise be the one thing that ignored it.
 */
export function useCountUp(
  target: number | undefined,
  durationMs = countUpMs,
): number {
  const reduced = usePrefersReducedMotion();
  const animate = target !== undefined && target > 0 && !reduced;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!animate) return;

    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / durationMs);
      setProgress(t);
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [animate, durationMs, target]);

  if (!animate) return target ?? 0;
  // easeOutCubic, so the figure decelerates into its final value.
  return Math.round(target * (1 - Math.pow(1 - progress, 3)));
}
```

#### `src/shared/hooks/use-demo-now.ts`

**Unchanged.**

```ts
"use client";

import { useClock } from "./use-clock";

/**
 * The clock a date-anchored demo runs on.
 *
 * The fixtures are static and dated around one anchor, so the wall clock walks
 * past them and every scheduled match would read as already kicked off. This
 * starts at the anchor instead and then ticks in real time, which keeps a
 * countdown live without letting the demo expire underneath the viewer.
 *
 * Null until the client hydrates — the server cannot know what time it is here.
 */

const startedAt = Date.now();

export function useDemoNow(anchorIso: string): number | null {
  const clock = useClock();
  if (clock == null) return null;
  return Date.parse(anchorIso) + (clock - startedAt);
}
```

#### `src/shared/hooks/use-prefers-reduced-motion.ts`

**Unchanged.**

```ts
"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the viewer asked for less motion.
 *
 * The global damper in `globals.css` only neuters CSS animations and
 * transitions — a rAF loop runs straight through it — so anything animated from
 * JavaScript has to ask for itself. The games do, and so does the profile's
 * counting telemetry, which is why the question is answered here rather than
 * inside any one feature.
 */

const reduceMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(reduceMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(reduceMotionQuery).matches,
    () => false,
  );
}
```

## Step 3: design-system pieces

These are general-purpose building blocks. None of them knows anything about matches.

### Colours and shapes

`colors.ts` is the TypeScript side of the palette in `tokens.css`. `accentVar("cyan")` returns `var(--ds-color-accent-cyan)`. `shape.ts` and `elevation.ts` hold helpers for cut corners and transparency.

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
export type FeedbackName = keyof typeof colors.feedback;

/** The CSS custom property backing an accent, for inline color props. */
export function accentVar(name: AccentName): string {
  return `var(--ds-color-accent-${name})`;
}

/** The CSS custom property backing a feedback color. */
export function feedbackVar(name: FeedbackName): string {
  return `var(--ds-color-${name})`;
}
```

#### `src/design-system/tokens/elevation.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/** Fades any CSS color to the given opacity. */
export function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
}
```

#### `src/design-system/tokens/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./colors";
export * from "./elevation";
export * from "./shape";
```

#### `src/design-system/tokens/shape.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/**
 * The HUD plate: a strong chamfer on the top-left and bottom-right corners, and
 * a smaller answering cut on the other two. Cards and action surfaces share it
 * so they read as one piece of hardware.
 *
 * `hudChamferPath` is the same geometry at any pair of cuts. Most surfaces want
 * the tokenised `hudClipPath`; a dense HUD built at several sizes at once — a
 * ball strip, a sting plate, a score token — needs the cuts to scale with the
 * element, and reaches for the function instead.
 */
export function hudChamferPath(bigCut: number, smallCut: number): string {
  const big = `${bigCut}px`;
  const small = `${smallCut}px`;
  return `polygon(${big} 0, calc(100% - ${small}) 0, 100% ${small}, 100% calc(100% - ${big}), calc(100% - ${big}) 100%, ${small} 100%, 0 calc(100% - ${small}), 0 ${big})`;
}
```

### Icons

Icons are inline SVG filled with `currentColor`, so they take the colour of the text around them. `brand.tsx` draws multi-colour artwork from an image file instead; the one piece this page uses is the coin in the top bar.

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

/** Material Symbols `storefront` (outlined). */
export function ShopIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M841-518v318q0 33-23.5 56.5T761-120H201q-33 0-56.5-23.5T121-200v-318q-23-21-35.5-54t-.5-72l42-136q8-26 28.5-43t47.5-17h556q27 0 47 16.5t29 43.5l42 136q12 39-.5 71T841-518Zm-272-42q27 0 41-18.5t11-41.5l-22-140h-78v148q0 21 14 36.5t34 15.5Zm-180 0q23 0 37.5-15.5T441-612v-148h-78l-22 140q-4 24 10.5 42t37.5 18Zm-178 0q18 0 31.5-13t16.5-33l22-154h-78l-40 134q-6 20 6.5 43t41.5 23Zm540 0q29 0 42-23t6-43l-42-134h-76l22 154q3 20 16.5 33t31.5 13ZM201-200h560v-282q-5 2-6.5 2H751q-27 0-47.5-9T663-518q-18 18-41 28t-49 10q-27 0-50.5-10T481-518q-17 18-39.5 28T393-480q-29 0-52.5-10T299-518q-21 21-41.5 29.5T211-480h-4.5q-2.5 0-5.5-2v282Zm560 0H201h560Z" />
    </Icon>
  );
}

/** Material Symbols `emoji_events` (outlined). */
export function TrophyIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z" />
    </Icon>
  );
}

/** Material Symbols `person` (outlined). */
export function ProfileIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
    </Icon>
  );
}

/** Material Symbols `local_fire_department` (outlined). */
export function FlameIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z" />
    </Icon>
  );
}

/** Material Symbols `more_horiz` (rounded). */
export function MoreIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
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

/** Material Symbols `add` (rounded). */
export function PlusIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z" />
    </Icon>
  );
}

/** The GAMES tab glyph (assets/icons/game.svg). */
export function GameIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 20 20" {...props}>
      <path d="M9.99935 8.74935 7.49935 6.24935V1.66602H12.4993V6.24935L9.99935 8.74935ZM13.7493 12.4993 11.2493 9.99935 13.7493 7.49935H18.3327V12.4993H13.7493ZM1.66602 12.4993V7.49935H6.24935L8.74935 9.99935 6.24935 12.4993H1.66602ZM7.49935 18.3327V13.7493L9.99935 11.2493 12.4993 13.7493V18.3327H7.49935ZM9.99935 6.37435 10.8327 5.54102V3.33268H9.16602V5.54102L9.99935 6.37435ZM3.33268 10.8327H5.54102L6.37435 9.99935 5.54102 9.16602H3.33268V10.8327ZM9.16602 16.666H10.8327V14.4577L9.99935 13.6243 9.16602 14.4577V16.666ZM14.4577 10.8327H16.666V9.16602H14.4577L13.6243 9.99935 14.4577 10.8327Z" />
    </Icon>
  );
}

/** The PICK glyph (assets/icons/pick.svg) — a stack of chevrons. */
export function PickIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 20 20" {...props}>
      <path d="M6.16667 17.8127 5 16.646l5-5 5 5-1.1667 1.1667L10 14.0002l-3.83333 3.8125ZM6.16667 12.8127 5 11.646l5-5 5 5-1.1667 1.1667L10 9.00016l-3.83333 3.81254ZM6.16667 7.81266 5 6.646l5-5 5 5-1.1667 1.16666L10 4.00016 6.16667 7.81266Z" />
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

/** Material Symbols `check` (rounded). */
export function CheckIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </Icon>
  );
}

/** Material Symbols `arrow_forward` (rounded). */
export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M560-80l-71-71 329-329-329-329 71-71 400 400L560-80Z" />
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

/** Material Symbols `flag` (filled). */
export function FlagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M280-400v240q0 17-11.5 28.5T240-120q-17 0-28.5-11.5T200-160v-600q0-17 11.5-28.5T240-800h287q14 0 25 9t14 23l10 48h184q17 0 28.5 11.5T800-680v320q0 17-11.5 28.5T760-320H553q-14 0-25-9t-14-23l-10-48H280Z" />
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

/** Material Symbols `edit` (outlined). */
export function EditIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
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

/** Material Symbols `schedule` (outlined). */
export function ScheduleIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
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

/** Material Symbols `lock` (outlined). */
export function LockIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
    </Icon>
  );
}

/** Material Symbols `military_tech` (outlined). */
export function MedalIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M280-880h400v314q0 23-10 41t-28 29l-142 84 28 92h152l-124 88 48 152-124-94-124 94 48-152-124-88h152l28-92-142-84q-18-11-28-29t-10-41v-314Zm80 80v234l80 48v-282h-80Zm240 0h-80v282l80-48v-234ZM480-647Zm-40-12Zm80 0Z" />
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

/** Material Symbols `workspace_premium` (outlined). */
export function PremiumIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m387-412 35-114-92-74h114l36-112 36 112h114l-93 74 35 114-92-71-93 71ZM240-40v-309q-38-42-59-96t-21-115q0-134 93-227t227-93q134 0 227 93t93 227q0 61-21 115t-59 96v309l-240-80-240 80Zm410-350q70-70 70-170t-70-170q-70-70-170-70t-170 70q-70 70-70 170t70 170q70 70 170 70t170-70ZM320-159l160-41 160 41v-124q-35 20-75.5 31.5T480-240q-44 0-84.5-11.5T320-283v124Zm160-62Z" />
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

/** Material Symbols `paid` (outlined). */
export function PaidIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
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

/** Material Symbols `forum` — the match's discussion thread. */
export function ForumIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80l160-160h560q33 0 56.5-23.5T880-320v-480q0-33-23.5-56.5T800-880H160q-33 0-56.5 23.5T80-800v720Zm80-213v-507h640v480H207l-47 27Z" />
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

#### `src/design-system/icons/brand.tsx`

**Adapted.** StatOz registers four pieces of artwork and a Google mark. This keeps the artwork this page draws: ozCoins.

```tsx
import Image from "next/image";
import { publicAsset } from "@/shared/config";

/**
 * Multi-color brand artwork from the app's `assets/icons`. These carry their
 * own palette, so unlike the glyphs in `glyphs.tsx` they are served as images
 * rather than inlined and tinted.
 */
export const brandAssets = {
  ozCoins: { src: "/assets/icons/oz_coins.svg", alt: "Oz coins" },
} as const;

export type BrandAssetName = keyof typeof brandAssets;

export type BrandIconProps = {
  name: BrandAssetName;
  size?: number;
  /** Overrides the default alt text; pass "" for purely decorative use. */
  alt?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Renders one of the brand artwork assets at a square size. Some artwork is
 * not square (the coins are 21×20), so the box is pinned to 1:1 and the art is
 * contained within it rather than letting `height: auto` reshape the image.
 */
export function BrandIcon({
  name,
  size = 18,
  alt,
  className,
  priority,
}: BrandIconProps) {
  const asset = brandAssets[name];
  const resolved = alt ?? asset.alt;

  return (
    <Image
      src={publicAsset(asset.src)}
      alt={resolved}
      width={size}
      height={size}
      className={["aspect-square object-contain", className]
        .filter(Boolean)
        .join(" ")}
      priority={priority}
      aria-hidden={resolved === "" ? true : undefined}
    />
  );
}
```

#### `src/design-system/icons/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { type IconProps } from "./icon";
export * from "./glyphs";
export * from "./brand";
```

#### `public/assets/icons/oz_coins.svg`

**Unchanged.**

```xml
<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.2418 8.93332L11.1085 6.79999H8.97513L6.8418 8.93332V11.0667L8.97513 13.2H11.1074L13.2408 11.0667L13.2418 8.93332Z" fill="#FDC700"/>
<path d="M15.8846 0C16.6262 0 17.3028 0.18632 17.9145 0.558953C18.5448 0.931579 19.0453 1.43463 19.416 2.06808C19.8053 2.68293 20 3.37237 20 4.13627C20 4.13627 20.0573 9.70541 20.0573 13.0133C18.443 13.0133 14.6667 13.0133 14.6667 13.0133L14.6276 5.35099H5.36095L5.4 13.0133H0L9.80377e-06 4.14122C9.80377e-06 3.37732 0.164761 2.68293 0.535514 2.06808C0.906257 1.43463 1.40677 0.931582 2.03702 0.558953C2.6673 0.186318 3.35326 0 4.09476 0H15.8846Z" fill="#FDC700"/>
<path d="M20.043 14.6637V14.6133H0.0429688V14.6828C0.0429688 15.6443 0.207721 16.5147 0.578473 17.3319C0.949216 18.1492 1.44973 18.7982 2.07998 19.2789C2.71026 19.7596 3.39621 20 4.13772 20H15.9276C16.6691 20 17.3457 19.7596 17.9575 19.2789C18.5877 18.7982 19.0882 18.1492 19.459 17.3319C19.8483 16.5147 20.043 15.6252 20.043 14.6637Z" fill="#FDC700"/>
<path d="M15.8846 0C16.6262 0 17.3028 0.18632 17.9145 0.558953C18.5448 0.931579 19.0453 1.43463 19.416 2.06808C19.8053 2.68293 20 3.37237 20 4.13627C20 4.13627 20.0573 9.70541 20.0573 13.0133H18.95C18.95 9.70541 18.8927 4.13627 18.8927 4.13627C18.8927 3.57098 18.7486 3.05336 18.4603 2.58343C18.1862 2.11495 17.8156 1.74258 17.3484 1.46631C16.895 1.19004 16.407 1.0519 15.8846 1.0519H4.09476C3.57237 1.0519 3.07338 1.19004 2.59779 1.46631C2.13058 1.74258 1.75995 2.11495 1.4859 2.58343C1.21186 3.05336 1.07531 3.57262 1.07531 4.14122L1.0753 13.0133H0L9.80377e-06 4.14122C9.80377e-06 3.37732 0.164761 2.68293 0.535514 2.06808C0.906257 1.43463 1.40677 0.931582 2.03702 0.558953C2.6673 0.186318 3.35326 0 4.09476 0H15.8846Z" fill="#FFE173" fill-opacity="0.55"/>
</svg>
```

### Components

Each component sits in its own folder with a one-line `index.ts`.

- `NavRail`: the navigation, as a side rail or a bottom bar.
- `Breadcrumbs`: the trail under the top bar.
- `UnderlineTabs`: the tab strip with a sliding underline. The page's four tabs and the TOPS board selector use it.
- `FilterChips`: the row of cut-corner chips used across the STATS tab.
- `Button`: the two buttons in the account prompt.
- `NoDataState`: the "nothing here yet" message with an icon.
- `Avatar` and `Monogram`: portraits and initials on the leaderboard.
- `GoalMouthDiagram`: the small goal that shows where a shot went.

#### `src/design-system/components/actions/button/button.tsx`

**Unchanged.**

```tsx
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { withAlpha } from "../../../tokens/elevation";

export type ButtonVariant = "solid" | "tonal" | "surface" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: ReactNode;
  /**
   * `solid` fills with the accent, `tonal` tints a dark plate with it,
   * `surface` is the neutral plate used for third-party sign-in, and `ghost`
   * drops the plate entirely.
   */
  variant?: ButtonVariant;
  /** CSS color driving the fill, edge, and label. */
  accent?: string;
  /** Blooms the accent behind the plate. For the one focal action on a screen. */
  glow?: boolean;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Renders a link that looks like a button. */
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Shows a spinner in place of the trailing icon and blocks input. */
  pending?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Accessible name, when the label alone does not read as one. */
  label?: string;
  className?: string;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-field)" };

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 px-3.5 text-2xs",
  md: "h-11 gap-2.5 px-4 text-xs",
  lg: "h-13 gap-3 px-5 text-sm",
};

/** The plate colors each variant paints: an edge, an inset fill, and a label. */
function surfacesFor(variant: ButtonVariant, accent: string) {
  switch (variant) {
    case "solid":
      return {
        edge: accent,
        fill: accent,
        color: "var(--ds-color-text-inverse)",
      };
    case "tonal":
      return {
        edge: withAlpha(accent, 0.5),
        fill: `color-mix(in srgb, ${accent} 15%, var(--ds-color-background-secondary))`,
        color: "var(--ds-color-text-default)",
      };
    case "surface":
      return {
        edge: "var(--ds-color-border-default)",
        fill: "var(--ds-color-background-elevated)",
        color: "var(--ds-color-text-default)",
      };
    case "ghost":
      return { edge: "transparent", fill: "transparent", color: accent };
  }
}

/**
 * The system's chamfered action plate. Built as an edge layer with the fill
 * inset a pixel inside it, because a clip path crops a border away.
 */
export function Button({
  children,
  variant = "solid",
  accent = "var(--ds-color-accent-cyan)",
  glow = false,
  size = "md",
  fullWidth = false,
  href,
  onClick,
  type = "button",
  disabled = false,
  pending = false,
  leadingIcon,
  trailingIcon,
  label,
  className,
}: ButtonProps) {
  const { edge, fill, color } = surfacesFor(variant, accent);
  const blocked = disabled || pending;

  const chrome = [
    "relative inline-flex items-center justify-center font-display font-black tracking-label",
    "transition-[transform,filter] duration-150 hover:-translate-y-px hover:brightness-110 active:translate-y-0",
    // A clip path crops anything layered behind the plate, so the bloom is a
    // drop-shadow — applied after clipping, it traces the chamfered silhouette.
    glow ? "drop-shadow-[0_0_12px_var(--button-glow)]" : "",
    sizes[size],
    fullWidth ? "w-full" : "",
    blocked ? "pointer-events-none opacity-55" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-px"
        style={{ ...clip, background: fill }}
      />
      {leadingIcon ? (
        <span aria-hidden className="relative grid shrink-0 place-items-center">
          {leadingIcon}
        </span>
      ) : null}
      <span className="relative truncate">{children}</span>
      {pending ? (
        <span
          aria-hidden
          className="relative size-3.5 shrink-0 animate-spin rounded-pill border-2 border-current border-t-transparent"
        />
      ) : trailingIcon ? (
        <span aria-hidden className="relative grid shrink-0 place-items-center">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  const style: CSSProperties = {
    ...clip,
    background: edge,
    color,
    ...(glow ? { "--button-glow": withAlpha(accent, 0.5) } : {}),
  } as CSSProperties;

  if (href) {
    return (
      <Link href={href} aria-label={label} className={chrome} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={blocked}
      aria-label={label}
      aria-busy={pending || undefined}
      className={chrome}
      style={style}
    >
      {content}
    </button>
  );
}
```

#### `src/design-system/components/actions/button/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { Button } from "./button";
```

#### `src/design-system/components/data-display/avatar/avatar.tsx`

**Unchanged.**

```tsx
import Image from "next/image";
import type { CSSProperties } from "react";

import { publicAsset } from "@/shared/config";

export type AvatarProps = {
  /** Path under `public/`; run through `publicAsset` here. */
  src: string;
  /** Accessible name. Pass an empty string when a label sits beside it. */
  alt: string;
  size: number;
  /** Draws a ring in this colour around the portrait. */
  ring?: string;
  ringWidth?: number;
  className?: string;
};

/**
 * An octagon-clipped portrait — the same silhouette as {@link Monogram}, which
 * is what stands in for one when there is no picture to show.
 *
 * The ring is a clipped plate with the portrait inset inside it rather than a
 * border, because a clip path crops a border away.
 */
export function Avatar({
  src,
  alt,
  size,
  ring,
  ringWidth = 1.2,
  className,
}: AvatarProps) {
  const clip: CSSProperties = { clipPath: "var(--ds-clip-octagon)" };
  const inset = ring ? ringWidth : 0;

  return (
    <span
      className={["relative block shrink-0", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
    >
      {ring ? (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ ...clip, background: ring }}
        />
      ) : null}
      <span
        aria-hidden={alt === "" ? true : undefined}
        className="absolute overflow-hidden"
        style={{
          ...clip,
          inset,
          background: "var(--ds-color-background-elevated)",
        }}
      >
        <Image
          src={publicAsset(src)}
          alt={alt}
          fill
          sizes={`${Math.ceil(size)}px`}
          className="object-cover object-top"
        />
      </span>
    </span>
  );
}
```

#### `src/design-system/components/data-display/avatar/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { Avatar } from "./avatar";
```

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

#### `src/design-system/components/data-display/monogram/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { Monogram } from "./monogram";
```

#### `src/design-system/components/data-display/monogram/monogram.tsx`

**Unchanged.**

```tsx
import type { CSSProperties } from "react";

export type MonogramProps = {
  /** Full name; the initials are derived from it. */
  name: string;
  /** Pre-computed initials, when the derived ones read badly. */
  initials?: string;
  /** CSS color for the badge fill and edge. */
  accent: string;
  size?: number;
  className?: string;
};

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Octagonal identity badge used for teams, clubs, and players. Cut corners
 * instead of a circle so it matches the rest of the system's silhouette.
 */
export function Monogram({
  name,
  initials,
  accent,
  size = 34,
  className,
}: MonogramProps) {
  const label = initials ?? initialsFrom(name);
  const style = {
    width: size,
    height: size,
    clipPath: "var(--ds-clip-octagon)",
    background: `color-mix(in srgb, ${accent} 22%, var(--ds-color-background-primary))`,
    color: accent,
    // Two initials get the full step; a longer label — a club code such as FCB
    // or S04 — is set smaller so it still clears the octagon's cut corners.
    fontSize: Math.round(size * (label.length > 2 ? 0.26 : 0.36)),
  } satisfies CSSProperties;

  return (
    <span
      className={[
        "inline-grid shrink-0 place-items-center font-display font-black tracking-tight",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="img"
      aria-label={name}
    >
      {label}
    </span>
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

#### `src/design-system/components/navigation/breadcrumbs/breadcrumbs.tsx`

**Unchanged.**

```tsx
import Link from "next/link";

import { ChevronRightIcon } from "@/design-system/icons";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  label?: string;
  className?: string;
};

/** A compact, horizontally-safe trail for secondary page navigation. */
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  className,
}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={className}>
      <ol className="flex min-w-0 items-center overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? "current"}-${item.label}`}
              className="flex min-w-0 shrink-0 items-center"
            >
              {index > 0 ? (
                <ChevronRightIcon
                  size={14}
                  className="mx-1.5 shrink-0 text-line-strong"
                  aria-hidden="true"
                />
              ) : null}

              {item.href && !current ? (
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center font-display text-2xs font-black tracking-ultra text-muted transition-colors hover:text-cyan"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className="flex min-h-11 max-w-72 items-center truncate font-display text-2xs font-black tracking-ultra text-cyan"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

#### `src/design-system/components/navigation/breadcrumbs/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";
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

#### `src/design-system/components/navigation/nav-rail/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { NavRail, type NavRailItem } from "./nav-rail";
```

#### `src/design-system/components/navigation/nav-rail/nav-rail.tsx`

**Unchanged.**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type NavRailItemBase = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Color the item takes when it is the current destination. */
  accent: string;
};

export type NavRailItem = NavRailItemBase &
  ({ href: string; onSelect?: never } | { href?: never; onSelect: () => void });

export type NavRailProps = {
  items: NavRailItem[];
  /** Id of the current destination. */
  activeId?: string;
  /** `bar` lays the items out horizontally, `rail` stacks them vertically. */
  orientation?: "bar" | "rail";
  label: string;
  className?: string;
};

/**
 * Primary destination switcher. The same items, accents, and active treatment
 * render either as a bottom bar on small screens or as a side rail on large
 * ones, so the product's navigation identity survives the reflow.
 */
export function NavRail({
  items,
  activeId,
  orientation = "bar",
  label,
  className,
}: NavRailProps) {
  const rail = orientation === "rail";

  return (
    <nav
      aria-label={label}
      className={[rail ? "h-full w-full py-4" : "px-2 py-3", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ background: "var(--ds-gradient-nav-bar)" }}
    >
      <ul
        className={[
          "flex",
          rail ? "flex-col gap-1.5" : "items-stretch gap-1.5",
        ].join(" ")}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          const itemClassName = [
            "flex min-h-15 w-full transition-colors duration-200",
            rail
              ? "flex-row items-center gap-3 px-4 py-3"
              : "flex-col items-center justify-center gap-1.5 px-1",
          ].join(" ");
          const itemStyle = {
            color: active ? item.accent : "var(--ds-color-text-disabled)",
            background: active
              ? `color-mix(in srgb, ${item.accent} 10%, transparent)`
              : undefined,
          };
          const content = (
            <>
              <span className="grid size-5 shrink-0 place-items-center">
                {item.icon}
              </span>
              <span
                className={[
                  "font-display leading-tight",
                  rail ? "text-xs" : "text-2xs",
                  active ? "font-black" : "font-semibold",
                ].join(" ")}
              >
                {item.label}
              </span>
            </>
          );
          return (
            <li key={item.id} className={rail ? "" : "flex-1"}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={itemClassName}
                  style={itemStyle}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onSelect}
                  aria-current={active ? "page" : undefined}
                  className={itemClassName}
                  style={itemStyle}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

#### `src/design-system/components/navigation/underline-tabs/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { UnderlineTabs } from "./underline-tabs";
```

#### `src/design-system/components/navigation/underline-tabs/underline-tabs.tsx`

**Unchanged.**

```tsx
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

export type UnderlineTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Prints the label beside an icon; icon-only tabs remain compact by default. */
  showLabel?: boolean;
  /** Runs a callback instead of selecting — for trailing actions like "more". */
  action?: () => void;
};

export type UnderlineTabsProps = {
  tabs: UnderlineTab[];
  /** Index of the selected tab, or -1 when nothing on this strip is selected. */
  activeIndex: number;
  onChange: (index: number) => void;
  /** Drives the wash, the underline, and the strip's bottom hairline. */
  accent: string;
  /** Optional identity color for each tab icon, in the same order as `tabs`. */
  iconColors?: string[];
  label: string;
  /** Trailing cell pinned to the end of the strip, outside the scroll area. */
  trailing?: ReactNode;
  /** Minimum width for each tab. When set, the strip scrolls horizontally. */
  minTabWidth?: number;
  className?: string;
};

/**
 * Flat tab strip whose only live element is a glowing underline that slides
 * between tabs. Lower-key than {@link GlidingTabs} — reach for it on dense
 * browse surfaces that already carry a focal element.
 */
export function UnderlineTabs({
  tabs,
  activeIndex,
  onChange,
  accent,
  iconColors,
  label,
  trailing,
  minTabWidth,
  className,
}: UnderlineTabsProps) {
  if (iconColors && iconColors.length !== tabs.length) {
    throw new Error("UnderlineTabs iconColors must match the tabs length.");
  }

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(from: number, delta: number) {
    const next = (from + delta + tabs.length) % tabs.length;
    tabRefs.current[next]?.focus();
    if (!tabs[next].action) onChange(next);
  }

  // The underline spans the middle 64% of the active tab's cell.
  const cell = 100 / Math.max(tabs.length, 1);
  const underline = {
    left: `${cell * activeIndex + cell * 0.18}%`,
    width: `${cell * 0.64}%`,
    background: accent,
    boxShadow: `0 0 10px color-mix(in srgb, ${accent} 70%, transparent)`,
  } satisfies CSSProperties;

  return (
    <div
      className={[
        "flex h-12.5 min-h-10 shrink-0 border-b bg-background/40",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
      }}
    >
      <div className="h-full min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label={label}
          className="relative flex h-full min-w-full"
          style={minTabWidth ? { width: "max-content" } : undefined}
        >
          {tabs.map((tab, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role={tab.action ? undefined : "tab"}
                aria-selected={tab.action ? undefined : active}
                aria-label={tab.label}
                title={tab.label}
                tabIndex={Boolean(tab.action) || active ? 0 : -1}
                onClick={() => (tab.action ? tab.action() : onChange(index))}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    move(index, 1);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    move(index, -1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    tabRefs.current[0]?.focus();
                    if (!tabs[0]?.action) onChange(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    const last = tabs.length - 1;
                    tabRefs.current[last]?.focus();
                    if (!tabs[last]?.action) onChange(last);
                  }
                }}
                className="flex min-h-10 flex-1 items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                style={{
                  minWidth: minTabWidth,
                  color: active ? accent : "var(--ds-color-text-muted)",
                  background: active
                    ? `color-mix(in srgb, ${accent} 7%, transparent)`
                    : undefined,
                }}
              >
                {tab.icon ? (
                  <span className="flex min-w-0 items-center justify-center gap-2 px-2">
                    <span
                      aria-hidden
                      className="grid shrink-0 place-items-center transition-colors duration-200"
                      style={
                        iconColors?.[index]
                          ? {
                              color: active
                                ? iconColors[index]
                                : `color-mix(in srgb, ${iconColors[index]} 58%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.showLabel ? (
                      <span className="truncate font-display text-2xs font-black tracking-wide">
                        {tab.label}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="truncate px-1 font-display text-2xs font-black tracking-ultra">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}

          {activeIndex >= 0 && activeIndex < tabs.length ? (
            <span
              aria-hidden
              className="absolute bottom-0 h-0.75 transition-[left,width] duration-300 ease-out"
              style={underline}
            />
          ) : null}
        </div>
      </div>

      {trailing ? (
        <div
          className="grid min-h-10 w-12 shrink-0 place-items-center border-l"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
          }}
        >
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
```

### The entry point

Everything above is imported through this one file, as `@/design-system`.

#### `src/design-system/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./tokens";
export * from "./icons";

export * from "./components/actions/button";
export * from "./components/data-display/avatar";
export * from "./components/data-display/goal-mouth-diagram";
export * from "./components/data-display/monogram";
export * from "./components/feedback/no-data-state";
export * from "./components/navigation/breadcrumbs";
export * from "./components/navigation/filter-chips";
export * from "./components/navigation/nav-rail";
export * from "./components/navigation/underline-tabs";
```

## Step 4: data types

`sport.ts` lists the sports and each one's accent colour. `match.ts` describes a fixture and a team. `detail.ts` describes everything the page shows for one match, gathered into `MatchDetailData`. `report.ts` and `race.ts` are unchanged type files that `detail.ts` refers to; they also describe other sports. `circle.ts` describes the discussion thread behind the Match Circle count. `quiz.ts` holds the types and rules for prediction quizzes.

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
    label: "Basket",
    shortLabel: "BALL",
    accent: "gold",
  },
  tennis: {
    sport: "tennis",
    label: "Tennis",
    shortLabel: "TENNIS",
    accent: "lime",
  },
  motorsport: {
    sport: "motorsport",
    label: "Motorsport",
    shortLabel: "MOTOR",
    accent: "racing",
  },
};

export function sportModuleFor(sport: Sport): SportModule {
  return sportModules[sport];
}
```

#### `src/domain/matches/circle.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type { Sport } from "../sports";

import type { SportMatch } from "./match";

export type MatchCircleAuthor = {
  id: string;
  displayName: string;
  /** A face from the avatar catalogue. */
  avatarId: string;
  playerTag?: string;
};

export type MatchCirclePost = {
  id: string;
  threadKey: string;
  /** Set on a reply, naming the comment it hangs under. */
  parentId?: string;
  author: MatchCircleAuthor;
  text: string;
  /** ISO 8601. */
  createdAt: string;
  editedAt?: string;
  likes: number;
  likedBy: string[];
  isDeleted: boolean;
};

export type MatchCircleThread = {
  key: string;
  sport: Sport;
  leagueId: string;
  matchId: string;
  posts: MatchCirclePost[];
  seededAt: string;
  updatedAt: string;
};

/**
 * The key a thread is stored under. Motorsport still writes `f1`, so threads
 * saved before the sport was renamed are not orphaned.
 */
export function matchCircleThreadKey(match: SportMatch): string {
  const sport = match.sport === "motorsport" ? "f1" : match.sport;
  return `${sport}:${match.leagueId}:${match.id}`;
}

/** The count the call-to-action carries: 940, 1.2K, 3M. */
export function compactMatchCircleCount(count: number): string {
  if (count < 1000) return String(count);
  const [value, suffix] =
    count < 1_000_000 ? [count / 1000, "K"] : [count / 1_000_000, "M"];
  const rounded = Math.round(value);
  return `${value === rounded ? rounded : value.toFixed(1)}${suffix}`;
}

/** Everything still standing, replies included. */
export function visibleCount(thread: MatchCircleThread): number {
  return thread.posts.filter((post) => !post.isDeleted).length;
}
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
export * from "./circle";
export * from "./detail";
export * from "./report";
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

#### `src/domain/predictions/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./quiz";
```

#### `src/domain/predictions/quiz.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/**
 * The prediction quiz — the contract behind the match detail's PREDICT tab.
 *
 * A quiz is a set of questions attached to one fixture. The player answers them
 * as an editable draft, seals that draft into an immutable lock before kickoff,
 * and once the fixture is over the lock is settled against the questions' known
 * answers for XP.
 *
 * Everything here is data and pure rules. The store that persists a player's
 * answers lives in `features/predictions`; the fixtures' questions live in
 * `mocks/matches`.
 */

/** The default quiz set every fixture carries. */
export const defaultPredictionQuizId = "main";

/** Oz charged once when a player first enters the paid Scoreline Quiz. */
export const scorelineQuizEntryFee = 25;

/** The Scoreline Quiz prize pool, indexed by finish rank. */
export const scorelineContestPrizes = [2000, 1000, 500];

/**
 * Where a player's entry sits in its lifecycle.
 *
 * open    → an auto-saved draft, still editable until kickoff.
 * locked  → sealed by hand or at the deadline; answers are immutable.
 * settled → the result is known, `correctCount` and `rewardEarned` are filled.
 */
export type PredictionStatus = "open" | "locked" | "settled";

export type QuizQuestionType = "multipleChoice" | "exactScore";

/* ---- Boosts ---------------------------------------------------------------- */

/** The two boosts a player can arm, one question each. */
export type PredictionMultiplierId = "x2" | "x15";

/* ---- Score answers --------------------------------------------------------- */

/**
 * A predicted scoreline packed into the single integer an answer slot holds:
 * home x 100 + away, which covers 0-99 a side.
 */
export const ScoreAnswer = {
  encode(home: number, away: number): number {
    return home * 100 + away;
  },
  decode(encoded: number): { home: number; away: number } {
    return { home: Math.floor(encoded / 100), away: encoded % 100 };
  },
};

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

export function isScoreQuestion(question: QuizQuestion): boolean {
  return question.type === "exactScore";
}

/** The correct answer in the encoding an answer slot uses, or null. */
export function settledAnswerFor(question: QuizQuestion): number | null {
  if (question.forcedVoid) return null;
  if (isScoreQuestion(question)) {
    if (
      question.settledHomeScore == null ||
      question.settledAwayScore == null
    ) {
      return null;
    }
    return ScoreAnswer.encode(
      question.settledHomeScore,
      question.settledAwayScore,
    );
  }
  return question.settledOptionIndex ?? null;
}

export function isQuestionSettled(question: QuizQuestion): boolean {
  return question.forcedVoid === true || settledAnswerFor(question) !== null;
}

/** Every question's reward added up — the quiz's advertised XP. */
export function quizMaxReward(quiz: PredictionQuiz): number {
  return quiz.questions.reduce((sum, question) => sum + question.reward, 0);
}

/** True once every question can be marked, so the quiz can be revealed. */
export function isQuizSettleable(quiz: PredictionQuiz): boolean {
  return quiz.questions.every(isQuestionSettled);
}

/** A paid coin contest — the top three finishers win the prize pool. */
export function isContestQuiz(quiz: PredictionQuiz): boolean {
  return quiz.entryFee > 0;
}

/* ---- A player's entry ------------------------------------------------------ */

export type UserPrediction = {
  matchId: string;
  quizId: string;
  /** questionId → the selected option index, or an encoded scoreline. */
  answers: Record<string, number>;
  /** questionId → the boost armed on it. At most one of each boost. */
  multipliersByQuestion: Record<string, PredictionMultiplierId>;
  /** ISO 8601. */
  submittedAt: string;
  status: PredictionStatus;
  correctCount?: number;
  rewardEarned: number;
  /** Finish position in a paid contest's field once settled (1-based). */
  contestRank?: number;
  /** Oz won from the prize pool. Zero off the podium and on free quizzes. */
  contestPrizeOz: number;
};

export function predictionStorageKey(matchId: string, quizId: string): string {
  return `${matchId}::${quizId}`;
}

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

/** Re-ranks a field by points, highest first. */
export function rankedBoard(
  entries: MatchPredictionLeaderboardEntry[],
): MatchPredictionLeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/**
 * The player's score once their card is settled, on the same curve the rivals
 * sit on: a perfect card lands at the top of their band.
 */
export function boardPointsFor(
  correct: number,
  total: number,
  answered: number,
): number {
  return (total === 0 ? 0 : Math.round((620 * correct) / total)) + answered * 6;
}
```

## Step 5: the match data

The page calls two functions from `@/mocks/matches`: `matchById(id)` returns the fixture, and `matchDetailFor(match)` returns its quizzes, leaderboards and STATS report.

### The fixture

`definitions.ts` holds the league and two small builders. `football.ts` lists the two teams and the one fixture. `catalog.ts` provides the lookups and sets `matchDemoAnchor` to 25 August 2026, the fixed day the demo treats as today.

A team has four colours: `color` and `secondaryColor` for the crest, `badgeTextColor` for the letters on it, and `secondaryTextColor` for text and bars drawn on the page's dark background. Fulham's main colour is black, so its bars use white.

#### `src/mocks/matches/definitions.ts`

**Adapted.** The league list holds the Premier League only. The runtime lookup in StatOz's generated team-palette file is removed, and `team()` takes the fourth colour, `secondaryTextColor`, as an extra argument instead.

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

**Adapted.** StatOz lists every football fixture here. This keeps Fulham v Chelsea, with the team colours StatOz's palette lookup produces written in directly.

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

#### `src/mocks/matches/catalog.ts`

**Adapted.** The fixture list holds football only, so the other sports' fixture files are not needed.

```ts
import type { SportMatch } from "@/domain/matches";
import { footballFixtures } from "./football";

/** Fixed timestamp that keeps the demo's relative date labels stable. */
export const matchDemoAnchor = "2026-08-25T00:00:00.000Z";

/** Stable reading order for the sport feed and static match routes. */
export const sportFixtures: SportMatch[] = [...footballFixtures];

const matchIndex = new Map(sportFixtures.map((match) => [match.id, match]));
export const allMockMatchIds = sportFixtures.map((match) => match.id);
export function matchById(id: string): SportMatch | undefined {
  return matchIndex.get(id);
}
```

### The match report

`matchDetailFor` works in two passes. `buildMatchDetail` first generates a report from the match id, which is what StatOz shows for a fixture with no recorded data. `applyFootballSnapshot` then replaces the stats, timeline, commentary, pressure chart, shots, lineups and player figures with the recorded match from `football-revamp.json`. Everything the STATS tab shows for this match comes from the snapshot.

**Copy `src/mocks/snapshots/card-game/football-revamp.json` from StatOz to the same path.** It is 140 KB, too large to print here.

#### `src/mocks/matches/details/index.ts`

**Adapted.** StatOz's version also handles cricket, basketball, tennis and motorsport. This keeps the football path.

```ts
import type { MatchDetailData, SportMatch } from "@/domain/matches";

import { footballDetail } from "./football";
import { applyFootballSnapshot } from "./football-snapshot";
import { buildMatchDetail } from "./shared";

/** Builds the tabs' data for a fixture, then lays the recorded match over it. */
export function matchDetailFor(match: SportMatch): MatchDetailData {
  const detail = buildMatchDetail(match, footballDetail);
  applyFootballSnapshot(match, detail.scoreboard);
  return detail;
}
```

#### `src/mocks/matches/details/shared.ts`

**Unchanged.**

```ts
import type {
  MatchDetailData,
  MatchDetailLineup,
  MatchDetailScoreboard,
  SportMatch,
} from "@/domain/matches";
import { formatKickoffDate, formatKickoffTime } from "@/shared/utils";

import { matchBoardRivals, quizzesForMatch } from "../quizzes";
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
  const quizzes = quizzesForMatch(match);
  const seed = stableSeed(`${match.id}:scoreboard`);
  const stats = config.statLabels.map((label, index) =>
    statFor(label, seed, index),
  );
  const scoreRows = config.scoreRows(match, seed);
  const report = buildReport({ match, seed, stats, scoreRows });

  return {
    quizzes,
    leaderboard: Object.fromEntries(
      quizzes.map((quiz) => [quiz.id, matchBoardRivals(match.id, quiz.id)]),
    ),
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

#### `src/mocks/matches/details/report.ts`

**Adapted.** `buildReport` chooses a report by sport in StatOz. Here it always builds the football one, and the other sports' builders are left out.

```ts
import type {
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
  return footballReport(input);
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

### Quizzes and boards

`quizzesForMatch` builds the two quizzes and, because the match is finished, fills in each question's answer from the final score. A question the score cannot decide, such as the number of fouls, is marked void. `matchBoardRivals` picks six rivals for each board from the list in `detail-rivals.ts` and gives them points.

`football-bank.ts` names a background image for each question. The quiz page draws them. This page does not, so they are not among the files to copy.

#### `src/mocks/matches/quizzes/football-bank.ts`

**Unchanged.**

```ts
import type { PredictionQuiz, QuizQuestion } from "@/domain/predictions";

/**
 * The shared football prediction-question bank.
 *
 * `buildFootballQuiz` assembles a per-fixture set: an exact-score centrepiece,
 * the compulsory match-winner pick, then one seeded match-level question and
 * one seeded team-level question, so every fixture reads differently while the
 * flow stays four questions long.
 *
 * The app keys a full-bleed backdrop off each question id. The web has no
 * prediction backdrop art, so the panels carry the same layout without one —
 * see the port notes on the match feature.
 */

type BankCategory = "matchBool" | "matchMcq" | "teamBool" | "teamMcq";

type BankQuestion = {
  id: string;
  category: BankCategory;
  /** May carry `{teamA}` / `{teamB}`, bound to the fixture's sides. */
  template: string;
  options: (home: string, away: string) => string[];
};

const trueFalse = ["True", "False"];
const bool = () => trueFalse;
const winnerOptions = (home: string, away: string) => [home, away, "Draw"];
const firstGoalOptions = (home: string, away: string) => [
  home,
  away,
  "No goal scored",
];

/**
 * The art each question is asked over, keyed by question id. Several questions
 * deliberately share one image; anything absent falls back to the default.
 */
const backgroundById: Record<string, string> = {
  exact_score: "match_result_mcq",
  match_result_mcq: "match_result_mcq",
  match_ends_in_draw: "match_ends_in_draw",
  both_teams_to_score: "both_teams_to_score",
  first_scorer_wins: "first_scorer_wins",
  halftime_leader_wins: "halftime_leader_wins",
  match_has_red_card: "match_has_red_card",
  team_red_card_b: "match_has_red_card",
  match_over_4_yellow_cards: "match_over_4_yellow_cards",
  first_goal_before_30: "first_goal_before_30",
  match_over_8_corners: "match_over_8_corners",
  total_corners_range_mcq: "match_over_8_corners",
  team_corners_range_mcq: "match_over_8_corners",
  team_five_plus_corners: "match_over_8_corners",
  team_wins_match: "team_wins_match",
  team_clean_sheet: "team_clean_sheet",
  team_possession_over_60: "team_possession_over_60",
  team_five_plus_shots_on_target: "team_five_plus_shots_on_target",
  team_red_card_a: "team_gets_red_card",
  team_yellow_card_a: "total_yellow_cards_range_mcq",
  team_yellow_card_b: "total_yellow_cards_range_mcq",
  total_yellow_cards_range_mcq: "total_yellow_cards_range_mcq",
  team_ten_plus_fouls: "team_ten_plus_fouls",
  total_cards_range_mcq: "team_ten_plus_fouls",
  halftime_leader_mcq: "halftime_leader_mcq",
  first_goal_team_mcq: "first_goal_team_mcq",
  first_goal_window_mcq: "first_goal_team_mcq",
  total_goals_range_mcq: "total_goals_range_mcq",
  team_shots_range_mcq: "team_shots_range_mcq",
  team_goals_range_mcq: "team_goals_range_mcq",
  team_scores_two_plus: "team_goals_range_mcq",
};

export function questionBackground(id: string): string {
  return `/assets/backgrounds/predictions/${backgroundById[id] ?? "default"}.webp`;
}

const rewardByCategory: Record<BankCategory, number> = {
  matchMcq: 90,
  teamMcq: 90,
  matchBool: 60,
  teamBool: 60,
};

/** The compulsory match-winner question; always included. */
const matchResult: BankQuestion = {
  id: "match_result_mcq",
  category: "matchMcq",
  template: "Which team will win the match?",
  options: winnerOptions,
};

const bank: BankQuestion[] = [
  // Match-level booleans.
  {
    id: "match_three_or_more_goals",
    category: "matchBool",
    template: "There will be 3 or more total goals in the match.",
    options: bool,
  },
  {
    id: "match_ends_in_draw",
    category: "matchBool",
    template: "The match will end in a draw.",
    options: bool,
  },
  {
    id: "both_teams_to_score",
    category: "matchBool",
    template: "Both teams will score at least one goal.",
    options: bool,
  },
  {
    id: "first_scorer_wins",
    category: "matchBool",
    template: "The team that scores first will go on to win the match.",
    options: bool,
  },
  {
    id: "halftime_leader_wins",
    category: "matchBool",
    template: "The team leading at half time will win the match.",
    options: bool,
  },
  {
    id: "match_has_red_card",
    category: "matchBool",
    template: "At least one red card will be shown in the match.",
    options: bool,
  },
  {
    id: "match_over_4_yellow_cards",
    category: "matchBool",
    template: "The match will produce 4 or more yellow cards in total.",
    options: bool,
  },
  {
    id: "first_goal_before_30",
    category: "matchBool",
    template:
      "The first goal of the match will be scored before the 30-minute mark.",
    options: bool,
  },
  {
    id: "match_over_8_corners",
    category: "matchBool",
    template: "There will be more than 8 corner kicks in the match.",
    options: bool,
  },
  // Team-specific booleans.
  {
    id: "team_wins_match",
    category: "teamBool",
    template: "{teamA} will win the match.",
    options: bool,
  },
  {
    id: "team_clean_sheet",
    category: "teamBool",
    template: "{teamA} will keep a clean sheet (concede 0 goals).",
    options: bool,
  },
  {
    id: "team_scores_two_plus",
    category: "teamBool",
    template: "{teamB} will score 2 or more goals in the match.",
    options: bool,
  },
  {
    id: "team_possession_over_60",
    category: "teamBool",
    template: "{teamA} will have more than 60% possession.",
    options: bool,
  },
  {
    id: "team_five_plus_shots_on_target",
    category: "teamBool",
    template: "{teamB} will register 5 or more shots on target.",
    options: bool,
  },
  {
    id: "team_red_card_a",
    category: "teamBool",
    template: "{teamA} will receive a red card in the match.",
    options: bool,
  },
  {
    id: "team_red_card_b",
    category: "teamBool",
    template: "{teamB} will receive a red card in the match.",
    options: bool,
  },
  {
    id: "team_yellow_card_a",
    category: "teamBool",
    template: "{teamA} will receive a yellow card in the match.",
    options: bool,
  },
  {
    id: "team_yellow_card_b",
    category: "teamBool",
    template: "{teamB} will receive a yellow card in the match.",
    options: bool,
  },
  {
    id: "team_ten_plus_fouls",
    category: "teamBool",
    template: "{teamA} will commit 10 or more fouls in the match.",
    options: bool,
  },
  {
    id: "team_five_plus_corners",
    category: "teamBool",
    template: "{teamA} will win 5 or more corner kicks.",
    options: bool,
  },
  // Match-level MCQs.
  {
    id: "halftime_leader_mcq",
    category: "matchMcq",
    template: "Which team will be leading at half time?",
    options: winnerOptions,
  },
  {
    id: "first_goal_team_mcq",
    category: "matchMcq",
    template: "Which team will score the first goal of the match?",
    options: firstGoalOptions,
  },
  {
    id: "total_goals_range_mcq",
    category: "matchMcq",
    template: "How many total goals will be scored in the match?",
    options: () => ["0 - 1", "2 - 3", "4 - 5", "6 or more"],
  },
  {
    id: "total_yellow_cards_range_mcq",
    category: "matchMcq",
    template: "How many yellow cards will be shown in total?",
    options: () => ["0 - 2", "3 - 4", "5 - 6", "7 or more"],
  },
  {
    id: "total_cards_range_mcq",
    category: "matchMcq",
    template: "How many total cards (yellow + red) will be shown in the match?",
    options: () => ["0 - 3", "4 - 5", "6 - 7", "8 or more"],
  },
  {
    id: "total_corners_range_mcq",
    category: "matchMcq",
    template: "How many total corner kicks will the match have?",
    options: () => ["0 - 5", "6 - 9", "10 - 13", "14 or more"],
  },
  {
    id: "first_goal_window_mcq",
    category: "matchMcq",
    template: "When will the first goal of the match be scored?",
    options: () => [
      "1 - 15 min",
      "16 - 30 min",
      "31 - 45 min",
      "46 - 60 min",
      "61 - 75 min",
      "76 - 90+ min",
      "No goal scored",
    ],
  },
  // Team-specific MCQs.
  {
    id: "team_goals_range_mcq",
    category: "teamMcq",
    template: "How many goals will {teamA} score in the match?",
    options: () => ["0", "1", "2", "3 or more"],
  },
  {
    id: "team_shots_range_mcq",
    category: "teamMcq",
    template: "How many shots will {teamA} take in the match?",
    options: () => ["Under 5", "5 - 9", "10 - 14", "15 or more"],
  },
  {
    id: "team_corners_range_mcq",
    category: "teamMcq",
    template: "How many corner kicks will {teamA} win?",
    options: () => ["0 - 2", "3 - 5", "6 - 8", "9 or more"],
  },
];

/** The repository's stable hash, so a fixture's quiz is fixed but varied. */
export function quizSeed(value: string): number {
  let hash = 17;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return hash;
}

function toQuestion(
  entry: BankQuestion,
  home: string,
  away: string,
): QuizQuestion {
  const text = entry.template
    .replaceAll("{teamA}", home)
    .replaceAll("{teamB}", away);
  return {
    id: entry.id,
    text,
    options: entry.options(home, away),
    type: "multipleChoice",
    reward: rewardByCategory[entry.category],
    backgroundAsset: questionBackground(entry.id),
  };
}

/** Deterministically pick one entry of `category` from the bank. */
function pick(
  seed: number,
  salt: number,
  category: BankCategory,
): BankQuestion {
  const pool = bank.filter((entry) => entry.category === category);
  return pool[(seed + salt) % pool.length];
}

export function buildFootballQuiz(
  matchId: string,
  home: string,
  away: string,
): Pick<PredictionQuiz, "matchId" | "questions"> {
  const seed = quizSeed(matchId);
  const matchCategory: BankCategory = seed % 2 === 0 ? "matchMcq" : "matchBool";
  const teamCategory: BankCategory = seed % 2 === 0 ? "teamBool" : "teamMcq";
  return {
    matchId,
    questions: [
      {
        id: "exact_score",
        text: "Predict the full-time score",
        options: [],
        type: "exactScore",
        reward: 125,
        backgroundAsset: questionBackground("exact_score"),
      },
      toQuestion(matchResult, home, away),
      toQuestion(pick(seed, 1, matchCategory), home, away),
      toQuestion(pick(seed, 2, teamCategory), home, away),
    ],
  };
}
```

#### `src/mocks/matches/quizzes/index.ts`

**Adapted.** StatOz builds and settles quizzes for five sports here. This keeps the football builder and the football settlement.

```ts
import type { SportMatch } from "@/domain/matches";
import {
  ScoreAnswer,
  quizMaxReward,
  scorelineContestPrizes,
  scorelineQuizEntryFee,
  type MatchPredictionLeaderboardEntry,
  type PredictionQuiz,
  type QuizQuestion,
} from "@/domain/predictions";

import { matchDetailRivals } from "../detail-rivals";
import {
  buildFootballQuiz,
  questionBackground,
  quizSeed,
} from "./football-bank";

/**
 * The prediction quiz sets behind every fixture's PREDICT tab.
 *
 * The app authors one quiz per fixture in its mock repository, with the
 * finished fixtures carrying real settled answers so the reveal cinematic has
 * something to reveal. This does the same, except that a finished fixture's
 * answers are read out of the fixture itself wherever the scoreline decides
 * them — the mock never has to restate a result it already holds. Anything the
 * fixture cannot decide (corners, cards, the toss) is marked void, which is the
 * app's own escape hatch: it counts as settled so the quiz can be revealed, but
 * scores nothing either way.
 */

/* ---- Quiz sets ------------------------------------------------------------- */

function withMeta(
  base: Pick<PredictionQuiz, "matchId" | "questions">,
  meta: { id?: string; title: string; subtitle: string; entryFee?: number },
): PredictionQuiz {
  const entryFee = meta.entryFee ?? 0;
  const quiz: PredictionQuiz = {
    id: meta.id ?? "main",
    matchId: base.matchId,
    title: meta.title,
    subtitle: meta.subtitle,
    questions: base.questions,
    entryFee,
  };
  return {
    ...quiz,
    prizeLabel:
      entryFee > 0
        ? `${scorelineContestPrizes.join(" / ")} Oz prize pool`
        : `${quizMaxReward(quiz)} XP available`,
  };
}

function mcq(
  id: string,
  text: string,
  options: string[],
  reward: number,
): QuizQuestion {
  return {
    id,
    text,
    options,
    type: "multipleChoice",
    reward,
    backgroundAsset: questionBackground(id),
  };
}

function footballQuizzes(match: SportMatch): PredictionQuiz[] {
  const home = match.home.name;
  const away = match.away.name;
  return [
    withMeta(buildFootballQuiz(match.id, home, away), {
      title: "Scoreline Quiz",
      subtitle: "Final score and scoring market",
      entryFee: scorelineQuizEntryFee,
    }),
    withMeta(
      {
        matchId: match.id,
        questions: [
          mcq("q1", `Who wins ${home} vs ${away}?`, [home, "Draw", away], 90),
          mcq("q2", "Which team scores first?", [home, away, "No goal"], 80),
          mcq("q3", "Will a red card be shown?", ["Yes", "No"], 60),
        ],
      },
      {
        id: "events",
        title: "Match Events Quiz",
        subtitle: "Winner, first goal, and discipline",
      },
    ),
  ];
}

/** The quiz sets for one fixture, with a finished fixture's answers filled in. */
export function quizzesForMatch(match: SportMatch): PredictionQuiz[] {
  const quizzes = footballQuizzes(match);
  if (match.status !== "finished") return quizzes;
  return quizzes.map((quiz) => ({
    ...quiz,
    questions: quiz.questions.map((question) =>
      settleQuestion(question, quiz.id, match),
    ),
  }));
}

/* ---- Settlement ------------------------------------------------------------ */

type Scoreline = { home: number; away: number };

/** Football and basketball fixtures carry plain numbers. */
function numericScore(match: SportMatch): Scoreline | null {
  const home = Number(match.homeScore);
  const away = Number(match.awayScore);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function bucket(value: number, bounds: number[]): number {
  for (let index = 0; index < bounds.length; index += 1) {
    if (value <= bounds[index]) return index;
  }
  return bounds.length;
}

/** True/False questions answer 0 for True. */
function truth(value: boolean): number {
  return value ? 0 : 1;
}

function voided(question: QuizQuestion): QuizQuestion {
  return { ...question, forcedVoid: true };
}

function settled(question: QuizQuestion, optionIndex: number): QuizQuestion {
  return { ...question, settledOptionIndex: optionIndex };
}

function settleQuestion(
  question: QuizQuestion,
  quizId: string,
  match: SportMatch,
): QuizQuestion {
  const answer = resolve(question, quizId, match);
  if (answer == null) return voided(question);
  if (question.type === "exactScore") {
    const { home, away } = ScoreAnswer.decode(answer);
    return { ...question, settledHomeScore: home, settledAwayScore: away };
  }
  return settled(question, answer);
}

function resolve(
  question: QuizQuestion,
  quizId: string,
  match: SportMatch,
): number | null {
  return resolveFootball(question, quizId, match);
}

function resolveFootball(
  question: QuizQuestion,
  quizId: string,
  match: SportMatch,
): number | null {
  const score = numericScore(match);
  if (!score) return null;
  const total = score.home + score.away;

  if (quizId === "events") {
    // Winner, then the two event calls the fixture cannot decide on its own.
    if (question.id === "q1") {
      return score.home > score.away ? 0 : score.home < score.away ? 2 : 1;
    }
    return null;
  }

  switch (question.id) {
    case "exact_score":
      return ScoreAnswer.encode(score.home, score.away);
    case "match_result_mcq":
      return score.home > score.away ? 0 : score.home < score.away ? 1 : 2;
    case "match_three_or_more_goals":
      return truth(total >= 3);
    case "match_ends_in_draw":
      return truth(score.home === score.away);
    case "both_teams_to_score":
      return truth(score.home > 0 && score.away > 0);
    case "total_goals_range_mcq":
      return bucket(total, [1, 3, 5]);
    case "team_goals_range_mcq":
      return bucket(score.home, [0, 1, 2]);
    case "team_wins_match":
      return truth(score.home > score.away);
    case "team_clean_sheet":
      return truth(score.away === 0);
    case "team_scores_two_plus":
      return truth(score.away >= 2);
    default:
      return null;
  }
}

/* ---- The board ------------------------------------------------------------- */

/**
 * The rivals a match board fields, rotated by the fixture so each match and
 * quiz draws a different lineup from the shared roster.
 *
 * The app's roster carries the player as a permanent seed at index 0, which the
 * cubit then overwrites with their real result. The web has a real profile
 * instead, so this returns the rivals alone and the store splices the player in
 * once their card is settled — but the points curve is the app's, untouched,
 * because the Scoreline contest ranks the player against these numbers for
 * real coin prizes.
 */
export function matchBoardRivals(
  matchId: string,
  quizId: string,
): MatchPredictionLeaderboardEntry[] {
  const seed = quizSeed(`${matchId}:${quizId}`);
  return Array.from({ length: 6 }, (_, index) => {
    const rival =
      matchDetailRivals[(seed + index * 5) % matchDetailRivals.length];
    // Index 0 is the player's slot in the app's field, so a rival at position
    // `index` here sits at `index + 1` on that curve.
    const slot = index + 1;
    return {
      rank: slot,
      name: rival.name,
      points: 620 - slot * 47 + ((seed + slot * 13) % 31),
      correct: 5 - (slot % 3),
      movement: rival.movement,
      badge: "badge" in rival ? rival.badge : undefined,
      isUser: false,
      isNew: "isNew" in rival ? rival.isNew === true : false,
    };
  });
}
```

#### `src/mocks/matches/detail-rivals.ts`

**Unchanged.**

```ts
/** Stable leaderboard identities used to derive the match-detail demo boards. */
export const matchDetailRivals = [
  { name: "jarvis", movement: -1, badge: "PRO" },
  { name: "Vortex", movement: 2 },
  { name: "NeoStrike", movement: -1, badge: "PRO" },
  { name: "PhantomX", movement: 1 },
  { name: "Blaze", movement: 4 },
  { name: "Titan", movement: -2 },
  { name: "EchoZero", movement: 1, badge: "PRO" },
  { name: "Reaper", movement: -3 },
  { name: "NovaQ", movement: 2 },
  { name: "Falcon9", movement: -1 },
  { name: "Striker", movement: 5, isNew: true },
  { name: "Diwakar", movement: -2 },
  { name: "monika", movement: 1, badge: "PRO" },
  { name: "Raja2000", movement: -1 },
  { name: "Invincible51", movement: 4 },
  { name: "rocky", movement: -2 },
  { name: "Mirage", movement: 1 },
  { name: "Zenith", movement: -1, isNew: true },
  { name: "Ghost", movement: 2 },
  { name: "Drift", movement: -3 },
  { name: "Volt", movement: 1 },
  { name: "Comet", movement: -1 },
  { name: "Rookie7", movement: 0, isNew: true },
] as const;
```

### The discussion thread

`circle.ts` writes the three posts every thread opens with. The page only counts them.

#### `src/mocks/matches/circle.ts`

**Unchanged.**

```ts
import {
  matchCircleThreadKey,
  type MatchCircleAuthor,
  type MatchCirclePost,
  type MatchCircleThread,
  type SportMatch,
} from "@/domain/matches";

import { matchDemoAnchor } from "./catalog";

/**
 * The conversation a fixture opens with.
 *
 * Three regulars start every thread — an opening question, one reply to it and
 * a second question — worded for the sport and for where the fixture is in its
 * life, so a thread reads as being about this match rather than about matches.
 */

const priyanshu: MatchCircleAuthor = {
  id: "seed:priyanshu",
  displayName: "Priyanshu",
  avatarId: "raphinha",
};
const jasper: MatchCircleAuthor = {
  id: "seed:jasper",
  displayName: "Jasper",
  avatarId: "rodri",
};
const maya: MatchCircleAuthor = {
  id: "seed:maya",
  displayName: "Maya",
  avatarId: "camavinga",
};

type SeedCopy = { primary: string; reply: string; secondary: string };

function seedCopy(match: SportMatch): SeedCopy {
  const contest = `${match.home.name} vs ${match.away.name}`;
  const upcoming = match.status === "scheduled";
  const live = match.status === "live";

  switch (match.sport) {
    case "cricket":
      if (upcoming) {
        return {
          primary: `What is a winning total for ${contest}?`,
          reply: "The powerplay matchup will be huge.",
          secondary: "Who takes the first wicket?",
        };
      }
      if (live) {
        return {
          primary: "This spell could decide the match.",
          reply: "One big over swings the pressure.",
          secondary: "How would you play the next five overs?",
        };
      }
      return {
        primary: `What was the key moment in ${contest}?`,
        reply: "The middle overs made the difference.",
        secondary: "Who gets your player of the match vote?",
      };

    case "basketball":
      if (upcoming) {
        return {
          primary: `Who sets the pace in ${contest}?`,
          reply: "The bench minutes could decide it.",
          secondary: "Drop your final score prediction.",
        };
      }
      if (live) {
        return {
          primary: "This run has changed the energy.",
          reply: "The next timeout is important.",
          secondary: "Who should take the next big shot?",
        };
      }
      return {
        primary: `What decided ${contest} tonight?`,
        reply: "The fourth-quarter execution stood out.",
        secondary: "Who was your MVP?",
      };

    case "tennis":
      if (upcoming) {
        return {
          primary: `How many sets for ${contest}?`,
          reply: "The first-serve numbers will tell the story.",
          secondary: "Which matchup is the biggest factor?",
        };
      }
      if (live) {
        return {
          primary: "Momentum is moving quickly in this set.",
          reply: "The next service game feels massive.",
          secondary: "What adjustment would you make now?",
        };
      }
      return {
        primary: "What was the turning point in this match?",
        reply: "The return game made the difference.",
        secondary: "Best rally of the match?",
      };

    case "motorsport":
      if (upcoming) {
        return {
          primary: `Who takes pole at ${match.home.name}?`,
          reply: "Race pace could look very different from qualifying.",
          secondary: "Give us your podium prediction.",
        };
      }
      if (live) {
        return {
          primary: "Race strategy is getting interesting now.",
          reply: "The next pit window could decide it.",
          secondary: "Who makes the next move through the field?",
        };
      }
      return {
        primary: `How do you rate the ${match.home.name} weekend?`,
        reply: "Strategy made all the difference.",
        secondary: "Who is your driver of the day?",
      };

    default:
      if (upcoming) {
        return {
          primary: `Score predictions for ${contest}?`,
          reply: "I think one goal decides it.",
          secondary: "Which midfield wins the first 20 minutes?",
        };
      }
      if (live) {
        return {
          primary: "This match is wide open right now.",
          reply: "The next goal changes everything.",
          secondary: "Who has impressed you most so far?",
        };
      }
      return {
        primary: `That ${contest} result will be talked about.`,
        reply: "The turning point was clear to me.",
        secondary: "Who was your player of the match?",
      };
  }
}

const hour = 3_600_000;

/** The thread a fixture starts with, before anyone here has said anything. */
export function seedMatchCircleThread(match: SportMatch): MatchCircleThread {
  const key = matchCircleThreadKey(match);
  const seededAt = Date.parse(matchDemoAnchor);
  const copy = seedCopy(match);
  const at = (hoursAgo: number) =>
    new Date(seededAt - hoursAgo * hour).toISOString();
  const primaryId = `${key}:seed:1`;

  const posts: MatchCirclePost[] = [
    {
      id: primaryId,
      threadKey: key,
      author: priyanshu,
      text: copy.primary,
      createdAt: at(7),
      likes: 3,
      likedBy: [],
      isDeleted: false,
    },
    {
      id: `${key}:seed:2`,
      threadKey: key,
      parentId: primaryId,
      author: jasper,
      text: copy.reply,
      createdAt: at(6),
      likes: 1,
      likedBy: [],
      isDeleted: false,
    },
    {
      id: `${key}:seed:3`,
      threadKey: key,
      author: maya,
      text: copy.secondary,
      createdAt: at(4),
      likes: 2,
      likedBy: [],
      isDeleted: false,
    },
  ];

  const seeded = new Date(seededAt).toISOString();
  return {
    key,
    sport: match.sport,
    leagueId: match.leagueId,
    matchId: match.id,
    posts,
    seededAt: seeded,
    updatedAt: seeded,
  };
}
```

#### `src/mocks/matches/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./catalog";
export * from "./details";
export * from "./quizzes";
export { seedMatchCircleThread } from "./circle";
```

## Step 6: stand-ins for the wallet, streak and player

Each file here takes the place of a StatOz feature that keeps its data in the browser. Replace them with the project's own.

**The wallet** returns a fixed balance of 1,000, which is what StatOz gives a new wallet. Nothing on this page spends coins.

#### `src/features/economy/index.ts`

**New.** Stands in for StatOz's economy feature. The page only reads the coin balance.

```ts
/**
 * Wallet adapter. Stands in for StatOz's economy store with the one hook this
 * page reads. Return the player's real balance from here.
 */
export type EconomySnapshot = {
  coins: number;
};

/** 1,000 is the balance StatOz opens a new wallet with. */
const demo: EconomySnapshot = { coins: 1000 };

export function useEconomy(): EconomySnapshot {
  return demo;
}
```

**The streak** reports six active days ending yesterday, which is what StatOz seeds for a new player. It reports nothing on the server, so the top bar shows a dash until the page has loaded.

#### `src/features/streaks/index.ts`

**New.** Stands in for StatOz's streak feature, with the three exports the top bar reads.

```ts
"use client";

import { useSyncExternalStore } from "react";

/**
 * Streak adapter. Stands in for StatOz's streak store with the three exports
 * the top bar reads. The date helpers, `currentStreak` and
 * `useIsStreakHydrated` are StatOz's own code; the snapshot below is a demo.
 */
export type StreakCategory =
  | "overall"
  | "predict"
  | "pick"
  | "games"
  | "pitchDuel"
  | "penaltyShootout";

export type StreakSnapshot = {
  /** The local calendar days with activity, as `YYYY-MM-DD` keys. */
  activeDays: Record<StreakCategory, string[]>;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function emptyDays(): Record<StreakCategory, string[]> {
  return {
    overall: [],
    predict: [],
    pick: [],
    games: [],
    pitchDuel: [],
    penaltyShootout: [],
  };
}

/**
 * What the server renders. It is empty on purpose: a streak depends on the
 * player's own clock, so the server cannot know it.
 */
const serverSnapshot: StreakSnapshot = Object.freeze({
  activeDays: Object.freeze(emptyDays()) as Record<StreakCategory, string[]>,
});

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function localDateFromKey(key: string): Date | null {
  if (!datePattern.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return localDateKey(date) === key ? date : null;
}

export function addLocalCalendarDays(date: Date, amount: number): Date {
  const next = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
  );
  next.setDate(next.getDate() + amount);
  return next;
}

let clientSnapshot: StreakSnapshot | null = null;

/**
 * The browser's snapshot, built once and then reused so React sees a stable
 * value. This demo seeds six days in a row ending yesterday, as StatOz does
 * for a new player. Replace it with the player's real activity days.
 */
function getSnapshot(): StreakSnapshot {
  if (!clientSnapshot) {
    const activeDays = emptyDays();
    activeDays.overall = [6, 5, 4, 3, 2, 1].map((days) =>
      localDateKey(addLocalCalendarDays(new Date(), -days)),
    );
    clientSnapshot = { activeDays };
  }
  return clientSnapshot;
}

/** Nothing changes the demo snapshot, so there is nothing to subscribe to. */
function subscribe(): () => void {
  return () => {};
}

export function useStreakSnapshot(): StreakSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export function useIsStreakHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function currentStreak(
  snapshot: StreakSnapshot,
  category: StreakCategory,
  now = new Date(),
): number {
  const days = new Set(snapshot.activeDays[category]);
  const today = localDateKey(now);
  const yesterday = localDateKey(addLocalCalendarDays(now, -1));
  const anchor = days.has(today)
    ? today
    : days.has(yesterday)
      ? yesterday
      : null;
  if (!anchor) return 0;
  let count = 0;
  let cursor = localDateFromKey(anchor);
  while (cursor && days.has(localDateKey(cursor))) {
    count += 1;
    cursor = addLocalCalendarDays(cursor, -1);
  }
  return count;
}
```

**The player** is a fixed `PLAYER ONE` with one portrait. **The rival card** is a placeholder for StatOz's rival profile, which depends on its cards, friends and achievements features.

#### `src/features/profile/components/rival-dossier.tsx`

**New.** A placeholder for StatOz's rival dossier, which belongs to the profile feature. It shows the rival's name, rank and points.

```tsx
"use client";

import { useEffect } from "react";

export type RivalDossierOverlayProps = {
  name: string;
  /** The rival's place on the board that opened this. */
  rank: number;
  /** Their points on that board. */
  xp: number;
  pro?: boolean;
  /**
   * Your own place on that same board. When you are not on the board yet, the
   * tab passes the rival's rank here instead, so this placeholder ignores it.
   */
  userRank: number;
  onClose: () => void;
};

/**
 * Placeholder for StatOz's rival dossier, the profile card that opens when a
 * player taps a rival on a leaderboard. It shows the rival's name, rank and
 * points and nothing else. Replace it with the project's own profile overlay.
 */
export function RivalDossierOverlay({
  name,
  rank,
  xp,
  pro = false,
  onClose,
}: RivalDossierOverlayProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name}, rival summary`}
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      style={{ background: "var(--ds-color-overlay-scrim)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-line bg-surface-elevated p-5 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-2xs font-black tracking-ultra text-muted">
          {pro ? "PRO RIVAL" : "RIVAL"}
        </p>
        <h2 className="mt-2 truncate font-display text-lg font-black">
          {name}
        </h2>
        <p className="ds-tabular mt-2 font-display text-2xs font-extrabold tracking-wide text-muted">
          RANK #{rank} · {xp} PTS
        </p>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-5 min-h-11 bg-accent px-6 font-display text-2xs font-black tracking-ultra text-inverse"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
```

#### `src/features/profile/index.ts`

**New.** Stands in for StatOz's profile feature. These are the two things the TOPS tab takes from it.

```ts
export { usePlayerStanding } from "./state/player-standing";

export { RivalDossierOverlay } from "./components/rival-dossier";
```

#### `src/features/profile/state/player-standing.ts`

**New.** Stands in for StatOz's player record. It returns one fixed player.

```ts
import { publicAsset } from "@/shared/config";

/**
 * Who the player is on a leaderboard. This stand-in returns a fixed player;
 * StatOz builds the same shape from the player's saved profile and XP.
 */
export type PlayerStanding = {
  displayName: string;
  /** Resolved portrait path. */
  avatarSrc: string;
  totalXp: number;
  level: number;
  /**
   * False until the browser's own record has been read. A board must not rank
   * the player before it knows their XP.
   */
  ready: boolean;
  frameColor?: string;
};

/** The name every board shows for the player. */
export const playerDisplayName = "PLAYER ONE";

const demo: PlayerStanding = {
  displayName: playerDisplayName,
  avatarSrc: publicAsset("/assets/avatars/adams.webp"),
  totalXp: 0,
  level: 1,
  ready: true,
};

export function usePlayerStanding(): PlayerStanding {
  return demo;
}
```

**Portraits by name.** These are StatOz's own files, trimmed. `avatarForName` picks one of six portraits from a rival's name, so the same rival always has the same face. The portraits are copied in step 14.

#### `src/features/onboarding/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { avatarForName } from "@/mocks/onboarding";
```

#### `src/features/onboarding/types.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export type AvatarOption = {
  id: string;
  label: string;
  /** Portrait served from `public/assets/avatars`. */
  src: string;
};
```

#### `src/mocks/onboarding/avatars.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import { seedHash } from "@/shared/utils";

import type { AvatarOption } from "@/features/onboarding/types";

/** The faces a new player picks their dossier portrait from. */
export const avatarOptions: AvatarOption[] = [
  { id: "adams", label: "Adams", src: "/assets/avatars/adams.webp" },
  {
    id: "bellingham",
    label: "Bellingham",
    src: "/assets/avatars/bellingham.webp",
  },
  { id: "raphinha", label: "Raphinha", src: "/assets/avatars/raphinha.webp" },
  {
    id: "camavinga",
    label: "Camavinga",
    src: "/assets/avatars/camavinga.webp",
  },
  { id: "ndiaye", label: "Ndiaye", src: "/assets/avatars/ndiaye.webp" },
  { id: "rodri", label: "Rodri", src: "/assets/avatars/rodri.webp" },
];

/**
 * The face a display name always wears. Rivals are fabricated, so their
 * portrait is expanded from the only seed they have — the same name maps to the
 * same face on a leaderboard row, on the podium and in their dossier.
 */
export function avatarForName(name: string): AvatarOption {
  return avatarOptions[seedHash(name) % avatarOptions.length];
}
```

#### `src/mocks/onboarding/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export * from "./avatars";
```

## Step 7: the session and the account prompt

`auth-session.ts` is a stand-in. It reports `hydrating` on the server and on the browser's first render, then a fixed session. **As shipped that session is a guest**, which is what a new visitor to StatOz is. Change `visitor` to `"authenticated"` to see the page as a logged-in player does: the rail reads PROFILE and the quiz cards go to the quiz page.

To connect real auth, make `useAuthSession` return the project's own session in the same shape. Nothing else in this step needs to change.

#### `src/features/auth/types.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export type AuthStatus = "hydrating" | "guest" | "authenticated";

export type AuthSessionSnapshot = {
  status: AuthStatus;
  isAuthenticated: boolean;
  /** Normalized local-demo account identity, unavailable while signed out. */
  email: string | null;
  /** True until this email has completed the profile setup flow. */
  needsOnboarding: boolean;
};

export type AuthGateRequest = {
  intent: string;
  message?: string;
  /** Navigation target after login; mutations should omit this and be retried. */
  returnTo?: string;
};
```

#### `src/features/auth/state/auth-session.ts`

**New.** Stands in for StatOz's session store. It reports `hydrating` first and then a fixed session, a guest as shipped.

```ts
"use client";

import { useSyncExternalStore } from "react";

import type { AuthSessionSnapshot, AuthStatus } from "../types";

/**
 * Session adapter. Stands in for StatOz's session store, which keeps a demo
 * account in local storage. Wire `useAuthSession` to the host project's auth.
 *
 * As shipped, every visitor is a guest. That is what StatOz shows before
 * anyone logs in: the navigation reads LOG IN, and a quiz card opens the
 * account prompt. Set `visitor` to "authenticated" to see the page as a
 * logged-in player does.
 */
const snapshots: Record<AuthStatus, AuthSessionSnapshot> = {
  hydrating: Object.freeze({
    status: "hydrating",
    isAuthenticated: false,
    email: null,
    needsOnboarding: false,
  }),
  guest: Object.freeze({
    status: "guest",
    isAuthenticated: false,
    email: null,
    needsOnboarding: false,
  }),
  authenticated: Object.freeze({
    status: "authenticated",
    isAuthenticated: true,
    email: "player@example.com",
    needsOnboarding: false,
  }),
};

/** The session the browser reports once the page has loaded. */
const visitor: Exclude<AuthStatus, "hydrating"> = "guest";

function subscribe(): () => void {
  return () => {};
}

/**
 * The server, and the browser's first render, report `hydrating`: a session
 * lives in the browser, so neither of those can know it yet.
 */
export function useAuthSession(): AuthSessionSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshots[visitor],
    () => snapshots.hydrating,
  );
}
```

The rest is StatOz's own code. `AuthProvider` wraps the app and supplies `useRequireAuth`. A control calls `requireAuth({ intent, message })` before an action that needs an account. It returns `true` for a logged-in player. For a guest it opens the dialog and returns `false`. While the session is still `hydrating` it returns `false` and does nothing.

#### `src/features/auth/return-path.ts`

**Unchanged.**

```ts
/** Only app-internal paths may be resumed after the local demo login. */
export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, "https://statoz.local");
    if (url.origin !== "https://statoz.local") return "/";
    if (url.pathname === "/login" || url.pathname.startsWith("/login/"))
      return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function loginHref(returnTo: string | null | undefined): string {
  return `/login?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`;
}
```

#### `src/features/auth/components/auth-gate-dialog.tsx`

**Unchanged.**

```tsx
"use client";

import { useEffect, useId, useRef } from "react";

import { Button, LockIcon, accentVar } from "@/design-system";

import type { AuthGateRequest } from "../types";

export type AuthGateDialogProps = {
  request: AuthGateRequest;
  onCancel: () => void;
  onContinue: () => void;
};

const focusable =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AuthGateDialog({
  request,
  onCancel,
  onContinue,
}: AuthGateDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>(focusable)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const controls = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusable),
      );
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[var(--ds-color-overlay-scrim)] p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-sm border border-cyan bg-surface-elevated p-5 shadow-[var(--ds-shadow-panel)] [clip-path:var(--ds-clip-panel)]"
      >
        <span
          aria-hidden
          className="grid size-11 place-items-center border border-cyan bg-cyan/10 text-cyan"
        >
          <LockIcon size={22} />
        </span>
        <p className="mt-5 font-display text-2xs font-black tracking-ultra text-cyan">
          {"// ACCOUNT REQUIRED"}
        </p>
        <h2
          id={titleId}
          className="mt-2 font-display text-xl font-black tracking-wide"
        >
          LOG IN TO {request.intent.toUpperCase()}
        </h2>
        <p
          id={descriptionId}
          className="mt-3 text-sm leading-relaxed text-muted"
        >
          {request.message ??
            "Log in to unlock this feature and keep your StatOz progress."}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="surface" size="lg" onClick={onCancel}>
            NOT NOW
          </Button>
          <Button
            variant="tonal"
            size="lg"
            onClick={onContinue}
            accent={accentVar("cyan")}
          >
            LOG IN
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### `src/features/auth/components/auth-provider.tsx`

**Unchanged.**

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginHref, sanitizeReturnTo } from "../return-path";
import { useAuthSession } from "../state/auth-session";
import type { AuthGateRequest } from "../types";

import { AuthGateDialog } from "./auth-gate-dialog";

type AuthGateContextValue = {
  requireAuth: (request: AuthGateRequest) => boolean;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthSession();
  const [request, setRequest] = useState<AuthGateRequest | null>(null);

  const requireAuth = useCallback(
    (next: AuthGateRequest): boolean => {
      if (session.status === "authenticated") return true;
      if (session.status === "hydrating") return false;
      setRequest((current) => current ?? next);
      return false;
    },
    [session.status],
  );

  const value = useMemo(() => ({ requireAuth }), [requireAuth]);

  const close = useCallback(() => setRequest(null), []);
  const continueToLogin = useCallback(() => {
    if (!request) return;
    const current = `${pathname}${window.location.search}${window.location.hash}`;
    const returnTo = sanitizeReturnTo(request.returnTo ?? current);
    setRequest(null);
    router.push(loginHref(returnTo));
  }, [pathname, request, router]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      {request ? (
        <AuthGateDialog
          request={request}
          onCancel={close}
          onContinue={continueToLogin}
        />
      ) : null}
    </AuthGateContext.Provider>
  );
}

export function useRequireAuth() {
  const context = useContext(AuthGateContext);
  if (!context)
    throw new Error("useRequireAuth must be used inside AuthProvider");
  return context.requireAuth;
}
```

#### `src/features/auth/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { AuthProvider, useRequireAuth } from "./components/auth-provider";
export { useAuthSession } from "./state/auth-session";
```

## Step 8: the app shell

### Navigation, top bar and breadcrumbs

`PlatformNav` decides which destination is active from the URL. No destination's address matches `/matches/...`, so it falls back to SPORTS. `PlatformTopBar` picks its title from the URL in the same way and reads the streak and the wallet. `PlatformBreadcrumbs` maps every StatOz route to a trail; the `matches` case is the one this page uses.

#### `src/features/shell/components/platform-breadcrumbs.tsx`

**Unchanged.**

```tsx
"use client";

import { usePathname } from "next/navigation";

import { Breadcrumbs, type BreadcrumbItem } from "@/design-system";

const HOME: BreadcrumbItem = { label: "HOME", href: "/" };

const segmentLabels: Record<string, string> = {
  basketball: "BASKETBALL",
  bug: "BUG REPORT",
  cricket: "CRICKET",
  feature: "FEATURE REQUEST",
  feedback: "FEEDBACK",
  football: "FOOTBALL",
  "football-bingo": "BINGO GRID",
  "football-chess": "FOOTBALL CHESS",
  "hoop-duel": "HOOP DUEL",
  mismatch: "DATA MISMATCH",
  motorsport: "MOTORSPORT",
  "penalty-shootout": "PENALTY SHOOTOUT",
  pick: "PICK",
  "pitch-duel": "PITCH DUEL",
  predict: "PREDICT",
  shoutout: "SHOUTOUT",
  tennis: "TENNIS",
};

function labelFor(segment: string): string {
  if (segmentLabels[segment]) return segmentLabels[segment];

  try {
    return decodeURIComponent(segment).replaceAll("-", " ").toUpperCase();
  } catch {
    return segment.replaceAll("-", " ").toUpperCase();
  }
}

/** Maps every platform route to the user-facing hierarchy shown below the top bar. */
export function breadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const [section, detail, leaf, item] = pathname.split("/").filter(Boolean);
  if (!section) return [];

  switch (section) {
    case "cards":
      return [
        HOME,
        { label: "PROFILE", href: "/profile" },
        { label: "ALL CARDS" },
      ];
    case "decks":
      return detail
        ? [
            HOME,
            { label: "DECK LOCKER", href: "/decks" },
            { label: `${labelFor(detail)} LOADOUT` },
          ]
        : [HOME, { label: "DECK LOCKER" }];
    case "friends":
      return detail === "referrals"
        ? [
            HOME,
            { label: "FRIENDS", href: "/friends" },
            { label: "REFER A FRIEND" },
          ]
        : [HOME, { label: "PROFILE", href: "/profile" }, { label: "FRIENDS" }];
    case "games":
      return [HOME, { label: `${labelFor(detail ?? "games")} GAMES` }];
    case "how-to-play":
      return detail
        ? [
            HOME,
            { label: "HOW TO PLAY", href: "/how-to-play" },
            { label: labelFor(detail) },
          ]
        : [HOME, { label: "HOW TO PLAY" }];
    case "leaderboard":
      return [HOME, { label: "LEADERBOARD" }];
    case "leagues":
      return leaf === "teams" && item
        ? [
            HOME,
            {
              label: `${labelFor(detail ?? "league")} HUB`,
              href: `/leagues/${detail}`,
            },
            { label: `${labelFor(item)} DETAILS` },
          ]
        : [HOME, { label: `${labelFor(detail ?? "league")} HUB` }];
    case "matches":
      if (detail === "search") return [HOME, { label: "MATCH SEARCH" }];
      if (leaf === "circle") {
        return [
          HOME,
          { label: "MATCH DETAILS", href: `/matches/${detail}` },
          { label: "MATCH CIRCLE" },
        ];
      }
      return [HOME, { label: "MATCH DETAILS" }];
    case "picks":
      return detail
        ? [
            HOME,
            { label: "PICKS", href: "/picks" },
            { label: "MARKET DETAILS" },
          ]
        : [HOME, { label: "PICKS" }];
    case "profile":
      if (detail === "history" && leaf) {
        return [
          HOME,
          { label: "PROFILE", href: "/profile" },
          { label: "HISTORY", href: "/profile/history" },
          { label: `${labelFor(leaf)} RESULTS` },
        ];
      }
      if (detail === "talk-to-statoz" && leaf) {
        return [
          HOME,
          { label: "PROFILE", href: "/profile" },
          { label: "TALK TO STATOZ", href: "/profile/talk-to-statoz" },
          { label: labelFor(leaf) },
        ];
      }
      if (detail === "talk-to-statoz") {
        return [
          HOME,
          { label: "PROFILE", href: "/profile" },
          { label: "TALK TO STATOZ" },
        ];
      }
      if (detail === "xp") {
        return [
          HOME,
          { label: "PROFILE", href: "/profile" },
          { label: "XP PROGRESS" },
        ];
      }
      return [HOME, { label: "PROFILE" }];
    case "shop":
      return [HOME, { label: "SHOP" }];
    default:
      return [HOME, { label: labelFor(leaf ?? detail ?? section) }];
  }
}

/** Desktop-only route context. Fullscreen and onboarding routes use other shells. */
export function PlatformBreadcrumbs() {
  const items = breadcrumbsForPath(usePathname());
  if (items.length === 0) return null;

  return (
    <Breadcrumbs
      items={items}
      className="hidden border-b border-line-subtle bg-surface/80 lg:block"
    />
  );
}
```

#### `src/features/shell/components/platform-nav.tsx`

**Unchanged.**

```tsx
"use client";

import { usePathname } from "next/navigation";

import {
  accentVar,
  FootballIcon,
  LockIcon,
  NavRail,
  ProfileIcon,
  ShopIcon,
  TrophyIcon,
  type NavRailItem,
} from "@/design-system";
import { useAuthSession, useRequireAuth } from "@/features/auth";
import { navDestinations, type NavDestinationId } from "@/shared/config";

export type PlatformNavProps = {
  /** Overrides the destination derived from the URL. */
  activeId?: NavDestinationId;
  orientation?: "bar" | "rail";
  className?: string;
};

const icons: Record<NavDestinationId, React.ReactNode> = {
  sports: <FootballIcon size={20} />,
  shop: <ShopIcon size={20} />,
  leaderboard: <TrophyIcon size={20} />,
  profile: <ProfileIcon size={20} />,
};

/** Platform destinations share one violet accent so no single tab dominates. */
const NAV_ACCENT = accentVar("violet");

/**
 * Which destination the current URL belongs to.
 *
 * Longest matching href wins, so `/profile/history` still lights PROFILE, and
 * the root href is only ever an exact match — otherwise it would claim every
 * page in the app.
 */
function destinationForPath(pathname: string): NavDestinationId {
  let best: NavDestinationId = "sports";
  let bestLength = 0;

  for (const destination of navDestinations) {
    if (destination.href === "/") continue;
    const matches =
      pathname === destination.href ||
      pathname.startsWith(`${destination.href}/`);
    if (matches && destination.href.length > bestLength) {
      best = destination.id;
      bestLength = destination.href.length;
    }
  }

  return best;
}

/** The platform's primary navigation, in either presentation. */
export function PlatformNav({
  activeId,
  orientation = "bar",
  className,
}: PlatformNavProps) {
  const pathname = usePathname();
  const session = useAuthSession();
  const requireAuth = useRequireAuth();
  const active = activeId ?? destinationForPath(pathname);

  const items: NavRailItem[] = navDestinations.map((destination) => {
    const base = {
      id: destination.id,
      label:
        destination.id === "profile" && session.status === "guest"
          ? "LOG IN"
          : destination.label,
      icon:
        destination.id === "profile" && session.status === "guest" ? (
          <LockIcon size={20} />
        ) : (
          icons[destination.id]
        ),
      accent: NAV_ACCENT,
    };

    if (destination.id === "profile" && session.status !== "authenticated") {
      return {
        ...base,
        onSelect: () =>
          requireAuth({
            intent: "view your profile",
            message:
              "Log in to see your profile, history, achievements, and loadouts.",
            returnTo: "/profile",
          }),
      };
    }

    return { ...base, href: destination.href };
  });

  return (
    <NavRail
      label="Primary"
      items={items}
      activeId={active}
      orientation={orientation}
      className={className}
    />
  );
}
```

#### `src/features/shell/components/platform-top-bar.tsx`

**Unchanged.**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { accentVar, BrandIcon, FlameIcon, PlusIcon } from "@/design-system";
import { useEconomy } from "@/features/economy";
import {
  currentStreak,
  useIsStreakHydrated,
  useStreakSnapshot,
} from "@/features/streaks";
import { formatInt } from "@/shared/utils";

export type PlatformTopBarProps = {
  title?: string;
  coins?: number;
  /** Accent for the wordmark glow and the add-coins button. */
  accent?: string;
};

const GOLD = accentVar("gold");

/** The persistent header: wordmark, streak, and coin balance. */
export function PlatformTopBar({
  title,
  coins,
  accent = accentVar("cyan"),
}: PlatformTopBarProps) {
  const pathname = usePathname();
  const resolvedTitle =
    title ??
    (pathname.startsWith("/shop")
      ? "Shop"
      : pathname === "/decks"
        ? "Deck Locker"
        : pathname.startsWith("/decks/")
          ? "Loadout"
          : "StatOz");
  return (
    <header
      className="flex h-19.5 shrink-0 items-center gap-3 border-b bg-surface-nav px-4 pr-3.5"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 26%, transparent)`,
        boxShadow: "var(--ds-shadow-hard-drop)",
      }}
    >
      <h1
        className="flex-1 truncate font-display text-2xl font-black leading-compact tracking-tight"
        style={{
          textShadow: `0 0 12px color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      >
        {resolvedTitle}
      </h1>

      <AuthenticatedStats coins={coins} accent={accent} />
    </header>
  );
}

function AuthenticatedStats({
  coins,
  accent,
}: {
  coins?: number;
  accent: string;
}) {
  const economy = useEconomy();
  const streakSnapshot = useStreakSnapshot();
  const streakHydrated = useIsStreakHydrated();
  const streak = currentStreak(streakSnapshot, "overall");
  const resolvedCoins = coins ?? economy.coins;

  return (
    <>
      <Link
        href="/streaks"
        className="flex items-center gap-1.5 px-1 py-2"
        aria-label={`Daily streak: ${streak} days`}
      >
        <FlameIcon size={22} style={{ color: GOLD }} />
        <span className="ds-tabular font-display text-sm font-black">
          {streakHydrated ? formatInt(streak) : "—"}
        </span>
      </Link>

      <div className="flex items-center gap-2 pl-2">
        <BrandIcon name="ozCoins" size={18} alt="" />
        <span className="ds-tabular font-display text-sm font-black">
          {formatInt(resolvedCoins)}
        </span>
        <Link
          href="/shop?tab=coins"
          aria-label="Add coins"
          className="grid size-7 place-items-center text-inverse"
          style={{ background: accent }}
        >
          <PlusIcon size={17} />
        </Link>
      </div>
    </>
  );
}
```

#### `src/features/shell/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { PlatformNav } from "./components/platform-nav";
export { PlatformBreadcrumbs } from "./components/platform-breadcrumbs";
export { PlatformTopBar } from "./components/platform-top-bar";
```

### Ad rails

`AdSlot` reserves a space and draws a placeholder in it. The component and its placement list are StatOz's whole files, so they describe formats and placements this page does not use. Only the 160 by 600 artwork is included here; the component also names five other images under `/assets/ads/`, which are needed only if those other placements are used.

To leave the ad rails out, delete the two `AdSlot` columns from the layout in step 14 and skip this section.

#### `src/features/ads/components/ad-slot.module.css`

**Unchanged.**

```css
.slot {
  width: 100%;
  color: var(--ds-color-text-default);
}

.desktopOnly {
  display: none;
}

.frame {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--ds-color-border-strong);
  background: var(--ds-color-background-secondary);
}

.horizontal {
  width: min(100%, 20rem);
  min-height: 6.25rem;
  margin: 0 auto;
}

.rectangle {
  width: min(100%, 18.75rem);
  min-height: 15.625rem;
  margin: 0 auto;
  aspect-ratio: 6 / 5;
}

.skyscraper {
  width: min(100%, 10rem);
  height: 37.5rem;
  margin: 0 auto;
}

.anchor {
  width: min(100%, 20rem);
  height: 3.125rem;
  margin: 0 auto;
}

.image {
  object-fit: cover;
}

.horizontal .image {
  object-position: 72% 56%;
}

.rectangle .image {
  object-position: 70% center;
}

.scrim {
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
}

.campaign .scrim {
  background: linear-gradient(
    90deg,
    rgb(4 8 14 / 96%) 0%,
    rgb(4 8 14 / 78%) 42%,
    rgb(4 8 14 / 5%) 76%
  );
}

.rectangle.campaign .scrim {
  background: linear-gradient(
    135deg,
    rgb(4 8 14 / 96%) 0%,
    rgb(4 8 14 / 69%) 58%,
    rgb(4 8 14 / 4%) 100%
  );
}

.copy {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: var(--ds-space-12);
  display: flex;
  max-width: 54%;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ds-space-4);
  transform: translateY(-50%);
  pointer-events: none;
}

.copyEyebrow,
.copyTitle,
.copyDetail {
  margin: 0;
  font-family: var(--ds-font-display);
  font-weight: 900;
  line-height: var(--ds-leading-compact);
  text-transform: uppercase;
}

.copyEyebrow {
  color: var(--ds-color-text-muted);
  font-size: 0.5rem;
  letter-spacing: var(--ds-tracking-ultra);
}

.copyTitle {
  color: var(--ds-color-text-default);
  font-size: clamp(0.75rem, 2.7vw, 1.25rem);
  letter-spacing: var(--ds-tracking-tight);
}

.copyDetail {
  color: var(--ds-color-accent-lime);
  font-size: 0.5rem;
  letter-spacing: var(--ds-tracking-wide);
}

.rectangle .copy {
  top: var(--ds-space-16);
  max-width: 62%;
  transform: none;
}

.skyscraper .copy {
  top: var(--ds-space-20);
  max-width: calc(100% - 2 * var(--ds-space-24));
  transform: none;
}

.rectangle .copyTitle,
.skyscraper .copyTitle {
  font-size: var(--ds-text-lg);
}

.wireframe {
  display: grid;
  place-items: center;
  border-style: dashed;
  background:
    linear-gradient(
      90deg,
      transparent 49.7%,
      color-mix(in srgb, var(--ds-color-border-strong) 54%, transparent) 50%,
      transparent 50.3%
    ),
    linear-gradient(
      transparent 49.7%,
      color-mix(in srgb, var(--ds-color-border-strong) 54%, transparent) 50%,
      transparent 50.3%
    ),
    var(--ds-color-background-muted);
}

.wireframeImage {
  object-fit: cover;
  opacity: 0.42;
}

.wireframeCopy {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  gap: var(--ds-space-6);
  padding: var(--ds-space-12);
  text-align: center;
}

.wireframeCopy span,
.wireframeCopy strong,
.wireframeCopy small {
  font-family: var(--ds-font-display);
  font-weight: 900;
  line-height: var(--ds-leading-compact);
  text-transform: uppercase;
}

.wireframeCopy span {
  color: var(--ds-color-text-muted);
  font-size: var(--ds-text-2xs);
  letter-spacing: var(--ds-tracking-ultra);
}

.wireframeCopy strong {
  color: var(--ds-color-accent-cyan);
  font-size: var(--ds-text-sm);
  letter-spacing: var(--ds-tracking-wide);
}

.wireframeCopy small {
  color: var(--ds-color-text-subtle);
  font-size: var(--ds-text-2xs);
  letter-spacing: var(--ds-tracking-label);
}

.anchor .wireframeCopy {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ds-space-4) var(--ds-space-8);
  padding: var(--ds-space-6) var(--ds-space-48) var(--ds-space-6)
    var(--ds-space-8);
}

.anchor .wireframeCopy span {
  width: 100%;
  font-size: var(--ds-text-nano);
}

.anchor .wireframeCopy strong,
.anchor .wireframeCopy small {
  font-size: var(--ds-text-2xs);
}

@media (min-width: 48rem) {
  .horizontal {
    width: min(100%, 60.625rem);
    min-height: 5.625rem;
  }

  .anchor {
    width: min(100%, 45.5rem);
    height: 5.625rem;
  }

  .copy {
    left: var(--ds-space-20);
  }

  .copyEyebrow,
  .copyDetail {
    font-size: var(--ds-text-2xs);
  }

  .copyTitle {
    font-size: var(--ds-text-xl);
  }
}

@media (min-width: 64rem) {
  .desktopOnly {
    display: block;
  }
}
```

#### `src/features/ads/components/ad-slot.tsx`

**Unchanged.**

```tsx
import Image from "next/image";

import { adPlacements } from "@/mocks/ads";
import type { AdFormat, AdPlacementId } from "../types";

import styles from "./ad-slot.module.css";

export type AdSlotProps = {
  placement: AdPlacementId;
  className?: string;
};

/**
 * A visible, non-interactive reservation for a future responsive display ad.
 * It deliberately owns no Google script or credential: a real provider can
 * replace this inner creative later without moving the route-level placement.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  const config = adPlacements[placement];
  const frameClass = [
    styles.frame,
    styles[config.format],
    config.creative === "campaign" ? styles.campaign : styles.wireframe,
  ].join(" ");
  const slotClass = [
    styles.slot,
    config.desktopOnly ? styles.desktopOnly : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside
      className={slotClass}
      aria-label="Advertisement"
      data-ad-placement={placement}
    >
      <div className={frameClass} aria-hidden="true">
        {config.creative === "campaign" ? (
          <CampaignCreative format={config.format} />
        ) : (
          <WireframeCreative format={config.format} />
        )}
      </div>
    </aside>
  );
}

function CampaignCreative({ format }: { format: AdFormat }) {
  const src =
    format === "horizontal"
      ? "/assets/ads/velocity-lab-wide.png"
      : "/assets/ads/velocity-lab-rectangle.png";

  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes={imageSizes(format)}
        loading={format === "horizontal" ? "eager" : undefined}
        className={styles.image}
      />
      <span className={styles.scrim} />
      <div className={styles.copy}>
        <p className={styles.copyEyebrow}>Demo creative</p>
        <p className={styles.copyTitle}>Velocity Lab</p>
        <p className={styles.copyDetail}>Move beyond</p>
      </div>
    </>
  );
}

function WireframeCreative({ format }: { format: AdFormat }) {
  const dimensions =
    format === "horizontal"
      ? "320×100 → 970×90"
      : format === "skyscraper"
        ? "160×600"
        : format === "anchor"
          ? "320×50 → 728×90"
          : "300×250";
  const src =
    format === "horizontal"
      ? "/assets/ads/ad-space-horizontal.svg"
      : format === "skyscraper"
        ? "/assets/ads/ad-space-skyscraper.svg"
        : format === "anchor"
          ? "/assets/ads/ad-space-anchor.svg"
          : "/assets/ads/ad-space-rectangle.svg";
  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes={imageSizes(format)}
        loading={
          format === "skyscraper" || format === "anchor" ? "eager" : undefined
        }
        className={styles.wireframeImage}
      />
      <div className={styles.wireframeCopy}>
        <span>Demo ad space</span>
        <strong>Responsive display</strong>
        <small>{dimensions}</small>
      </div>
    </>
  );
}

function imageSizes(format: AdFormat) {
  if (format === "horizontal") {
    return "(max-width: 767px) 320px, (max-width: 1023px) 728px, 970px";
  }

  if (format === "skyscraper") return "160px";
  if (format === "anchor") return "(max-width: 767px) 320px, 728px";
  return "300px";
}
```

#### `src/features/ads/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { AdSlot } from "./components/ad-slot";
```

#### `src/features/ads/types.ts`

**Unchanged.**

```ts
/** Stable identifiers used to name future AdSense slots without coupling UI to credentials. */
export type AdPlacementId =
  | "home-feed"
  | "games-catalog"
  | "profile-dossier"
  | "history-feed"
  | "leaderboard-rail"
  | "platform-left-rail"
  | "platform-right-rail"
  | "game-landing-anchor";

export type AdFormat = "horizontal" | "rectangle" | "skyscraper" | "anchor";

export type AdCreative = "campaign" | "wireframe";

export type AdPlacement = {
  format: AdFormat;
  creative: AdCreative;
  desktopOnly?: boolean;
};
```

#### `src/mocks/ads/index.ts`

**Unchanged.**

```ts
export { adPlacements } from "./placements";
```

#### `src/mocks/ads/placements.ts`

**Unchanged.**

```ts
import type { AdPlacement, AdPlacementId } from "@/features/ads/types";

/**
 * The page owns where an ad is safe to appear; this map owns its presentation.
 * These names intentionally match the slots that can later receive AdSense IDs.
 */
export const adPlacements: Record<AdPlacementId, AdPlacement> = {
  "home-feed": { format: "horizontal", creative: "campaign" },
  "games-catalog": { format: "horizontal", creative: "wireframe" },
  "profile-dossier": { format: "horizontal", creative: "campaign" },
  "history-feed": { format: "horizontal", creative: "wireframe" },
  "leaderboard-rail": {
    format: "rectangle",
    creative: "campaign",
    desktopOnly: true,
  },
  "platform-left-rail": {
    format: "skyscraper",
    creative: "wireframe",
    desktopOnly: true,
  },
  "platform-right-rail": {
    format: "skyscraper",
    creative: "wireframe",
    desktopOnly: true,
  },
  "game-landing-anchor": {
    format: "anchor",
    creative: "wireframe",
  },
};
```

#### `public/assets/ads/ad-space-skyscraper.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 600" role="img" aria-label="Neutral skyscraper ad space wireframe">
  <rect width="160" height="600" fill="#0f1929"/>
  <path d="M0 300H160M80 0V600" stroke="#395068" stroke-dasharray="6 6"/>
  <rect x="1" y="1" width="158" height="598" fill="none" stroke="#718aa3" stroke-dasharray="8 6"/>
  <text x="80" y="280" fill="#9eb2c5" font-family="Arial, sans-serif" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">DEMO AD SPACE</text>
  <text x="80" y="310" fill="#53d8ff" font-family="Arial, sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="2">160×600</text>
</svg>
```

## Step 9: the page frame

`match-detail.module.css` lays out the page, header, tab area, facts panel and Match Circle link, and holds the TOPS tab's layout. `TeamBadge` draws a crest.

#### `src/features/matches/components/match-detail.module.css`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```css
.page {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding-top: env(safe-area-inset-top);
  background: var(--ds-gradient-app-background);
}

.frame {
  display: flex;
  width: 100%;
  max-width: 640px;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--ds-color-background-quiz-hub);
  box-shadow: 0 0 40px rgb(0 0 0 / 34%);
}

.contextEyebrow,
.boardMeta {
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

.tabsBody {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  background: transparent;
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

.mainTabs {
  min-height: 50px;
  background: transparent;
}
.mainTabs :global(button) {
  background: transparent !important;
}
.mainTabs :global(button:focus-visible) {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: -2px;
}

.tabPanel {
  min-height: 0;
  flex: 1;
}

.scrollPanel {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-color: var(--ds-color-border-strong) transparent;
}

.scrollPanel {
  padding: 12px 12px 28px;
}
.contextPanel h2 {
  margin: 0;
  color: var(--ds-color-text-default);
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-weight: 900;
}

/* TOPS is a column: the board scrolls, the standing bar stays docked. */
.topsTab {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
}
.topsPanel {
  padding: 14px 16px 8px;
}
.boardMeta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 2px;
  color: var(--ds-color-text-muted);
  font-size: 9px;
}
.boardMeta span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--ds-color-accent-gold);
}
.boardState {
  padding: 0 2px 9px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--ds-color-accent-gold) 22%, transparent);
  color: var(--ds-color-accent-gold);
  font-family: var(--ds-font-display);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.rankList {
  display: grid;
  gap: 6px;
  margin-top: 13px;
}
/* Rows arrive in sequence, sliding in from the left as they do in the app. */
.rankEnter {
  animation: rankEnter 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes rankEnter {
  from {
    opacity: 0;
    transform: translateX(-48px);
  }
}
.localRankBar {
  flex: none;
  padding: 10px 16px 12px;
  border-top: 1px solid
    color-mix(in srgb, var(--ds-color-border-strong) 32%, transparent);
  background: var(--ds-color-background-nav);
  box-shadow: 0 -8px 18px rgb(0 0 0 / 25%);
}

.contextRail {
  flex: none;
}
.contextPanel {
  display: none;
}
.circleCta {
  position: relative;
  z-index: 5;
  display: flex;
  width: 100%;
  height: 62px;
  text-decoration: none;
  flex: none;
  align-items: center;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom);
  border: 0;
  border-top: 1px solid
    color-mix(in srgb, var(--ds-color-accent-cyan) 16%, transparent);
  background: var(--ds-gradient-dock-bar);
  color: var(--ds-color-text-default);
  cursor: pointer;
}
.circleCta:hover {
  filter: brightness(1.12);
}
.circleCta:focus-visible {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: -3px;
}
.circleCtaInner {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.circleLabel {
  font-size: 12px;
  font-weight: 700;
}
.circleCount {
  margin-left: -4px;
  color: var(--ds-color-text-muted);
  font-size: 10px;
}

@media (min-width: 641px) and (max-width: 1023px) {
  .frame {
    border-right: 1px solid var(--ds-color-border-muted);
    border-left: 1px solid var(--ds-color-border-muted);
  }
  .scrollPanel {
    padding-right: 18px;
    padding-left: 18px;
  }
}

@media (min-width: 1024px) {
  .page {
    position: static;
    z-index: auto;
    display: block;
    overflow: visible;
    padding: 30px clamp(20px, 3vw, 52px) 44px;
    background: transparent;
  }
  .frame {
    display: grid;
    width: min(100%, 1440px);
    max-width: none;
    height: auto;
    min-height: 700px;
    margin: 0 auto;
    grid-template-columns: minmax(0, 1fr) clamp(320px, 25vw, 352px);
    grid-template-areas: "summary rail" "tabs rail";
    align-items: start;
    column-gap: 24px;
    overflow: visible;
    background: transparent;
    box-shadow: none;
  }
  .summary {
    grid-area: summary;
  }
  .tabsBody {
    grid-area: tabs;
    min-height: 640px;
    margin-top: 12px;
  }
  .tabPanel {
    min-height: 590px;
  }
  .scrollPanel {
    height: auto;
    min-height: 590px;
    overflow: visible;
    overscroll-behavior: auto;
  }
  .scrollPanel {
    padding: 18px 18px 24px;
  }
  .contextRail {
    position: sticky;
    top: 24px;
    display: grid;
    grid-area: rail;
    gap: 14px;
    align-self: start;
  }
  .contextPanel {
    display: block;
    padding: 18px;
    clip-path: var(--ds-clip-signal);
    background: var(--ds-color-background-secondary);
    box-shadow:
      inset 0 0 0 1px var(--ds-color-border-default),
      var(--ds-shadow-panel);
  }
  .contextEyebrow {
    display: block;
    color: var(--ds-color-accent-cyan);
    font-size: 9px;
  }
  .contextPanel h2 {
    margin-top: 6px;
    font-size: 18px;
    line-height: 1.08;
  }
  .contextFacts {
    display: grid;
    gap: 1px;
    margin: 18px 0 0;
  }
  .contextFacts div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid var(--ds-color-border-subtle);
  }
  .contextFacts dt {
    color: var(--ds-color-text-muted);
    font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.07em;
  }
  .contextFacts dd {
    margin: 0;
    color: var(--ds-color-text-subtle);
    text-align: right;
    font-size: 10px;
    font-weight: 700;
  }
  .topsPanel {
    max-width: 920px;
  }
  .topsTab {
    height: auto;
  }
  .localRankBar {
    position: sticky;
    bottom: 12px;
  }
}

@media (min-width: 1280px) {
  .frame {
    grid-template-columns: minmax(0, 1fr) 352px;
  }
  .tabsBody {
    min-height: 690px;
  }
  .tabPanel {
    min-height: 640px;
  }
  .scrollPanel {
    min-height: 640px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rankEnter {
    animation: none;
  }
  .frame *,
  .frame *::before,
  .frame *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
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

`MatchTabsView` holds the selected tab and renders one of the four panels.

#### `src/features/matches/components/match-tabs-view.tsx`

**Unchanged.**

```tsx
"use client";

import { useEffect, useState } from "react";

import { UnderlineTabs, accentVar } from "@/design-system";
import type { SportMatch } from "@/domain/matches";
import { MatchPicksPanel } from "@/features/picks";
import { MatchPredictTab } from "@/features/predictions";

import type { MatchDetailData } from "../types";
import { MatchLeaderboardTab } from "./match-leaderboard-tab";
import { MatchScoreboard } from "./match-scoreboard";
import styles from "./match-detail.module.css";

/**
 * The four match surfaces: the quizzes, the markets on the same fixture, the
 * board those quizzes rank, and the scoreboard.
 *
 * The tabs know about each other in exactly two places, both of which the app
 * has too: TOPS hands an unranked player to PREDICT, and PREDICT hands a
 * finished draft to PICKS.
 */

type MainTab = "predict" | "picks" | "tops" | "stats";

/** Labels only, as on the app's strip — the underline is the whole signal. */
const mainTabs: { id: MainTab; label: string }[] = [
  { id: "predict", label: "PREDICT" },
  { id: "picks", label: "PICKS" },
  { id: "tops", label: "TOPS" },
  { id: "stats", label: "STATS" },
];

export function MatchTabsView({
  match,
  detail,
}: {
  match: SportMatch;
  detail: MatchDetailData;
}) {
  const [activeTab, setActiveTab] = useState<MainTab>("predict");
  useEffect(() => {
    if (window.location.hash !== "#picks") return;
    const task = window.setTimeout(() => setActiveTab("picks"), 0);
    return () => window.clearTimeout(task);
  }, []);
  const activeIndex = mainTabs.findIndex((tab) => tab.id === activeTab);
  return (
    <section className={styles.tabsBody} aria-label="Match content">
      <UnderlineTabs
        label="Match detail tabs"
        className={styles.mainTabs}
        tabs={mainTabs}
        activeIndex={activeIndex}
        onChange={(index) => setActiveTab(mainTabs[index].id)}
        accent={accentVar("cyan")}
      />

      <div className={styles.tabPanel}>
        {activeTab === "predict" ? (
          <MatchPredictTab match={match} quizzes={detail.quizzes} />
        ) : null}
        {activeTab === "picks" ? <MatchPicksPanel matchId={match.id} /> : null}
        {activeTab === "tops" ? (
          <MatchLeaderboardTab
            match={match}
            detail={detail}
            onJoin={() => setActiveTab("predict")}
          />
        ) : null}
        {activeTab === "stats" ? (
          <MatchScoreboard match={match} scoreboard={detail.scoreboard} />
        ) : null}
      </div>
    </section>
  );
}
```

#### `src/features/matches/types.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export type { MatchDetailData } from "@/domain/matches";
```

The Match Circle link reads the thread from a store kept in the browser's local storage under `statoz.matchcircle.v1`. With nothing saved, the thread is the three seeded posts.

#### `src/features/matches/state/match-circle-store.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
"use client";

import { useSyncExternalStore } from "react";

import {
  matchCircleThreadKey,
  type MatchCircleThread,
  type SportMatch,
} from "@/domain/matches";
import { seedMatchCircleThread } from "@/mocks/matches";

/**
 * Every match discussion this browser holds, keyed by thread.
 *
 * A thread is seeded the first time a fixture is opened and then belongs to
 * the player: their comments, replies, likes, edits and deletions all live
 * here. The seeded regulars never change, so a thread always has something in
 * it to answer.
 */

export type MatchCircleSnapshot = {
  version: 1;
  hydrated: boolean;
  threads: Record<string, MatchCircleThread>;
};

const storageKey = "statoz.matchcircle.v1";
const listeners = new Set<() => void>();
const serverSnapshot: MatchCircleSnapshot = Object.freeze({
  version: 1,
  hydrated: false,
  threads: Object.freeze({}) as Record<string, MatchCircleThread>,
});
let current: MatchCircleSnapshot | null = null;

function coerce(value: unknown): Record<string, MatchCircleThread> {
  if (value == null || typeof value !== "object") return {};
  const threads: Record<string, MatchCircleThread> = {};
  for (const [key, thread] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (thread == null || typeof thread !== "object") continue;
    const candidate = thread as MatchCircleThread;
    if (typeof candidate.key !== "string" || !Array.isArray(candidate.posts))
      continue;
    threads[key] = candidate;
  }
  return threads;
}

function load(): MatchCircleSnapshot {
  let threads: Record<string, MatchCircleThread> = {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw)
      threads = coerce((JSON.parse(raw) as { threads?: unknown }).threads);
  } catch {
    // Private mode keeps the conversation in memory for this session.
  }
  return { ...serverSnapshot, hydrated: true, threads };
}

function getSnapshot(): MatchCircleSnapshot {
  if (typeof window === "undefined") return serverSnapshot;
  current ??= load();
  return current;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function onStorage(event: StorageEvent): void {
  if (event.key !== storageKey && event.key !== null) return;
  current = load();
  notify();
}

export function useMatchCircle(): MatchCircleSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

/**
 * The thread for a fixture. Seeded on the spot when the player has never
 * opened it, so reading is enough to have a conversation to join.
 */
export function threadFor(
  snapshot: MatchCircleSnapshot,
  match: SportMatch,
): MatchCircleThread {
  const stored = snapshot.threads[matchCircleThreadKey(match)];
  if (!stored) return seedMatchCircleThread(match);
  // A thread written before the sport and league were recorded gets them back.
  return stored.sport && stored.leagueId
    ? stored
    : { ...stored, sport: match.sport, leagueId: match.leagueId };
}
```

#### `src/features/matches/components/match-circle-cta.tsx`

**Unchanged.**

```tsx
"use client";

import Link from "next/link";

import { ForumIcon } from "@/design-system";
import {
  compactMatchCircleCount,
  visibleCount,
  type SportMatch,
} from "@/domain/matches";

import { threadFor, useMatchCircle } from "../state/match-circle-store";
import styles from "./match-detail.module.css";

/**
 * The bar docked under the match tabs, and the way into the discussion.
 *
 * It is chrome, not a call to action: a quiet 62px rail with a cyan hairline
 * along its top edge, carrying the thread's post count. Every tab scrolls
 * above it, so it never covers what it sits beneath.
 */
export function MatchCircleCta({ match }: { match: SportMatch }) {
  const snapshot = useMatchCircle();
  const count = visibleCount(threadFor(snapshot, match));
  const label = compactMatchCircleCount(count);

  return (
    <Link
      href={`/matches/${match.id}/circle`}
      className={styles.circleCta}
      aria-label={`Open Match Circle, ${label} discussion posts for ${match.home.name} versus ${match.away.name}`}
    >
      <span className={styles.circleCtaInner}>
        <ForumIcon size={20} aria-hidden="true" />
        <span className={styles.circleLabel}>Match Circle</span>
        <span className={styles.circleCount} suppressHydrationWarning>
          {label}
        </span>
      </span>
    </Link>
  );
}
```

#### `src/features/matches/components/match-detail-context.tsx`

**Unchanged.**

```tsx
import type { SportMatch } from "@/domain/matches";
import {
  formatKickoffDate,
  formatKickoffTime,
  formatOzCompact,
} from "@/shared/utils";

import { MatchCircleCta } from "./match-circle-cta";
import styles from "./match-detail.module.css";

export function MatchDetailContext({ match }: { match: SportMatch }) {
  const status =
    match.status === "live"
      ? `LIVE ${match.liveMinute ? `${match.liveMinute}'` : "NOW"}`
      : match.status === "finished"
        ? "FINAL"
        : "UPCOMING";

  return (
    <aside className={styles.contextRail} aria-label="Match context">
      <section className={styles.contextPanel}>
        <span className={styles.contextEyebrow}>MATCH INTEL</span>
        <h2>{match.leagueLabel}</h2>
        <dl className={styles.contextFacts}>
          <div>
            <dt>STATUS</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>START</dt>
            <dd>
              {formatKickoffDate(match.kickoff)} ·{" "}
              {formatKickoffTime(match.kickoff)}
            </dd>
          </div>
          <div>
            <dt>REWARD</dt>
            <dd>UP TO {match.rewardXp} XP</dd>
          </div>
          <div>
            <dt>VOLUME</dt>
            <dd>{formatOzCompact(match.volumeOz)} OZ</dd>
          </div>
        </dl>
      </section>
      <MatchCircleCta match={match} />
    </aside>
  );
}
```

## Step 10: the PREDICT tab

`resolveQuizHubVisual` in `hub-visual.ts` decides everything a quiz card shows: its tag, pill, progress bar and bottom line. It is StatOz's whole file and covers every state a card can be in. This page reaches one of them: not entered, match finished.

`prediction-store.ts` reads the player's saved predictions from local storage under `statoz.predictions.v1`. A new visitor has none.

#### `src/features/predictions/hub-visual.ts`

**Unchanged.**

```ts
import type { SportMatch } from "@/domain/matches";
import {
  isContestQuiz,
  isQuizSettleable,
  quizMaxReward,
  settledAnswerFor,
  type PredictionQuiz,
  type UserPrediction,
} from "@/domain/predictions";

/**
 * The resolved look of one quiz-set hub card.
 *
 * Every state reads as an objective: a status tag, a reward stake, a
 * completion or accuracy meter and a call to action. This is the whole of the
 * card's logic — the component below it only draws what this returns.
 */
export type QuizHubVisual = {
  accent: string;
  tag: string;
  /** 0..1. */
  progress: number;
  progressAccent: string;
  ctaText: string;
  ctaIcon: QuizHubIcon;
  rewardText: string;
  rewardColor: string;
  /** The reward-reveal moment, and the only card that ever glows. */
  glow: boolean;
  showChevron: boolean;
  /** Entry is barred; the tap is intercepted and the card reads muted. */
  blocked: boolean;
  blockedMessage?: string;
  contest?: ContestMeta;
  /** Per-question verdict dots, once a card is settled. */
  outcomes?: Array<"correct" | "wrong" | "void">;
};

export type QuizHubIcon =
  | "bolt"
  | "edit"
  | "lock"
  | "lockClock"
  | "vote"
  | "reveal"
  | "medal"
  | "done"
  | "stats";

export type ContestMeta = {
  fee: number;
  paid: boolean;
  affordable: boolean;
  /** Finish position once settled; zero before that. */
  rank: number;
  prizeOz: number;
  settled: boolean;
};

const cyan = "var(--ds-color-accent-cyan)";
const gold = "var(--ds-color-accent-gold)";
const muted = "var(--ds-color-text-muted)";
const success = "var(--ds-color-success)";
const danger = "var(--ds-color-danger)";
const amber = "var(--ds-color-warning)";

/** Per-question verdicts on a settled card, for the outcome dots. */
export function questionOutcomes(
  quiz: PredictionQuiz,
  prediction: UserPrediction,
): Array<"correct" | "wrong" | "void"> {
  return quiz.questions.map((question) => {
    if (question.forcedVoid) return "void";
    const actual = settledAnswerFor(question);
    if (actual == null) return "void";
    return prediction.answers[question.id] === actual ? "correct" : "wrong";
  });
}

export function resolveQuizHubVisual(
  match: SportMatch,
  quiz: PredictionQuiz,
  prediction: UserPrediction | undefined,
  options: { coins?: number; now?: number } = {},
): QuizHubVisual {
  const total = quiz.questions.length;
  const answered = prediction ? Object.keys(prediction.answers).length : 0;
  const potentialXp = quizMaxReward(quiz);
  const settled = prediction?.status === "settled";
  const locked = prediction?.status === "locked";
  const now = options.now ?? Date.now();

  const contest = isContestQuiz(quiz);
  const affordable = options.coins == null || options.coins >= quiz.entryFee;
  const contestFor = (
    over: Partial<ContestMeta> = {},
  ): ContestMeta | undefined =>
    contest
      ? {
          fee: quiz.entryFee,
          paid: prediction != null,
          affordable,
          rank: 0,
          prizeOz: 0,
          settled: false,
          ...over,
        }
      : undefined;

  // Finished and settled: the verdict card, calm — the moment already happened.
  if (match.status === "finished" && settled && prediction) {
    const correct = prediction.correctCount ?? 0;
    const won = correct > 0;
    const earned = prediction.rewardEarned;
    const wonCoins = prediction.contestPrizeOz > 0;
    return {
      accent: won || wonCoins ? gold : muted,
      tag: wonCoins ? "PRIZE WON" : "SETTLED",
      progress: total === 0 ? 0 : correct / total,
      progressAccent: won ? success : muted,
      ctaIcon: won || wonCoins ? "medal" : "done",
      ctaText: `${correct} / ${total} CORRECT`,
      rewardText: earned > 0 ? `+${earned} XP` : "NO XP",
      rewardColor: earned > 0 ? success : muted,
      glow: false,
      showChevron: false,
      blocked: false,
      contest: contestFor({
        settled: true,
        rank: prediction.contestRank ?? 0,
        prizeOz: prediction.contestPrizeOz,
      }),
      outcomes: questionOutcomes(quiz, prediction),
    };
  }

  // Finished with rewards waiting: the one glowing focal moment on the screen.
  if (match.status === "finished" && prediction) {
    return {
      accent: gold,
      tag: "REWARD READY",
      progress: 1,
      progressAccent: gold,
      ctaIcon: "reveal",
      ctaText: contest
        ? "TAP TO REVEAL RESULT · PRIZE"
        : "TAP TO REVEAL RESULTS",
      rewardText: "REVEAL",
      rewardColor: gold,
      glow: true,
      showChevron: true,
      blocked: false,
      contest: contestFor(),
    };
  }

  // Finished with no entry: closed, but the crowd is still worth reading.
  if (match.status === "finished") {
    const settleable = isQuizSettleable(quiz);
    return {
      accent: settleable ? cyan : amber,
      tag: settleable ? "FINAL RESULTS" : "RESULT VERIFYING",
      progress: 0,
      progressAccent: settleable ? cyan : amber,
      ctaIcon: "stats",
      ctaText: settleable ? "VIEW COMMUNITY RESULTS" : "VIEW CROWD SIGNAL",
      rewardText: "VIEW",
      rewardColor: settleable ? cyan : amber,
      glow: false,
      showChevron: true,
      blocked: false,
    };
  }

  // Live: every saved entry is frozen while the match runs.
  if (match.status === "live") {
    return {
      accent: danger,
      tag: "LIVE",
      progress: total === 0 ? 0 : answered / total,
      progressAccent: danger,
      ctaIcon: "lock",
      ctaText: "LOCKED PICKS · MATCH IN PROGRESS",
      rewardText: prediction ? "IN PLAY" : "CLOSED",
      rewardColor: danger,
      glow: false,
      showChevron: false,
      blocked: prediction == null,
      blockedMessage: prediction
        ? undefined
        : "Kickoff has passed. New predictions are closed.",
      contest: contestFor(),
    };
  }

  // A just-started fixture can still read as scheduled. The kickoff clock closes
  // fresh entry only; an existing draft stays open so the deadline lock can seal
  // its last saved answers.
  if (Date.parse(match.kickoff) <= now && prediction == null) {
    return {
      accent: muted,
      tag: "CLOSED",
      progress: 0,
      progressAccent: muted,
      ctaIcon: "lockClock",
      ctaText: "KICKOFF PASSED · NO ENTRY",
      rewardText: "MISSED",
      rewardColor: muted,
      glow: false,
      showChevron: false,
      blocked: true,
      blockedMessage: "Kickoff has passed. New predictions are closed.",
      contest: contestFor(),
    };
  }

  // Sealed before kickoff: the crowd signal is already unlocked.
  if (locked) {
    return {
      accent: success,
      tag: "LOCKED IN",
      progress: total === 0 ? 0 : answered / total,
      progressAccent: success,
      ctaIcon: "vote",
      ctaText: "VIEW CROWD VOTES",
      rewardText: `+${potentialXp} XP`,
      rewardColor: gold,
      glow: false,
      showChevron: true,
      blocked: false,
      contest: contestFor(),
    };
  }

  // Scheduled with a draft: editable, auto-saved.
  if (prediction) {
    const complete = answered >= total;
    return {
      accent: cyan,
      tag: complete ? "DRAFT ACTIVE" : "IN PROGRESS",
      progress: total === 0 ? 0 : answered / total,
      progressAccent: cyan,
      ctaIcon: "edit",
      ctaText: complete
        ? "REVIEW & LOCK"
        : `RESUME · ${answered}/${total} ANSWERED`,
      rewardText: `+${potentialXp} XP`,
      rewardColor: gold,
      glow: false,
      showChevron: true,
      blocked: false,
      contest: contestFor(),
    };
  }

  // Scheduled, contest entry unaffordable: barred until they top up.
  if (contest && !affordable) {
    return {
      accent: muted,
      tag: "ENTRY LOCKED",
      progress: 0,
      progressAccent: muted,
      ctaIcon: "lock",
      ctaText: `NEED ${quiz.entryFee} OZ TO ENTER`,
      rewardText: `+${potentialXp} XP`,
      rewardColor: muted,
      glow: false,
      showChevron: false,
      blocked: true,
      blockedMessage: `Need ${quiz.entryFee} Oz to enter this contest.`,
      contest: contestFor(),
    };
  }

  // Scheduled and fresh: the actionable entry point.
  return {
    accent: cyan,
    tag: "OBJECTIVE",
    progress: 0,
    progressAccent: cyan,
    ctaIcon: "bolt",
    ctaText: `TAP TO PREDICT · ${total} QUESTIONS`,
    rewardText: `+${potentialXp} XP`,
    rewardColor: gold,
    glow: false,
    showChevron: true,
    blocked: false,
    contest: contestFor(),
  };
}
```

#### `src/features/predictions/state/prediction-store.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
"use client";

import { useSyncExternalStore } from "react";

import {
  ScoreAnswer,
  defaultPredictionQuizId,
  predictionStorageKey,
  settledAnswerFor,
  type PredictionMultiplierId,
  type PredictionStatus,
  type UserPrediction,
} from "@/domain/predictions";
import { matchById, quizzesForMatch } from "@/mocks/matches";

/**
 * Every prediction the player has entered, kept in browser storage.
 *
 * The app holds this in a cubit over a repository; the web keeps the same
 * lifecycle — draft, lock, settle — in the store shape the rest of the features
 * use: a versioned key, a frozen server snapshot, a cached parse so
 * `useSyncExternalStore` can compare by reference, and a `storage` listener so
 * a second tab moves this one.
 *
 * A draft is only ever created before kickoff, is immutable once locked, and
 * settles exactly once — the XP and any contest prize are credited on that one
 * transition, so re-opening a settled card never pays twice.
 */

const storageKey = "statoz.predictions.v1";

export type PredictionsSnapshot = {
  version: 1;
  hydrated: boolean;
  /** `matchId::quizId` -> the entry. */
  predictions: Record<string, UserPrediction>;
};

const serverSnapshot: PredictionsSnapshot = Object.freeze({
  version: 1,
  hydrated: false,
  predictions: Object.freeze({}) as Record<string, UserPrediction>,
});

let current: PredictionsSnapshot | null = null;
const listeners = new Set<() => void>();

/* ---- The demo card --------------------------------------------------------- */

/**
 * One sealed card on a fixture that has already finished.
 *
 * The app's fixtures move through their own lifecycle, so a card entered before
 * kickoff is still there to be revealed afterwards. The web's are static: a
 * scheduled fixture never becomes a finished one, and without this the reveal —
 * and the contest payout behind it — could never be reached. So the demo starts
 * with one locked card, the way the picks demo starts with settled positions.
 */
const seededMatchId = "fifa_fra_eng_result";

function seededPredictions(): Record<string, UserPrediction> {
  const match = matchById(seededMatchId);
  if (!match) return {};
  const quiz = quizzesForMatch(match).find(
    (entry) => entry.id === defaultPredictionQuizId,
  );
  if (!quiz) return {};

  const answers: Record<string, number> = {};
  quiz.questions.forEach((question, index) => {
    const actual = settledAnswerFor(question);
    // The first two are called right, the rest are near misses — a card worth
    // revealing rather than a perfect one.
    if (actual != null && index < 2) {
      answers[question.id] = actual;
      return;
    }
    if (question.type === "exactScore") {
      answers[question.id] = ScoreAnswer.encode(1, 1);
      return;
    }
    const wrong = question.options.findIndex((_, option) => option !== actual);
    answers[question.id] = wrong < 0 ? 0 : wrong;
  });

  const key = predictionStorageKey(match.id, quiz.id);
  return {
    [key]: {
      matchId: match.id,
      quizId: quiz.id,
      answers,
      multipliersByQuestion: { [quiz.questions[0]?.id ?? "q1"]: "x2" },
      submittedAt: match.kickoff,
      status: "locked",
      rewardEarned: 0,
      contestPrizeOz: 0,
    },
  };
}

/* ---- Reading --------------------------------------------------------------- */

function coerce(value: unknown): Record<string, UserPrediction> {
  if (typeof value !== "object" || value === null) return {};
  const entries: Record<string, UserPrediction> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw !== "object" || raw === null) continue;
    const record = raw as Partial<UserPrediction>;
    if (typeof record.matchId !== "string" || typeof record.quizId !== "string")
      continue;
    if (typeof record.answers !== "object" || record.answers === null) continue;
    entries[key] = {
      matchId: record.matchId,
      quizId: record.quizId,
      answers: { ...(record.answers as Record<string, number>) },
      multipliersByQuestion: {
        ...(record.multipliersByQuestion as
          | Record<string, PredictionMultiplierId>
          | undefined),
      },
      submittedAt:
        typeof record.submittedAt === "string"
          ? record.submittedAt
          : new Date().toISOString(),
      status: statusOf(record.status),
      correctCount:
        typeof record.correctCount === "number"
          ? record.correctCount
          : undefined,
      rewardEarned:
        typeof record.rewardEarned === "number" ? record.rewardEarned : 0,
      contestRank:
        typeof record.contestRank === "number" ? record.contestRank : undefined,
      contestPrizeOz:
        typeof record.contestPrizeOz === "number" ? record.contestPrizeOz : 0,
    };
  }
  return entries;
}

function statusOf(value: unknown): PredictionStatus {
  return value === "locked" || value === "settled" ? value : "open";
}

function load(): PredictionsSnapshot {
  let predictions = seededPredictions();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw)
      predictions = coerce(
        (JSON.parse(raw) as { predictions?: unknown }).predictions,
      );
  } catch {
    // A private window refusing storage keeps this session in memory.
  }
  return { ...serverSnapshot, hydrated: true, predictions };
}

function getSnapshot(): PredictionsSnapshot {
  if (typeof window === "undefined") return serverSnapshot;
  current ??= load();
  return current;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent): void {
  if (event.key === storageKey || event.key === null) {
    current = load();
    notify();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function usePredictions(): PredictionsSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export function predictionFor(
  snapshot: PredictionsSnapshot,
  matchId: string,
  quizId: string,
): UserPrediction | undefined {
  return snapshot.predictions[predictionStorageKey(matchId, quizId)];
}
```

#### `src/features/predictions/components/predictions.module.css`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```css
/*
 * The PREDICT tab: the quiz-set hub, the one-question-at-a-time flow, the
 * review cards with their crowd votes, and the two docks that end them.
 *
 * Motion and pseudo-state only — layout is Tailwind and colour comes from the
 * token variables the components pass in.
 */

.hubTag,
.hubTitle,
.rewardPill,
.contestChip,
.hubCta,
.indexPlate,
.lockLine {
  font-family: var(--ds-font-display);
  font-weight: 900;
  letter-spacing: 0.08em;
}

.tabular {
  font-variant-numeric: tabular-nums;
}

/* Cards sit at their own height; a stretched cell would show its offset edge
   above the frame instead of below it. */
.hubList {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 22px;
}

.hubCard {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  cursor: pointer;
  isolation: isolate;
}

.hubCard:disabled {
  cursor: not-allowed;
}

/* The hard, un-blurred offset edge that reads as elevation. */
.hubShadow {
  position: absolute;
  z-index: -1;
  inset: 6px 0 -6px 0;
  background: color-mix(
    in srgb,
    var(--hub-accent) 30%,
    var(--ds-color-fixture-shadow)
  );
  clip-path: var(--ds-clip-compact-hud);
}

.hubFrame {
  position: relative;
  display: flex;
  min-height: 84px;
  gap: 12px;
  padding: 12px 12px 13px;
  clip-path: var(--ds-clip-compact-hud);
  background: linear-gradient(
    135deg,
    color-mix(
      in srgb,
      var(--home-color) 16%,
      var(--ds-color-background-quiz-hub)
    ),
    color-mix(
      in srgb,
      var(--away-color) 16%,
      var(--ds-color-background-quiz-hub)
    )
  );
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--hub-accent) 40%, transparent);
}

/* The reward-reveal moment is the one card that breathes — and the only glow. */
.hubGlow .hubFrame {
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--hub-accent) 60%, transparent);
}
.hubGlow {
  animation: hubBreathe 2.8s ease-in-out infinite;
}

@keyframes hubBreathe {
  0%,
  100% {
    filter: drop-shadow(
      0 0 12px color-mix(in srgb, var(--hub-accent) 18%, transparent)
    );
  }
  50% {
    filter: drop-shadow(
      0 0 22px color-mix(in srgb, var(--hub-accent) 40%, transparent)
    );
  }
}

.hubBlocked .hubFrame {
  filter: saturate(0.5) brightness(0.86);
}

.hubCard:hover:not(:disabled) .hubFrame {
  filter: brightness(1.06);
}
.hubCard:focus-visible {
  outline: 2px solid var(--hub-accent);
  outline-offset: 2px;
}

.indexPlate {
  display: grid;
  width: 38px;
  height: 38px;
  flex: none;
  place-items: center;
  clip-path: polygon(
    8px 0,
    calc(100% - 2px) 0,
    100% 2px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    2px 100%,
    0 calc(100% - 2px),
    0 8px
  );
  background: color-mix(in srgb, var(--hub-accent) 16%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--hub-accent) 60%, transparent);
  color: var(--hub-accent);
  font-size: 15px;
  letter-spacing: 0;
}

.hubTag {
  color: var(--hub-accent);
  font-size: 8.5px;
  letter-spacing: 0.16em;
}
.hubTitle {
  margin: 4px 0 0;
  color: var(--ds-color-text-default);
  font-size: 14.5px;
  line-height: 1.2;
}
.hubSubtitle {
  margin: 6px 0 0;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-body);
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0;
}

.rewardPill {
  flex: none;
  padding: 4px 8px;
  border: 1px solid color-mix(in srgb, var(--pill-color) 50%, transparent);
  background: color-mix(in srgb, var(--pill-color) 12%, transparent);
  color: var(--pill-color);
  font-size: 9px;
  letter-spacing: 0.06em;
}

.contestStrip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 9px;
}
.contestChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3.5px 7px;
  border: 1px solid color-mix(in srgb, var(--chip-color) 45%, transparent);
  background: color-mix(in srgb, var(--chip-color) 10%, transparent);
  color: var(--chip-color);
  font-size: 8.5px;
  letter-spacing: 0.08em;
}
.contestChipFilled {
  background: color-mix(in srgb, var(--chip-color) 18%, transparent);
}

.hubTrack {
  height: 6px;
  margin-top: 11px;
  background: rgb(0 0 0 / 35%);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--hub-accent) 22%, transparent);
}
.hubTrack i {
  display: block;
  height: 100%;
  background: var(--track-accent);
  transition: width 240ms ease-out;
}

.hubDivider {
  height: 1px;
  margin: 10px 0 9px;
  background: linear-gradient(
    to right,
    transparent,
    color-mix(in srgb, var(--hub-accent) 62%, transparent),
    transparent
  );
}

.hubCta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--hub-accent);
  font-size: 9px;
  letter-spacing: 0.1em;
}
.hubCtaText {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hubGlow .hubCtaText {
  text-shadow: 0 0 10px color-mix(in srgb, var(--hub-accent) 50%, transparent);
}

.chevronChip {
  display: grid;
  width: 26px;
  height: 26px;
  flex: none;
  place-items: center;
  clip-path: polygon(
    6px 0,
    calc(100% - 2px) 0,
    100% 2px,
    100% calc(100% - 6px),
    calc(100% - 6px) 100%,
    2px 100%,
    0 calc(100% - 2px),
    0 6px
  );
  background: color-mix(in srgb, var(--hub-accent) 14%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--hub-accent) 55%, transparent);
}

.outcomeDots {
  display: flex;
  flex: none;
  gap: 4px;
}
.outcomeDot {
  display: grid;
  width: 13px;
  height: 13px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--dot-color) 55%, transparent);
  background: color-mix(in srgb, var(--dot-color) 12%, transparent);
  color: var(--dot-color);
}

.blockedNote {
  margin-top: 10px;
  color: var(--ds-color-text-muted);
  font-family: var(--ds-font-body);
  font-size: 11px;
}
/* The scroll rides above the backdrop art. */
.flowScroll {
  position: relative;
  z-index: 1;
  min-height: 0;
  flex: 1;
  padding-bottom: calc(92px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-color: var(--ds-color-border-strong) transparent;
}

.lockLine {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px 2px;
  font-size: 11px;
  letter-spacing: 0.14em;
}
.lockLineStack {
  display: grid;
  justify-items: center;
  gap: 7px;
  padding: 12px 20px 2px;
}

/* ---- Review ---------------------------------------------------------------- */

.reviewNotice {
  margin: 14px 20px 0;
  padding: 10px 12px;
  border: 1px solid
    color-mix(in srgb, var(--ds-color-accent-cyan) 28%, transparent);
  background: color-mix(in srgb, var(--ds-color-accent-cyan) 8%, transparent);
  color: var(--ds-color-text-subtle);
  font-size: 13px;
  text-align: center;
}

/* ---- Wider ------------------------------------------------------------- */

@media (width >= 1024px) {
  .flowScroll {
    min-height: 560px;
    height: auto;
    padding-bottom: 24px;
    overflow: visible;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hubGlow {
    animation: none;
  }
}
```

#### `src/features/predictions/components/quiz-flow.tsx`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```tsx
"use client";

import { FlagIcon, LockIcon, ScheduleIcon } from "@/design-system";
import type { SportMatch } from "@/domain/matches";
import styles from "./predictions.module.css";

/**
 * The question flow: one question at a time, a numbered panel with its XP
 * stake and boosts, and the dock that carries the progress segments and the
 * forward action.
 */

/* ---- Chrome ---------------------------------------------------------------- */

export function LockLine({
  match,
  untilLockMs,
  hydrated,
  trailing,
}: {
  match: SportMatch;
  untilLockMs: number;
  hydrated: boolean;
  trailing?: React.ReactNode;
}) {
  const upcoming = match.status === "scheduled" && untilLockMs > 0;
  const [Icon, text, color] = upcoming
    ? ([
        ScheduleIcon,
        `QUIZ LOCKS IN ${formatCountdown(untilLockMs)}`,
        "var(--ds-color-accent-gold)",
      ] as const)
    : match.status === "finished"
      ? ([FlagIcon, "MATCH ENDED", "var(--ds-color-text-muted)"] as const)
      : ([LockIcon, "PREDICTIONS LOCKED", "var(--ds-color-danger)"] as const);

  const line = (
    <span className={styles.lockLine} style={{ color }} role="status">
      <Icon size={13} aria-hidden="true" />
      <span className={styles.tabular} suppressHydrationWarning>
        {hydrated || !upcoming ? text : "QUIZ LOCKS IN --:--:--"}
      </span>
    </span>
  );

  return trailing ? (
    <span className={styles.lockLineStack}>
      {line}
      {trailing}
    </span>
  ) : (
    line
  );
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
```

#### `src/features/predictions/components/quiz-review.tsx`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```tsx
"use client";

import styles from "./predictions.module.css";

/**
 * The draft summary and, once a card is sealed, the read-only review: each
 * question with the pick that was locked in and how the crowd voted on it.
 */

export function ReviewNotice({ text }: { text: string }) {
  return <p className={styles.reviewNotice}>{text}</p>;
}
```

#### `src/features/predictions/components/quiz-hub-card.tsx`

**Unchanged.**

```tsx
"use client";

import type { CSSProperties, ComponentType } from "react";

import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  GroupsIcon,
  InsightsIcon,
  LockIcon,
  MedalIcon,
  MoreIcon,
  PaidIcon,
  PremiumIcon,
  ScheduleIcon,
  TrophyIcon,
  type IconProps,
} from "@/design-system";
import type { SportMatch } from "@/domain/matches";
import {
  scorelineContestPrizes,
  type PredictionQuiz,
  type UserPrediction,
} from "@/domain/predictions";

import {
  resolveQuizHubVisual,
  type ContestMeta,
  type QuizHubIcon,
} from "../hub-visual";
import styles from "./predictions.module.css";

/**
 * One quiz set, as an objective card.
 *
 * The whole of its logic is `resolveQuizHubVisual`; this draws what it returns.
 * A barred card is still a button — pressing it says why rather than doing
 * nothing, which is how the app answers a tap it cannot honour.
 */

const ctaIcons: Record<QuizHubIcon, ComponentType<IconProps>> = {
  bolt: BoltIcon,
  edit: EditIcon,
  lock: LockIcon,
  lockClock: ScheduleIcon,
  vote: GroupsIcon,
  reveal: PremiumIcon,
  medal: MedalIcon,
  done: CheckIcon,
  stats: InsightsIcon,
};

export type QuizHubCardProps = {
  match: SportMatch;
  quiz: PredictionQuiz;
  index: number;
  prediction: UserPrediction | undefined;
  coins?: number;
  /** The demo clock, so a fixture does not read as kicked off before its time. */
  now?: number;
  onOpen: () => void;
  onBlocked: (message: string) => void;
};

export function QuizHubCard({
  match,
  quiz,
  index,
  prediction,
  coins,
  now,
  onOpen,
  onBlocked,
}: QuizHubCardProps) {
  const visual = resolveQuizHubVisual(match, quiz, prediction, { coins, now });
  const CtaIcon = ctaIcons[visual.ctaIcon];

  return (
    <button
      type="button"
      className={[
        styles.hubCard,
        visual.glow ? styles.hubGlow : "",
        visual.blocked ? styles.hubBlocked : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--hub-accent": visual.accent,
          "--home-color": match.home.color,
          "--away-color": match.away.color,
        } as CSSProperties
      }
      aria-label={`Open ${quiz.title}`}
      onClick={() =>
        visual.blocked
          ? onBlocked(
              visual.blockedMessage ?? "This quiz is not available right now.",
            )
          : onOpen()
      }
    >
      <span className={styles.hubShadow} aria-hidden="true" />
      <span className={styles.hubFrame}>
        <span className={[styles.indexPlate, styles.tabular].join(" ")}>
          {String(index).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className="min-w-0 flex-1">
              <span className={`${styles.hubTag} block`}>{visual.tag}</span>
              <span className={`${styles.hubTitle} block`}>{quiz.title}</span>
            </span>
            <span
              className={[styles.rewardPill, styles.tabular].join(" ")}
              style={{ "--pill-color": visual.rewardColor } as CSSProperties}
            >
              {visual.rewardText}
            </span>
          </span>

          {quiz.subtitle ? (
            <span className={`${styles.hubSubtitle} block truncate`}>
              {quiz.subtitle}
            </span>
          ) : null}

          {visual.contest ? <ContestStrip meta={visual.contest} /> : null}

          <span
            className={`${styles.hubTrack} block`}
            role="progressbar"
            aria-valuenow={Math.round(visual.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i
              style={
                {
                  width: `${Math.min(100, Math.max(0, visual.progress * 100))}%`,
                  "--track-accent": visual.progressAccent,
                } as CSSProperties
              }
            />
          </span>

          <span className={`${styles.hubDivider} block`} aria-hidden="true" />

          <span className={styles.hubCta}>
            <CtaIcon size={14} aria-hidden="true" />
            <span className={`${styles.hubCtaText} ${styles.tabular}`}>
              {visual.ctaText}
            </span>
            {visual.outcomes ? (
              <OutcomeDots outcomes={visual.outcomes} />
            ) : visual.showChevron ? (
              <span className={styles.chevronChip} aria-hidden="true">
                <ArrowRightIcon size={15} />
              </span>
            ) : null}
          </span>

          {visual.blocked && visual.blockedMessage ? (
            <span className={`${styles.blockedNote} block`}>
              {visual.blockedMessage}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

const outcomeColors = {
  correct: "var(--ds-color-success)",
  wrong: "var(--ds-color-danger)",
  void: "var(--ds-color-text-muted)",
};

function OutcomeDots({
  outcomes,
}: {
  outcomes: Array<"correct" | "wrong" | "void">;
}) {
  return (
    <span className={styles.outcomeDots}>
      {outcomes.map((outcome, index) => {
        const Glyph =
          outcome === "correct"
            ? CheckIcon
            : outcome === "wrong"
              ? CloseIcon
              : MoreIcon;
        return (
          <span
            key={index}
            className={styles.outcomeDot}
            style={{ "--dot-color": outcomeColors[outcome] } as CSSProperties}
          >
            <Glyph size={9} aria-hidden="true" />
          </span>
        );
      })}
    </span>
  );
}

/**
 * The paid contest's ribbon: entry state on the left, the prize pool on the
 * right — or, once settled, the finish and the coins won. Flat chips only; the
 * reveal owns the moment, so the hub stays calm.
 */
function ContestStrip({ meta }: { meta: ContestMeta }) {
  if (meta.settled) {
    const won = meta.prizeOz > 0;
    return (
      <span className={styles.contestStrip}>
        <Chip
          icon={TrophyIcon}
          label={meta.rank > 0 ? `FINISHED #${meta.rank}` : "FINISHED"}
          color={
            won ? "var(--ds-color-accent-gold)" : "var(--ds-color-text-muted)"
          }
        />
        {won ? (
          <Chip
            icon={PaidIcon}
            label={`+${meta.prizeOz}`}
            color="var(--ds-color-accent-gold)"
            filled
          />
        ) : (
          <Chip label="NO PRIZE" color="var(--ds-color-text-muted)" />
        )}
      </span>
    );
  }

  const entry = meta.paid ? (
    <Chip
      icon={CheckIcon}
      label="ENTRY PAID"
      color="var(--ds-color-accent-lime)"
    />
  ) : meta.affordable ? (
    <Chip
      icon={PaidIcon}
      label={`-${meta.fee} OZ ENTRY`}
      color="var(--ds-color-accent-cyan)"
    />
  ) : (
    <Chip
      icon={LockIcon}
      label={`NEED ${meta.fee} OZ`}
      color="var(--ds-color-text-muted)"
    />
  );

  return (
    <span className={styles.contestStrip}>
      {entry}
      <Chip
        icon={TrophyIcon}
        label={scorelineContestPrizes.join(" · ")}
        color="var(--ds-color-accent-gold)"
      />
    </span>
  );
}

function Chip({
  icon: Icon,
  label,
  color,
  filled = false,
}: {
  icon?: ComponentType<IconProps>;
  label: string;
  color: string;
  filled?: boolean;
}) {
  return (
    <span
      className={[
        styles.contestChip,
        styles.tabular,
        filled ? styles.contestChipFilled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--chip-color": color } as CSSProperties}
    >
      {Icon ? <Icon size={12} aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
```

#### `src/features/predictions/components/match-predict-tab.tsx`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SportMatch } from "@/domain/matches";
import { isContestQuiz, type PredictionQuiz } from "@/domain/predictions";
import { useAuthSession, useRequireAuth } from "@/features/auth";
import { useEconomy } from "@/features/economy";
import { matchDemoAnchor } from "@/mocks/matches";
import { useDemoNow } from "@/shared/hooks";

import { usePredictions, predictionFor } from "../state/prediction-store";
import { LockLine } from "./quiz-flow";
import { QuizHubCard } from "./quiz-hub-card";
import { ReviewNotice } from "./quiz-review";
import styles from "./predictions.module.css";

/**
 * The PREDICT tab.
 *
 * The tab owns the quiz-set hub. Opening a quiz pushes the dedicated fullscreen
 * route, matching the app while keeping each quiz directly addressable on web.
 */

export function MatchPredictTab({
  match,
  quizzes,
}: {
  match: SportMatch;
  quizzes: PredictionQuiz[];
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  if (quizzes.length === 0) {
    return (
      <EmptyState
        title="Quiz not live yet"
        message="Prediction questions will appear here when this match opens."
      />
    );
  }

  return (
    <QuizHub
      match={match}
      quizzes={quizzes}
      notice={notice}
      onNotice={setNotice}
      onOpen={(quizId) => {
        setNotice(null);
        router.push(`/matches/${match.id}/predict/${quizId}`);
      }}
    />
  );
}

/* ---- The hub --------------------------------------------------------------- */

function QuizHub({
  match,
  quizzes,
  notice,
  onNotice,
  onOpen,
}: {
  match: SportMatch;
  quizzes: PredictionQuiz[];
  notice: string | null;
  onNotice: (message: string | null) => void;
  onOpen: (quizId: string) => void;
}) {
  const predictions = usePredictions();
  const economy = useEconomy();
  const session = useAuthSession();
  const requireAuth = useRequireAuth();
  const now = useDemoNow(matchDemoAnchor);
  const untilLockMs = Math.max(
    0,
    Date.parse(match.kickoff) - (now ?? Date.parse(matchDemoAnchor)),
  );

  const open = (quiz: PredictionQuiz) => {
    if (session.status === "guest") {
      requireAuth({
        intent: "predict",
        message:
          "Log in to answer match missions and save your prediction history.",
      });
      return;
    }
    const entry = predictionFor(predictions, match.id, quiz.id);
    const communityResults = entry == null && match.status === "finished";
    if (entry == null && match.status !== "scheduled" && !communityResults) {
      onNotice("Kickoff has passed. New predictions are closed.");
      return;
    }
    onOpen(quiz.id);
  };

  return (
    <div className={styles.flowScroll}>
      <LockLine
        match={match}
        untilLockMs={untilLockMs}
        hydrated={now != null}
      />
      {notice ? <ReviewNotice text={notice} /> : null}
      <div className={`${styles.hubList} px-5 pt-4 pb-16`}>
        {quizzes.map((quiz, index) => (
          <QuizHubCard
            key={quiz.id}
            match={match}
            quiz={quiz}
            index={index + 1}
            prediction={predictionFor(predictions, match.id, quiz.id)}
            coins={isContestQuiz(quiz) ? economy.coins : undefined}
            now={now ?? undefined}
            onOpen={() => open(quiz)}
            onBlocked={onNotice}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="grid h-full place-items-center px-8 text-center">
      <div>
        <h2 className={styles.overlayHeadline} style={{ fontSize: "16px" }}>
          {title}
        </h2>
        <p className={styles.overlayBody}>{message}</p>
      </div>
    </div>
  );
}
```

#### `src/features/predictions/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
/**
 * The predictions feature's public API.
 *
 * The PREDICT tab itself, plus the store behind it — a player's drafts, their
 * sealed cards, and what those cards settled for.
 */
export { MatchPredictTab } from "./components/match-predict-tab";

export { predictionFor, usePredictions } from "./state/prediction-store";
```

## Step 11: the PICKS tab

#### `src/features/picks/components/match-picks-panel.tsx`

**Adapted.** StatOz's panel also lists a fixture's markets and opens the trade sheet. This match has no markets, so only the link and the empty state remain.

```tsx
import Link from "next/link";

import {
  ChevronRightIcon,
  NoDataState,
  PickIcon,
  ScheduleIcon,
  accentVar,
} from "@/design-system";

import styles from "./picks.module.css";

/**
 * The PICKS tab. StatOz lists the markets tied to a fixture here. This match
 * has none, so the panel is the link to every market and the empty state.
 */
export function MatchPicksPanel({ matchId }: { matchId: string }) {
  void matchId;
  return (
    <div className={styles.matchPanel}>
      <Link href="/picks" className={styles.matchHeader}>
        <PickIcon size={18} aria-hidden="true" />
        <span>
          <strong>VIEW ALL PICKS</strong>
          <small>Browse every open market</small>
        </span>
        <ChevronRightIcon size={20} aria-hidden="true" />
      </Link>

      <NoDataState
        icon={PickIcon}
        spark={ScheduleIcon}
        accent={accentVar("lime")}
        title="No picks for this match"
        message="Match-linked picks will appear here when markets open."
      />
    </div>
  );
}
```

#### `src/features/picks/components/picks.module.css`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```css
/* ---- Market detail --------------------------------------------------------- */
.matchPanel {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 12px 28px;
  scrollbar-color: var(--ds-color-border-strong) transparent;
}
/* A plain row, not a panel: the markets below are the surfaces here. */
.matchHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 4px;
  color: var(--ds-color-accent-lime);
  text-decoration: none;
}
.matchHeader > span {
  display: grid;
  min-width: 0;
  flex: 1;
}
.matchHeader strong {
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-display);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.07em;
}
.matchHeader small {
  margin-top: 2px;
  color: var(--ds-color-text-muted);
  font-size: 11px;
}
.matchHeader:hover strong {
  color: var(--ds-color-accent-lime);
}
.matchHeader:focus-visible {
  outline: 2px solid var(--ds-color-accent-lime);
  outline-offset: 2px;
}
@media (min-width: 1024px) {
  .matchPanel {
    height: auto;
    min-height: 590px;
    overflow: visible;
    padding: 18px 18px 24px;
  }
}
```

#### `src/features/picks/index.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
export { MatchPicksPanel } from "./components/match-picks-panel";
```

## Step 12: the TOPS tab

The leaderboard parts are shared with StatOz's season leaderboard, which is why they accept options this page does not use, such as team crests.

- `RankPlate` draws the cut-corner panel behind every entry.
- `rank-parts.tsx` holds the portrait, the tag, the movement arrow and the counting score.
- `RankPodium` draws the top three, `RankRow` each row below, and `RankUserBar` the player's own bar.

#### `src/features/leaderboard/components/leaderboard.module.css`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```css
/**
 * Rows and podium tiles are dealt in from the left, staggered by a per-element
 * `--enter-delay`. The app runs a `TweenAnimationBuilder` per card with an
 * `Interval` curve standing in for the delay; a keyframe with a real delay is
 * the same 320ms ease-out over the same 48px, with nothing to dispose.
 *
 * `backwards`, never `both`: the fill only has to hold the from-state through
 * the delay, and a forwards fill would keep the animation in effect forever —
 * which leaves an animated `transform` applied, and with it a containing block
 * that the rival dossier's `position: fixed` scrim would anchor to instead of
 * the viewport.
 */
.dealIn {
  animation: deal-in 320ms cubic-bezier(0.33, 1, 0.68, 1) backwards;
  animation-delay: var(--enter-delay, 0ms);
}

@keyframes deal-in {
  from {
    opacity: 0;
    transform: translateX(-48px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/**
 * A tappable plate lifts a hair. Flutter has no hover at all — its `_Pressable`
 * fakes one with a shadow — so this is one of the divergences the web is
 * expected to add rather than avoid.
 */
.pressable {
  transition: transform 150ms ease-out;
}

.pressable:hover {
  transform: translateY(-1px);
}

.pressable:active {
  transform: translateY(0);
}
```

#### `src/features/leaderboard/components/rank-parts.tsx`

**Unchanged.**

```tsx
"use client";

import type { CSSProperties } from "react";

import {
  accentVar,
  Avatar,
  feedbackVar,
  Monogram,
  ScheduleIcon,
  withAlpha,
} from "@/design-system";
import type { SportTeam } from "@/domain/matches";
import { avatarForName } from "@/features/onboarding";
import { useCountUp } from "@/shared/hooks";
import { formatInt } from "@/shared/utils";

import { plateFill, RankPlate } from "./rank-plate";

/**
 * The small parts every rank board is built from — the face, the tag pill, the
 * movement delta, the counted score and the countdown.
 */

const cyan = accentVar("cyan");
const gold = accentVar("gold");
const orange = accentVar("orange");

/* ---- Avatar -------------------------------------------------------------- */

export type RivalAvatarProps = {
  name: string;
  size: number;
  /** Marks the player's own face: a thicker, brighter ring. */
  highlight?: boolean;
  /** Overrides the ring colour — the podium tints it by placing. */
  ring?: string;
  /** Equipped shop frame color for the player's own avatar. */
  frameColor?: string;
  /** A team row shows a crest instead of a face, and no ring. */
  team?: SportTeam;
  /**
   * The portrait to use. Only the player passes one; every rival's face is
   * derived from their name so they look the same wherever they appear.
   */
  src?: string;
  className?: string;
};

/** Octagon-clipped portrait, or a team's crest. */
export function RivalAvatar({
  name,
  size,
  highlight = false,
  ring,
  frameColor,
  team,
  src,
  className,
}: RivalAvatarProps) {
  if (team) {
    return (
      <Monogram
        name={team.name}
        initials={team.shortName}
        accent={team.color}
        size={size}
        className={className}
      />
    );
  }

  const color =
    frameColor ?? ring ?? (highlight ? cyan : "var(--ds-color-border-default)");

  return (
    <Avatar
      src={src ?? avatarForName(name).src}
      alt={name}
      size={size}
      ring={withAlpha(color, highlight ? 0.9 : 0.42)}
      ringWidth={highlight ? 2 : 1.2}
      className={className}
    />
  );
}

/* ---- Pills --------------------------------------------------------------- */

/** A tiny chamfered label — YOU, PRO, a team's short name. */
export function RankTag({ label, color }: { label: string; color: string }) {
  return (
    <RankPlate
      cut={4}
      background={plateFill(color, 0.16)}
      borderColor={withAlpha(color, 0.7)}
      className="inline-block shrink-0"
    >
      <span
        className="block px-1.5 py-px font-display font-black leading-normal"
        style={{
          fontSize: "9px",
          letterSpacing: "var(--ds-tracking-wide)",
          color,
        }}
      >
        {label}
      </span>
    </RankPlate>
  );
}

/** The rank delta: climbed, dropped, held, or a first-time entrant. */
export function MovementBadge({
  movement,
  isNew,
}: {
  movement: number;
  isNew: boolean;
}) {
  const [label, color, description] = isNew
    ? ["NEW", gold, "New entry"]
    : movement > 0
      ? [`▲${movement}`, feedbackVar("success"), `Up ${movement}`]
      : movement < 0
        ? [`▼${-movement}`, feedbackVar("danger"), `Down ${-movement}`]
        : ["—", "var(--ds-color-text-muted)", "Unchanged"];

  return (
    <span
      className="ds-tabular shrink-0 font-display font-black leading-none"
      style={{
        fontSize: "11px",
        letterSpacing: "var(--ds-tracking-tight)",
        color,
      }}
      aria-label={description}
    >
      {label}
    </span>
  );
}

/**
 * A score that counts up to its value the first time it lands.
 *
 * The app re-keys the widget so a board change restarts the count; give this
 * the same `key` and React remounts it for exactly the same effect.
 */
export function ScoreText({
  value,
  suffix = "",
  className,
  style,
}: {
  value: number;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const shown = useCountUp(value);
  return (
    <span className={className} style={style}>
      {formatInt(shown)}
      {suffix}
    </span>
  );
}

/**
 * `04h 12m` above an hour, `12m 05s` below — the granularity a board countdown
 * wants. Ported as written; the web feeds it a real clock rather than the
 * app's frozen fixture.
 */
export function formatBoardCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "00m 00s";
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(minutes)}m ${pad(totalSeconds % 60)}s`;
}

/** The amber "time left" pill above a live board. */
export function CountdownPill({
  remaining,
  label,
  accent = orange,
}: {
  remaining: string;
  label?: string;
  accent?: string;
}) {
  return (
    <RankPlate
      cut={8}
      background={plateFill(accent, 0.14)}
      borderColor={withAlpha(accent, 0.55)}
      className="inline-block"
    >
      <span className="flex items-center gap-1.25 px-2.5 py-1.5">
        <ScheduleIcon size={13} style={{ color: accent }} />
        <span
          className="ds-tabular font-display font-black leading-none"
          style={{
            fontSize: "10px",
            letterSpacing: "var(--ds-tracking-label)",
            color: accent,
          }}
        >
          {label ? `${label} ${remaining}` : remaining}
        </span>
      </span>
    </RankPlate>
  );
}
```

#### `src/features/leaderboard/components/rank-plate.tsx`

**Unchanged.**

```tsx
import type { CSSProperties, ReactNode } from "react";

import { hudChamferPath } from "@/design-system";

import styles from "./leaderboard.module.css";

/**
 * The board's shared surface: a flat fill inside a chamfered edge.
 *
 * The app draws every podium tile, row, chip and pill with one
 * `cutCornerDecoration`, which cuts the top-left and bottom-right corners and
 * leaves the other two square — the HUD chamfer with no answering cut, which is
 * exactly what `hudChamferPath(cut, 0)` describes. Only the cut size and the
 * two colours change between them, so they are all this component.
 *
 * It is not `HudPanel`: that fixes the silhouette at 14/4 and always paints an
 * accent edge, where a board needs seven different cuts and an edgeless plate
 * for the rows that are not yours.
 *
 * Built as an edge layer with the fill inset a pixel inside it, because a clip
 * path crops a border away.
 */

/**
 * A translucent fill, resolved against the page ground as an opaque colour.
 *
 * The app strokes a one-pixel border and fills behind it, so its translucent
 * fills sit on the scaffold. A clip path crops a border away, so the web has to
 * draw the edge as a plate *behind* the fill — which means a translucent fill
 * would blend into the edge instead of the page, and a strongly tinted edge
 * would swallow the fill whole. Mixing against the ground here keeps every
 * plate the colour the app painted rather than the colour of its own border.
 */
export function plateFill(color: string, amount: number): string {
  return `color-mix(in srgb, ${color} ${amount * 100}%, var(--ds-color-background-primary))`;
}

export type RankPlateProps = {
  /** Depth of the top-left and bottom-right chamfer, in pixels. */
  cut: number;
  /** Must be opaque — see {@link plateFill}. */
  background: string;
  /** Omit for a plate with no edge at all — the resting row. */
  borderColor?: string;
  /** Adds the hover lift. Set it on anything actually tappable. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function RankPlate({
  cut,
  background,
  borderColor,
  interactive = false,
  className,
  style,
  children,
}: RankPlateProps) {
  const clip: CSSProperties = { clipPath: hudChamferPath(cut, 0) };

  return (
    <div
      className={[
        "relative",
        interactive ? styles.pressable : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {borderColor ? (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ ...clip, background: borderColor }}
        />
      ) : null}
      <span
        aria-hidden
        className={borderColor ? "absolute inset-px" : "absolute inset-0"}
        style={{ ...clip, background }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
```

#### `src/features/leaderboard/components/rank-podium.tsx`

**Unchanged.**

```tsx
"use client";

import type { CSSProperties } from "react";

import { accentVar, PremiumIcon, withAlpha } from "@/design-system";

import type { LeaderboardEntry, ScoreMeta } from "../types";

import styles from "./leaderboard.module.css";
import { MovementBadge, RankTag, RivalAvatar, ScoreText } from "./rank-parts";
import { plateFill, RankPlate } from "./rank-plate";

/**
 * The top three: a wide gold champion card over two runner-up cards.
 *
 * The champion reads as a lockup — face, name, badge and a big score on one
 * line — while the runners-up are the compact column version of the same card.
 * Third place is amber rather than the board accent, so the three placings stay
 * legible as placings even when the accent itself is gold.
 */

const gold = accentVar("gold");
const orange = accentVar("orange");
const panel = "var(--ds-color-background-elevated)";

/** Deal each card in on the app's 70ms stagger. */
function delay(index: number): CSSProperties {
  return { "--enter-delay": `${index * 70}ms` } as CSSProperties;
}

export type RankPodiumProps = {
  entries: LeaderboardEntry[];
  meta: ScoreMeta;
  accent: string;
  /** The player's own portrait, so their card is their face and not a hash. */
  userAvatarSrc?: string;
  userFrameColor?: string;
  onOpen?: (entry: LeaderboardEntry) => void;
};

export function RankPodium({
  entries,
  meta,
  accent,
  userAvatarSrc,
  userFrameColor,
  onOpen,
}: RankPodiumProps) {
  if (entries.length < 3) return null;
  const [first, second, third] = entries;

  const tile = (
    entry: LeaderboardEntry,
    color: string,
    avatarSize: number,
    primary: boolean,
  ) => (
    <RankWinnerTile
      entry={entry}
      meta={meta}
      color={color}
      avatarSize={avatarSize}
      primary={primary}
      avatarSrc={entry.isUser ? userAvatarSrc : undefined}
      frameColor={entry.isUser ? userFrameColor : undefined}
      onOpen={onOpen}
    />
  );

  return (
    <div>
      <div className={styles.dealIn} style={delay(0)}>
        {tile(first, gold, 86, true)}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div className={styles.dealIn} style={delay(1)}>
          {tile(second, accent, 66, false)}
        </div>
        <div className={styles.dealIn} style={delay(2)}>
          {tile(third, orange, 66, false)}
        </div>
      </div>
    </div>
  );
}

export type RankWinnerTileProps = {
  entry: LeaderboardEntry;
  meta: ScoreMeta;
  /** Tints the edge, the rank numeral and the score — the placing's colour. */
  color: string;
  avatarSize: number;
  /** The champion layout: one wide row with the score set large at the end. */
  primary?: boolean;
  avatarSrc?: string;
  frameColor?: string;
  onOpen?: (entry: LeaderboardEntry) => void;
};

export function RankWinnerTile({
  entry,
  meta,
  color,
  avatarSize,
  primary = false,
  avatarSrc,
  frameColor,
  onOpen,
}: RankWinnerTileProps) {
  const plate = (
    <RankPlate
      cut={primary ? 18 : 13}
      background={plateFill(panel, primary ? 0.84 : 0.58)}
      borderColor={withAlpha(color, primary ? 0.42 : 0.26)}
      interactive={Boolean(onOpen)}
      className="h-full"
    >
      {primary ? (
        <div className="flex items-center p-4">
          <RivalAvatar
            name={entry.name}
            size={avatarSize}
            ring={color}
            team={entry.team ?? undefined}
            src={avatarSrc}
            frameColor={entry.isUser ? frameColor : undefined}
          />
          <WinnerCopy entry={entry} color={color} />
          <WinnerScore
            key={`podium-${entry.score}-${meta.unit}`}
            score={entry.score}
            unit={meta.unit}
            color={color}
          />
        </div>
      ) : (
        <div className="p-3">
          <div className="flex items-center gap-2">
            <span
              className="ds-tabular font-display font-black leading-none"
              style={{ fontSize: "15px", color }}
            >
              #{entry.rank}
            </span>
            <MovementBadge movement={entry.movement} isNew={entry.isNew} />
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <RivalAvatar
              name={entry.name}
              size={avatarSize}
              ring={color}
              team={entry.team ?? undefined}
              src={avatarSrc}
              frameColor={entry.isUser ? frameColor : undefined}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold leading-none">
                {entry.name}
              </p>
              <ScoreText
                key={`winner-${entry.rank}-${entry.score}-${meta.unit}`}
                value={entry.score}
                suffix={` ${meta.unit}`}
                className="ds-tabular mt-1 block truncate font-display font-black leading-none"
                style={{ fontSize: "13px", color }}
              />
            </div>
          </div>
        </div>
      )}
    </RankPlate>
  );

  if (!onOpen) return plate;
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="block h-full w-full cursor-pointer text-left"
      aria-label={`${entry.name}, rank ${entry.rank}`}
    >
      {plate}
    </button>
  );
}

function WinnerCopy({
  entry,
  color,
}: {
  entry: LeaderboardEntry;
  color: string;
}) {
  return (
    <div className="ml-4 min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span
          className="ds-tabular font-display font-black leading-none"
          style={{ fontSize: "17px", color }}
        >
          #{entry.rank}
        </span>
        <PremiumIcon size={18} style={{ color: gold }} />
        <MovementBadge movement={entry.movement} isNew={entry.isNew} />
      </div>

      <p className="mt-2 truncate text-xl font-bold leading-compact">
        {entry.name}
      </p>

      {entry.subtitle ? (
        <p
          className="mt-1.5 truncate font-display font-black leading-none text-muted"
          style={{ fontSize: "9px", letterSpacing: "var(--ds-tracking-wide)" }}
        >
          {entry.subtitle}
        </p>
      ) : null}

      {entry.badge ? (
        <div className="mt-2">
          <RankTag label={entry.badge} color={color} />
        </div>
      ) : null}
    </div>
  );
}

function WinnerScore({
  score,
  unit,
  color,
}: {
  score: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="ml-3 flex max-w-24.5 shrink-0 flex-col items-end">
      <ScoreText
        value={score}
        className="ds-tabular truncate font-display font-black leading-none"
        style={{ fontSize: "24px", color }}
      />
      <span
        className="mt-1 font-display font-black leading-none"
        style={{
          fontSize: "9px",
          letterSpacing: "var(--ds-tracking-label)",
          color: withAlpha(color, 0.72),
        }}
      >
        {unit}
      </span>
    </div>
  );
}
```

#### `src/features/leaderboard/components/rank-row.tsx`

**Unchanged.**

```tsx
"use client";

import { accentVar, withAlpha } from "@/design-system";

import type { LeaderboardEntry, ScoreMeta } from "../types";

import { MovementBadge, RankTag, RivalAvatar, ScoreText } from "./rank-parts";
import { plateFill, RankPlate } from "./rank-plate";

/**
 * A board row below the podium.
 *
 * The player's own row is the only one that gets an accent fill and an edge;
 * everyone else is a calm plate with no border at all, so the eye finds you
 * without the list turning into a wall of outlines.
 */

const cyan = accentVar("cyan");
const violet = accentVar("violet");
const gold = accentVar("gold");
const panel = "var(--ds-color-background-elevated)";

export type RankRowProps = {
  entry: LeaderboardEntry;
  accent: string;
  meta: ScoreMeta;
  /** The player's own portrait, used only on their row. */
  avatarSrc?: string;
  frameColor?: string;
  onOpen?: (entry: LeaderboardEntry) => void;
};

export function RankRow({
  entry,
  accent,
  meta,
  avatarSrc,
  frameColor,
  onOpen,
}: RankRowProps) {
  const isUser = entry.isUser;

  const row = (
    <RankPlate
      cut={12}
      background={isUser ? plateFill(accent, 0.1) : plateFill(panel, 0.34)}
      borderColor={isUser ? withAlpha(accent, 0.5) : undefined}
      interactive={Boolean(onOpen)}
    >
      {/* The app spaces this row unevenly — 10 before the face, 12 either
          side of the name — so each gap is stated rather than uniform. */}
      <div className="flex items-center px-3 py-2.75">
        <span
          className="ds-tabular w-8.5 shrink-0 font-display font-black leading-none"
          style={{
            fontSize: "14px",
            color: entry.rank <= 3 ? gold : "var(--ds-color-text-muted)",
          }}
        >
          #{entry.rank}
        </span>

        <RivalAvatar
          className="ml-2.5"
          name={entry.name}
          size={48}
          highlight={isUser}
          team={entry.team ?? undefined}
          src={isUser ? avatarSrc : undefined}
          frameColor={isUser ? frameColor : undefined}
        />

        <div className="ml-3 min-w-0 flex-1">
          <div className="flex items-center gap-1.75">
            <span
              className={[
                "truncate text-base leading-none",
                isUser ? "font-extrabold" : "font-semibold",
              ].join(" ")}
            >
              {entry.name}
            </span>
            {isUser ? (
              <RankTag label="YOU" color={cyan} />
            ) : entry.badge ? (
              <RankTag label={entry.badge} color={violet} />
            ) : null}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <MovementBadge movement={entry.movement} isNew={entry.isNew} />
            {entry.subtitle ? (
              <span
                className="truncate font-display font-black leading-none text-muted"
                style={{
                  fontSize: "9px",
                  letterSpacing: "var(--ds-tracking-wide)",
                }}
              >
                {entry.subtitle}
              </span>
            ) : null}
          </div>
        </div>

        <div className="ml-3 flex max-w-21.5 shrink-0 flex-col items-end">
          <ScoreText
            key={`row-${entry.rank}-${entry.score}-${meta.unit}`}
            value={entry.score}
            className="ds-tabular truncate font-display font-black leading-none"
            style={{ fontSize: "16px", color: accent }}
          />
          <span
            className="mt-1 font-display font-extrabold leading-none"
            style={{
              fontSize: "9px",
              letterSpacing: "var(--ds-tracking-label)",
              color: withAlpha("var(--ds-color-text-muted)", 0.82),
            }}
          >
            {meta.unit}
          </span>
        </div>
      </div>
    </RankPlate>
  );

  if (!onOpen) return row;
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="block w-full cursor-pointer text-left"
      aria-label={`${entry.name}, rank ${entry.rank}`}
    >
      {row}
    </button>
  );
}
```

#### `src/features/leaderboard/components/rank-user-bar.tsx`

**Unchanged.**

```tsx
"use client";

import { withAlpha } from "@/design-system";

import type { LeaderboardEntry, ScoreMeta } from "../types";

import { MovementBadge, RivalAvatar, ScoreText } from "./rank-parts";
import { plateFill, RankPlate } from "./rank-plate";

/**
 * The "where you stand" card.
 *
 * On a phone it is docked below the scroll so it never leaves; once there is
 * room it moves into the sidebar and simply stays in view. Either way it is the
 * same card — the framing is the caller's, since only the caller knows which
 * of the two it is doing.
 */

export type RankUserBarProps = {
  user: LeaderboardEntry;
  meta: ScoreMeta;
  accent: string;
  label?: string;
  /** The player's own portrait. Absent on a team board, which has a crest. */
  avatarSrc?: string;
  frameColor?: string;
  onOpen?: () => void;
  /**
   * What stands where the rank normally does. A match board uses it for the
   * two states that have no rank yet: `#--` while a card waits to settle, and
   * `UNRANKED` before one is played at all.
   */
  rankText?: string;
  /** A board the player has not scored on yet has no number to show. */
  showScore?: boolean;
  /** Turns the card into a call to action — the app's JOIN affordance. */
  ctaLabel?: string;
};

export function RankUserBar({
  user,
  meta,
  accent,
  label = "Your rank",
  avatarSrc,
  frameColor,
  onOpen,
  rankText,
  showScore = true,
  ctaLabel,
}: RankUserBarProps) {
  const card = (
    <RankPlate
      cut={18}
      background={plateFill(accent, 0.1)}
      borderColor={withAlpha(accent, 0.34)}
      interactive={Boolean(onOpen)}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <RivalAvatar
          name={user.name}
          size={54}
          highlight
          team={user.team ?? undefined}
          src={user.team ? undefined : avatarSrc}
          frameColor={user.team ? undefined : frameColor}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-display font-extrabold leading-none"
              style={{ fontSize: "11px", color: withAlpha(accent, 0.85) }}
            >
              {label}
            </span>
            <MovementBadge movement={user.movement} isNew={user.isNew} />
          </div>

          <div className="mt-0.5 flex items-baseline gap-2">
            <span
              className="ds-tabular font-display font-black leading-none"
              style={{ fontSize: rankText ? "20px" : "28px" }}
            >
              {rankText ?? `#${user.rank}`}
            </span>
            <span className="truncate text-base font-bold">{user.name}</span>
          </div>

          {user.subtitle ? (
            <p
              className="mt-1 truncate font-display font-black leading-none text-muted"
              style={{
                fontSize: "9px",
                letterSpacing: "var(--ds-tracking-ultra)",
              }}
            >
              {user.subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end">
          {ctaLabel ? (
            <span
              className="font-display font-black leading-none"
              style={{
                fontSize: "11px",
                letterSpacing: "var(--ds-tracking-label)",
                color: accent,
                border: `1px solid ${withAlpha(accent, 0.6)}`,
                padding: "7px 12px",
              }}
            >
              {ctaLabel}
            </span>
          ) : showScore ? (
            <>
              <ScoreText
                key={`user-${meta.unit}-${user.score}`}
                value={user.score}
                className="ds-tabular font-display font-black leading-none"
                style={{ fontSize: "21px", color: accent }}
              />
              <span
                className="mt-1 font-display font-black leading-none"
                style={{
                  fontSize: "9px",
                  letterSpacing: "var(--ds-tracking-label)",
                  color: withAlpha(accent, 0.7),
                }}
              >
                {meta.unit.toLowerCase()}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </RankPlate>
  );

  if (!onOpen) return card;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full cursor-pointer text-left"
      aria-label={ctaLabel ? `${ctaLabel} this board` : "Open your profile"}
    >
      {card}
    </button>
  );
}
```

#### `src/features/leaderboard/types.ts`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```ts
import type { SportTeam } from "@/domain/matches";

/**
 * One row on a rank board. `score` is whatever the active board measures; `xp`
 * is the player's canonical XP, which is what their dossier is scouted from.
 */
export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  /** >0 climbed, <0 dropped, 0 held. */
  movement: number;
  isNew: boolean;
  badge?: string;
  isUser: boolean;
  /** Set on a team row, which shows a crest and opens no dossier. */
  team?: SportTeam | null;
  /** Independent of the active board type and scope. */
  xp: number;
  /** Optional detail line beside the movement badge. */
  subtitle?: string;
};

/** What a board's score column is measured in. */
export type ScoreMeta = { unit: string };
```

The tab builds its rows from the rivals in the match data. The player would join the board only after settling a quiz card, which cannot happen on this page.

#### `src/features/matches/components/match-leaderboard-tab.tsx`

**Unchanged.**

```tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  BoltIcon,
  GameIcon,
  NoDataState,
  ScheduleIcon,
  TrophyIcon,
  UnderlineTabs,
  accentVar,
} from "@/design-system";
import type { SportMatch } from "@/domain/matches";
import {
  boardPointsFor,
  rankedBoard,
  type MatchPredictionLeaderboardEntry,
  type PredictionQuiz,
  type UserPrediction,
} from "@/domain/predictions";
import { sportModuleFor } from "@/domain/sports";
import {
  CountdownPill,
  formatBoardCountdown,
} from "@/features/leaderboard/components/rank-parts";
import { RankPodium } from "@/features/leaderboard/components/rank-podium";
import { RankRow } from "@/features/leaderboard/components/rank-row";
import { RankUserBar } from "@/features/leaderboard/components/rank-user-bar";
import type { LeaderboardEntry } from "@/features/leaderboard/types";
import { predictionFor, usePredictions } from "@/features/predictions";
import { RivalDossierOverlay, usePlayerStanding } from "@/features/profile";
import { matchDemoAnchor } from "@/mocks/matches";
import { useDemoNow } from "@/shared/hooks";

import type { MatchDetailData } from "../types";
import styles from "./match-detail.module.css";

/**
 * The TOPS tab: one prediction board per quiz set.
 *
 * The rivals are fielded by the fixture; the player only appears among them
 * once their own card has settled, which is why an unsettled entry reads as
 * pending rather than as a rank of zero. The rows themselves are the season
 * leaderboard's, so a rival looks the same here as they do there.
 */

const meta = { unit: "PTS" };

export function MatchLeaderboardTab({
  match,
  detail,
  onJoin,
}: {
  match: SportMatch;
  detail: MatchDetailData;
  onJoin?: () => void;
}) {
  const [quizId, setQuizId] = useState(detail.quizzes[0]?.id ?? "");
  const [openRival, setOpenRival] = useState<LeaderboardEntry | null>(null);
  const quiz =
    detail.quizzes.find((entry) => entry.id === quizId) ?? detail.quizzes[0];
  const predictions = usePredictions();
  const standing = usePlayerStanding();
  const accent = accentVar(sportModuleFor(match.sport).accent);
  // The shared clock keeps the pill ticking without disagreeing with the
  // server render, which cannot know what time it is on the client.
  const now = useDemoNow(matchDemoAnchor);
  const untilLock =
    match.status === "scheduled" && now != null
      ? Math.max(0, Date.parse(match.kickoff) - now) || null
      : null;

  const prediction = quiz
    ? predictionFor(predictions, match.id, quiz.id)
    : undefined;
  const entries = useMemo(
    () =>
      quiz
        ? boardEntries(
            detail.leaderboard[quiz.id] ?? [],
            quiz,
            prediction,
            standing.displayName,
          )
        : [],
    [detail.leaderboard, quiz, prediction, standing.displayName],
  );

  if (!quiz) {
    return (
      <NoDataState
        icon={TrophyIcon}
        spark={ScheduleIcon}
        accent={accentVar("gold")}
        title="No leaderboard yet"
        message="Prediction leaderboards appear when quiz sets open."
      />
    );
  }

  // A thin field skips the podium and lists everyone as flat rows.
  const usePodium = entries.length >= 3;
  const podium = usePodium ? entries.slice(0, 3) : [];
  const rest = usePodium ? entries.slice(3) : entries;
  const answered = prediction ? Object.keys(prediction.answers).length : 0;
  const canJoin = match.status === "scheduled" || prediction != null;

  /** A rival opens their dossier; the player's own row is not a link. */
  function openDossier(entry: LeaderboardEntry) {
    if (entry.isUser) return;
    setOpenRival(entry);
  }

  return (
    <div className={styles.topsTab}>
      <div className={[styles.scrollPanel, styles.topsPanel].join(" ")}>
        {detail.quizzes.length > 1 ? (
          <UnderlineTabs
            label="Leaderboard quiz selector"
            className={styles.mainTabs}
            tabs={detail.quizzes.map((entry) => ({
              id: entry.id,
              label: entry.title.toUpperCase(),
            }))}
            activeIndex={detail.quizzes.findIndex(
              (entry) => entry.id === quiz.id,
            )}
            onChange={(index) => setQuizId(detail.quizzes[index].id)}
            accent={accentVar("gold")}
          />
        ) : null}

        <div className={styles.boardMeta}>
          {untilLock == null ? (
            <span />
          ) : (
            <CountdownPill
              label="LOCKS IN"
              remaining={formatBoardCountdown(untilLock)}
            />
          )}
          <span className="flex items-center gap-4.5">
            <MetaCell
              label="PREDICTIONS"
              value={`${answered}/${quiz.questions.length}`}
              color={accentVar("gold")}
            />
            <MetaCell
              label="PLAYERS"
              value={String(entries.length)}
              color={accent}
            />
          </span>
        </div>

        <div className={styles.boardState}>
          {boardModeLabel(match, prediction, quiz)}
        </div>

        {entries.length === 0 ? (
          canJoin ? (
            <NoDataState
              icon={GameIcon}
              spark={BoltIcon}
              title="Be the 1st to play"
              message="Play this prediction quiz and set the rank to beat."
            />
          ) : (
            <NoDataState
              icon={TrophyIcon}
              spark={ScheduleIcon}
              accent={accentVar("gold")}
              title="No players yet"
              message="No prediction quiz results were submitted before this board closed."
            />
          )
        ) : (
          <>
            {usePodium ? (
              <RankPodium
                entries={podium}
                meta={meta}
                accent={accent}
                onOpen={openDossier}
              />
            ) : null}
            <section
              className={styles.rankList}
              aria-label="Leaderboard standings"
            >
              {rest.map((entry, index) => (
                <StaggeredEntrance
                  key={entry.name}
                  index={index + podium.length}
                >
                  <RankRow
                    entry={entry}
                    accent={accent}
                    meta={meta}
                    onOpen={openDossier}
                  />
                </StaggeredEntrance>
              ))}
            </section>
          </>
        )}
      </div>

      <UserBar
        entries={entries}
        prediction={prediction}
        quiz={quiz}
        accent={accent}
        name={standing.displayName}
        onJoin={onJoin}
      />

      {openRival ? (
        <RivalDossierOverlay
          name={openRival.name}
          rank={openRival.rank}
          xp={openRival.xp}
          pro={openRival.badge === "PRO"}
          userRank={
            entries.find((entry) => entry.isUser)?.rank ?? openRival.rank
          }
          onClose={() => setOpenRival(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * The board rows arrive in sequence rather than all at once, as they do in the
 * app. Capped so a long field does not keep the reader waiting.
 */
function StaggeredEntrance({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  return (
    <div
      className={styles.rankEnter}
      style={{ animationDelay: `${Math.min(index, 10) * 70}ms` }}
    >
      {children}
    </div>
  );
}

/** The docked "where you stand" card, in its three states. */
function UserBar({
  entries,
  prediction,
  quiz,
  accent,
  name,
  onJoin,
}: {
  entries: LeaderboardEntry[];
  prediction: UserPrediction | undefined;
  quiz: PredictionQuiz;
  accent: string;
  name: string;
  onJoin?: () => void;
}) {
  const total = quiz.questions.length;
  const ranked = entries.find((entry) => entry.isUser);

  if (ranked) {
    return (
      <div className={styles.localRankBar}>
        <RankUserBar
          user={{
            ...ranked,
            subtitle: `${prediction?.correctCount ?? 0} / ${total} CORRECT`,
          }}
          meta={meta}
          accent={accent}
        />
      </div>
    );
  }

  const answered = prediction ? Object.keys(prediction.answers).length : 0;
  const pending = prediction != null;
  return (
    <div className={styles.localRankBar}>
      <RankUserBar
        user={{
          rank: 0,
          name,
          score: 0,
          movement: 0,
          isNew: false,
          isUser: true,
          xp: 0,
          subtitle: pending
            ? `${answered} / ${total} LOCKED · PENDING`
            : "PLAY THE QUIZ TO ENTER",
        }}
        meta={meta}
        accent={accent}
        label="Your standing"
        rankText={pending ? "#--" : "UNRANKED"}
        showScore={false}
        ctaLabel={pending ? undefined : "JOIN"}
        onOpen={pending ? undefined : onJoin}
      />
    </div>
  );
}

function MetaCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <span className="grid justify-items-end">
      <small
        style={{
          color: "var(--ds-color-text-muted)",
          fontSize: "8px",
          letterSpacing: "var(--ds-tracking-ultra)",
        }}
      >
        {label}
      </small>
      <b
        className="ds-tabular font-display"
        style={{ color, fontSize: "14px", marginTop: "3px" }}
      >
        {value}
      </b>
    </span>
  );
}

/**
 * The board rows. The player joins the field only once their card is settled —
 * before that there is no score to rank them by.
 */
function boardEntries(
  rivals: MatchPredictionLeaderboardEntry[],
  quiz: PredictionQuiz,
  prediction: UserPrediction | undefined,
  name: string,
): LeaderboardEntry[] {
  const field = [...rivals];
  if (prediction?.status === "settled") {
    const correct = prediction.correctCount ?? 0;
    const answered = Object.keys(prediction.answers).length;
    field.push({
      rank: 0,
      name,
      points: boardPointsFor(correct, quiz.questions.length, answered),
      correct,
      movement: 0,
      isUser: true,
      isNew: false,
    });
  }
  return rankedBoard(field).map((entry) => ({
    rank: entry.rank,
    name: entry.name,
    score: entry.points,
    movement: entry.movement,
    isNew: entry.isNew,
    badge: entry.badge,
    isUser: entry.isUser,
    xp: entry.points,
    subtitle: `${entry.correct} CORRECT`,
  }));
}

/** The state-driven caption over the board's hairline. */
function boardModeLabel(
  match: SportMatch,
  prediction: UserPrediction | undefined,
  quiz: PredictionQuiz,
): string {
  if (prediction?.status === "settled") return "FINAL RESULTS";
  if (match.status === "finished") {
    return prediction &&
      quiz.questions.every(
        (question) =>
          question.forcedVoid ||
          question.settledOptionIndex != null ||
          question.settledHomeScore != null,
      )
      ? "FINAL RANKS READY"
      : "MATCH CLOSED";
  }
  if (match.status === "live") return "LOCKED PICKS";
  if (prediction?.status === "locked") return "LOCKED IN · CROWD VOTES";
  if (prediction) return "DRAFT ACTIVE · REVIEW & LOCK";
  return "JOIN BEFORE LOCK";
}
```

## Step 13: the STATS tab

`match-stats-shell.tsx` holds the pieces every section shares: the row surface, the comparison row, the team key and the MATCH INTEL card.

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
.eventMinute {
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

#### `src/features/matches/components/match-scoreboard.tsx`

**Adapted.** StatOz chooses between five sports' reports here. This keeps the football one.

```tsx
"use client";

import type { MatchDetailScoreboard, SportMatch } from "@/domain/matches";

import { FootballStatsView } from "./football-stats-view";

/**
 * The STATS tab.
 *
 * StatOz picks a report by sport here. This page is a football match, so the
 * football report is the only one wired in.
 */
export function MatchScoreboard({
  match,
  scoreboard,
}: {
  match: SportMatch;
  scoreboard: MatchDetailScoreboard;
}) {
  return <FootballStatsView match={match} scoreboard={scoreboard} />;
}
```

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

OVERVIEW's timeline and the COMMENTARY list:

#### `src/features/matches/components/match-report-parts.tsx`

**Trimmed.** StatOz's file holds more. This keeps the parts this page uses, each copied exactly.

```tsx
"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import {
  CheckIcon,
  FootballIcon,
  HistoryIcon,
  InsightsIcon,
  MicIcon,
  SwapHorizIcon,
  accentVar,
} from "@/design-system";
import type {
  MatchDetailCommentary,
  MatchDetailTimelineEvent,
  SportMatch,
} from "@/domain/matches";

import { EmptyPanel, SectionHeading, StatsRow } from "./match-stats-shell";
import styles from "./match-stats.module.css";

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
```

MOMENTUM's chart and shot map:

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

LINEUPS and the player card:

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

## Step 14: the route, the layouts and the files to copy

The page looks the fixture up by id and returns a 404 for any other id.

#### `src/app/(platform)/matches/[matchId]/page.tsx`

**Unchanged.**

```tsx
import { matchById, matchDetailFor } from "@/mocks/matches";
import { MatchSummaryHeader } from "@/features/matches/components/match-summary-header";
import { MatchTabsView } from "@/features/matches/components/match-tabs-view";
import { MatchDetailContext } from "@/features/matches/components/match-detail-context";
import { allMockMatchIds } from "@/mocks/matches";
import { notFound } from "next/navigation";

import styles from "@/features/matches/components/match-detail.module.css";

export function generateStaticParams() {
  return allMockMatchIds.map((matchId) => ({ matchId }));
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const resolvedParams = await params;
  const match = matchById(resolvedParams.matchId);

  if (!match) {
    notFound();
  }
  const detail = matchDetailFor(match);

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <MatchSummaryHeader match={match} />
        <MatchTabsView match={match} detail={detail} />
        <MatchDetailContext match={match} />
      </div>
    </div>
  );
}
```

The root layout loads the two fonts and wraps the app in `AuthProvider`.

#### `src/app/layout.tsx`

**Adapted.** StatOz's root layout also mounts the streak celebration, which nothing on this page can trigger. The `children` prop is typed directly instead of with Next's generated `LayoutProps` helper.

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";

import { AuthProvider } from "@/features/auth";

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
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
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

The platform layout places the shell around every page in the `(platform)` folder.

#### `src/app/(platform)/layout.tsx`

**Adapted.** The `children` prop is typed directly instead of with Next's generated `LayoutProps` helper, so the file does not depend on generated route types.

```tsx
import type { CSSProperties } from "react";

import { AdSlot } from "@/features/ads";
import {
  PlatformBreadcrumbs,
  PlatformNav,
  PlatformTopBar,
} from "@/features/shell";

/**
 * The platform shell. Navigation sits at the bottom on phones and moves to a
 * side rail once there is room for it.
 */
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh"
      style={
        {
          background: "var(--ds-gradient-app-background)",
          /**
           * The bar nav's height, published because it is sticky and therefore
           * floats over the page: anything a screen docks above it — the
           * leaderboard's YOUR RANK card — has to offset by exactly this. The
           * nav below is sized from the same value, so the two cannot drift.
           */
          "--platform-nav-height": "5.25rem",
        } as CSSProperties
      }
    >
      <div className="mx-auto grid min-h-dvh w-full max-w-[104rem] grid-cols-1 2xl:grid-cols-[10rem_minmax(0,80rem)_10rem] 2xl:gap-4 2xl:px-4">
        <div className="hidden 2xl:block">
          <div className="sticky top-4">
            <AdSlot placement="platform-left-rail" />
          </div>
        </div>

        <div className="mx-auto flex min-h-dvh w-full max-w-7xl min-w-0 flex-col lg:flex-row 2xl:mx-0">
          <div className="hidden shrink-0 lg:block lg:w-56">
            <div className="sticky top-0 h-dvh">
              <PlatformNav orientation="rail" />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <PlatformTopBar />
            <PlatformBreadcrumbs />
            <main className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
              {children}
            </main>
          </div>

          <PlatformNav className="sticky bottom-0 z-20 h-[calc(var(--platform-nav-height)+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] lg:hidden" />
        </div>

        <div className="hidden 2xl:block">
          <div className="sticky top-4">
            <AdSlot placement="platform-right-rail" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Files to copy from StatOz

Copy each to the same path.

| File                                          | Size  |
| --------------------------------------------- | ----- |
| `src/app/fonts/onest-latin-variable.woff2`    | 33 KB |
| `src/app/fonts/orbitron-latin-variable.woff2` | 12 KB |

| File                                                 | Size   |
| ---------------------------------------------------- | ------ |
| `src/mocks/snapshots/card-game/football-revamp.json` | 140 KB |

| File                                    | Size   |
| --------------------------------------- | ------ |
| `public/assets/avatars/adams.webp`      | 92 KB  |
| `public/assets/avatars/bellingham.webp` | 86 KB  |
| `public/assets/avatars/camavinga.webp`  | 84 KB  |
| `public/assets/avatars/ndiaye.webp`     | 110 KB |
| `public/assets/avatars/raphinha.webp`   | 99 KB  |
| `public/assets/avatars/rodri.webp`      | 92 KB  |

Run the app and open `/matches/401879318`. Then work through the [checklist](#checklist).

## If the project already has the earlier guides

This guide is written for a project that has none of them. Its files use the same paths as the earlier guides, and many are cut-down versions of theirs.

**If the project has `MATCH_DETAIL.md` and the three tab guides, do not paste this guide over them.** That project already shows this page, and every other fixture, with fuller files. Replacing them with the trimmed ones here would break the other fixtures. This guide adds only the following, and combining them with the series was not built or tested:

| What                  | Files                                                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell around the page | `src/features/shell/` (the series has only the top bar from `TOP_BAR.md`), `src/app/(platform)/layout.tsx`, `src/shared/config/navigation.ts`, and the `NavRail` and `Breadcrumbs` components |
| Ad rails              | `src/features/ads/`, `src/mocks/ads/`, one SVG                                                                                                                                                |
| Account prompt        | `src/features/auth/components/auth-provider.tsx`, `auth-gate-dialog.tsx`, `return-path.ts`, `types.ts`, and the `Button` component                                                            |

Two things need care when adding those. The series' auth stand-in exports its own `useRequireAuth` and treats everyone as logged in, so the prompt never opens until that is replaced by the provider's. And `src/design-system/index.ts`, `src/shared/config/index.ts` and `glyphs.tsx` need the extra exports and icons merged in, not replaced.

**If the project has only `NAV_BAR.md`, `TOP_BAR.md` or `SPORTS_SECTION.md`**, files with the same path are either identical or differ in what they export. Compare before replacing, and where both versions export things, keep both sets.

## What differs from StatOz

1. **One fixture, one sport.** Other match ids return 404. Five files were edited to drop the other four sports (`match-scoreboard.tsx`, `details/index.ts`, `details/report.ts`, `quizzes/index.ts`, `catalog.ts`).
2. **The PICKS panel has no market list or trade sheet.** This match has no markets, so those parts are left out.
3. **Team colours are written into `football.ts`.** StatOz looks them up at runtime in a generated palette file of about 8,000 lines. The values here are the looked-up ones.
4. **The session, wallet, streak and player are stand-ins**, and every visitor is a guest (steps 6 and 7).
5. **A tapped rival opens a placeholder card**, not StatOz's rival profile.
6. **The root layout does not mount the streak celebration.** Nothing on this page can trigger it.
7. **Files are trimmed to what this page uses.**

## Quirks carried over unchanged

These are in StatOz today and are reproduced as they are, so the port matches. Fix them if you prefer.

1. **Below 1024px the page has no way back.** It covers the navigation and has no back or close control of its own. The visitor leaves with the browser's back button.
2. **Reloading returns to PREDICT.** The selected tab is not kept in the URL, apart from the `#picks` shortcut.
3. **A rival can have more correct answers than the quiz has questions.** `Invincible51` shows `5 CORRECT` on the four-question Scoreline board. The rivals' figures are generated without reference to the quiz.
4. **The top bar shows a streak that the stand-in invents**, as StatOz's seed does, and its link's label reads `0 days` until the page has loaded.
5. **The player card's xG figure is always a dash.** The snapshot has no expected-goals data.
6. **StatOz's dev server logs an image warning on the TOPS tab**, asking for `loading="eager"` on the first-place portrait. It is a performance hint and does not affect what is drawn.

## Checklist

At `/matches/401879318` in a window at least 1024px wide:

- [ ] A side rail lists SPORTS, SHOP, TOP and LOG IN, with SPORTS highlighted.
- [ ] The top bar reads `StatOz`, with a streak of 6 and a balance of 1,000.
- [ ] Breadcrumbs read `HOME > MATCH DETAILS`.
- [ ] The header reads `FT`, with `2 - 3` between a black Fulham crest and a blue Chelsea crest.
- [ ] PREDICT is selected and shows `MATCH ENDED` above two cards tagged `FINAL RESULTS`.
- [ ] Clicking a card opens `LOG IN TO PREDICT`. Escape closes it.
- [ ] Clicking LOG IN in the rail opens `LOG IN TO VIEW YOUR PROFILE`.
- [ ] A MATCH INTEL panel on the right reads `EPL`, `FINAL`, `24 AUG · 19:00`, `UP TO 160 XP`, `98.6K OZ`, with `Match Circle 3` beneath.
- [ ] PICKS shows `NO PICKS FOR THIS MATCH`.
- [ ] TOPS shows `monika` first with 601 points, then `Zenith` and `Rookie7`, and a bar reading `UNRANKED`. Clicking the bar returns to PREDICT.
- [ ] STATS shows four chips. OVERVIEW starts with possession at `61.5%` and `38.5%`.
- [ ] Clicking João Pedro's goal at 1' in the timeline opens a sentence describing it.
- [ ] MOMENTUM shows the pressure chart and a shot map reading `31 ATTEMPTS`. GOALS reduces it to 4.
- [ ] LINEUPS shows Fulham in a 4-2-3-1. Clicking `B. Leno` opens a MATCH DOSSIER card for Bernd Leno.
- [ ] COMMENTARY reads `104 ENTRIES`.

In a window at least 1536px wide:

- [ ] A dashed `DEMO AD SPACE` rail appears on each side.

In a phone-sized window:

- [ ] The match page fills the screen, with no rail, top bar or breadcrumbs, and `Match Circle 3` docked at the bottom.

Finally:

- [ ] `/matches/anything-else` shows the 404 page.
- [ ] `npx tsc --noEmit` reports no errors.
- [ ] `next build` lists `/matches/401879318`.
