# Sports section: the MATCH and GAMES home hub

This guide rebuilds StatOz's **SPORTS** destination, the page at `/`, in another Next.js App Router project. It contains every source file the page needs, so it can be followed without access to the StatOz repository. The one exception is the two font files, covered in step 9.

The page has two tabs. **MATCH** shows fixtures (scheduled, live and finished matches) and prediction markets. **GAMES** shows the playable mini-games. A strip of sport icons under the tabs narrows either one to a single sport.

**Checked on 10 October 2026.** The 81 files below were assembled into a standalone app on Next.js 16.3.2, React 19.2.8 and Tailwind CSS 4.3.3. That app type-checks, builds, and was compared in a browser with the StatOz page in every state: both tabs, trending and per-sport feeds, and the all-sports selector. Mock data and crest colours are identical to StatOz.

## Contents

1. [What you are building](#what-you-are-building)
2. [Scope](#scope)
3. [How it behaves](#how-it-behaves)
4. [Requirements](#requirements)
5. [How to use this guide](#how-to-use-this-guide)
6. [Step 1: styles](#step-1-styles)
7. [Step 2: shared helpers](#step-2-shared-helpers)
8. [Step 3: the sports list](#step-3-the-sports-list)
9. [Step 4: design-system pieces](#step-4-design-system-pieces)
10. [Step 5: data model and mock data](#step-5-data-model-and-mock-data)
11. [Step 6: adapters for auth and profile](#step-6-adapters-for-auth-and-profile)
12. [Step 7: the MATCH components](#step-7-the-match-components)
13. [Step 8: the GAMES components](#step-8-the-games-components)
14. [Step 9: the hub, the page and its layout](#step-9-the-hub-the-page-and-its-layout)
15. [Connecting real data and auth](#connecting-real-data-and-auth)
16. [What differs from StatOz](#what-differs-from-statoz)
17. [Quirks carried over unchanged](#quirks-carried-over-unchanged)
18. [Checklist](#checklist)

## What you are building

```
┌────────────────────────────────────────────────┐
│        MATCH           │         GAMES         │  GlidingTabs (61px)
├────────────────────────────────────────────────┤
│ Trending Football Cricket Basketball ··· │search│  SportHubTabs (50px, icons only)
├────────────────────────────────────────────────┤
│                                                │
│   the feed for the chosen tab and sport        │
│                                                │
└────────────────────────────────────────────────┘
```

The feed has four states:

| Tab   | Sport strip | Component           | What it shows                                                         |
| ----- | ----------- | ------------------- | --------------------------------------------------------------------- |
| MATCH | Trending    | `TrendingFeed`      | A curated grid of 11 tiles: fixtures, prediction missions and markets |
| MATCH | A sport     | `SportMatchFeed`    | That sport's fixtures, one day at a time, grouped by league           |
| GAMES | Trending    | `GamesTrendingFeed` | A curated grid of 10 game tiles                                       |
| GAMES | A sport     | `SportGameDeck`     | That sport's games: featured banners, then a QUICK PLAY shelf         |

The component tree:

```
page.tsx (server)
└─ HomeHub (client)                     owns tab, the sport per tab, and the selector
   ├─ GlidingTabs                       MATCH | GAMES
   ├─ SportHubTabs → UnderlineTabs      Trending, three sports, ALL SPORTS (+ search on MATCH)
   ├─ MATCH, Trending → TrendingFeed    (server-rendered, passed in as a prop)
   │     └─ BentoGrid → SportFixtureCard | TrendingPredictCard | TrendingMarketCard
   ├─ MATCH, a sport  → SportMatchFeed  (client)
   │     └─ day navigator → league groups → SportFixtureCard
   ├─ GAMES, Trending → GamesTrendingFeed (server-rendered, passed in)
   │     └─ BentoGrid → ArcadeHeroTile | QuickGameTile
   ├─ GAMES, a sport  → SportGameDeck   (server-rendered; all five passed in)
   │     └─ ArcadeHeroTile banners + QUICK PLAY shelf of QuickGameTile
   └─ AllSportsSelector                 full-screen <dialog>
```

Terms used in this guide:

- **Fixture**: one match, with two teams, a kick-off time and a status.
- **Market**: a prediction question with several outcomes, each priced as a probability.
- **Bento**: a grid whose tiles come in three sizes (square, wide, tall) and pack together.
- **Oz**: StatOz's in-app currency. `VOL 98.6K OZ` is how much has been staked.
- **XP**: the points a correct prediction earns.
- **Hero tile / quick tile**: the large illustrated game tile, and the compact one.

## Scope

This guide covers the page at `/` and everything drawn on it. It does not cover the pages its tiles link to. Those links will return 404 until you build them:

| Link                      | Comes from                                                       |
| ------------------------- | ---------------------------------------------------------------- |
| `/matches/{id}`           | Every fixture card and PREDICT tile                              |
| `/matches/search`         | The search button on the sport strip (MATCH tab only)            |
| `/picks/{id}`             | PICK and FUTURE market tiles                                     |
| `/leagues/{id}`           | The league heading in a sport feed (labelled STANDING)           |
| `/leagues/{id}?tab=games` | VIEW MORE under a league with more than three fixtures           |
| `/play/...`               | Every game tile. The 18 paths are in `game-registry.ts` (step 5) |

The navigation shell around the page (side rail, bottom bar) is in `NAV_BAR.md`. StatOz also has a top bar, breadcrumbs and ad slots around this page; none of those are included.

## How it behaves

### State and the URL

`HomeHub` holds four pieces of state: the active tab, the sport chosen on MATCH, the sport chosen on GAMES, and whether the all-sports selector is open. A sport of `null` means Trending.

- **Each tab remembers its own sport.** Choosing Cricket on MATCH and then switching to GAMES still shows GAMES on whatever it was on before.
- **The URL mirrors the state** as `/?tab=match&sport=cricket`. `tab` is `match` or `games`. `sport` is left out for Trending.
- **The URL is read once, on first render.** `sport` applies only to the tab named by `tab`. An unknown sport is ignored.
- **Every change calls `router.replace`**, so tab and sport changes do not add browser history entries.
- **`page.tsx` wraps the hub in `<Suspense>`.** `useSearchParams` requires it for the page to be prerendered.

The four feeds are built on the server where possible. `TrendingFeed`, `GamesTrendingFeed` and all five `SportGameDeck`s are rendered by `page.tsx` and passed to the hub as props, so switching between them never calls the server. `SportMatchFeed` is a client component because it holds the selected day.

### MATCH / GAMES tabs (`GlidingTabs`)

- One coloured plate sits behind the active tab and slides to the other over 300ms. It is cyan on MATCH and orange on GAMES, and its two bottom corners are cut at 16px.
- The active label is dark (`--ds-color-text-inverse`). The inactive one is tinted towards its own colour.
- Left and right arrow keys move between the tabs and select them.

### Sport strip (`SportHubTabs`)

- Five icon-only buttons: Trending, Football, Cricket, Basketball, and ALL SPORTS. Each has an `aria-label` and a tooltip.
- A glowing 3px underline marks the selection and slides between tabs. It takes the selected sport's colour, or cyan on Trending.
- **Tennis and motorsport have no button.** They are chosen through ALL SPORTS. While one of them is selected, no button is underlined.
- ALL SPORTS opens the selector. It is a plain button, not a tab.
- The search button appears on the MATCH tab only.
- Arrow keys, Home and End move between the buttons.

Sport colours come from `sportModules` (step 3):

| Sport      | Accent token | Colour  |
| ---------- | ------------ | ------- |
| Football   | `cyan`       | #5cdfff |
| Cricket    | `white`      | #ffffff |
| Basketball | `gold`       | #fdc700 |
| Tennis     | `lime`       | #51ff94 |
| Motorsport | `racing`     | #f42d29 |

### All-sports selector (`AllSportsSelector`)

- A native `<dialog>` opened with `showModal()` and sized to cover the viewport. The browser traps focus inside it and closes it on Escape.
- It lists Trending and all five sports. Each row shows an icon, a name, a description and a count.
- On MATCH the count reads `1 LIVE · 11` when a sport has live fixtures (with a red dot), or `11 FIXTURES` when it has none. On GAMES it reads `6 GAMES`.
- The current selection has a solid coloured edge and `aria-pressed="true"`.
- Choosing a row applies it and closes the dialog.

### Trending grid on MATCH (`TrendingFeed`)

The grid is two columns on phones, three from 768px and four from 1024px. Rows are at least 10.5rem tall. Each tile declares a `span`: `square` (1×1), `wide` (2×1) or `tall` (1×2). Tiles are packed densely, so a later small tile can fill a gap left earlier.

There are four kinds of tile, listed in `trending-catalog.ts`:

| Kind      | Looks like                                                      | Links to        |
| --------- | --------------------------------------------------------------- | --------------- |
| `match`   | A fixture card (described next)                                 | `/matches/{id}` |
| `predict` | Tag PREDICT, both crests with VS between them, `+90 XP MISSION` | `/matches/{id}` |
| `pick`    | Tag PICK, the question, the leading outcome and its percentage  | `/picks/{id}`   |
| `future`  | The same as `pick`, tagged FUTURE                               | `/picks/{id}`   |

- Every tile ends in a footer with its status on the left and `VOL … OZ` on the right.
- A market tile shows the leader's change in points, green if it rose and red if it fell. The change pulses inside a box when the market is **hot**: the leader moved 5 points or more between the last two price ticks and the market is not settled. A market with no price history uses the leader's `delta` field instead.
- A `tall` market tile lists up to four outcomes, each with a progress bar. The catalog has none at present.
- A tile whose match or market id is not found shows SIGNAL UNAVAILABLE.

### Fixture card (`SportFixtureCard`)

- **Shape.** A card with a notch cut into the top edge. The notch holds the status: the kick-off time, `LIVE 67′`, or `Finished`.
- **Edge colour.** Red when live, slate when finished, teal when scheduled. In the trending grid it is always teal.
- **Score.** Shown between the crests as `2 - 1`. When the match is finished, the losing side's score and name are dimmed.
- **Cricket.** Each innings score sits beside its team's crest. `161/5 (18/20 ov, target 156)` is split into the score and a smaller line under the team name.
- **Tennis.** Set scores appear as small chips under the match score.
- **Motorsport.** The card shows one crest and the race name. The `home` team is the race; `away` is a placeholder.
- **Result line.** `resultLine` is printed under the teams for cricket, tennis and motorsport. Football and basketball do not show it.
- **Footer.** `IN PLAY`, `FULL TIME` or `POTENTIAL +90 XP`, with the volume on the right.
- The whole card is one link, with an `aria-label` naming both teams and the status.

### Per-sport fixtures (`SportMatchFeed`)

- **Day navigator.** A heading such as `TODAY (4)` with previous and next arrows and a calendar button. The number is the count of fixtures on that day. The calendar button is a native date input laid invisibly over the icon.
- **Motorsport works in weeks.** Its heading reads `THIS WEEK`, `NEXT WEEK` and so on, and a week runs Monday to Sunday.
- **Swiping** left or right by 80px or more moves to the next or previous day.
- **What is listed.** In day mode the feed shows the selected day _and every later day_, each later day under its own date heading such as `26 AUG`. In week mode it shows that week only, with a date heading over every day.
- **Grouping.** Fixtures are grouped by league. A league shows at most three, then a VIEW MORE link.
- **Layout.** One column on phones, two from 768px, three from 1280px.
- **Animation.** Cards fade and slide in, 45ms apart, from the side you navigated towards.
- **Empty days** show `NO GAMES ON 28 AUG` (or `NO RACES THIS WEEK`).
- **YOUR CLUB.** If the player follows a club that has a fixture in the selected period, that fixture is pinned at the top under a gold YOUR CLUB heading, and the club's name on the card is printed in the club's colour. Live beats scheduled, which beats finished. This is off until you connect the profile adapter (step 6).
- **"Today" is a fixed date.** `matchDemoAnchor` in `catalog.ts` is `2026-08-25`, so the demo's TODAY and TOMORROW labels never drift. Replace it when you connect real data.
- **All dates are formatted in UTC**, so the server and the browser produce the same text.

### GAMES tab

- **Hero tile (`ArcadeHeroTile`).** An illustration on the right, a small badge, the title, and a call to action along the bottom, all in the game's colour. The featured game (Pitch Duel) also has a soft glow.
- **Quick tile (`QuickGameTile`).** A boxed icon, a FREE pill, the title and a subtitle, with the illustration cropped into the bottom-right corner.
- **Trending arcade (`GamesTrendingFeed`).** The same bento grid as MATCH, with 10 tiles.
- **Sport deck (`SportGameDeck`).** The sport's hero games as banners (one column; two from 768px and three from 1280px when there are several), then a QUICK PLAY heading with a count, then the quick tiles (two columns; three from 640px; four from 1024px).
- **Signed-out players** see LOG IN REQUIRED and LOG IN TO PLAY on hero tiles and a lock with LOG IN on quick tiles. The tile becomes a button that opens the login prompt instead of a link. This is off until you connect the auth adapter (step 6).

### Accessibility

- Both tab strips use `role="tablist"` and `role="tab"` with `aria-selected`. Only the selected tab is in the tab order, plus the ALL SPORTS button on the sport strip.
- Every card is a single link or button with a descriptive `aria-label`. Decorative layers are `aria-hidden`.
- Icons are hidden from screen readers unless given a `title`.
- Team crests have `role="img"` and the team's full name as their label.
- The day navigator's heading is an `aria-live` region, so a change of day is announced.
- A clipped card cannot show a normal focus outline, because the clip path crops it. `SignalPanel` tiles and trending fixture cards turn their edge solid under keyboard focus instead, and fixture cards in a sport feed draw the outline inside the card. Game tiles do neither; see [quirks](#quirks-carried-over-unchanged).
- `globals.css` shortens all animations for people who prefer reduced motion.

## Requirements

- **Next.js 15 or later with the App Router.** Built here on 16.3.2 with React 19.2.8.
- **Tailwind CSS v4** through `@tailwindcss/postcss`. Built here on 4.3.3. The code uses v4-only syntax: `@theme inline`, variable shorthands such as `bg-(--panel-edge)`, and fractional spacing such as `h-12.5`.
- **A `@/` path alias pointing at `src/`.**
- **The Onest and Orbitron fonts**, exposed as the CSS variables `--font-onest` and `--font-orbitron` (step 9).
- No other packages. Icons are inline SVG and there is no state library.

`next.config` needs no changes. The game illustrations are SVG files loaded through `next/image`, which Next serves as they are.

## How to use this guide

Create each file below at the path shown. **Paths match StatOz's own folder layout, so every import works without editing.** If you move a file, update the imports that point at it.

Each file is labelled:

- **Unchanged**: identical to the StatOz file.
- **Adapted**: the StatOz file with a stated change, made so the section stands alone.
- **Trimmed**: StatOz's file exports more; this version keeps only what the section uses.
- **New**: written for this guide, to stand in for a part of StatOz that is out of scope.

There are 56 unchanged, 10 adapted, 10 trimmed and 5 new files.

**If you already followed `NAV_BAR.md`:**

- Replace its `globals.css` with the two style files in step 1. They contain everything the navigation needs and more.
- Keep its root layout, which is the same as the one in step 9.
- Keep its `(app)/layout.tsx` navigation shell, and skip this guide's `(platform)/layout.tsx`. Put `page.tsx` and `_components/` inside `(app)/` instead. Route group names do not appear in the URL, so the page is still served at `/`.

All 81 files. Those with no tag are unchanged:

```
├── src/
│   ├── design-system/
│   │   ├── styles/
│   │   │   └── tokens.css
│   │   ├── tokens/
│   │   │   └── colors.ts   [trimmed]
│   │   ├── icons/
│   │   │   ├── icon.tsx
│   │   │   └── glyphs.tsx   [trimmed]
│   │   ├── components/
│   │   │   ├── navigation/
│   │   │   │   ├── gliding-tabs/
│   │   │   │   │   └── gliding-tabs.tsx
│   │   │   │   └── underline-tabs/
│   │   │   │       └── underline-tabs.tsx
│   │   │   ├── layout/bento-grid/
│   │   │   │   └── bento-grid.tsx
│   │   │   ├── data-display/
│   │   │   │   ├── signal-panel/
│   │   │   │   │   └── signal-panel.tsx
│   │   │   │   ├── hud-panel/
│   │   │   │   │   └── hud-panel.tsx
│   │   │   │   └── badge/
│   │   │   │       └── badge.tsx
│   │   │   └── feedback/progress/
│   │   │       └── progress.tsx
│   │   └── index.ts   [trimmed]
│   ├── app/
│   │   ├── globals.css
│   │   ├── (platform)/
│   │   │   ├── _components/
│   │   │   │   └── home-hub.tsx   [adapted]
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx   [new]
│   │   └── layout.tsx   [new]
│   ├── shared/
│   │   ├── config/
│   │   │   ├── base-path.ts
│   │   │   └── index.ts   [trimmed]
│   │   └── utils/
│   │       ├── format.ts
│   │       └── index.ts   [trimmed]
│   ├── domain/
│   │   ├── sports/
│   │   │   ├── sport.ts
│   │   │   └── index.ts
│   │   ├── matches/
│   │   │   ├── match.ts   [adapted]
│   │   │   └── index.ts   [trimmed]
│   │   └── predictions/
│   │       ├── market.ts
│   │       └── index.ts   [trimmed]
│   ├── mocks/
│   │   ├── matches/
│   │   │   ├── definitions.ts   [adapted]
│   │   │   ├── football.ts   [adapted]
│   │   │   ├── cricket.ts   [adapted]
│   │   │   ├── basketball.ts   [adapted]
│   │   │   ├── tennis.ts
│   │   │   ├── motorsport.ts
│   │   │   ├── catalog.ts
│   │   │   ├── markets.ts   [adapted]
│   │   │   ├── trending-catalog.ts
│   │   │   └── index.ts   [trimmed]
│   │   ├── games/
│   │   │   ├── game-registry.ts
│   │   │   ├── sport-decks.ts
│   │   │   ├── trending-catalog.ts
│   │   │   └── index.ts
│   │   └── onboarding/
│   │       └── index.ts   [new]
│   └── features/
│       ├── games/
│       │   ├── types.ts
│       │   ├── components/
│       │   │   ├── game-scenes.tsx
│       │   │   ├── arcade-hero-tile.tsx   [adapted]
│       │   │   ├── quick-game-tile.tsx
│       │   │   ├── quick-play-header.tsx
│       │   │   ├── games-trending-feed.tsx
│       │   │   └── sport-game-deck.tsx
│       │   └── index.ts   [trimmed]
│       ├── auth/
│       │   └── index.ts   [new]
│       ├── profile/
│       │   └── index.ts   [new]
│       └── matches/
│           ├── components/
│           │   ├── sport-icon.tsx
│           │   ├── sport-hub-tabs.tsx
│           │   ├── all-sports-selector.tsx
│           │   ├── all-sports-selector.module.css
│           │   ├── team-badge.tsx
│           │   ├── team-badge.module.css
│           │   ├── tile-meta-row.tsx
│           │   ├── tile-footer.tsx
│           │   ├── sport-fixture-card.tsx
│           │   ├── sport-fixture-card.module.css
│           │   ├── trending-match-card.tsx
│           │   ├── trending-predict-card.tsx
│           │   ├── trending-market-card.tsx   [adapted]
│           │   ├── trending-feed.tsx
│           │   ├── sport-match-feed.tsx   [adapted]
│           │   └── sport-match-feed.module.css
│           └── index.ts   [trimmed]
└── public/assets/games/
    ├── bingo.svg
    ├── final-over.svg
    ├── football-chess.svg
    ├── grand-prix-dash.svg
    ├── guess-driver.svg
    ├── guess-player.svg
    ├── guess-winner.svg
    ├── hoop-duel.svg
    ├── penalty-shootout.svg
    ├── pitch-duel.svg
    ├── quiz.svg
    └── tennis-rally.svg
```

## Step 1: styles

`tokens.css` defines every design value as a CSS variable prefixed `--ds-`. `globals.css` imports it and maps those variables to Tailwind class names, which is what makes classes such as `bg-surface-nav`, `text-muted`, `font-display` and `tracking-ultra` work.

Both are copied whole. The section does not use every token, but unused ones are harmless and keeping the file intact avoids missing one.

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

`publicAsset` prefixes a path with `NEXT_PUBLIC_BASE_PATH` when the app is served from a sub-path, and is otherwise a no-op. The format helpers produce the text on the cards, in UTC.

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

**Trimmed.** StatOz also exports its navigation config from here.

```ts
export * from "./base-path";
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

#### `src/shared/utils/index.ts`

**Trimmed.** StatOz also exports hashing and player-tag helpers from here.

```ts
export * from "./format";
```

## Step 3: the sports list

This is the single list of sports. Every sport's label, short code and colour come from here, and `sportOrder` sets the order used everywhere. To add a sport, add it to the `Sport` type, `sportModules` and `sportOrder`; TypeScript then points at every other place that needs an entry.

#### `src/domain/sports/sport.ts`

**Unchanged.**

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

/** Browse order for the sport strip. */
export const sportOrder: Sport[] = [
  "football",
  "cricket",
  "basketball",
  "tennis",
  "motorsport",
];

/** Ordered tab palette, derived from the same source as every sport surface. */
export const sportTabColors: SportAccent[] = sportOrder.map(
  (sport) => sportModules[sport].accent,
);

export function sportModuleFor(sport: Sport): SportModule {
  return sportModules[sport];
}
```

#### `src/domain/sports/index.ts`

**Unchanged.**

```ts
export * from "./sport";
```

## Step 4: design-system pieces

These are the general-purpose building blocks. None of them knows anything about sports.

### Colours and icons

`accentVar("cyan")` returns `var(--ds-color-accent-cyan)`. Components pass that string around as their colour, so one prop can drive an edge, a glow and a label.

Icons are filled with `currentColor`, so they take the colour of the text around them.

#### `src/design-system/tokens/colors.ts`

**Trimmed.** StatOz's file holds the whole palette as TypeScript. This keeps the accent names and the helper that turns one into a CSS variable.

```ts
/**
 * Accent token names. Each one is backed by `--ds-color-accent-<name>` in
 * `design-system/styles/tokens.css`.
 */
export type AccentName =
  | "white"
  | "cyan"
  | "violet"
  | "orange"
  | "lime"
  | "gold"
  | "blue"
  | "racing"
  | "pink";

/** The CSS custom property backing an accent, for inline color props. */
export function accentVar(name: AccentName): string {
  return `var(--ds-color-accent-${name})`;
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

#### `src/design-system/icons/glyphs.tsx`

**Trimmed.** StatOz's file has 111 icons. These are the 20 this page draws, each copied exactly.

```tsx
import { Icon, type IconProps } from "./icon";

/* -------------------------------------------------------------------------
 * The glyphs the sports section draws. Most are Material Symbols paths,
 * inlined to keep the project free of an icon dependency; MatchIcon and
 * GameIcon are StatOz's own. All take `currentColor`.
 * ---------------------------------------------------------------------- */

/** Material Symbols `sports_soccer` (outlined filled). */
export function FootballIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm242 112q26 0 51-4t49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4Zm-90-200h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
    </Icon>
  );
}

/** Material Symbols `sports_cricket` (outlined filled). */
export function CricketIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M600-392 488-280q-12 12-28 12t-28-12L92-620q-12-12-12-27t12-27l112-112q12-12 29-12t29 12l338 338q12 12 12 28t-12 28ZM744-80 574-250l56-56 170 170-56 56Zm-4-520q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Z" />
    </Icon>
  );
}

/** Material Symbols `sports_basketball` (outlined filled). */
export function BasketballIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M82-521q5-51 21-96.5t44-85.5q35 36 58.5 83.5T236-521H82Zm642 0q7-51 30-98t59-83q28 39 44 85t21 96H724ZM147-258q-28-39-44-84.5T82-439h154q-7 51-30.5 98T147-258Zm666 0q-36-36-59-83t-30-98h154q-5 50-21 96t-44 85ZM317-521q-8-72-39-133t-81-110q48-48 109.5-77T439-878v357H317Zm204 0v-357q71 8 132.5 37T763-764q-51 48-81.5 109.5T643-521H521ZM439-82q-72-8-133-37.5T197-197q51-48 81.5-109T317-439h122v357Zm82 0v-357h122q8 72 38.5 133.5T763-196q-48 48-109.5 77T521-82Z" />
    </Icon>
  );
}

/** Material Symbols `sports_tennis` (outlined filled). */
export function TennisIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m137-160-57-56 164-164q31-31 42.5-77.5T298-600q0-58 26-114t74-104q91-91 201-103t181 61q72 72 60 182T738-478q-48 48-104 74t-114 26q-97 0-142 11t-77 43L137-160Zm275-334q47 46 127 34t143-75q64-64 76.5-143.5T724-803q-48-48-125.5-36T456-763q-63 63-76.5 142.5T412-494ZM720-40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113T720-40Z" />
    </Icon>
  );
}

/** Material Symbols `sports_motorsports` (outlined filled). */
export function MotorsportIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M579-182H96q-5 0-9-4t-4-9q0-47 1.5-82.5T89-341h314q69 0 117.5-49T569-510q0-51-28.5-92.5T464-664l-134-53q54-30 113.5-45.5T567-778q128 0 219 86.5T877-480q0 125-86.5 211.5T579-182ZM102-420q20-71 59-133.5T254-664l180 73q26 11 41 33t15 48q0 38-25.5 64T401-420H102Z" />
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

/** Material Symbols `search` (rounded). */
export function SearchIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
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

/** The MATCH tab glyph (assets/icons/match.svg) — stroke-drawn. */
export function MatchIcon(props: IconProps) {
  return (
    <Icon
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.0833 14.5833 2.5 5V2.5H5l9.5833 9.5833" />
      <path d="m10.834 15.834 5-5" />
      <path d="m13.334 13.334 3.3333 3.3333" />
      <path d="M15.834 17.5 17.5 15.834" />
      <path d="m12.084 5.41667 2.9167-2.91667H17.5007V5l-2.9167 2.91667" />
      <path d="m4.16797 11.666 3.33333 3.3333" />
      <path d="m5.83398 14.166-2.5 2.5" />
      <path d="m2.5 15.834 1.66597 1.666" />
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

/** Material Symbols `calendar_month` (rounded). */
export function CalendarIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
    </Icon>
  );
}

/** Material Symbols `event_busy` (rounded). */
export function EventBusyIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="m610-160 56-56-84-84 84-84-56-56-84 84-84-84-56 56 84 84-84 84 56 56 84-84 84 84ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Z" />
    </Icon>
  );
}

/** Material Symbols `quiz` (rounded). */
export function QuizIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-34.5q30-28 42-50t12-48q0-53-34.5-85T560-780q-44 0-79 25.5T433-686l54 22q9-27 30-43.5t43-16.5q29 0 47 16t18 42q0 17-9 32t-28 32q-31 27-44.5 51T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm-160 160q-33 0-56.5-23.5T80-160v-520h80v520h520v80H160Z" />
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

/** Material Symbols `person_search` (rounded). */
export function PersonSearchIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M769-108 645-232q-25 17-55 25.5t-63 8.5q-91 0-152.5-61.5T313-412q0-91 61.5-152.5T527-626q91 0 152.5 61.5T741-412q0 32-8.5 62T707-295l125 125-63 62ZM527-288q52 0 88-36t36-88q0-52-36-88t-88-36q-52 0-88 36t-36 88q0 52 36 88t88 36ZM120-240v-92q0-19 10-35t28-24q41-19 89-34t121-15q-14 20-24 42.5T328-350q-38 6-66.5 15T210-315q-6 3-8 7.5t-2 9.5v18h123q6 22 15.5 42.5T362-200H160q-17 0-28.5-11.5T120-240Zm240-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T440-720q0-33-23.5-56.5T360-800q-33 0-56.5 23.5T280-720q0 33 23.5 56.5T360-640Zm0-80Z" />
    </Icon>
  );
}

/** Material Symbols `arrow_back_ios` (rounded) — the bare chevron. */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
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
```

### Tab strips

`GlidingTabs` is the MATCH / GAMES switch. `UnderlineTabs` is the quieter strip that the sport icons are built on.

#### `src/design-system/components/navigation/gliding-tabs/gliding-tabs.tsx`

**Unchanged.**

```tsx
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

export type GlidingTab = {
  id: string;
  label: string;
  /** Identity color; the active plate morphs between these as it travels. */
  accent: string;
  icon: ReactNode;
};

export type GlidingTabsProps = {
  tabs: GlidingTab[];
  activeIndex: number;
  onChange: (index: number) => void;
  /** Names the tab strip for assistive technology. */
  label: string;
  className?: string;
};

/**
 * A calm dark tab strip with one raised, chamfered plate that glides — and
 * color-morphs between the per-tab accents — as the selection changes. Resting
 * tabs stay tinted toward their own accent so each identity reads at a glance.
 */
export function GlidingTabs({
  tabs,
  activeIndex,
  onChange,
  label,
  className,
}: GlidingTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    onChange(next);
    tabRefs.current[next]?.focus();
  }

  const plateStyle = {
    width: `${100 / tabs.length}%`,
    transform: `translateX(${activeIndex * 100}%)`,
    background: tabs[activeIndex]?.accent,
    clipPath: "var(--ds-clip-tab-plate)",
  } satisfies CSSProperties;

  return (
    <div
      role="tablist"
      aria-label={label}
      className={[
        "relative h-[61px] min-h-10 shrink-0 border-t border-black/15 bg-surface-nav",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 transition-[transform,background-color] duration-300 ease-out"
        style={plateStyle}
      />

      <div className="relative flex h-full">
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusTab(index + 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusTab(index - 1);
                }
              }}
              className="flex min-h-10 flex-1 flex-col items-center justify-center gap-[5px]"
              style={{
                color: active
                  ? "var(--ds-color-text-inverse)"
                  : `color-mix(in srgb, ${tab.accent} 68%, var(--ds-color-text-muted))`,
              }}
            >
              <span
                className={[
                  "grid size-[18px] place-items-center transition-transform duration-300",
                  active ? "scale-100" : "scale-[0.84]",
                ].join(" ")}
              >
                {tab.icon}
              </span>
              <span
                className={[
                  "font-display transition-all duration-200",
                  active
                    ? "text-2xs font-black tracking-label"
                    : "text-2xs font-semibold tracking-tight",
                ].join(" ")}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
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

### Grid and panels

StatOz cuts corners instead of rounding them. A CSS `clip-path` does the cutting, and it also crops borders, shadows and focus outlines. So each panel is built from stacked layers that share one clip path: a coloured layer for the edge, a slightly smaller layer for the fill, and the content on top.

- `BentoGrid` and `BentoTile` lay out the trending grids.
- `SignalPanel` is the tile with a notched top-right corner, used for PREDICT, PICK and FUTURE.
- `HudPanel` is the plate used for every game tile.
- `Badge` is the small label in a panel's top rail.
- `Progress` is the thin bar on a tall market tile.

#### `src/design-system/components/layout/bento-grid/bento-grid.tsx`

**Unchanged.**

```tsx
import type { ReactNode } from "react";

export type BentoSpan = "square" | "wide" | "tall";

export type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export type BentoTileProps = {
  span?: BentoSpan;
  children: ReactNode;
  className?: string;
};

const spanClass: Record<BentoSpan, string> = {
  square: "",
  wide: "col-span-2",
  tall: "row-span-2",
};

/**
 * Dense two-column bento that widens to three and four columns on larger
 * screens. Tiles pack into the first cell that fits, while source order stays
 * the reading and tab order.
 *
 * The row height clears a signal panel's two rails — a 36px tag rail and a 32px
 * footer — with room left for its body. The vertical gap is the horizontal gap
 * plus the panel's lift, so the shadow hangs into the gutter instead of
 * widening it, and both gutters read the same.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={[
        "grid grid-cols-2 gap-x-3 gap-y-[calc(0.75rem+var(--ds-shape-signal-lift))]",
        "grid-flow-dense auto-rows-[minmax(10.5rem,auto)]",
        "md:grid-cols-3 lg:grid-cols-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** One cell of a {@link BentoGrid}. */
export function BentoTile({
  span = "square",
  children,
  className,
}: BentoTileProps) {
  return (
    <div
      className={[spanClass[span], className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
```

#### `src/design-system/components/data-display/signal-panel/signal-panel.tsx`

**Unchanged.**

```tsx
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type SignalPanelProps = {
  /** CSS color that drives the panel's edge, hairline, wash, and lift. */
  accent: string;
  /** Opt-in medium slate treatment; the original accent wash remains default. */
  appearance?: "accented" | "balanced";
  /** Small label pinned to the left of the panel's top rail. */
  tag?: ReactNode;
  /** Sits opposite the tag on the top rail — a clock, a count, a status. */
  meta?: ReactNode;
  /** Fills the bottom rail: the panel's stakes, volume, or state line. */
  footer?: ReactNode;
  /** Applies the standard content inset. Off for panels that centre their own. */
  pad?: boolean;
  /** Casts the accent-tinted shadow that makes the panel sit above the page. */
  lifted?: boolean;
  href?: string;
  onClick?: () => void;
  /** Accessible name, required when the panel is interactive. */
  label?: string;
  className?: string;
  children?: ReactNode;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-signal)" };

/** The single horizontal inset every rail and the body share. */
const RAIL_INSET = "px-3.5";

/**
 * The signature StatOz surface: a chamfered plate with a notched top-right
 * edge, an accent hairline across the top, and an accent shadow beneath.
 *
 * Built from stacked layers that share one clip path — a lift, an accent edge,
 * and the fill — so the cut corners stay crisp at any size. The content column
 * carries the clip too, because the bottom rail paints an opaque background of
 * its own and would otherwise square the panel off at exactly the corners the
 * silhouette cuts.
 *
 * The accent edge is drawn one pixel *outside* the fill rather than under it.
 * The app strokes the silhouette rather than insetting a fill, and keeping the
 * ring outside is what makes that faithful: no rail, badge, or meter background
 * can reach it, so the edge stays unbroken the whole way round the shape.
 *
 * Content sits in three regions: a fixed top rail carrying the tag, a flexible
 * body, and an optional bottom rail. The rails are structural rather than
 * absolutely positioned, so panels never have to guess how much padding clears
 * the tag, and every panel in a grid ends on the same baseline.
 *
 * When interactive, the hit area is a stretched overlay rather than a wrapper,
 * so panel content stays flow-level regardless of which element it uses. The
 * overlay is clipped, which would swallow a focus outline — so the focus ring
 * is drawn by the panel's own layers instead.
 */
export function SignalPanel({
  accent,
  appearance = "accented",
  tag,
  meta,
  footer,
  pad = true,
  lifted = true,
  href,
  onClick,
  label,
  className,
  children,
}: SignalPanelProps) {
  const interactive = Boolean(href ?? onClick);
  const balanced = appearance === "balanced";
  const style = {
    "--panel-accent": accent,
    "--panel-edge": `color-mix(in srgb, ${accent} ${balanced ? 45 : 55}%, transparent)`,
    "--panel-edge-hover": `color-mix(in srgb, ${accent} ${balanced ? 60 : 74}%, transparent)`,
    "--panel-lift": `color-mix(in srgb, ${accent} ${balanced ? 16 : 22}%, transparent)`,
    "--panel-surface": balanced
      ? "var(--ds-gradient-trending-card)"
      : `color-mix(in srgb, ${accent} 8%, var(--ds-color-background-elevated))`,
    "--panel-top-line": `color-mix(in srgb, ${accent} ${balanced ? 65 : 80}%, transparent)`,
    "--panel-footer-border": `1px solid color-mix(in srgb, ${accent} 16%, transparent)`,
    "--panel-footer-background": balanced
      ? "var(--ds-color-fixture-strip)"
      : `color-mix(in srgb, ${accent} 7%, var(--ds-color-background-muted))`,
    "--panel-footer-height": balanced ? "38px" : "32px",
  } as CSSProperties;

  return (
    <div className="group relative h-full w-full" style={style}>
      {lifted ? (
        <div
          aria-hidden
          className="absolute -inset-px translate-y-(--ds-shape-signal-lift)"
          style={{
            ...clip,
            background: "var(--panel-lift)",
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
        {/* Accent edge — a 1px ring standing one pixel proud of the fill, so
            nothing painted inside the panel can break it. It brightens on hover
            and goes solid under keyboard focus. Background comes from classes,
            not inline style, so the variants can win. */}
        <div
          aria-hidden
          className={[
            "absolute -inset-px transition-[background-color] duration-150",
            "bg-(--panel-edge)",
            interactive
              ? "group-hover:bg-(--panel-edge-hover) group-has-focus-visible:bg-(--panel-accent)"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={clip}
        />
        {/* The fill pulls back to 3px under keyboard focus, widening the edge
            into a ring that follows the chamfer exactly — the clip path would
            have cut away a real outline. */}
        <div
          aria-hidden
          className={[
            "absolute inset-0",
            interactive ? "group-has-focus-visible:inset-0.75" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            ...clip,
            background: "var(--panel-surface)",
          }}
        />
        {/* The one bright line on the panel. It stops where the notch steps in
            — a pixel further and it would hang off the cut edge, since it sits
            outside the clipped content column. */}
        <div
          aria-hidden
          className="absolute top-0 h-0.5 left-(--ds-shape-signal-cut) right-[calc(var(--ds-shape-signal-notch)+var(--ds-shape-signal-step))]"
          style={{
            background: "var(--panel-top-line)",
          }}
        />

        <div className="relative z-10 flex h-full w-full flex-col" style={clip}>
          {tag || meta ? (
            <div
              className={`flex h-9 shrink-0 items-center justify-between gap-2 ${RAIL_INSET}`}
            >
              <span className="flex min-w-0 items-center">{tag}</span>
              {meta ? (
                <span className="flex shrink-0 items-center">{meta}</span>
              ) : null}
            </div>
          ) : null}

          <div
            className={[
              "flex min-h-0 flex-1 flex-col",
              // One rhythm for every panel: 8px between the body's regions.
              pad ? `gap-2 ${RAIL_INSET} pb-2` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={`flex shrink-0 items-center gap-2 ${RAIL_INSET}`}
              style={{
                height: "var(--panel-footer-height)",
                borderTop: "var(--panel-footer-border)",
                background: "var(--panel-footer-background)",
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            aria-label={label}
            className="absolute inset-0 z-20 outline-none"
            style={clip}
          />
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="absolute inset-0 z-20 outline-none"
            style={clip}
          />
        ) : null}
      </div>
    </div>
  );
}
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

#### `src/design-system/components/data-display/badge/badge.tsx`

**Unchanged.**

```tsx
import type { CSSProperties, ReactNode } from "react";

export type BadgeProps = {
  children: ReactNode;
  /** CSS color for the label, dot, and edge. */
  accent: string;
  /**
   * `bare` is a plain accent label; `outlined` adds a boxed edge and a status
   * dot. Only one badge on a surface should be outlined.
   */
  variant?: "bare" | "outlined";
  /** Slowly pulses the outlined badge to mark genuinely live data. */
  pulse?: boolean;
  className?: string;
};

/** Compact status label — the tag on a signal panel, or a LIVE marker. */
export function Badge({
  children,
  accent,
  variant = "bare",
  pulse = false,
  className,
}: BadgeProps) {
  const style = { "--badge-accent": accent } as CSSProperties;

  if (variant === "bare") {
    return (
      <span
        style={{ ...style, color: accent }}
        className={[
          "font-display text-2xs font-extrabold tracking-wide",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      style={{
        ...style,
        color: accent,
        background: "color-mix(in srgb, var(--badge-accent) 12%, transparent)",
        borderColor: "color-mix(in srgb, var(--badge-accent) 62%, transparent)",
        boxShadow:
          "0 0 8px -4px color-mix(in srgb, var(--badge-accent) 20%, transparent)",
      }}
      className={[
        "inline-flex items-center gap-[5px] border px-[7px] py-1 font-display text-2xs font-extrabold tracking-label",
        pulse ? "animate-pulse" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className="size-[5px] rounded-pill"
        style={{ background: accent }}
      />
      {children}
    </span>
  );
}
```

#### `src/design-system/components/feedback/progress/progress.tsx`

**Unchanged.**

```tsx
export type ProgressProps = {
  /** Fill fraction, 0..1. */
  value: number;
  /** CSS color for the fill and its glow. */
  accent: string;
  /** Accessible name for the measurement. */
  label: string;
  height?: number;
  className?: string;
};

/** Thin accent meter used for probabilities and completion. */
export function Progress({
  value,
  accent,
  label,
  height = 4,
  className,
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 1);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={[
        "w-full overflow-hidden rounded-sm bg-background/70",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ height }}
    >
      <div
        className="h-full rounded-sm transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped * 100}%`,
          background: accent,
          boxShadow: `0 0 6px -1px color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      />
    </div>
  );
}
```

### The entry point

Everything above is imported through this one file, as `@/design-system`.

#### `src/design-system/index.ts`

**Trimmed.** Exports only the pieces in this step.

```ts
export { accentVar, type AccentName } from "./tokens/colors";
export { Icon, type IconProps } from "./icons/icon";
export * from "./icons/glyphs";
export {
  GlidingTabs,
  type GlidingTab,
  type GlidingTabsProps,
} from "./components/navigation/gliding-tabs/gliding-tabs";
export {
  UnderlineTabs,
  type UnderlineTab,
  type UnderlineTabsProps,
} from "./components/navigation/underline-tabs/underline-tabs";
export {
  BentoGrid,
  BentoTile,
  type BentoGridProps,
  type BentoSpan,
  type BentoTileProps,
} from "./components/layout/bento-grid/bento-grid";
export {
  SignalPanel,
  type SignalPanelProps,
} from "./components/data-display/signal-panel/signal-panel";
export {
  HudPanel,
  type HudPanelProps,
} from "./components/data-display/hud-panel/hud-panel";
export { Badge, type BadgeProps } from "./components/data-display/badge/badge";
export {
  Progress,
  type ProgressProps,
} from "./components/feedback/progress/progress";
```

## Step 5: data model and mock data

The page reads its data through a small set of functions. Keep those functions and replace what is behind them when you connect an API (see [Connecting real data and auth](#connecting-real-data-and-auth)).

### Types

#### `src/domain/matches/match.ts`

**Adapted.** `MatchLeague` and `SportFixtureCount` are added at the end. In StatOz they live in `detail.ts`, which is otherwise about the match detail screens.

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

export function isLive(match: SportMatch): boolean {
  return match.status === "live";
}

export function isFinished(match: SportMatch): boolean {
  return match.status === "finished";
}

/** Presentation data for one fixture competition. Its accent is brand data. */
export type MatchLeague = {
  id: string;
  sport: Sport;
  name: string;
  shortCode: string;
  accent: string;
};

export type SportFixtureCount = {
  live: number;
  total: number;
};
```

#### `src/domain/matches/index.ts`

**Trimmed.** StatOz also exports the match detail, report and race types from here.

```ts
export * from "./match";
```

#### `src/domain/predictions/market.ts`

**Unchanged.**

```ts
import type { Sport } from "../sports";

export type PickMarketType = "match" | "event" | "future";
export type PickMarketStatus =
  | "upcoming"
  | "live"
  | "closed"
  | "unresolved"
  | "settled"
  | "voided";
export type PickPositionStatus =
  | "pending"
  | "live"
  | "unresolved"
  | "settleable"
  | "won"
  | "lost"
  | "voided";

export type PickOutcome = {
  id: string;
  label: string;
  /** Implied probability and one-share price, 1..99 Oz. */
  probabilityPercent: number;
  /** Outcome/team identity is data, not a design-system token. */
  color?: string;
  /** Change in percentage points since the previous tick. */
  delta?: number;
};

export type PickPricePoint = {
  at: string;
  percentsByOutcome: Record<string, number>;
};

export type PickMarket = {
  id: string;
  sport: Sport;
  leagueId?: string;
  leagueLabel: string;
  question: string;
  type?: PickMarketType;
  status?: PickMarketStatus;
  outcomes: PickOutcome[];
  volumeOz: number;
  closesAt?: string;
  priceHistory?: PickPricePoint[];
  matchId?: string;
  contextTitle?: string;
  contextSubtitle?: string;
  homeLabel?: string;
  awayLabel?: string;
  homeScore?: string;
  awayScore?: string;
  liveLabel?: string;
  resultNote?: string;
  resolvedOutcomeId?: string;
  voidReason?: string;
  /** Compatibility field for existing trending surfaces. */
  resolved: boolean;
};

export type PickPosition = {
  id: string;
  marketId: string;
  marketQuestion: string;
  marketType: PickMarketType;
  leagueLabel: string;
  outcomeId: string;
  outcomeLabel: string;
  stakeOz: number;
  shareCount: number;
  averageProbabilityPercent: number;
  submittedAt: string;
  status: PickPositionStatus;
  resolvedAt?: string;
  payoutOz: number;
  resultNote?: string;
};

export function isValidProbability(probabilityPercent: number): boolean {
  return (
    Number.isInteger(probabilityPercent) &&
    probabilityPercent >= 1 &&
    probabilityPercent <= 99
  );
}

export function isValidStake(input: {
  stakeOz: number;
  probabilityPercent: number;
  balanceOz: number;
}): boolean {
  return (
    Number.isInteger(input.stakeOz) &&
    input.stakeOz > 0 &&
    input.stakeOz <= input.balanceOz &&
    isValidProbability(input.probabilityPercent) &&
    input.stakeOz % input.probabilityPercent === 0
  );
}

export function sharesForStake(
  stakeOz: number,
  probabilityPercent: number,
): number {
  return isValidProbability(probabilityPercent) &&
    stakeOz > 0 &&
    stakeOz % probabilityPercent === 0
    ? Math.floor(stakeOz / probabilityPercent)
    : 0;
}

export function payoutForShares(shares: number): number {
  return Math.max(0, Math.floor(shares)) * 100;
}

export function positionMaxPayout(position: PickPosition): number {
  return payoutForShares(position.shareCount);
}
export function positionIsFinal(position: PickPosition): boolean {
  return (
    position.status === "won" ||
    position.status === "lost" ||
    position.status === "voided"
  );
}
export function marketCanBuy(market: PickMarket): boolean {
  return market.status === "upcoming" || market.status === "live";
}
export function marketResultKnown(market: PickMarket): boolean {
  return market.status === "settled" || market.status === "voided";
}
export function outcomeFor(
  market: PickMarket,
  outcomeId: string,
): PickOutcome | undefined {
  return market.outcomes.find((outcome) => outcome.id === outcomeId);
}
export function leadingOutcome(market: PickMarket): PickOutcome {
  return market.outcomes.reduce((leader, outcome) =>
    outcome.probabilityPercent > leader.probabilityPercent ? outcome : leader,
  );
}
export function latestDeltaFor(
  market: PickMarket,
  outcomeId: string,
): number | undefined {
  if (market.priceHistory && market.priceHistory.length >= 2) {
    const latest = market.priceHistory.at(-1)?.percentsByOutcome[outcomeId];
    const previous = market.priceHistory.at(-2)?.percentsByOutcome[outcomeId];
    if (latest !== undefined && previous !== undefined)
      return latest - previous;
  }
  return outcomeFor(market, outcomeId)?.delta;
}

export const HOT_DELTA_THRESHOLD = 5;
export function isHot(market: PickMarket): boolean {
  const delta = latestDeltaFor(market, leadingOutcome(market).id);
  return (
    delta !== undefined &&
    Math.abs(delta) >= HOT_DELTA_THRESHOLD &&
    !market.resolved
  );
}
```

#### `src/domain/predictions/index.ts`

**Trimmed.** StatOz also exports the quiz types from here.

```ts
export * from "./market";
```

### Fixtures

`definitions.ts` holds the leagues and two small builders, `team()` and `fixture()`. Each sport's file lists its teams and fixtures. `catalog.ts` joins them and provides the lookups the components call. There are 30 fixtures and 12 leagues, with one live fixture per sport.

#### `src/mocks/matches/definitions.ts`

**Adapted.** The runtime lookup in StatOz's generated team-palette file is removed. `fixture()` now uses each team's colours as given.

```ts
import type { MatchLeague, SportMatch, SportTeam } from "@/domain/matches";
import type { Sport } from "@/domain/sports";

export const matchLeagues: MatchLeague[] = [
  {
    id: "mls",
    sport: "football",
    name: "Major League Soccer",
    shortCode: "MLS",
    accent: "#5cdfff",
  },
  {
    id: "epl",
    sport: "football",
    name: "Premier League",
    shortCode: "EPL",
    accent: "#5cdfff",
  },
  {
    id: "fifa",
    sport: "football",
    name: "World Cup",
    shortCode: "FIFA",
    accent: "#51ff94",
  },
  {
    id: "ipl",
    sport: "cricket",
    name: "Indian Premier League",
    shortCode: "IPL",
    accent: "#c27aff",
  },
  {
    id: "t20i",
    sport: "cricket",
    name: "International T20",
    shortCode: "T20I",
    accent: "#ff8904",
  },
  {
    id: "wnba",
    sport: "basketball",
    name: "WNBA",
    shortCode: "WNBA",
    accent: "#ff8904",
  },
  {
    id: "nba",
    sport: "basketball",
    name: "NBA",
    shortCode: "NBA",
    accent: "#f42d29",
  },
  {
    id: "wimbledon",
    sport: "tennis",
    name: "Wimbledon",
    shortCode: "WIMBLEDON",
    accent: "#51ff94",
  },
  {
    id: "atp",
    sport: "tennis",
    name: "ATP Tour",
    shortCode: "ATP",
    accent: "#2b7fff",
  },
  {
    id: "wta",
    sport: "tennis",
    name: "WTA Tour",
    shortCode: "WTA",
    accent: "#c27aff",
  },
  {
    id: "f1",
    sport: "motorsport",
    name: "Formula 1",
    shortCode: "F1",
    accent: "#f42d29",
  },
  {
    id: "indy",
    sport: "motorsport",
    name: "IndyCar",
    shortCode: "INDY",
    accent: "#2b7fff",
  },
];

export function team(
  id: string,
  name: string,
  shortName: string,
  color: string,
  secondaryColor: string,
  badgeTextColor = "#ffffff",
): SportTeam {
  return { id, name, shortName, color, secondaryColor, badgeTextColor };
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

**Adapted.** Team colours are the values StatOz's palette lookup produces, written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  fulham: team("370", "Fulham", "FUL", "#000000", "#ffffff"),
  chelsea: team("363", "Chelsea", "CHE", "#034694", "#ffffff"),
  newcastle: team("newcastle", "Newcastle United", "NEW", "#241f20", "#ffffff"),
  united: team("man-utd", "Manchester United", "MUN", "#da291c", "#fde200"),
  arsenal: team("arsenal", "Arsenal", "ARS", "#ef0107", "#063672"),
  liverpool: team("liverpool", "Liverpool", "LIV", "#c8102e", "#002d62"),
  city: team(
    "man-city",
    "Manchester City",
    "MCI",
    "#6cabdd",
    "#1c2c5b",
    "#000000",
  ),
  spurs: team("spurs", "Tottenham Hotspur", "TOT", "#132257", "#ffffff"),
  villa: team("villa", "Aston Villa", "AVL", "#670e36", "#95bfe5"),
  france: team("france", "France", "FRA", "#002f79", "#ffffff"),
  england: team("england", "England", "ENG", "#ffffff", "#ce1124", "#0b1740"),
  philadelphia: team("phi", "Philadelphia Union", "PHI", "#071b2c", "#b9975b"),
  redBullNy: team("rbny", "Red Bull New York", "RBNY", "#d50032", "#ffd400"),
  newEngland: team("ne", "New England Revolution", "NE", "#0a2240", "#ce0e2d"),
  toronto: team("tor", "Toronto FC", "TOR", "#c8102e", "#455560"),
  miami: team("mia", "Inter Miami CF", "MIA", "#f47321", "#005030"),
  chicago: team("chi", "Chicago Fire FC", "CHI", "#d3362a", "#23449c"),
  columbus: team("clb", "Columbus Crew", "CLB", "#101010", "#fef200"),
  nycfc: team(
    "nyc",
    "New York City FC",
    "NYC",
    "#9bc9eb",
    "#6cace4",
    "#081019",
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
  fixture(
    "epl_cfc_new",
    "football",
    "epl",
    teams.chelsea,
    teams.newcastle,
    "2026-08-25T19:00:00.000Z",
    "live",
    120,
    48200,
    { homeScore: 2, awayScore: 1, liveMinute: 67 },
  ),
  fixture(
    "epl_liv_mci",
    "football",
    "epl",
    teams.liverpool,
    teams.city,
    "2026-08-25T21:00:00.000Z",
    "scheduled",
    110,
    96500,
  ),
  fixture(
    "epl_tot_avl",
    "football",
    "epl",
    teams.spurs,
    teams.villa,
    "2026-08-25T17:30:00.000Z",
    "scheduled",
    80,
    21600,
  ),
  fixture(
    "epl_mu_ars_today",
    "football",
    "epl",
    teams.united,
    teams.arsenal,
    "2026-08-25T15:00:00.000Z",
    "scheduled",
    90,
    31400,
  ),
  fixture(
    "epl_mu_ars",
    "football",
    "epl",
    teams.united,
    teams.arsenal,
    "2026-08-26T16:30:00.000Z",
    "scheduled",
    90,
    31400,
  ),
  fixture(
    "fifa_fra_eng_result",
    "football",
    "fifa",
    teams.france,
    teams.england,
    "2026-08-24T18:30:00.000Z",
    "finished",
    160,
    128000,
    {
      homeScore: 4,
      awayScore: 6,
      resultLine: "England won 6-4 to take third place",
    },
  ),
  fixture(
    "mls_phi_rbny",
    "football",
    "mls",
    teams.philadelphia,
    teams.redBullNy,
    "2026-08-23T19:30:00.000Z",
    "finished",
    90,
    18400,
    { homeScore: 3, awayScore: 1, resultLine: "Philadelphia Union won 3-1" },
  ),
  fixture(
    "mls_ne_tor",
    "football",
    "mls",
    teams.newEngland,
    teams.toronto,
    "2026-08-23T21:00:00.000Z",
    "finished",
    85,
    14200,
    { homeScore: 0, awayScore: 0, resultLine: "Full time 0-0" },
  ),
  fixture(
    "mls_mia_chi",
    "football",
    "mls",
    teams.miami,
    teams.chicago,
    "2026-08-24T00:00:00.000Z",
    "finished",
    110,
    32900,
    { homeScore: 3, awayScore: 2, resultLine: "Inter Miami CF won 3-2" },
  ),
  fixture(
    "mls_clb_nyc",
    "football",
    "mls",
    teams.columbus,
    teams.nycfc,
    "2026-08-24T01:30:00.000Z",
    "finished",
    95,
    20700,
    { homeScore: 1, awayScore: 2, resultLine: "New York City FC won 2-1" },
  ),
];
```

#### `src/mocks/matches/cricket.ts`

**Adapted.** Team colours are the values StatOz's palette lookup produces, written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  mumbai: team("mumbai", "Mumbai Indians", "MI", "#004ba0", "#d1ab3e"),
  chennai: team(
    "chennai",
    "Chennai Super Kings",
    "CSK",
    "#f9cd05",
    "#1e3a8a",
    "#1e3a8a",
  ),
  bengaluru: team(
    "335970",
    "Royal Challengers Bengaluru",
    "RCB",
    "#a50000",
    "#1f0000",
  ),
  gujarat: team("1298769", "Gujarat Titans", "GT", "#2f3b6f", "#bfa14a"),
  rajasthan: team("rajasthan", "Rajasthan Royals", "RR", "#ea1a85", "#1e88e5"),
  india: team("india", "India", "IND", "#0033a0", "#ff9933"),
  pakistan: team("pakistan", "Pakistan", "PAK", "#01411c", "#d4af37"),
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
  fixture(
    "1496576",
    "cricket",
    "ipl",
    teams.mumbai,
    teams.chennai,
    "2026-08-25T14:00:00.000Z",
    "live",
    140,
    67900,
    {
      homeScore: "164/6 (17.2 ov)",
      awayScore: "148/8 (20 ov)",
      liveMinute: 17,
    },
  ),
  fixture(
    "ipl_rcb_rr",
    "cricket",
    "ipl",
    teams.bengaluru,
    teams.rajasthan,
    "2026-08-26T14:30:00.000Z",
    "scheduled",
    100,
    42300,
  ),
  fixture(
    "t20i_ind_pak",
    "cricket",
    "t20i",
    teams.india,
    teams.pakistan,
    "2026-08-24T13:30:00.000Z",
    "finished",
    130,
    112000,
    {
      homeScore: "202/6 (20 ov)",
      awayScore: "189/9 (20 ov)",
      resultLine: "India won by 13 runs",
    },
  ),
];
```

#### `src/mocks/matches/basketball.ts`

**Adapted.** Team colours are the values StatOz's palette lookup produces, written in directly.

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  dallas: team("dallas", "Dallas Wings", "DAL", "#00538c", "#002f5f"),
  phoenix: team("phoenix", "Phoenix Mercury", "PHX", "#e56020", "#1d1160"),
  lakers: team("lakers", "Los Angeles Lakers", "LAL", "#552583", "#fdb927"),
  warriors: team(
    "warriors",
    "Golden State Warriors",
    "GSW",
    "#1d428a",
    "#ffc72c",
  ),
  liberty: team(
    "liberty",
    "New York Liberty",
    "NYL",
    "#6eceb2",
    "#000000",
    "#081019",
  ),
  aces: team("aces", "Las Vegas Aces", "LVA", "#c8102e", "#c5c7c9"),
  spurs: team("24", "San Antonio Spurs", "SA", "#000000", "#c4ced4"),
  knicks: team("18", "New York Knicks", "NY", "#006bb6", "#f58426"),
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
  fixture(
    "wnba_demo_dal_phx",
    "basketball",
    "wnba",
    teams.dallas,
    teams.phoenix,
    "2026-08-26T01:00:00.000Z",
    "scheduled",
    75,
    12800,
  ),
  fixture(
    "nba_lal_gsw",
    "basketball",
    "nba",
    teams.lakers,
    teams.warriors,
    "2026-08-25T23:30:00.000Z",
    "scheduled",
    110,
    83400,
  ),
  fixture(
    "wnba_nyl_lva",
    "basketball",
    "wnba",
    teams.liberty,
    teams.aces,
    "2026-08-25T20:00:00.000Z",
    "live",
    95,
    36700,
    { homeScore: 68, awayScore: 64, liveMinute: 33 },
  ),
  fixture(
    "wnba_phx_dal_result",
    "basketball",
    "wnba",
    teams.phoenix,
    teams.dallas,
    "2026-08-24T19:00:00.000Z",
    "finished",
    75,
    15100,
    { homeScore: 75, awayScore: 82, resultLine: "Dallas Wings won 82-75" },
  ),
];
```

#### `src/mocks/matches/tennis.ts`

**Unchanged.**

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  alcaraz: team(
    "alcaraz",
    "Carlos Alcaraz",
    "ESP",
    "#f1bf00",
    "#aa151b",
    "#081019",
  ),
  sinner: team("sinner", "Jannik Sinner", "ITA", "#009246", "#ce2b37"),
  djokovic: team("djokovic", "Novak Djokovic", "SRB", "#0c4076", "#c6363c"),
  gauff: team("gauff", "Coco Gauff", "USA", "#3c3b6e", "#b22234"),
  swiatek: team(
    "swiatek",
    "Iga Swiatek",
    "POL",
    "#ffffff",
    "#dc143c",
    "#081019",
  ),
};
export const tennisFixtures: SportMatch[] = [
  fixture(
    "wimbledon_mens_final_26",
    "tennis",
    "wimbledon",
    teams.alcaraz,
    teams.sinner,
    "2026-08-27T13:00:00.000Z",
    "scheduled",
    160,
    88300,
  ),
  fixture(
    "atp_alc_djo_result",
    "tennis",
    "atp",
    teams.alcaraz,
    teams.djokovic,
    "2026-08-24T13:00:00.000Z",
    "finished",
    160,
    66400,
    {
      homeScore: 3,
      awayScore: 0,
      resultLine: "Alcaraz won 6-4, 6-2, 6-1",
      tennisSets: [
        [6, 4],
        [6, 2],
        [6, 1],
      ],
    },
  ),
  fixture(
    "atp_alc_sin",
    "tennis",
    "atp",
    teams.alcaraz,
    teams.sinner,
    "2026-08-25T13:00:00.000Z",
    "scheduled",
    150,
    75200,
  ),
  fixture(
    "wta_swi_gau",
    "tennis",
    "wta",
    teams.swiatek,
    teams.gauff,
    "2026-08-25T16:00:00.000Z",
    "live",
    125,
    44100,
    {
      homeScore: 1,
      awayScore: 1,
      liveMinute: 78,
      tennisSets: [
        [6, 4],
        [3, 6],
      ],
    },
  ),
  fixture(
    "atp_sin_djo",
    "tennis",
    "atp",
    teams.alcaraz,
    teams.sinner,
    "2026-08-26T12:30:00.000Z",
    "scheduled",
    145,
    62800,
  ),
];
```

#### `src/mocks/matches/motorsport.ts`

**Unchanged.**

```ts
import type { SportMatch } from "@/domain/matches";
import { fixture, team } from "./definitions";
const teams = {
  f1: team("formula-1", "Dutch Grand Prix", "F1", "#e10600", "#ffffff"),
  f1Belgium: team(
    "formula-1-belgium",
    "Belgian Grand Prix",
    "F1",
    "#e10600",
    "#f7c948",
  ),
  f1Italy: team(
    "formula-1-italy",
    "Italian Grand Prix",
    "F1",
    "#e10600",
    "#009246",
  ),
  indy: team("indycar-gateway", "Gateway 500", "INDY", "#001489", "#d71920"),
  field: team("race-field", "Race Field", "GRID", "#314158", "#90a1b9"),
};
export const motorsportFixtures: SportMatch[] = [
  fixture(
    "f1_belgian_gp",
    "motorsport",
    "f1",
    teams.f1Belgium,
    teams.field,
    "2026-08-22T13:00:00.000Z",
    "finished",
    180,
    163000,
    { resultLine: "Verstappen won from pole" },
  ),
  fixture(
    "f1_dutch_practice",
    "motorsport",
    "f1",
    teams.f1,
    teams.field,
    "2026-08-25T11:30:00.000Z",
    "live",
    90,
    71400,
    { liveMinute: 38 },
  ),
  fixture(
    "f1_dutch_gp",
    "motorsport",
    "f1",
    teams.f1,
    teams.field,
    "2026-08-30T13:00:00.000Z",
    "scheduled",
    200,
    189000,
  ),
  fixture(
    "indy_gateway_500",
    "motorsport",
    "indy",
    teams.indy,
    teams.field,
    "2026-08-30T18:00:00.000Z",
    "scheduled",
    150,
    82400,
  ),
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

**Unchanged.**

```ts
import type {
  MatchLeague,
  SportFixtureCount,
  SportMatch,
} from "@/domain/matches";
import { sportOrder, type Sport } from "@/domain/sports";

import { basketballFixtures } from "./basketball";
import { cricketFixtures } from "./cricket";
import { footballFixtures } from "./football";
import { motorsportFixtures } from "./motorsport";
import { tennisFixtures } from "./tennis";
import { matchLeagues } from "./definitions";

export { fixture, matchLeagues, team } from "./definitions";

/** Fixed timestamp that keeps the demo's relative date labels stable. */
export const matchDemoAnchor = "2026-08-25T00:00:00.000Z";

/** Stable reading order for the sport feed and static match routes. */
export const sportFixtures: SportMatch[] = [
  ...footballFixtures,
  ...cricketFixtures,
  ...basketballFixtures,
  ...motorsportFixtures,
  ...tennisFixtures,
];

const matchIndex = new Map(sportFixtures.map((match) => [match.id, match]));
const leagueIndex = new Map(matchLeagues.map((league) => [league.id, league]));
export const allMockMatchIds = sportFixtures.map((match) => match.id);
export const trendingMatches = [
  requiredMatch("401879318"),
  requiredMatch("1535465"),
  requiredMatch("basketball-revamp-20260614-ny-sa"),
  requiredMatch("600057442"),
  requiredMatch("wimbledon_mens_final_26"),
];
export function fixturesForSport(sport: Sport): SportMatch[] {
  return sportFixtures.filter((match) => match.sport === sport);
}
export function fixturesForLeague(leagueId: string): SportMatch[] {
  return sportFixtures.filter((match) => match.leagueId === leagueId);
}
export function matchById(id: string): SportMatch | undefined {
  return matchIndex.get(id);
}
export function leagueById(id: string): MatchLeague | undefined {
  return leagueIndex.get(id);
}
export function fixtureCountsBySport(): Record<Sport, SportFixtureCount> {
  return Object.fromEntries(
    sportOrder.map((sport) => {
      const fixtures = fixturesForSport(sport);
      return [
        sport,
        {
          total: fixtures.length,
          live: fixtures.filter((match) => match.status === "live").length,
        },
      ];
    }),
  ) as Record<Sport, SportFixtureCount>;
}
function requiredMatch(id: string): SportMatch {
  const match = matchIndex.get(id);
  if (!match) throw new Error(`Missing mock match: ${id}`);
  return match;
}
```

### Markets and the trending list

`trending-catalog.ts` is the ordered list of tiles in the MATCH trending grid. Each entry names a kind, a size, and the id of the fixture or market it draws.

#### `src/mocks/matches/markets.ts`

**Adapted.** Holds the values StatOz renders once its picks catalog has overridden these six markets. Fields the tiles do not read are left out, and price history is cut to its last two ticks.

```ts
import type { PickMarket } from "@/domain/predictions";

/**
 * Curated prediction markets shown with the sport match fixtures.
 *
 * Every outcome names its colour: a side wears its own, a draw or a catch-all
 * takes slate, and a yes/no pair reads green against red.
 *
 * `priceHistory` holds the last two ticks only. That is all a trending tile
 * reads: the move between them decides whether the leader's delta pulses.
 */
export const trendingMarkets: PickMarket[] = [
  {
    id: "fifa_2026_winner",
    sport: "football",
    leagueId: "fifa",
    leagueLabel: "WORLD CUP",
    type: "future",
    status: "upcoming",
    question: "Who lifts the 2026 World Cup?",
    outcomes: [
      {
        id: "bra",
        label: "Brazil",
        probabilityPercent: 24,
        delta: 3,
        color: "#facc15",
      },
      {
        id: "fra",
        label: "France",
        probabilityPercent: 21,
        delta: -2,
        color: "#1d4ed8",
      },
      {
        id: "eng",
        label: "England",
        probabilityPercent: 15,
        delta: 1,
        color: "#ffffff",
      },
      {
        id: "arg",
        label: "Argentina",
        probabilityPercent: 14,
        delta: -1,
        color: "#74acdf",
      },
    ],
    volumeOz: 412000,
    closesAt: "2027-06-01T18:00:00.000Z",
    resolved: false,
    priceHistory: [
      {
        at: "2027-06-01T12:00:00.000Z",
        percentsByOutcome: { bra: 23, fra: 22, eng: 15, arg: 14 },
      },
      {
        at: "2027-06-01T18:00:00.000Z",
        percentsByOutcome: { bra: 24, fra: 21, eng: 15, arg: 14 },
      },
    ],
  },
  {
    id: "epl_liv_mc_winner",
    sport: "football",
    leagueId: "epl",
    leagueLabel: "EPL",
    type: "match",
    status: "upcoming",
    question: "Liverpool vs Man City result",
    outcomes: [
      {
        id: "liv",
        label: "Liverpool",
        probabilityPercent: 41,
        delta: 7,
        color: "#c8102e",
      },
      {
        id: "draw",
        label: "Draw",
        probabilityPercent: 27,
        delta: -3,
        color: "#64748b",
      },
      {
        id: "mci",
        label: "Man City",
        probabilityPercent: 32,
        delta: -4,
        color: "#6cabdd",
      },
    ],
    volumeOz: 96500,
    closesAt: "2026-08-26T04:00:00.000Z",
    resolved: false,
    priceHistory: [
      {
        at: "2026-08-25T22:00:00.000Z",
        percentsByOutcome: { liv: 39, draw: 28, mci: 33 },
      },
      {
        at: "2026-08-26T04:00:00.000Z",
        percentsByOutcome: { liv: 41, draw: 27, mci: 32 },
      },
    ],
  },
  {
    id: "ipl_2026_winner",
    sport: "cricket",
    leagueId: "ipl",
    leagueLabel: "IPL",
    type: "future",
    status: "upcoming",
    question: "Which side takes the 2026 IPL title?",
    outcomes: [
      {
        id: "csk",
        label: "Chennai",
        probabilityPercent: 28,
        delta: 2,
        color: "#ffd400",
      },
      {
        id: "mi",
        label: "Mumbai",
        probabilityPercent: 23,
        delta: -1,
        color: "#2856a5",
      },
      {
        id: "rcb",
        label: "Bengaluru",
        probabilityPercent: 19,
        delta: 4,
        color: "#d81920",
      },
    ],
    volumeOz: 238000,
    closesAt: "2027-06-01T18:00:00.000Z",
    resolved: false,
    priceHistory: [
      {
        at: "2027-06-01T12:00:00.000Z",
        percentsByOutcome: { csk: 28, mi: 23, rcb: 18 },
      },
      {
        at: "2027-06-01T18:00:00.000Z",
        percentsByOutcome: { csk: 28, mi: 23, rcb: 19 },
      },
    ],
  },
  {
    id: "ipl_sixes_over_12_5",
    sport: "cricket",
    leagueId: "ipl",
    leagueLabel: "IPL",
    type: "event",
    status: "live",
    question: "Over 12.5 sixes in tonight's innings?",
    outcomes: [
      {
        id: "over",
        label: "Over",
        probabilityPercent: 58,
        delta: 6,
        color: "#36b86a",
      },
      {
        id: "under",
        label: "Under",
        probabilityPercent: 42,
        delta: -6,
        color: "#ff332e",
      },
    ],
    volumeOz: 44700,
    closesAt: "2026-08-26T20:00:00.000Z",
    resolved: false,
    priceHistory: [
      {
        at: "2026-08-26T14:00:00.000Z",
        percentsByOutcome: { over: 57, under: 44 },
      },
      {
        at: "2026-08-26T20:00:00.000Z",
        percentsByOutcome: { over: 58, under: 42 },
      },
    ],
  },
  {
    id: "epl_mu_over_1_5",
    sport: "football",
    leagueId: "epl",
    leagueLabel: "EPL",
    type: "event",
    status: "settled",
    question: "Man United to score over 1.5 goals?",
    outcomes: [
      {
        id: "over",
        label: "Over",
        probabilityPercent: 47,
        delta: -2,
        color: "#36b86a",
      },
      {
        id: "under",
        label: "Under",
        probabilityPercent: 53,
        delta: 2,
        color: "#ff332e",
      },
    ],
    volumeOz: 29100,
    closesAt: "2026-08-27T04:00:00.000Z",
    resolved: true,
    priceHistory: [
      {
        at: "2026-08-26T22:00:00.000Z",
        percentsByOutcome: { over: 48, under: 53 },
      },
      {
        at: "2026-08-27T04:00:00.000Z",
        percentsByOutcome: { over: 47, under: 53 },
      },
    ],
  },
  {
    id: "f1_belgian_gp_winner",
    sport: "motorsport",
    leagueId: "f1",
    leagueLabel: "BELGIAN GP",
    type: "match",
    status: "settled",
    question: "Who wins at Spa?",
    outcomes: [
      {
        id: "ver",
        label: "Verstappen",
        probabilityPercent: 36,
        delta: 1,
        color: "#3671c6",
      },
      {
        id: "nor",
        label: "Norris",
        probabilityPercent: 29,
        delta: 5,
        color: "#ff8000",
      },
      {
        id: "lec",
        label: "Leclerc",
        probabilityPercent: 18,
        delta: -3,
        color: "#e8002d",
      },
    ],
    volumeOz: 153000,
    closesAt: "2026-08-27T12:00:00.000Z",
    resolved: true,
    priceHistory: [
      {
        at: "2026-08-27T06:00:00.000Z",
        percentsByOutcome: { ver: 36, nor: 28, lec: 19 },
      },
      {
        at: "2026-08-27T12:00:00.000Z",
        percentsByOutcome: { ver: 36, nor: 29, lec: 18 },
      },
    ],
  },
];

export function marketById(id: string): PickMarket | undefined {
  return trendingMarkets.find((market) => market.id === id);
}
```

#### `src/mocks/matches/trending-catalog.ts`

**Unchanged.**

```ts
import type { BentoSpan } from "@/design-system";
import type { Sport } from "@/domain/sports";

/** What a trending tile is asking the player to do. */
export type TrendingTileKind = "match" | "predict" | "pick" | "future";

export type TrendingTileConfig = {
  id: string;
  kind: TrendingTileKind;
  /** Id of the match or market the tile renders. */
  sourceId: string;
  sport: Sport;
  span: BentoSpan;
};

/**
 * The curated trending feed. Order is the reading order; the bento packs the
 * tiles into whichever cells they fit.
 */
export const matchTrendingCatalog: TrendingTileConfig[] = [
  {
    id: "trend-fulham-chelsea",
    kind: "match",
    sourceId: "401879318",
    sport: "football",
    span: "wide",
  },
  {
    id: "trend-world-cup-future",
    kind: "future",
    sourceId: "fifa_2026_winner",
    sport: "football",
    span: "square",
  },
  {
    id: "trend-arsenal-predict",
    kind: "predict",
    sourceId: "epl_mu_ars",
    sport: "football",
    span: "square",
  },
  {
    id: "trend-liverpool-pick",
    kind: "pick",
    sourceId: "epl_liv_mc_winner",
    sport: "football",
    span: "square",
  },
  {
    id: "trend-spurs-knicks",
    kind: "match",
    sourceId: "basketball-revamp-20260614-ny-sa",
    sport: "basketball",
    span: "wide",
  },
  {
    id: "trend-rcb-gt",
    kind: "match",
    sourceId: "1535465",
    sport: "cricket",
    span: "wide",
  },
  {
    id: "trend-ipl-future",
    kind: "future",
    sourceId: "ipl_2026_winner",
    sport: "cricket",
    span: "square",
  },
  {
    id: "trend-ipl-sixes-pick",
    kind: "pick",
    sourceId: "ipl_sixes_over_12_5",
    sport: "cricket",
    span: "square",
  },
  {
    id: "trend-wimbledon-predict",
    kind: "predict",
    sourceId: "wimbledon_mens_final_26",
    sport: "tennis",
    span: "wide",
  },
  {
    id: "trend-man-utd-pick",
    kind: "pick",
    sourceId: "epl_mu_over_1_5",
    sport: "football",
    span: "square",
  },
  {
    id: "trend-italian-gp",
    kind: "match",
    sourceId: "600057442",
    sport: "motorsport",
    span: "square",
  },
];
```

#### `src/mocks/matches/index.ts`

**Trimmed.** StatOz also exports match details, quizzes and discussion threads from here.

```ts
export * from "./catalog";
export * from "./markets";
export * from "./trending-catalog";
```

### Games

`game-registry.ts` is the one place that describes each game: its title, colour, illustration, link, and whether it is a hero or a quick tile. `sport-decks.ts` says which games belong to which sport. `trending-catalog.ts` is the ordered list of tiles in the GAMES trending grid.

#### `src/features/games/types.ts`

**Unchanged.**

```ts
import type { BentoSpan } from "@/design-system";
import type { Sport } from "@/domain/sports";

/**
 * Identifier of a playable game. Several sports run their own cut of the same
 * format — five quizzes, four mystery games — so the id names the sport's
 * version rather than the format alone.
 */
export type GameId =
  | "pitch-duel"
  | "penalty-shootout"
  | "football-chess"
  | "football-quiz"
  | "football-bingo"
  | "guess-player"
  | "final-over"
  | "cricket-quiz"
  | "cricket-guess-player"
  | "hoop-duel"
  | "basketball-quiz"
  | "basketball-guess-player"
  | "tennis-rally"
  | "tennis-quiz"
  | "tennis-guess-winner"
  | "grand-prix-dash"
  | "motorsport-quiz"
  | "guess-driver";

/**
 * How a game presents itself. `hero` tiles carry a painted scene and a call to
 * action; `quick` tiles are the compact icon plates.
 */
export type GameTileKind = "hero" | "quick";

/**
 * Which illustration a game shows. Formats that repeat across sports share one
 * drawing rather than carrying five near-identical files.
 */
export type GameSceneId =
  | "pitch-duel"
  | "penalty-shootout"
  | "football-chess"
  | "final-over"
  | "hoop-duel"
  | "grand-prix-dash"
  | "tennis-rally"
  | "quiz"
  | "bingo"
  | "guess-player"
  | "guess-driver"
  | "guess-winner";

/** One tile in the games trending bento. */
export type GamesTrendingTileConfig = {
  id: string;
  /** Id of the game the tile launches. */
  sourceId: GameId;
  sport: Sport;
  span: BentoSpan;
};
```

#### `src/mocks/games/game-registry.ts`

**Unchanged.**

```ts
import type { AccentName } from "@/design-system";
import { sportModuleFor } from "@/domain/sports";

import type { GameId, GameSceneId, GameTileKind } from "@/features/games/types";

export type GameEntry = {
  kind: GameTileKind;
  /** Single-line title, and the accessible name the tile announces. */
  title: string;
  /**
   * Where the title is set over fixed lines rather than wrapped. Flutter pins
   * these so long names break at the same point every time.
   */
  titleLines?: string[];
  subtitle: string;
  /** Hero tiles only: the corner tag above the title. */
  badgeLabel?: string;
  /** Hero tiles only: the verb pinned to the bottom edge. */
  ctaLabel?: string;
  accent: AccentName;
  /** Casts the accent bloom. Only the featured game sets it. */
  glow?: boolean;
  /**
   * Whether the game fields a deck of cards. Those games hand the player their
   * sport's starter pack the first time they enter; quizzes and the guessing
   * games need no cards and so have no gate.
   */
  requiresDeck?: true;
  /** The illustration this game shows; formats that repeat share one. */
  scene: GameSceneId;
  href: string;
};

/**
 * Copy, accent, illustration, and destination for every playable game.
 *
 * The Flutter screen builds these inline, in two places — the trending bento
 * and the per-sport deck — and the two disagree in a few spots. Here each game
 * has one identity, so the collapsed cases are called out where they happen.
 *
 * Route slugs follow the game module directories under `features/games`, so a
 * few differ from the id: the arcade names a game, the module names a sport.
 */
export const gameRegistry: Record<GameId, GameEntry> = {
  /* ---- football ------------------------------------------------------- */
  "pitch-duel": {
    kind: "hero",
    title: "PITCH DUEL",
    subtitle: "TACTICAL CARD GAME",
    badgeLabel: "FEATURED // TACTICAL",
    ctaLabel: "ENTER THE DUEL",
    accent: "cyan",
    glow: true,
    scene: "pitch-duel",
    href: "/play/pitch-duel",
    requiresDeck: true,
  },
  "penalty-shootout": {
    kind: "hero",
    title: "PENALTY SHOOTOUT",
    titleLines: ["PENALTY", "SHOOTOUT"],
    subtitle: "SUDDEN-DEATH SPOT KICKS",
    badgeLabel: "SUDDEN DEATH",
    ctaLabel: "TAKE THE SHOT",
    accent: sportModuleFor("football").accent,
    scene: "penalty-shootout",
    href: "/play/penalty-shootout",
    requiresDeck: true,
  },
  "football-chess": {
    kind: "hero",
    title: "5V5 FOOTBALL CHESS",
    titleLines: ["5V5 FOOTBALL", "CHESS"],
    subtitle: "TACTICAL SQUAD DUEL",
    badgeLabel: "FEATURED // 5V5",
    ctaLabel: "MAKE YOUR MOVE",
    accent: sportModuleFor("football").accent,
    scene: "football-chess",
    href: "/play/football-chess",
    requiresDeck: true,
  },
  "football-quiz": {
    kind: "quick",
    title: "FOOTBALL QUIZ",
    subtitle: "TRIVIA GAUNTLET",
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/football",
  },
  "football-bingo": {
    kind: "quick",
    title: "FOOTBALL BINGO",
    // The deck said "COUNTRY x CLUB GRID"; both axes are clubs, and the grid
    // asks which player turned out for the pair. The trending bento says
    // "BUILD A WINNING GRID".
    subtitle: "CLUB x CLUB GRID",
    // Orange in the deck, cyan in the bento. Orange keeps it distinct from the
    // three cyan football games it sits beside.
    accent: "orange",
    scene: "bingo",
    href: "/play/football-bingo",
  },
  "guess-player": {
    kind: "quick",
    title: "GUESS THE PLAYER",
    subtitle: "DAILY FOOTBALL MYSTERY",
    // Pink is the family colour every other mystery game uses; the bento's lime
    // was the odd one out.
    accent: "pink",
    scene: "guess-player",
    href: "/play/guess-player",
  },

  /* ---- cricket -------------------------------------------------------- */
  "final-over": {
    kind: "hero",
    title: "FINAL OVER",
    subtitle: "THREE-OVER CHASE",
    badgeLabel: "FEATURED // THREE OVERS",
    ctaLabel: "START THE CHASE",
    accent: sportModuleFor("cricket").accent,
    scene: "final-over",
    href: "/play/final-over",
    requiresDeck: true,
  },
  "cricket-quiz": {
    kind: "quick",
    title: "CRICKET QUIZ",
    subtitle: "TRIVIA GAUNTLET",
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/cricket",
  },
  "cricket-guess-player": {
    kind: "quick",
    title: "GUESS THE PLAYER",
    subtitle: "DAILY CRICKET MYSTERY",
    accent: "pink",
    scene: "guess-player",
    href: "/play/guess-player/cricket",
  },

  /* ---- basketball ----------------------------------------------------- */
  "hoop-duel": {
    kind: "hero",
    title: "HOOP DUEL",
    subtitle: "STREET 1-ON-1 ARCADE HOOPS",
    badgeLabel: "FEATURED // STREET",
    ctaLabel: "HIT THE COURT",
    accent: "gold",
    scene: "hoop-duel",
    href: "/play/basketball",
    requiresDeck: true,
  },
  "basketball-quiz": {
    kind: "quick",
    title: "BASKETBALL QUIZ",
    subtitle: "TRIVIA GAUNTLET",
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/basketball",
  },
  "basketball-guess-player": {
    kind: "quick",
    title: "GUESS THE PLAYER",
    subtitle: "DAILY BASKETBALL MYSTERY",
    accent: "pink",
    scene: "guess-player",
    href: "/play/guess-player/basketball",
  },

  /* ---- tennis --------------------------------------------------------- */
  "tennis-rally": {
    kind: "hero",
    title: "TENNIS RALLY",
    subtitle: "2D ARCADE SETS // 5 MODES",
    badgeLabel: "FEATURED // NEW",
    ctaLabel: "STEP ON COURT",
    accent: "lime",
    scene: "tennis-rally",
    href: "/play/tennis",
    requiresDeck: true,
  },
  "tennis-quiz": {
    kind: "quick",
    title: "TENNIS QUIZ",
    subtitle: "TRIVIA GAUNTLET",
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/tennis",
  },
  "tennis-guess-winner": {
    kind: "quick",
    title: "GUESS THE WINNER",
    subtitle: "DAILY MYSTERY",
    accent: "cyan",
    scene: "guess-winner",
    href: "/play/guess-winner",
  },

  /* ---- motorsport ----------------------------------------------------- */
  "grand-prix-dash": {
    kind: "hero",
    title: "GRAND PRIX DASH",
    titleLines: ["GRAND PRIX", "DASH"],
    subtitle: "ONE-LAP ARCADE RACER",
    badgeLabel: "FEATURED // RACE",
    ctaLabel: "RACE NOW",
    accent: "racing",
    scene: "grand-prix-dash",
    href: "/play/grand-prix",
    requiresDeck: true,
  },
  "motorsport-quiz": {
    kind: "quick",
    title: "MOTORSPORT QUIZ",
    subtitle: "TRIVIA GAUNTLET",
    accent: "violet",
    scene: "quiz",
    href: "/play/quiz/motorsport",
  },
  "guess-driver": {
    kind: "quick",
    title: "GUESS THE DRIVER",
    subtitle: "DAILY F1 MYSTERY",
    accent: "pink",
    scene: "guess-driver",
    href: "/play/guess-driver",
  },
};

/** The registry entry for a game, or `undefined` when it has no tile yet. */
export function gameEntryFor(id: GameId): GameEntry | undefined {
  return gameRegistry[id];
}

/**
 * Every game addressable under `/play`, and the game each href names.
 *
 * Built from the registry rather than kept alongside it, so a game that changes
 * its href cannot end up unreachable.
 */
const gameByHref: Record<string, GameId> = Object.fromEntries(
  Object.entries(gameRegistry).map(([id, entry]) => [entry.href, id as GameId]),
);

export function playableGameHrefs(): string[] {
  return Object.keys(gameByHref);
}

export function gameForHref(
  href: string,
): { game: GameId; entry: GameEntry } | null {
  const game = gameByHref[href];
  return game ? { game, entry: gameRegistry[game] } : null;
}
```

#### `src/mocks/games/sport-decks.ts`

**Unchanged.**

```ts
import type { Sport } from "@/domain/sports";

import { gameRegistry } from "./game-registry";
import type { GameId } from "@/features/games/types";

/**
 * Every game a sport offers, in the order its deck lists them. Heroes lead,
 * quick games follow — the deck reads the `kind` off the registry rather than
 * keeping two lists, so a game can be promoted by editing one field.
 */
export const sportGameDecks: Record<Sport, GameId[]> = {
  football: [
    "pitch-duel",
    "penalty-shootout",
    "football-chess",
    "football-quiz",
    "football-bingo",
    "guess-player",
  ],
  cricket: ["final-over", "cricket-quiz", "cricket-guess-player"],
  basketball: ["hoop-duel", "basketball-quiz", "basketball-guess-player"],
  tennis: ["tennis-rally", "tennis-quiz", "tennis-guess-winner"],
  motorsport: ["grand-prix-dash", "motorsport-quiz", "guess-driver"],
};

export type SportDeck = {
  sport: Sport;
  heroes: GameId[];
  quick: GameId[];
};

/** A sport's deck, split into the two shelves it renders as. */
export function deckFor(sport: Sport): SportDeck {
  const games = sportGameDecks[sport];
  return {
    sport,
    heroes: games.filter((id) => gameRegistry[id].kind === "hero"),
    quick: games.filter((id) => gameRegistry[id].kind === "quick"),
  };
}

/** Small summary used by the shared All Sports picker. */
export function gameCountForSport(sport: Sport): number {
  return sportGameDecks[sport].length;
}

/**
 * Which sport a game belongs to, inverted from the decks above so the two can
 * never disagree about it.
 */
const sportByGame: Record<GameId, Sport> = Object.fromEntries(
  Object.entries(sportGameDecks).flatMap(([sport, games]) =>
    games.map((id) => [id, sport as Sport] as const),
  ),
) as Record<GameId, Sport>;

export function sportForGame(game: GameId): Sport {
  return sportByGame[game];
}
```

#### `src/mocks/games/trending-catalog.ts`

**Unchanged.**

```ts
import type { GamesTrendingTileConfig } from "@/features/games/types";

/**
 * The curated arcade feed. Order is the reading order; the bento packs the
 * tiles into whichever cells they fit.
 */
export const gamesTrendingCatalog: GamesTrendingTileConfig[] = [
  {
    id: "trend-game-pitch-duel",
    sourceId: "pitch-duel",
    sport: "football",
    span: "tall",
  },
  {
    id: "trend-game-penalty",
    sourceId: "penalty-shootout",
    sport: "football",
    span: "tall",
  },
  {
    id: "trend-game-football-chess",
    sourceId: "football-chess",
    sport: "football",
    span: "tall",
  },
  {
    id: "trend-game-football-quiz",
    sourceId: "football-quiz",
    sport: "football",
    span: "square",
  },
  {
    id: "trend-game-football-bingo",
    sourceId: "football-bingo",
    sport: "football",
    span: "square",
  },
  {
    id: "trend-game-guess-player",
    sourceId: "guess-player",
    sport: "football",
    span: "wide",
  },
  {
    id: "trend-game-final-over",
    sourceId: "final-over",
    sport: "cricket",
    span: "wide",
  },
  {
    id: "trend-game-hoop-duel",
    sourceId: "hoop-duel",
    sport: "basketball",
    span: "square",
  },
  {
    id: "trend-game-grand-prix",
    sourceId: "grand-prix-dash",
    sport: "motorsport",
    span: "square",
  },
  {
    id: "trend-game-tennis-rally",
    sourceId: "tennis-rally",
    sport: "tennis",
    span: "wide",
  },
];
```

#### `src/mocks/games/index.ts`

**Unchanged.**

```ts
export * from "./game-registry";
export * from "./sport-decks";
export * from "./trending-catalog";
```

## Step 6: adapters for auth and profile

The section touches two parts of StatOz that are out of scope: who is signed in, and which clubs the player follows. These three small files stand in for them. They have the same shape as StatOz's real modules, so the components that import them are unchanged.

As written, everyone counts as signed in and nobody follows a club. That gives a fully working page with plain links on every game tile and no YOUR CLUB pin. [Connecting real data and auth](#connecting-real-data-and-auth) explains how to wire them up.

#### `src/features/auth/index.ts`

**New.** Stands in for StatOz's auth feature, with the same two hooks.

```ts
/**
 * Auth adapter. The game tiles read these two hooks; wire them to the host
 * project's own auth. As shipped, everyone is treated as signed in, so every
 * tile is a plain link to its game.
 */
export type AuthStatus = "hydrating" | "guest" | "authenticated";

export type AuthGateRequest = {
  /** What the player was trying to do, for example "play". */
  intent: string;
  message?: string;
  /** Where to send the player once they have logged in. */
  returnTo?: string;
};

/** The current session. `hydrating` means it is not known yet. */
export function useAuthSession(): { status: AuthStatus } {
  return { status: "authenticated" };
}

/**
 * Returns the function a tile calls when a signed-out player taps it. It
 * should open the login prompt and return false, or return true when the
 * player is already signed in.
 */
export function useRequireAuth(): (request: AuthGateRequest) => boolean {
  return () => true;
}
```

#### `src/features/profile/index.ts`

**New.** Stands in for StatOz's profile feature, with the one hook this page uses.

```ts
/**
 * Profile adapter. The sport feed reads the player's followed clubs from here
 * to pin YOUR CLUB above the fixtures. Keys are league ids and values are team
 * ids, both matched against `followableLeagues` in `mocks/onboarding`.
 */
export type ProfileIdentity = {
  favoriteTeams: Record<string, string>;
};

const noFavorites: ProfileIdentity = { favoriteTeams: {} };

export function useProfileIdentity(): ProfileIdentity {
  return noFavorites;
}
```

#### `src/mocks/onboarding/index.ts`

**New.** Stands in for StatOz's list of leagues and clubs a player can follow.

```ts
import type { Sport } from "@/domain/sports";

export type FollowableTeam = {
  id: string;
  name: string;
  shortName: string;
  color: string;
};

/** A competition and the teams a player can follow within it. */
export type FollowableLeague = {
  sport: Sport;
  id: string;
  name: string;
  shortCode: string;
  teams: FollowableTeam[];
};

/** Empty as shipped, which keeps the YOUR CLUB pin hidden. */
export const followableLeagues: FollowableLeague[] = [];
```

## Step 7: the MATCH components

### Sport strip and selector

#### `src/features/matches/components/sport-icon.tsx`

**Unchanged.**

```tsx
import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  MotorsportIcon,
  TennisIcon,
  type IconProps,
} from "@/design-system";
import type { Sport } from "@/domain/sports";

const glyphs = {
  football: FootballIcon,
  cricket: CricketIcon,
  basketball: BasketballIcon,
  tennis: TennisIcon,
  motorsport: MotorsportIcon,
} as const;

/** Resolves a sport to its glyph so callers do not switch on the union. */
export function SportIcon({ sport, ...props }: IconProps & { sport: Sport }) {
  const Glyph = glyphs[sport];
  return <Glyph {...props} />;
}
```

#### `src/features/matches/components/sport-hub-tabs.tsx`

**Unchanged.**

```tsx
"use client";

import {
  accentVar,
  FlameIcon,
  MoreIcon,
  SearchIcon,
  UnderlineTabs,
  type UnderlineTab,
} from "@/design-system";
import {
  sportModuleFor,
  sportOrder,
  sportTabColors,
  type Sport,
} from "@/domain/sports";

import { SportIcon } from "./sport-icon";

/** `null` is the Trending destination; a sport narrows the feed to that sport. */
export type SportHubSelection = Sport | null;

export type SportHubTabsProps = {
  selected: SportHubSelection;
  onSelect: (selection: SportHubSelection) => void;
  onMore?: () => void;
  onSearch?: () => void;
};

/** Motorsport stays in All Sports rather than crowding the shortcuts. */
const shortcuts: Sport[] = sportOrder.filter(
  (sport) =>
    sport === "football" || sport === "cricket" || sport === "basketball",
);

/** Browse strip above the feed: Trending, four sports, then All Sports. */
export function SportHubTabs({
  selected,
  onSelect,
  onMore,
  onSearch,
}: SportHubTabsProps) {
  const tabs: UnderlineTab[] = [
    { id: "trending", label: "TRENDING", icon: <FlameIcon size={21} /> },
    ...shortcuts.map((sport) => ({
      id: sport,
      label: sportModuleFor(sport).label.toUpperCase(),
      icon: <SportIcon sport={sport} size={21} />,
    })),
    {
      id: "all",
      label: "ALL SPORTS",
      icon: <MoreIcon size={21} />,
      action: onMore,
    },
  ];

  const shortcutIndex = selected === null ? -1 : shortcuts.indexOf(selected);
  const activeIndex =
    selected === null ? 0 : shortcutIndex >= 0 ? shortcutIndex + 1 : -1;
  const accent = accentVar(selected ? sportModuleFor(selected).accent : "cyan");
  const shortcutColors = sportTabColors
    .slice(0, shortcuts.length)
    .map(accentVar);

  return (
    <UnderlineTabs
      label="Browse by sport"
      tabs={tabs}
      activeIndex={activeIndex}
      accent={accent}
      iconColors={[accentVar("cyan"), ...shortcutColors, accentVar("cyan")]}
      onChange={(index) => onSelect(index === 0 ? null : shortcuts[index - 1])}
      trailing={
        onSearch ? (
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search teams and leagues"
            title="Search teams and leagues"
            className="grid size-11 place-items-center text-accent"
          >
            <SearchIcon size={22} />
          </button>
        ) : undefined
      }
    />
  );
}
```

#### `src/features/matches/components/all-sports-selector.tsx`

**Unchanged.**

```tsx
"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { accentVar, ArrowLeftIcon, FlameIcon } from "@/design-system";
import { sportModuleFor, sportOrder, type Sport } from "@/domain/sports";

import { SportIcon } from "./sport-icon";
import type { SportHubSelection } from "./sport-hub-tabs";
import styles from "./all-sports-selector.module.css";

export type SportSelectorCount = {
  total: number;
  live?: number;
};

export type AllSportsSelectorProps = {
  open: boolean;
  mode: "matches" | "games";
  selected: SportHubSelection;
  counts: Record<Sport, SportSelectorCount>;
  onSelect: (selection: SportHubSelection) => void;
  onClose: () => void;
};

/** Full-screen sport catalogue shared by MATCH and GAMES. */
export function AllSportsSelector({
  open,
  mode,
  selected,
  counts,
  onSelect,
  onClose,
}: AllSportsSelectorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const total = sportOrder.reduce((sum, sport) => sum + counts[sport].total, 0);
  const live = sportOrder.reduce(
    (sum, sport) => sum + (counts[sport].live ?? 0),
    0,
  );

  function choose(next: SportHubSelection) {
    onSelect(next);
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="all-sports-title"
      className={styles.dialog}
      onClose={onClose}
    >
      <div className={`${styles.surface} flex min-h-full flex-col`}>
        <header className="sticky top-0 z-10 border-b border-line bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center px-2 sm:px-4">
            <button
              type="button"
              aria-label="Back to home"
              title="Back"
              onClick={() => dialogRef.current?.close()}
              className="grid size-11 shrink-0 place-items-center text-cyan"
            >
              <ArrowLeftIcon size={23} />
            </button>
            <div className="min-w-0 pl-2">
              <h2
                id="all-sports-title"
                className="font-display text-base font-black tracking-mega"
              >
                ALL SPORTS
              </h2>
              <p className="mt-0.5 font-display text-2xs font-extrabold tracking-ultra text-muted">
                {mode === "matches" ? "MATCH CENTRE" : "GAME ARCADE"}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
          <p className="mb-3 font-display text-2xs font-black tracking-max text-muted">
            SELECT DESTINATION
          </p>
          <div className="flex flex-col gap-3">
            <SelectorRow
              label="TRENDING"
              detail={
                mode === "matches"
                  ? "THE BIGGEST FIXTURES NOW"
                  : "QUICK PLAY ACROSS SPORTS"
              }
              count={
                mode === "matches" && live > 0
                  ? `${live} LIVE · ${total}`
                  : `${total} GAMES`
              }
              accent={accentVar("cyan")}
              selected={selected === null}
              icon={<FlameIcon size={25} />}
              onClick={() => choose(null)}
            />
            {sportOrder.map((sport) => {
              const sportModule = sportModuleFor(sport);
              const count = counts[sport];
              const countLabel =
                mode === "matches"
                  ? count.live
                    ? `${count.live} LIVE · ${count.total}`
                    : `${count.total} FIXTURES`
                  : `${count.total} GAMES`;
              return (
                <SelectorRow
                  key={sport}
                  label={
                    sport === "basketball"
                      ? "BASKETBALL"
                      : sportModule.label.toUpperCase()
                  }
                  detail={
                    mode === "matches"
                      ? "FIXTURES & RESULTS"
                      : "SPORT GAME DECK"
                  }
                  count={countLabel}
                  accent={accentVar(sportModule.accent)}
                  selected={selected === sport}
                  live={mode === "matches" && Boolean(count.live)}
                  icon={<SportIcon sport={sport} size={25} />}
                  onClick={() => choose(sport)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
}

function SelectorRow({
  label,
  detail,
  count,
  accent,
  selected,
  live = false,
  icon,
  onClick,
}: {
  label: string;
  detail: string;
  count: string;
  accent: string;
  selected: boolean;
  live?: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  const style = { "--selector-accent": accent } as CSSProperties;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${styles.row} ${selected ? styles.selected : ""}`}
      style={style}
    >
      <span className={styles.rowInner}>
        <span className={styles.iconPlate}>{icon}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-display text-sm font-black tracking-display">
            {label}
          </span>
          <span className="mt-1 block truncate font-display text-2xs font-bold tracking-ultra text-muted">
            {detail}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {live ? <span className={styles.liveDot} aria-hidden /> : null}
          <span className="ds-tabular font-display text-2xs font-black tracking-wide text-muted">
            {count}
          </span>
        </span>
      </span>
    </button>
  );
}
```

#### `src/features/matches/components/all-sports-selector.module.css`

**Unchanged.**

```css
.dialog {
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--ds-color-text-default);
  background:
    radial-gradient(circle at 50% 0%, rgb(0 229 255 / 8%), transparent 34rem),
    var(--ds-color-background-primary);
}

.dialog::backdrop {
  background: var(--ds-color-overlay-scrim);
  backdrop-filter: blur(6px);
}

.surface {
  min-height: 100%;
  background-image:
    linear-gradient(rgb(255 255 255 / 1%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 1%) 1px, transparent 1px);
  background-size: 28px 28px;
}

.row {
  --selector-accent: var(--ds-color-accent-cyan);
  position: relative;
  display: block;
  width: 100%;
  min-height: 76px;
  padding: 1px;
  clip-path: var(--ds-clip-hud);
  color: inherit;
  background: color-mix(
    in srgb,
    var(--selector-accent) 42%,
    var(--ds-color-border-default)
  );
  transition:
    transform 150ms ease,
    filter 150ms ease;
}

.row::after {
  content: "";
  position: absolute;
  top: 12px;
  right: 0;
  bottom: 12px;
  width: 4px;
  background: transparent;
}

.row:hover {
  transform: translateY(-1px);
}

.row:active {
  transform: translateY(0);
}

.selected {
  background: var(--selector-accent);
  filter: drop-shadow(
    0 0 12px color-mix(in srgb, var(--selector-accent) 14%, transparent)
  );
}

.selected::after {
  background: var(--selector-accent);
  box-shadow: 0 0 10px
    color-mix(in srgb, var(--selector-accent) 70%, transparent);
}

.rowInner {
  position: relative;
  display: flex;
  min-height: 74px;
  align-items: center;
  gap: 14px;
  padding: 10px 18px 10px 14px;
  clip-path: var(--ds-clip-hud);
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--selector-accent) 8%, transparent),
      transparent 46%
    ),
    var(--ds-color-background-elevated);
}

.iconPlate {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  clip-path: var(--ds-clip-octagon);
  color: var(--selector-accent);
  background: color-mix(
    in srgb,
    var(--selector-accent) 13%,
    var(--ds-color-background-muted)
  );
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--selector-accent) 42%, transparent);
  opacity: 0.62;
}

.selected .iconPlate {
  opacity: 1;
}

.liveDot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--ds-color-danger);
  box-shadow: 0 0 8px
    color-mix(in srgb, var(--ds-color-danger) 72%, transparent);
}

@media (min-width: 768px) {
  .row {
    min-height: 82px;
  }

  .rowInner {
    min-height: 80px;
  }
}
```

### Crest and shared tile rows

`TeamBadge` draws a crest from data alone: an octagon in the team's main colour, a stripe of its second colour along the bottom, and its short name. No image files are needed.

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

#### `src/features/matches/components/tile-meta-row.tsx`

**Unchanged.**

```tsx
import { accentVar } from "@/design-system";
import { sportModuleFor, type Sport } from "@/domain/sports";

import { SportIcon } from "./sport-icon";

export type TileMetaRowProps = {
  sport: Sport;
  leagueLabel: string;
  /** Names the sport before the league. Wide tiles have the room; squares don't. */
  showSportLabel?: boolean;
};

/**
 * The line every trending tile opens with: what sport this is, then which
 * competition. The sport accent colours the glyph and its label; the league
 * stays muted, so the accent means "sport" on every tile rather than shifting
 * to mean "tile kind" on some of them.
 */
export function TileMetaRow({
  sport,
  leagueLabel,
  showSportLabel = false,
}: TileMetaRowProps) {
  const sportModule = sportModuleFor(sport);
  const sportAccent = accentVar(sportModule.accent);

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <SportIcon
        sport={sport}
        size={13}
        className="shrink-0"
        style={{ color: sportAccent }}
      />
      {showSportLabel ? (
        <>
          <span
            className="shrink-0 font-display text-2xs font-extrabold tracking-wide"
            style={{ color: sportAccent }}
          >
            {sportModule.shortLabel}
          </span>
          <span aria-hidden className="h-2.25 w-px shrink-0 bg-line-strong" />
        </>
      ) : null}
      <span className="min-w-0 truncate font-display text-2xs font-extrabold tracking-wide text-muted">
        {leagueLabel}
      </span>
    </div>
  );
}
```

#### `src/features/matches/components/tile-footer.tsx`

**Unchanged.**

```tsx
import type { ReactNode } from "react";

import { formatOzCompact } from "@/shared/utils";

export type TileFooterProps = {
  /** What the tile is worth, or what state it is in. */
  status: string;
  /** CSS color for the status line. */
  accent: string;
  /** Glyph set before the status, sized to the 10px label. */
  icon?: ReactNode;
  /** Traded volume, rendered on the right. Omitted when a tile has none. */
  volumeOz?: number;
};

/**
 * The bottom rail shared by every trending tile: the stake on the left, the
 * market's volume on the right. Every kind carries one, so a row of tiles ends
 * on a single baseline instead of each kind stopping wherever its content did.
 */
export function TileFooter({
  status,
  accent,
  icon,
  volumeOz,
}: TileFooterProps) {
  return (
    <>
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span
        className="ds-tabular min-w-0 flex-1 truncate font-display text-2xs font-extrabold tracking-wide"
        style={{ color: accent }}
      >
        {status}
      </span>
      {volumeOz !== undefined ? (
        <span className="ds-tabular shrink-0 font-display text-2xs font-extrabold tracking-wide text-muted">
          VOL {formatOzCompact(volumeOz)} OZ
        </span>
      ) : null}
    </>
  );
}
```

### Fixture card

#### `src/features/matches/components/sport-fixture-card.tsx`

**Unchanged.**

```tsx
import Link from "next/link";
import type { CSSProperties } from "react";

import type { SportMatch, SportTeam } from "@/domain/matches";
import { formatKickoffTime, formatOzCompact } from "@/shared/utils";

import styles from "./sport-fixture-card.module.css";
import { TeamBadge } from "./team-badge";

export type SportFixtureCardProps = {
  match: SportMatch;
  followedTeamName?: string;
  /** Keeps feed cards unchanged while Trending opts into its shared chrome. */
  appearance?: "default" | "trending";
};

/** Flutter-faithful fixture surface shared by every sport match home. */
export function SportFixtureCard({
  match,
  followedTeamName,
  appearance = "default",
}: SportFixtureCardProps) {
  const trending = appearance === "trending";
  const followed = [match.home, match.away].find(
    (team) => team.name === followedTeamName,
  );
  const stateColor = trending
    ? "var(--ds-color-fixture-predicted)"
    : match.status === "live"
      ? "var(--ds-color-danger)"
      : match.status === "finished"
        ? "var(--ds-color-fixture-border)"
        : (followed?.color ?? "var(--ds-color-fixture-predicted)");
  const label =
    match.sport === "motorsport"
      ? `${match.home.name}, ${statusLabel(match)}`
      : `${match.home.name} versus ${match.away.name}, ${statusLabel(match)}`;

  return (
    <article
      className={`${styles.shell} ${trending ? styles.trending : ""}`}
      style={{ "--fixture-state": stateColor } as CSSProperties}
    >
      <div aria-hidden className={styles.lift} />
      <div className={styles.frame}>
        <div className={styles.inner}>
          <div className={styles.body}>
            {match.sport === "motorsport" ? (
              <RaceIdentity match={match} />
            ) : (
              <Teams match={match} followedTeamName={followedTeamName} />
            )}
            {showsResultSummary(match) ? (
              <p className="mt-3 text-center text-xs font-semibold leading-body text-[var(--ds-color-fixture-result)]">
                {match.resultLine}
              </p>
            ) : null}
          </div>
          <StatusStrip match={match} />
        </div>
      </div>
      <div className={styles.tag}>
        <StatusTag match={match} />
      </div>
      <Link
        href={`/matches/${match.id}`}
        aria-label={label}
        className={styles.stretchedLink}
      />
    </article>
  );
}

function StatusTag({ match }: { match: SportMatch }) {
  if (match.status === "live") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-extrabold tracking-label text-danger">
        <span aria-hidden className={styles.liveDot} />
        {match.liveMinute == null ? "LIVE" : `LIVE ${match.liveMinute}′`}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="text-xs font-semibold tracking-tight text-muted">
        Finished
      </span>
    );
  }
  return (
    <time
      dateTime={match.kickoff}
      className="ds-tabular text-sm font-bold tracking-label text-[var(--ds-color-fixture-kickoff)]"
    >
      {formatKickoffTime(match.kickoff)}
    </time>
  );
}

function Teams({
  match,
  followedTeamName,
}: {
  match: SportMatch;
  followedTeamName?: string;
}) {
  const cricket = match.sport === "cricket";
  const hasScore = match.homeScore != null || match.awayScore != null;
  const homeValue = scoreValue(match.homeScore);
  const awayValue = scoreValue(match.awayScore);
  const hasWinner =
    match.status === "finished" &&
    homeValue != null &&
    awayValue != null &&
    homeValue !== awayValue;
  const homeWinner = hasWinner ? homeValue > awayValue : null;
  const awayWinner = hasWinner ? awayValue > homeValue : null;
  return (
    <div className="flex min-w-0 items-start">
      <TeamColumn
        team={match.home}
        followed={match.home.name === followedTeamName}
        dim={match.status === "finished" && homeWinner === false}
        winner={homeWinner}
        score={cricket ? match.homeScore : undefined}
      />
      <div className="flex shrink-0 flex-col items-center px-2 pt-2">
        {!cricket && hasScore ? (
          <span className="ds-tabular whitespace-nowrap font-display text-2xl font-black tracking-tight">
            <span
              className={
                homeWinner === false ? "text-muted" : "text-foreground"
              }
            >
              {match.homeScore ?? "-"}
            </span>
            <span className="text-muted"> - </span>
            <span
              className={
                awayWinner === false ? "text-muted" : "text-foreground"
              }
            >
              {match.awayScore ?? "-"}
            </span>
          </span>
        ) : (
          <span className="font-display text-lg font-black text-muted">-</span>
        )}
        {match.sport === "tennis" && match.tennisSets?.length ? (
          <div className="mt-1.5 flex max-w-32 flex-wrap justify-center gap-1.5">
            {match.tennisSets.map((set, index) => (
              <span
                key={`${set.homeScore}-${set.awayScore}-${index}`}
                className={`${styles.setChip} ds-tabular px-2 py-0.75 text-2xs font-bold text-cyan`}
              >
                {set.homeScore}-{set.awayScore}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <TeamColumn
        team={match.away}
        followed={match.away.name === followedTeamName}
        alignEnd
        dim={match.status === "finished" && awayWinner === false}
        winner={awayWinner}
        score={cricket ? match.awayScore : undefined}
      />
    </div>
  );
}

function TeamColumn({
  team,
  alignEnd = false,
  dim,
  winner,
  followed,
  score,
}: {
  team: SportTeam;
  alignEnd?: boolean;
  dim: boolean;
  winner: boolean | null;
  followed: boolean;
  score?: SportMatch["homeScore"];
}) {
  const cricketScore = score == null ? null : splitCricketScore(String(score));
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col ${alignEnd ? "items-end text-right" : "items-start text-left"}`}
    >
      <span
        className={`flex items-center gap-2 ${alignEnd ? "flex-row-reverse" : ""}`}
      >
        <TeamBadge team={team} />
        {cricketScore ? (
          <b
            className={`ds-tabular font-display text-lg font-black ${dim ? "text-muted" : "text-foreground"}`}
          >
            {cricketScore.score}
          </b>
        ) : null}
      </span>
      <span
        className={`mt-2 line-clamp-2 max-w-full text-base font-bold leading-tight ${dim ? "text-[var(--ds-color-fixture-dim-name)]" : "text-foreground"}`}
        style={followed ? { color: team.color } : undefined}
      >
        {team.name}
      </span>
      {cricketScore?.qualifier ? (
        <span
          className={`ds-tabular mt-0.75 max-w-full text-xs font-semibold leading-tight ${winner ? "text-foreground" : "text-muted"}`}
        >
          {cricketScore.qualifier}
        </span>
      ) : null}
    </div>
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

function scoreValue(value: SportMatch["homeScore"]): number | null {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function RaceIdentity({ match }: { match: SportMatch }) {
  return (
    <div className="flex flex-col items-center text-center">
      <TeamBadge team={match.home} />
      <span className="mt-2 line-clamp-2 text-base font-bold leading-tight text-foreground">
        {match.home.name}
      </span>
    </div>
  );
}

function showsResultSummary(
  match: SportMatch,
): match is SportMatch & { resultLine: string } {
  return (
    Boolean(match.resultLine) &&
    match.sport !== "football" &&
    match.sport !== "basketball"
  );
}

function StatusStrip({ match }: { match: SportMatch }) {
  return (
    <div className={styles.footer}>
      {match.status === "live" ? (
        <span className="flex items-center gap-1.5 font-display text-2xs font-extrabold tracking-ultra text-danger">
          <span aria-hidden className={styles.liveDot} />
          IN PLAY
        </span>
      ) : match.status === "finished" ? (
        <span className="font-display text-2xs font-extrabold tracking-wide text-muted">
          FULL TIME
        </span>
      ) : (
        <span className="ds-tabular min-w-0 flex-1 truncate font-display text-2xs font-extrabold tracking-wide text-cyan/85">
          POTENTIAL +{match.rewardXp} XP
        </span>
      )}
      <span className="ds-tabular ml-auto shrink-0 font-display text-2xs font-semibold tracking-label text-muted">
        VOL {formatOzCompact(match.volumeOz)} OZ
      </span>
    </div>
  );
}

function statusLabel(match: SportMatch): string {
  if (match.status === "live")
    return match.liveMinute == null
      ? "live"
      : `live ${match.liveMinute} minutes`;
  if (match.status === "finished") return "finished";
  return formatKickoffTime(match.kickoff);
}
```

#### `src/features/matches/components/sport-fixture-card.module.css`

**Unchanged.**

```css
.shell {
  --fixture-state: var(--ds-color-fixture-predicted);
  position: relative;
  min-width: 0;
  height: 100%;
  isolation: isolate;
}

.lift {
  position: absolute;
  inset: 0;
  transform: translateY(var(--ds-shape-fixture-lift));
  clip-path: var(--ds-clip-fixture);
  background: color-mix(in srgb, var(--fixture-state) 25%, transparent);
}

.frame {
  position: relative;
  height: 100%;
  padding: 1.5px;
  clip-path: var(--ds-clip-fixture);
  background: color-mix(in srgb, var(--fixture-state) 25%, transparent);
  transition:
    transform 150ms ease,
    background-color 150ms ease;
}

.inner {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  overflow: hidden;
  clip-path: var(--ds-clip-fixture);
  background: var(--ds-color-fixture-base);
}

.body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 28px 16px 8px;
  background: var(--ds-gradient-fixture-card);
}

.tag {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 50%;
  display: flex;
  width: var(--ds-shape-fixture-notch-width);
  height: var(--ds-shape-fixture-notch-depth);
  transform: translateX(-50%);
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.stretchedLink {
  position: absolute;
  z-index: 3;
  inset: 0;
  clip-path: var(--ds-clip-fixture);
}

.stretchedLink:focus-visible {
  outline-offset: -3px;
}

.shell:hover .frame {
  transform: translateY(-2px);
}

.shell:active .frame {
  transform: translateY(0);
}

.trending .lift {
  background: color-mix(in srgb, var(--fixture-state) 16%, transparent);
}

.trending .frame {
  background: color-mix(in srgb, var(--fixture-state) 45%, transparent);
}

.trending .frame::before,
.trending .frame::after {
  position: absolute;
  z-index: 2;
  top: 0;
  width: max(0px, calc(50% - 72px));
  height: 2px;
  background: color-mix(in srgb, var(--fixture-state) 65%, transparent);
  content: "";
  pointer-events: none;
}

.trending .frame::before {
  left: 12px;
}

.trending .frame::after {
  right: 12px;
}

.trending .body {
  padding-inline: 14px;
  background: var(--ds-gradient-trending-card);
}

.trending .tag,
.trending .tag > * {
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-2xs);
  font-weight: 800;
  letter-spacing: var(--ds-tracking-wide);
}

.trending .footer {
  border-top-color: color-mix(in srgb, var(--fixture-state) 16%, transparent);
  padding-inline: 14px;
}

.trending:hover .frame {
  background: color-mix(in srgb, var(--fixture-state) 60%, transparent);
}

.trending:has(.stretchedLink:focus-visible) .frame {
  background: var(--fixture-state);
}

.setChip {
  border: 1px solid
    color-mix(in srgb, var(--ds-color-accent-cyan) 35%, transparent);
  border-radius: var(--ds-radius-md);
  background: color-mix(in srgb, var(--ds-color-accent-cyan) 6%, transparent);
}

.footer {
  display: flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgb(255 255 255 / 6%);
  background: var(--ds-color-fixture-strip);
  padding: 9px 16px;
}

.liveDot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: var(--ds-color-danger);
  box-shadow: 0 0 6px var(--ds-color-danger);
}
```

### Trending grid

#### `src/features/matches/components/trending-match-card.tsx`

**Unchanged.**

```tsx
import type { SportMatch } from "@/domain/matches";

import { SportFixtureCard } from "./sport-fixture-card";

export type TrendingMatchCardProps = {
  match: SportMatch;
};

/** Match tiles share the centred-status fixture structure used by sport feeds. */
export function TrendingMatchCard({ match }: TrendingMatchCardProps) {
  return <SportFixtureCard match={match} appearance="trending" />;
}
```

#### `src/features/matches/components/trending-predict-card.tsx`

**Unchanged.**

```tsx
import { accentVar, Badge, SignalPanel } from "@/design-system";
import type { SportMatch } from "@/domain/matches";

import { TeamBadge } from "./team-badge";
import { TileFooter } from "./tile-footer";
import { TileMetaRow } from "./tile-meta-row";

export type TrendingPredictCardProps = {
  match: SportMatch;
  /** True once the player has locked their answers for this fixture. */
  answered?: boolean;
};

const PRIMARY_ACCENT = accentVar("cyan");
const BORDER_ACCENT = "var(--ds-color-fixture-predicted)";

/** An open prediction mission on a fixture. */
export function TrendingPredictCard({
  match,
  answered = false,
}: TrendingPredictCardProps) {
  return (
    <SignalPanel
      accent={BORDER_ACCENT}
      appearance="balanced"
      tag={<Badge accent={PRIMARY_ACCENT}>PREDICT</Badge>}
      href={`/matches/${match.id}`}
      label={`Predict ${match.home.name} versus ${match.away.name}`}
      footer={
        <TileFooter
          status={answered ? "ANSWERS LOCKED" : `+${match.rewardXp} XP MISSION`}
          accent={PRIMARY_ACCENT}
          volumeOz={match.volumeOz}
        />
      }
    >
      <TileMetaRow sport={match.sport} leagueLabel={match.leagueLabel} />

      {/* The matchup is this tile's focal element, so it carries the weight the
          other kinds give to a figure. */}
      <div className="flex flex-1 items-center justify-between gap-2">
        <TeamBadge team={match.home} size={46} />
        <span
          className="font-display text-2xs font-black tracking-label"
          style={{ color: PRIMARY_ACCENT }}
        >
          VS
        </span>
        <TeamBadge team={match.away} size={46} />
      </div>

      <p className="truncate font-display text-sm font-black tracking-label">
        {match.home.shortName}
        {" // "}
        {match.away.shortName}
      </p>
    </SignalPanel>
  );
}
```

#### `src/features/matches/components/trending-market-card.tsx`

**Adapted.** The lookup in StatOz's picks catalog is removed. `markets.ts` already holds what that lookup returned.

```tsx
import { accentVar, Badge, Progress, SignalPanel } from "@/design-system";
import { isHot, leadingOutcome, type PickMarket } from "@/domain/predictions";

import { TileFooter } from "./tile-footer";
import { TileMetaRow } from "./tile-meta-row";

export type TrendingMarketCardProps = {
  market: PickMarket;
  /** `future` is a long-range outright; `pick` is a near-term call. */
  kind: "future" | "pick";
  /** Tall tiles have room to break out every outcome. */
  detailed?: boolean;
};

/** A prediction market tile — the leader's price, or the full outcome board. */
export function TrendingMarketCard({
  market,
  kind,
  detailed = false,
}: TrendingMarketCardProps) {
  const future = kind === "future";
  const accent = accentVar("cyan");
  const borderAccent = "var(--ds-color-fixture-predicted)";
  const leader = leadingOutcome(market);
  const hot = isHot(market);

  return (
    <SignalPanel
      accent={borderAccent}
      appearance="balanced"
      tag={<Badge accent={accent}>{future ? "FUTURE" : "PICK"}</Badge>}
      href={`/picks/${market.id}`}
      label={market.question}
      footer={
        <TileFooter
          status={market.resolved ? "SETTLED" : "MARKET OPEN"}
          accent={accent}
          volumeOz={market.volumeOz}
        />
      }
    >
      <TileMetaRow sport={market.sport} leagueLabel={market.leagueLabel} />

      {/* A full sentence, so it takes the body face. Everything else on the
          trending tiles is an identifier or a figure, and takes the display. */}
      <p
        className={[
          "font-sans text-sm font-bold leading-tight",
          detailed ? "line-clamp-3" : "line-clamp-2",
        ].join(" ")}
      >
        {market.question}
      </p>

      {detailed ? (
        <ul className="mt-1 flex flex-col gap-2">
          {market.outcomes.slice(0, 4).map((outcome) => {
            const leading = outcome.id === leader.id;
            const color = leading ? accent : "var(--ds-color-text-muted)";
            return (
              <li key={outcome.id} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="min-w-0 flex-1 truncate font-display text-2xs font-extrabold tracking-label"
                    style={{ color }}
                  >
                    {outcome.label.toUpperCase()}
                  </span>
                  <span
                    className={[
                      "ds-tabular shrink-0 font-display font-black leading-compact",
                      leading ? "text-base" : "text-2xs",
                    ].join(" ")}
                    style={{ color }}
                  >
                    {outcome.probabilityPercent}%
                  </span>
                </div>
                <Progress
                  value={outcome.probabilityPercent / 100}
                  accent={color}
                  label={`${outcome.label} ${outcome.probabilityPercent} percent`}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-auto flex flex-col gap-1">
          <p className="truncate font-display text-2xs font-extrabold tracking-label">
            {leader.label.toUpperCase()}
          </p>
          <div className="flex items-end gap-1.5">
            <span
              className="ds-tabular font-display text-xl font-black leading-compact"
              style={{ color: accent }}
            >
              {leader.probabilityPercent}%
            </span>
            {leader.delta !== undefined ? (
              <DeltaBadge delta={leader.delta} hot={hot} />
            ) : null}
          </div>
        </div>
      )}
    </SignalPanel>
  );
}

function DeltaBadge({ delta, hot }: { delta: number; hot: boolean }) {
  const color =
    delta >= 0 ? "var(--ds-color-success)" : "var(--ds-color-danger)";
  const text = `${delta >= 0 ? "+" : ""}${delta}`;

  if (!hot) {
    return (
      <span
        className="ds-tabular pb-0.5 font-display text-2xs font-extrabold"
        style={{ color }}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className="ds-tabular mb-0.5 animate-pulse rounded-md border px-1 py-px font-display text-2xs font-extrabold"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 55%, transparent)`,
        background: `color-mix(in srgb, ${color} 13%, transparent)`,
        boxShadow: `0 0 7px -3px color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      {text}
    </span>
  );
}
```

#### `src/features/matches/components/trending-feed.tsx`

**Unchanged.**

```tsx
import {
  accentVar,
  Badge,
  BentoGrid,
  BentoTile,
  SignalOffIcon,
  SignalPanel,
} from "@/design-system";

import {
  marketById,
  matchById,
  matchTrendingCatalog,
  type TrendingTileConfig,
} from "@/mocks/matches";
import { TrendingMarketCard } from "./trending-market-card";
import { TrendingMatchCard } from "./trending-match-card";
import { TrendingPredictCard } from "./trending-predict-card";

/** The curated trending bento — the home screen's main surface. */
export function TrendingFeed() {
  return (
    <BentoGrid>
      {matchTrendingCatalog.map((config) => (
        <BentoTile key={config.id} span={config.span}>
          <TrendingTile config={config} />
        </BentoTile>
      ))}
    </BentoGrid>
  );
}

function TrendingTile({ config }: { config: TrendingTileConfig }) {
  if (config.kind === "match" || config.kind === "predict") {
    const match = matchById(config.sourceId);
    if (!match) return <Unavailable kind={config.kind} />;
    return config.kind === "match" ? (
      <TrendingMatchCard match={match} />
    ) : (
      <TrendingPredictCard match={match} />
    );
  }

  const market = marketById(config.sourceId);
  if (!market) return <Unavailable kind={config.kind} />;
  return (
    <TrendingMarketCard
      market={market}
      kind={config.kind}
      detailed={config.span === "tall"}
    />
  );
}

const CHROME = accentVar("cyan");
const BORDER_ACCENT = "var(--ds-color-fixture-predicted)";

function Unavailable({ kind }: { kind: TrendingTileConfig["kind"] }) {
  return (
    <SignalPanel
      accent={BORDER_ACCENT}
      appearance="balanced"
      lifted={false}
      pad={false}
      tag={<Badge accent={CHROME}>{kind.toUpperCase()}</Badge>}
      footer={
        <span className="font-display text-2xs font-extrabold tracking-wide text-muted">
          NO DATA
        </span>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3.5 text-muted">
        <SignalOffIcon size={22} />
        <p className="text-center font-display text-2xs font-extrabold leading-tight tracking-wide">
          SIGNAL
          <br />
          UNAVAILABLE
        </p>
      </div>
    </SignalPanel>
  );
}
```

### Per-sport fixtures

#### `src/features/matches/components/sport-match-feed.tsx`

**Adapted.** `MatchLeague` is imported from `@/domain/matches` instead of the feature's own `types.ts`.

```tsx
"use client";

import Link from "next/link";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useMemo, useRef, useState } from "react";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EventBusyIcon,
} from "@/design-system";
import type { MatchLeague, SportMatch } from "@/domain/matches";
import type { Sport } from "@/domain/sports";
import { useProfileIdentity } from "@/features/profile";
import { followableLeagues } from "@/mocks/onboarding";

import { fixturesForSport, leagueById, matchDemoAnchor } from "@/mocks/matches";
import { SportFixtureCard } from "./sport-fixture-card";
import styles from "./sport-match-feed.module.css";

const DAY_MS = 86_400_000;
const PREVIEW_COUNT = 3;

export function SportMatchFeed({ sport }: { sport: Sport }) {
  const identity = useProfileIdentity();
  const weekMode = sport === "motorsport";
  const fixtures = useMemo(() => fixturesForSport(sport), [sport]);
  const periods = useMemo(
    () => (weekMode ? availableWeeks(fixtures) : availableDays(fixtures)),
    [fixtures, weekMode],
  );
  const [selectedPeriod, setSelectedPeriod] = useState(() =>
    initialPeriod(fixtures, weekMode),
  );
  const [direction, setDirection] = useState<"left" | "right">("left");
  const favoriteClubs = followableLeagues
    .filter(
      (league) => league.sport === sport && identity.favoriteTeams[league.id],
    )
    .flatMap((league) =>
      league.teams
        .filter((team) => team.id === identity.favoriteTeams[league.id])
        .map((team) => ({ ...team, leagueId: league.id })),
    );
  const [selectedClubId, setSelectedClubId] = useState(
    () => favoriteClubs[0]?.id ?? "",
  );
  const selectedClub =
    favoriteClubs.find((club) => club.id === selectedClubId) ??
    favoriteClubs[0];
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const currentIndex = Math.max(0, periods.indexOf(selectedPeriod));
  const selectedStart = fromDateKey(selectedPeriod);
  const selectedEnd = weekMode ? addDays(selectedStart, 6) : selectedStart;
  const selectedCount = fixtures.filter((match) => {
    const date = fromDateKey(dateKey(match.kickoff));
    return date >= selectedStart && date <= selectedEnd;
  }).length;
  const periodFixtures = fixtures.filter((match) => {
    const date = fromDateKey(dateKey(match.kickoff));
    return weekMode
      ? date >= selectedStart && date <= selectedEnd
      : dateKey(match.kickoff) === selectedPeriod;
  });
  const pinned = selectedClub
    ? periodFixtures
        .filter((match) =>
          fixtureHasClub(match, selectedClub.name, selectedClub.shortName),
        )
        .sort(pinPriority)[0]
    : undefined;
  const visibleFixtures = fixtures
    .filter((match) => {
      const date = fromDateKey(dateKey(match.kickoff));
      if (weekMode) return date >= selectedStart && date <= selectedEnd;
      return date >= selectedStart;
    })
    .filter((match) => match.id !== pinned?.id)
    .sort(
      (left, right) =>
        Number(
          Boolean(
            selectedClub &&
            fixtureHasClub(right, selectedClub.name, selectedClub.shortName),
          ),
        ) -
          Number(
            Boolean(
              selectedClub &&
              fixtureHasClub(left, selectedClub.name, selectedClub.shortName),
            ),
          ) || compareKickoff(left, right),
    );
  const groupedDays = groupByDay(visibleFixtures);

  function move(delta: number) {
    const next = periods[currentIndex + delta];
    if (!next) return;
    setDirection(delta < 0 ? "right" : "left");
    setSelectedPeriod(next);
  }

  function selectDate(value: string) {
    if (!value) return;
    const normalized = weekMode ? dateKey(mondayOf(fromDateKey(value))) : value;
    const next = periods.includes(normalized)
      ? normalized
      : closestPeriod(periods, normalized);
    setDirection(next < selectedPeriod ? "right" : "left");
    setSelectedPeriod(next);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) < 80 || Math.abs(x) <= Math.abs(y)) return;
    move(x < 0 ? 1 : -1);
  }

  const pickerMin = periods[0];
  const pickerMax = periods.length
    ? dateKey(addDays(fromDateKey(periods.at(-1)!), weekMode ? 6 : 0))
    : selectedPeriod;

  return (
    <div
      className={`${styles.feed} mx-auto w-full max-w-6xl`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <MatchDayNavigator
        label={
          weekMode ? weekHeading(selectedStart) : dayHeading(selectedStart)
        }
        count={selectedCount}
        canPrevious={currentIndex > 0}
        canNext={currentIndex < periods.length - 1}
        onPrevious={() => move(-1)}
        onNext={() => move(1)}
        dateValue={selectedPeriod}
        dateMin={pickerMin}
        dateMax={pickerMax}
        weekMode={weekMode}
        onDateChange={selectDate}
      />

      <div
        key={`${sport}-${selectedPeriod}`}
        className="mt-3 flex flex-col gap-5"
      >
        {pinned && selectedClub ? (
          <section className={styles.clubPin}>
            <header>
              <b>YOUR CLUB</b>
              {pinned.status === "finished" ? null : (
                <small>
                  {pinned.status === "live" ? "LIVE NOW" : "KICKING OFF"}
                </small>
              )}
              {favoriteClubs.length > 1 ? (
                <select
                  aria-label="Choose followed club"
                  value={selectedClub.id}
                  onChange={(event) => setSelectedClubId(event.target.value)}
                >
                  {favoriteClubs.map((club) => (
                    <option key={`${club.leagueId}-${club.id}`} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </header>
            <SportFixtureCard
              match={pinned}
              followedTeamName={selectedClub.name}
            />
          </section>
        ) : null}
        {groupedDays.length === 0 ? (
          <EmptyPeriod date={selectedStart} weekMode={weekMode} />
        ) : (
          groupedDays.map(([day, matches]) => (
            <DayGroup
              key={day}
              day={day}
              matches={matches}
              showDate={weekMode || day !== selectedPeriod}
              direction={direction}
            />
          ))
        )}
      </div>
    </div>
  );
}

function normalizedIdentity(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "");
}
function fixtureHasClub(
  match: SportMatch,
  name: string,
  shortName: string,
): boolean {
  const aliases = [name, shortName].map(normalizedIdentity);
  return [match.home, match.away].some((team) =>
    [team.name, team.shortName]
      .map(normalizedIdentity)
      .some(
        (value) =>
          aliases.includes(value) ||
          value.includes(aliases[0]) ||
          aliases[0].includes(value),
      ),
  );
}
function pinPriority(left: SportMatch, right: SportMatch): number {
  const rank = (match: SportMatch) =>
    match.status === "live" ? 0 : match.status === "scheduled" ? 1 : 2;
  const state = rank(left) - rank(right);
  if (state) return state;
  return left.status === "finished"
    ? right.kickoff.localeCompare(left.kickoff)
    : left.kickoff.localeCompare(right.kickoff);
}

function MatchDayNavigator({
  label,
  count,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  dateValue,
  dateMin,
  dateMax,
  weekMode,
  onDateChange,
}: {
  label: string;
  count: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  dateValue: string;
  dateMin: string;
  dateMax: string;
  weekMode: boolean;
  onDateChange: (value: string) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-center">
      <NavigatorButton
        label={weekMode ? "Previous race week" : "Previous match day"}
        enabled={canPrevious}
        onClick={onPrevious}
      >
        <ChevronLeftIcon size={23} />
      </NavigatorButton>
      <div
        className="flex min-w-0 max-w-68 flex-1 items-center justify-center px-2"
        aria-live="polite"
      >
        <span className="truncate font-display text-sm font-black tracking-display">
          {label}
        </span>
        <span className="ds-tabular ml-1.5 shrink-0 font-display text-sm font-extrabold text-muted">
          ({count})
        </span>
        <span
          className={`${styles.datePicker} relative ml-1 grid size-11 shrink-0 place-items-center text-muted`}
          title={weekMode ? "Pick race week" : "Pick match day"}
        >
          <CalendarIcon size={18} />
          <input
            type="date"
            aria-label={weekMode ? "Pick race week" : "Pick match day"}
            value={dateValue}
            min={dateMin}
            max={dateMax}
            onChange={(event) => onDateChange(event.target.value)}
            className={styles.dateInput}
          />
        </span>
      </div>
      <NavigatorButton
        label={weekMode ? "Next race week" : "Next match day"}
        enabled={canNext}
        onClick={onNext}
      >
        <ChevronRightIcon size={23} />
      </NavigatorButton>
    </div>
  );
}

function NavigatorButton({
  label,
  enabled,
  onClick,
  children,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!enabled}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center text-cyan transition-colors disabled:text-muted/35"
    >
      {children}
    </button>
  );
}

function DayGroup({
  day,
  matches,
  showDate,
  direction,
}: {
  day: string;
  matches: SportMatch[];
  showDate: boolean;
  direction: "left" | "right";
}) {
  const leagues = groupByLeague(matches);
  let animationIndex = 0;
  return (
    <section aria-label={formatDayDivider(fromDateKey(day))}>
      {showDate ? (
        <h2 className="mb-4 mt-2 text-center font-display text-sm font-black tracking-display text-cyan">
          {formatDayDivider(fromDateKey(day))}
        </h2>
      ) : null}
      <div className="flex flex-col gap-5">
        {leagues.map(([league, leagueMatches]) => {
          const visible = leagueMatches.slice(0, PREVIEW_COUNT);
          const remaining = leagueMatches.length - PREVIEW_COUNT;
          const headingId = `league-${day}-${league.id}`;
          return (
            <section key={league.id} aria-labelledby={headingId}>
              <Link
                href={`/leagues/${league.id}`}
                className="mb-2 flex min-h-11 items-center gap-2.5 no-underline"
              >
                <h3
                  id={headingId}
                  className="ds-tabular shrink-0 font-display text-lg font-black tracking-mega text-cyan/85"
                >
                  {league.shortCode}
                </h3>
                <span
                  aria-hidden
                  className="h-px flex-1"
                  style={{
                    background: `color-mix(in srgb, ${league.accent} 25%, transparent)`,
                  }}
                />
                <span className="shrink-0 font-display text-2xs font-extrabold tracking-ultra text-muted">
                  STANDING
                </span>
                <ChevronRightIcon size={13} className="shrink-0 text-cyan/70" />
              </Link>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((match) => {
                  const index = animationIndex++;
                  return (
                    <li
                      key={match.id}
                      className={styles.cardEnter}
                      style={
                        {
                          "--fixture-index": index,
                          "--fixture-shift":
                            direction === "left" ? "-16px" : "16px",
                        } as CSSProperties
                      }
                    >
                      <SportFixtureCard match={match} />
                    </li>
                  );
                })}
              </ul>
              {remaining > 0 ? (
                <Link
                  href={`/leagues/${league.id}?tab=games`}
                  className="ml-auto mt-2 flex min-h-11 items-center gap-1 font-display text-2xs font-black tracking-ultra"
                  style={{ color: league.accent }}
                  aria-label={`View ${remaining} more ${league.name} games`}
                >
                  VIEW MORE
                  <ChevronRightIcon size={14} />
                </Link>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function EmptyPeriod({ date, weekMode }: { date: Date; weekMode: boolean }) {
  return (
    <div className="grid min-h-90 place-items-center text-center">
      <div className="flex max-w-sm flex-col items-center gap-3 text-muted">
        <EventBusyIcon size={34} className="text-cyan" />
        <p className="font-display text-sm font-black tracking-wide text-foreground">
          {weekMode
            ? "NO RACES THIS WEEK"
            : `NO GAMES ON ${formatMonthDay(date)}`}
        </p>
        <p className="text-sm leading-body">
          {weekMode
            ? "Swipe to another race week to find open predictions."
            : "Pick another match day to find open predictions."}
        </p>
        <CalendarIcon size={18} className="text-cyan/70" />
      </div>
    </div>
  );
}

function groupByDay(fixtures: SportMatch[]): Array<[string, SportMatch[]]> {
  const groups = new Map<string, SportMatch[]>();
  for (const match of fixtures) {
    const key = dateKey(match.kickoff);
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }
  return [...groups.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function groupByLeague(
  fixtures: SportMatch[],
): Array<[MatchLeague, SportMatch[]]> {
  const ids = [...new Set(fixtures.map((match) => match.leagueId))];
  return ids.flatMap((id) => {
    const league = leagueById(id);
    if (!league) return [];
    return [
      [league, fixtures.filter((match) => match.leagueId === id)] as [
        MatchLeague,
        SportMatch[],
      ],
    ];
  });
}

function availableDays(fixtures: SportMatch[]): string[] {
  const anchor = new Date(matchDemoAnchor);
  const days = new Set<string>();
  for (let offset = -7; offset <= 4; offset += 1)
    days.add(dateKey(addDays(anchor, offset)));
  for (const match of fixtures) days.add(dateKey(match.kickoff));
  return [...days].sort();
}

function availableWeeks(fixtures: SportMatch[]): string[] {
  const anchorMonday = mondayOf(new Date(matchDemoAnchor));
  const weeks = new Set<string>(
    [-7, 0, 7].map((offset) => dateKey(addDays(anchorMonday, offset))),
  );
  for (const match of fixtures)
    weeks.add(dateKey(mondayOf(new Date(match.kickoff))));
  return [...weeks].sort();
}

function initialPeriod(fixtures: SportMatch[], weekMode: boolean): string {
  const anchor = new Date(matchDemoAnchor);
  const target = weekMode ? mondayOf(anchor) : anchor;
  const periods = weekMode ? availableWeeks(fixtures) : availableDays(fixtures);
  const key = dateKey(target);
  return periods.includes(key) ? key : closestPeriod(periods, key);
}

function closestPeriod(periods: string[], target: string): string {
  if (periods.length === 0) return target;
  const targetTime = fromDateKey(target).getTime();
  return periods.reduce((closest, candidate) => {
    const candidateDistance = Math.abs(
      fromDateKey(candidate).getTime() - targetTime,
    );
    const closestDistance = Math.abs(
      fromDateKey(closest).getTime() - targetTime,
    );
    return candidateDistance < closestDistance ? candidate : closest;
  });
}

function mondayOf(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDay();
  return addDays(result, day === 0 ? -6 : 1 - day);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function dateKey(value: string | Date): string {
  return (typeof value === "string" ? new Date(value) : value)
    .toISOString()
    .slice(0, 10);
}

function fromDateKey(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function compareKickoff(left: SportMatch, right: SportMatch): number {
  return left.kickoff.localeCompare(right.kickoff);
}

function dayHeading(date: Date): string {
  const anchor = fromDateKey(dateKey(matchDemoAnchor));
  const delta = Math.round((date.getTime() - anchor.getTime()) / DAY_MS);
  if (delta === 0) return "TODAY";
  if (delta === 1) return "TOMORROW";
  if (delta === -1) return "YESTERDAY";
  return formatMonthDay(date);
}

function weekHeading(date: Date): string {
  const anchor = mondayOf(new Date(matchDemoAnchor));
  const delta = Math.round((date.getTime() - anchor.getTime()) / (DAY_MS * 7));
  if (delta === 0) return "THIS WEEK";
  if (delta === 1) return "NEXT WEEK";
  if (delta === -1) return "LAST WEEK";
  const end = addDays(date, 6);
  return `${formatMonthDay(date)} — ${formatMonthDay(end)}`;
}

function formatDayDivider(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}

function formatMonthDay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}
```

#### `src/features/matches/components/sport-match-feed.module.css`

**Unchanged.**

```css
.feed {
  touch-action: pan-y;
}

.cardEnter {
  animation: card-enter 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--fixture-index, 0) * 45ms);
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateX(var(--fixture-shift, -16px)) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.dateInput {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

.datePicker:has(.dateInput:focus-visible) {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: 2px;
}

.dateInput:focus-visible {
  outline: 0;
}
.clubPin {
  display: grid;
  gap: var(--ds-space-2);
}
.clubPin > header {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: var(--ds-space-3);
}
.clubPin > header b {
  color: var(--ds-color-accent-gold);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
  letter-spacing: var(--ds-tracking-ultra);
}
.clubPin > header small {
  margin-left: auto;
  color: var(--ds-color-danger);
  font: 900 var(--ds-text-2xs) var(--ds-font-display);
}
.clubPin select {
  margin-left: auto;
  max-width: 150px;
  border: 1px solid var(--ds-color-border-muted);
  background: var(--ds-color-background-data);
  color: var(--ds-color-text-default);
  font-size: var(--ds-text-2xs);
}
```

### The entry point

#### `src/features/matches/index.ts`

**Trimmed.** Exports only what this page uses.

```ts
export {
  AllSportsSelector,
  type SportSelectorCount,
} from "./components/all-sports-selector";
export { SportFixtureCard } from "./components/sport-fixture-card";
export { SportMatchFeed } from "./components/sport-match-feed";
export {
  SportHubTabs,
  type SportHubSelection,
} from "./components/sport-hub-tabs";
export { SportIcon } from "./components/sport-icon";
export { TeamBadge, type TeamBadgeProps } from "./components/team-badge";
export { TrendingFeed } from "./components/trending-feed";
export { matchTrendingCatalog } from "@/mocks/matches";
export type { TrendingTileConfig, TrendingTileKind } from "@/mocks/matches";
export {
  fixtureCountsBySport,
  fixturesForSport,
  leagueById,
  matchById,
  matchDemoAnchor,
} from "@/mocks/matches";
export type { MatchLeague, SportFixtureCount } from "@/domain/matches";
```

## Step 8: the GAMES components

### Illustrations

Each game tile shows one of 12 illustrations, loaded from `public/assets/games/`. Several games share one: all five quizzes use `quiz.svg`. `GameScene` pins the illustration to the right of its box and, on hero tiles, lays a colour wash behind it.

The colours inside these SVG files are written out as fixed values. An SVG loaded as an image cannot read the page's CSS variables, so changing an accent token does not recolour them.

#### `src/features/games/components/game-scenes.tsx`

**Unchanged.**

```tsx
import Image from "next/image";

import { publicAsset } from "@/shared/config";

import { gameRegistry } from "@/mocks/games";
import type { GameId, GameSceneId } from "../types";

/* -------------------------------------------------------------------------
 * Game scenes
 *
 * The illustrations behind the arcade tiles, served from `public/assets/games`
 * and regenerated by `scripts/generate-game-scenes.mjs`. Seven are ports of the
 * `CustomPainter` family in the Flutter screen; the rest are new, drawn in the
 * same language. Formats that repeat across sports — the five quizzes, the
 * mystery games — share one drawing rather than carrying near-identical files.
 *
 * These carry their own palette, so — like the brand artwork in
 * `design-system/icons/brand.tsx` — they are images rather than inlined and
 * tinted. An SVG loaded through `<img>` is its own document and cannot read the
 * page's custom properties, so the accents inside each file are the token
 * values written out. Changing an accent token means re-running the generator.
 *
 * Every file shares one viewBox, cropped to the art, so the scenes are
 * interchangeable and position identically.
 * ---------------------------------------------------------------------- */

export const gameSceneAssets: Record<
  GameSceneId,
  { src: string; alt: string }
> = {
  "pitch-duel": {
    src: "/assets/games/pitch-duel.svg",
    alt: "Tactics board with a passing route",
  },
  "penalty-shootout": {
    src: "/assets/games/penalty-shootout.svg",
    alt: "Goal, target, and ball",
  },
  "football-chess": {
    src: "/assets/games/football-chess.svg",
    alt: "Five-by-five board mid-duel",
  },
  "final-over": {
    src: "/assets/games/final-over.svg",
    alt: "Cricket strip with stumps and a ball in flight",
  },
  "hoop-duel": {
    src: "/assets/games/hoop-duel.svg",
    alt: "Street basketball court in perspective",
  },
  "grand-prix-dash": {
    src: "/assets/games/grand-prix-dash.svg",
    alt: "Circuit telemetry with a car on the racing line",
  },
  "tennis-rally": {
    src: "/assets/games/tennis-rally.svg",
    alt: "Tennis court in perspective with the ball mid-air",
  },
  quiz: {
    src: "/assets/games/quiz.svg",
    alt: "Four answer options with one chosen",
  },
  bingo: {
    src: "/assets/games/bingo.svg",
    alt: "Bingo card with a winning line daubed",
  },
  "guess-player": {
    src: "/assets/games/guess-player.svg",
    alt: "Redacted player silhouette",
  },
  "guess-driver": {
    src: "/assets/games/guess-driver.svg",
    alt: "Redacted driver helmet",
  },
  "guess-winner": {
    src: "/assets/games/guess-winner.svg",
    alt: "Redacted trophy",
  },
};

/** Where each scene's wash lands at the right edge, before the fade. */
const wash: Record<GameSceneId, string> = {
  "pitch-duel": "#0a2a34",
  "penalty-shootout": "#0b2b39",
  "football-chess": "#0b2b39",
  "final-over": "#0b2b39",
  "hoop-duel": "#2c260d",
  "grand-prix-dash": "#361321",
  "tennis-rally": "#1b3f55",
  quiz: "#241a33",
  bingo: "#2f2109",
  "guess-player": "#301a26",
  "guess-driver": "#301a26",
  "guess-winner": "#0b2b39",
};

export type GameSceneProps = {
  game: GameId;
  /** Card artwork defaults to 60%; other surfaces may override it. */
  opacity?: number;
  /** Lays the accent wash under the art. Off for watermark use. */
  washed?: boolean;
};

/**
 * The painted backdrop for a game: an accent wash that fades in from the left,
 * and the illustration pinned to the right at the band's full height.
 *
 * Fitting rather than filling is what keeps a wide tile honest — its scene band
 * is barely a third as tall as it is wide, and filling would scale the art to
 * the width and crop away everything but a stripe.
 */
export function GameScene({
  game,
  opacity = 0.6,
  washed = true,
}: GameSceneProps) {
  const scene = gameRegistry[game].scene;
  const asset = gameSceneAssets[scene];

  return (
    <>
      {washed ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, transparent 36%, color-mix(in srgb, ${wash[scene]} 82%, transparent) 100%)`,
          }}
        />
      ) : null}
      <Image
        src={publicAsset(asset.src)}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1024px) 20vw, 50vw"
        className="pointer-events-none select-none object-contain object-right"
        style={{ opacity }}
      />
    </>
  );
}
```

Create these 12 files exactly as shown. Each is a complete SVG document.

#### `public/assets/games/bingo.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Bingo card with a winning line daubed">
  <title>Bingo card with a winning line daubed</title>
  <rect x="110" y="10" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="130" y="10" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="150" y="10" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="170" y="10" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="190" y="10" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="110" y="30" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="130" y="30" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="150" y="30" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="170" y="30" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="190" y="30" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="110" y="50" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="130" y="50" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="150" y="50" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="170" y="50" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="190" y="50" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="110" y="70" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="130" y="70" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="150" y="70" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="170" y="70" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="190" y="70" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="110" y="90" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="130" y="90" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="150" y="90" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="170" y="90" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="190" y="90" width="20" height="20" fill="#16243a" stroke="#5cdfff" stroke-opacity="0.22"/>
  <rect x="110" y="10" width="100" height="100" fill="none" stroke="#ff8904" stroke-opacity="0.6" stroke-width="1.4"/>
  <path d="M120 20 200 100" stroke="#ff8904" stroke-opacity="0.45" stroke-width="2.5"/>
  <circle cx="120" cy="20" r="7" fill="#5cdfff"/>
  <circle cx="140" cy="40" r="7" fill="#5cdfff"/>
  <circle cx="160" cy="60" r="7" fill="#5cdfff"/>
  <circle cx="180" cy="80" r="7" fill="#5cdfff"/>
  <circle cx="200" cy="100" r="7" fill="#5cdfff"/>
</svg>
```

#### `public/assets/games/final-over.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Cricket strip with stumps and a ball in flight">
  <title>Cricket strip with stumps and a ball in flight</title>
  <ellipse cx="158" cy="66" rx="58" ry="40.8" fill="#153e36"/>
  <path d="M148 24H168L192 122.4H114Z" fill="#8b7545" stroke="#ffffff" stroke-opacity="0.48" stroke-width="1.2"/>
  <path d="M122 99.6H186" stroke="#ffffff" stroke-opacity="0.66" stroke-width="1.3"/>
  <g stroke="#ffffff" stroke-width="2.2" stroke-linecap="round">
  <path d="M154 33.6V57.6"/>
  <path d="M160 33.6V57.6"/>
  <path d="M166 33.6V57.6"/>
  </g>
  <path d="M153 36H167" stroke="#ffffff" stroke-width="2"/>
  <path d="M144 62.4 176 78" stroke="#ffffff" stroke-opacity="0.28" stroke-width="2"/>
  <circle cx="176" cy="78" r="7" fill="#f3f6f8"/>
  <path d="M177.8 73.3A5 5 0 0 1 177.8 82.7" fill="none" stroke="#ff4d4d" stroke-width="1"/>
</svg>
```

#### `public/assets/games/football-chess.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Five-by-five board mid-duel">
  <title>Five-by-five board mid-duel</title>
  <rect x="118" y="12" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="134.8" y="12" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="151.6" y="12" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="168.4" y="12" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="185.2" y="12" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="118" y="34.08" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="134.8" y="34.08" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="151.6" y="34.08" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="168.4" y="34.08" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="185.2" y="34.08" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="118" y="56.16" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="134.8" y="56.16" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="151.6" y="56.16" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="168.4" y="56.16" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="185.2" y="56.16" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="118" y="78.24" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="134.8" y="78.24" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="151.6" y="78.24" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="168.4" y="78.24" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="185.2" y="78.24" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="118" y="100.32" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="134.8" y="100.32" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="151.6" y="100.32" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="168.4" y="100.32" width="16.8" height="22.08" fill="#202b31"/>
  <rect x="185.2" y="100.32" width="16.8" height="22.08" fill="#123d49"/>
  <rect x="118" y="12" width="84" height="110.4" fill="none" stroke="#5cdfff" stroke-opacity="0.72" stroke-width="1.4"/>
  <path d="M152 66 182 43.2" stroke="#5cdfff" stroke-opacity="0.58" stroke-width="2"/>
  <circle cx="138" cy="88.8" r="13" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="138" cy="88.8" r="9" fill="#5cdfff"/>
  <circle cx="168" cy="88.8" r="13" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="168" cy="88.8" r="9" fill="#5cdfff"/>
  <circle cx="152" cy="66" r="13" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="152" cy="66" r="9" fill="#5cdfff"/>
  <circle cx="182" cy="43.2" r="13" fill="none" stroke="#ffffff" stroke-opacity="0.34"/>
  <circle cx="182" cy="43.2" r="9" fill="#ffffff"/>
  <circle cx="138" cy="32.4" r="13" fill="none" stroke="#ffffff" stroke-opacity="0.34"/>
  <circle cx="138" cy="32.4" r="9" fill="#ffffff"/>
</svg>
```

#### `public/assets/games/grand-prix-dash.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Circuit telemetry with a car on the racing line">
  <title>Circuit telemetry with a car on the racing line</title>
  <g fill="none" stroke-linecap="round">
  <path d="M140 -12C202 12 136 51.6 168 73.2C196 93.6 144 104.4 192 129.6" stroke="#314158" stroke-width="42"/>
  <path d="M140 -12C202 12 136 51.6 168 73.2C196 93.6 144 104.4 192 129.6" stroke="#f42d29" stroke-opacity="0.22" stroke-width="46"/>
  <path d="M140 -12C202 12 136 51.6 168 73.2C196 93.6 144 104.4 192 129.6" stroke="#5cdfff" stroke-opacity="0.34" stroke-width="1.3"/>
  </g>
  <g transform="rotate(-12.6 164 72)">
  <rect x="140" y="63" width="48" height="18" rx="5" fill="#f42d29"/>
  <rect x="157.5" y="66" width="17" height="12" rx="5" fill="#0d111a"/>
  <g fill="#0d111a">
  <rect x="145.5" y="59.5" width="13" height="5" rx="2"/>
  <rect x="171.5" y="59.5" width="13" height="5" rx="2"/>
  <rect x="145.5" y="79.5" width="13" height="5" rx="2"/>
  <rect x="171.5" y="79.5" width="13" height="5" rx="2"/>
  </g>
  </g>
</svg>
```

#### `public/assets/games/guess-driver.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Redacted driver helmet">
  <title>Redacted driver helmet</title>
  <path d="M114 78C114 48 134 28 160 28C186 28 206 48 206 78C206 96 196 110 180 116L134 116C122 110 114 96 114 78Z" fill="#16241d" stroke="#ff94c1" stroke-opacity="0.55" stroke-width="1.4"/>
  <path d="M128 74C128 62 140 54 160 54C180 54 192 62 192 74L192 84L128 84Z" fill="#ff94c1" fill-opacity="0.22" stroke="#ff94c1" stroke-opacity="0.5" stroke-width="1.2"/>
  <rect x="104" y="66" width="112" height="9" fill="#ff94c1" fill-opacity="0.5"/>
  <g fill="#ff94c1" fill-opacity="0.3">
  <rect x="132" y="98" width="30" height="7"/>
  <rect x="168" y="98" width="16" height="7"/>
  </g>
</svg>
```

#### `public/assets/games/guess-player.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Redacted player silhouette">
  <title>Redacted player silhouette</title>
  <path d="M118 122C118 88 137 72 160 72C183 72 202 88 202 122Z" fill="#16241d" stroke="#ff94c1" stroke-opacity="0.55" stroke-width="1.4"/>
  <circle cx="160" cy="42" r="23" fill="#16241d" stroke="#ff94c1" stroke-opacity="0.55" stroke-width="1.4"/>
  <rect x="104" y="34" width="112" height="9" fill="#ff94c1" fill-opacity="0.5"/>
  <g fill="#ff94c1" fill-opacity="0.3">
  <rect x="130" y="92" width="30" height="7"/>
  <rect x="166" y="92" width="18" height="7"/>
  <rect x="130" y="105" width="20" height="7"/>
  </g>
</svg>
```

#### `public/assets/games/guess-winner.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Redacted trophy">
  <title>Redacted trophy</title>
  <path d="M136 24H184V56C184 71 173 82 160 82C147 82 136 71 136 56Z" fill="#16241d" stroke="#5cdfff" stroke-opacity="0.55" stroke-width="1.4"/>
  <path d="M136 32H124V44C124 53 129 58 136 59" fill="none" stroke="#5cdfff" stroke-opacity="0.5" stroke-width="1.4"/>
  <path d="M184 32H196V44C196 53 191 58 184 59" fill="none" stroke="#5cdfff" stroke-opacity="0.5" stroke-width="1.4"/>
  <path d="M154 82H166V96H154Z" fill="#16241d" stroke="#5cdfff" stroke-opacity="0.55" stroke-width="1.4"/>
  <rect x="136" y="96" width="48" height="10" fill="#5cdfff" fill-opacity="0.22" stroke="#5cdfff" stroke-opacity="0.5" stroke-width="1.2"/>
  <rect x="104" y="46" width="112" height="9" fill="#5cdfff" fill-opacity="0.5"/>
  <g fill="#5cdfff" fill-opacity="0.3">
  <rect x="130" y="112" width="30" height="7"/>
  <rect x="166" y="112" width="18" height="7"/>
  </g>
</svg>
```

#### `public/assets/games/hoop-duel.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Street basketball court in perspective">
  <title>Street basketball court in perspective</title>
  <path d="M128 19.2H200V120H104Z" fill="#665116" stroke="#fdc700" stroke-opacity="0.58" stroke-width="1.2"/>
  <g fill="none" stroke="#fdc700" stroke-opacity="0.58" stroke-width="1.2">
  <ellipse cx="158" cy="87.6" rx="54" ry="38"/>
  <path d="M164 19.2V62.4"/>
  </g>
  <path d="M148 33.6H182" stroke="#ffffff" stroke-opacity="0.55" stroke-width="3"/>
  <ellipse cx="164" cy="46.8" rx="18" ry="5" fill="none" stroke="#fdc700" stroke-width="3"/>
  <circle cx="182" cy="72" r="17" fill="#fdc700"/>
  <g fill="none" stroke="#17120a" stroke-opacity="0.78" stroke-width="1.4">
  <path d="M165 72H199"/>
  <path d="M182 55V89"/>
  <ellipse cx="182" cy="72" rx="8" ry="17"/>
  </g>
</svg>
```

#### `public/assets/games/penalty-shootout.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Goal, target, and ball">
  <title>Goal, target, and ball</title>
  <g stroke="#5cdfff" stroke-opacity="0.28" stroke-width="0.8">
  <path d="M138.4 21.6V74.4"/>
  <path d="M152.8 21.6V74.4"/>
  <path d="M167.2 21.6V74.4"/>
  <path d="M181.6 21.6V74.4"/>
  <path d="M124 34.8H196"/>
  <path d="M124 48H196"/>
  <path d="M124 61.199999999999996H196"/>
  </g>
  <rect x="124" y="21.6" width="72" height="52.8" fill="none" stroke="#5cdfff" stroke-opacity="0.6" stroke-width="2.6"/>
  <path d="M158 82.8 164 48.8" stroke="#5cdfff" stroke-opacity="0.34" stroke-width="2"/>
  <g fill="none" stroke="#5cdfff" stroke-opacity="0.55" stroke-width="1.4">
  <circle cx="172" cy="40.8" r="24"/>
  <circle cx="172" cy="40.8" r="15"/>
  </g>
  <circle cx="172" cy="40.8" r="6" fill="#5cdfff" fill-opacity="0.92"/>
  <circle cx="148" cy="94.8" r="15" fill="#edf4f6"/>
  <g fill="#18202a">
  <circle cx="148" cy="94.8" r="5"/>
  <circle cx="139" cy="87.8" r="3.2"/>
  <circle cx="157" cy="87.8" r="3.2"/>
  <circle cx="140" cy="102.8" r="3.2"/>
  <circle cx="156" cy="102.8" r="3.2"/>
  </g>
</svg>
```

#### `public/assets/games/pitch-duel.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Tactics board with a passing route">
  <title>Tactics board with a passing route</title>
  <g fill="none" stroke="#ffffff" stroke-opacity="0.42" stroke-width="1.2">
  <rect x="114" y="12" width="92" height="110.4" fill="#124b43"/>
  <path d="M114 67.2H206"/>
  <circle cx="160" cy="67.2" r="27"/>
  <rect x="119" y="-14" width="82" height="52"/>
  </g>
  <polyline points="138,92.4 172,69.6 150,40.8 188,27.6" fill="none" stroke="#5cdfff" stroke-opacity="0.65" stroke-width="1.5"/>
  <circle cx="138" cy="92.4" r="11" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="138" cy="92.4" r="7" fill="#5cdfff"/>
  <circle cx="172" cy="69.6" r="11" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="172" cy="69.6" r="7" fill="#5cdfff"/>
  <circle cx="150" cy="40.8" r="11" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="150" cy="40.8" r="7" fill="#5cdfff"/>
  <circle cx="188" cy="27.6" r="11" fill="none" stroke="#5cdfff" stroke-opacity="0.34"/>
  <circle cx="188" cy="27.6" r="7" fill="#fdc700"/>
</svg>
```

#### `public/assets/games/quiz.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Four answer options with one chosen">
  <title>Four answer options with one chosen</title>
  <g stroke="#c27aff" stroke-opacity="0.35" stroke-width="1.2">
  <rect x="112" y="14" width="46" height="46" fill="#241a33"/>
  <rect x="112" y="66" width="46" height="46" fill="#241a33"/>
  <rect x="164" y="66" width="46" height="46" fill="#241a33"/>
  </g>
  <g fill="#c27aff" fill-opacity="0.4">
  <circle cx="124" cy="37" r="4"/>
  <circle cx="124" cy="89" r="4"/>
  <circle cx="176" cy="89" r="4"/>
  </g>
  <rect x="164" y="14" width="46" height="46" fill="#c27aff" fill-opacity="0.18" stroke="#c27aff" stroke-opacity="0.9" stroke-width="1.6"/>
  <path d="M172 37 182 47 202 25" fill="none" stroke="#c27aff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

#### `public/assets/games/tennis-rally.svg`

**Unchanged.**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 -4 120 128" role="img" aria-label="Tennis court in perspective with the ball mid-air">
  <title>Tennis court in perspective with the ball mid-air</title>
  <path d="M134 14.4H188L216 123.6H96Z" fill="#1f475e" stroke="#5cdfff" stroke-opacity="0.52"/>
  <g fill="none" stroke="#5cdfff" stroke-opacity="0.52">
  <path d="M114 68.4H200"/>
  <path d="M150 14.4 134 120"/>
  </g>
  <ellipse cx="166" cy="93.6" rx="13.5" ry="4.5" fill="none" stroke="#51ff94" stroke-opacity="0.36" stroke-width="1.5"/>
  <circle cx="166" cy="46.8" r="6" fill="#51ff94"/>
</svg>
```

### Tiles and feeds

#### `src/features/games/components/arcade-hero-tile.tsx`

**Adapted.** The streak chip and its `streak` prop are removed. Nothing on this page sets it, and it needed StatOz's brand artwork.

```tsx
"use client";

import { accentVar, HudPanel, LockIcon } from "@/design-system";
import { useAuthSession, useRequireAuth } from "@/features/auth";

import type { GameEntry } from "@/mocks/games";
import type { GameId } from "../types";
import { GameScene } from "./game-scenes";

/**
 * Both layouts anchor the scene to the card's right side. `portrait` uses
 * compact typography for narrow bento columns; `landscape` gives the title
 * more room on a full-width deck banner.
 */
export type HeroLayout = "portrait" | "landscape";

export type ArcadeHeroTileProps = {
  game: GameId;
  entry: GameEntry;
  layout?: HeroLayout;
};

/**
 * The full-dress arcade tile: a painted scene under a badge, a title, and the
 * verb that names what playing feels like.
 *
 * The bottom line is the game's own call to action rather than the app's fixed
 * "TAP // PLAY", which names an input the web does not only have.
 */
export function ArcadeHeroTile({
  game,
  entry,
  layout = "portrait",
}: ArcadeHeroTileProps) {
  const session = useAuthSession();
  const requireAuth = useRequireAuth();
  const accent = accentVar(entry.accent);
  const lines = entry.titleLines ?? [entry.title];
  const landscape = layout === "landscape";
  const authenticated = session.status === "authenticated";
  const guest = session.status === "guest";

  return (
    <HudPanel
      accent={accent}
      glow={entry.glow}
      href={authenticated ? entry.href : undefined}
      onClick={
        authenticated
          ? undefined
          : () =>
              requireAuth({
                intent: "play",
                message: `Log in to play ${entry.title} and save your progress.`,
                returnTo: entry.href,
              })
      }
      label={`${entry.title}, ${guest ? "log in to play" : entry.ctaLabel}`}
    >
      <div
        className={[
          "relative flex flex-col",
          landscape ? "h-44 sm:h-48" : "h-full min-h-40",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute inset-y-px right-px",
            landscape ? "w-[48%]" : "w-[68%]",
          ].join(" ")}
        >
          <GameScene game={game} />
        </div>

        <div
          className={[
            "relative flex flex-col items-start",
            landscape ? "px-4.25 pt-4.25" : "px-3.25 pb-1.5 pt-3.5",
          ].join(" ")}
        >
          {guest ? (
            <span
              className="inline-flex max-w-full items-center gap-1.5 px-1.75 py-1 font-display text-2xs font-black leading-compact"
              style={{
                color: accent,
                background: `color-mix(in srgb, ${accent} 16%, transparent)`,
              }}
            >
              <LockIcon size={12} /> LOG IN REQUIRED
            </span>
          ) : entry.badgeLabel ? (
            <span
              className="max-w-full truncate px-1.75 py-1 font-display text-2xs font-black leading-compact"
              style={{
                color: accent,
                background: `color-mix(in srgb, ${accent} 16%, transparent)`,
              }}
            >
              {entry.badgeLabel}
            </span>
          ) : null}

          {/* Landscape keeps the title off the art, as the app does. */}
          <p
            className={[
              "font-display font-black leading-compact",
              landscape
                ? "mt-auto max-w-[60%] pt-6 text-xl tracking-wide"
                : "mt-2 w-full text-base tracking-label",
            ].join(" ")}
          >
            {lines.map((line) => (
              <span key={line} className="block truncate">
                {line}
              </span>
            ))}
          </p>

          {landscape ? (
            <p
              className="mt-1.5 line-clamp-2 max-w-[60%] font-display text-xs font-black leading-tight"
              style={{ color: accent }}
            >
              {entry.subtitle}
            </p>
          ) : null}
        </div>

        <p
          className={[
            "relative mt-auto font-display text-2xs font-black tracking-wide",
            landscape ? "px-4.25 pb-3.5" : "px-3.25 pb-2.75",
          ].join(" ")}
          style={{ color: `color-mix(in srgb, ${accent} 84%, transparent)` }}
        >
          {guest ? "LOG IN TO PLAY" : entry.ctaLabel}
        </p>
      </div>
    </HudPanel>
  );
}
```

#### `src/features/games/components/quick-game-tile.tsx`

**Unchanged.**

```tsx
"use client";

import type { ReactElement } from "react";

import {
  accentVar,
  GridViewIcon,
  HudPanel,
  LockIcon,
  PersonSearchIcon,
  QuizIcon,
  type IconProps,
} from "@/design-system";
import { useAuthSession, useRequireAuth } from "@/features/auth";

import { gameRegistry, type GameEntry } from "@/mocks/games";
import type { GameId, GameSceneId } from "../types";
import { GameScene } from "./game-scenes";

/**
 * The glyph each format is identified by, keyed off the scene rather than the
 * game — five sports run the same quiz and it wears the same mark in each.
 */
const icons: Partial<Record<GameSceneId, (props: IconProps) => ReactElement>> =
  {
    quiz: QuizIcon,
    bingo: GridViewIcon,
    "guess-player": PersonSearchIcon,
    "guess-driver": PersonSearchIcon,
    "guess-winner": PersonSearchIcon,
  };

export type QuickGameTileProps = {
  game: GameId;
  entry: GameEntry;
};

/**
 * The compact arcade plate: the game's glyph as a boxed mark, over its scene
 * run faintly as a watermark rather than shown outright. Quick games stay
 * quieter than the arcade heroes — the scene is texture here, not the subject.
 */
export function QuickGameTile({ game, entry }: QuickGameTileProps) {
  const session = useAuthSession();
  const requireAuth = useRequireAuth();
  const accent = accentVar(entry.accent);
  const Glyph = icons[gameRegistry[game].scene];
  const authenticated = session.status === "authenticated";
  const guest = session.status === "guest";

  return (
    <HudPanel
      accent={accent}
      href={authenticated ? entry.href : undefined}
      onClick={
        authenticated
          ? undefined
          : () =>
              requireAuth({
                intent: "play",
                message: `Log in to play ${entry.title} and save your progress.`,
                returnTo: entry.href,
              })
      }
      label={`${entry.title}, ${guest ? "log in to play" : "free to play"}`}
    >
      <div
        className="relative flex h-full min-h-40 flex-col p-3.25"
        style={{
          background: `color-mix(in srgb, ${accent} 5.5%, var(--ds-color-background-elevated))`,
        }}
      >
        {/* Bled off the bottom-right corner, the way the glyph mark used to be. */}
        <div className="pointer-events-none absolute -bottom-4 -right-5 h-4/5 w-3/5">
          <GameScene game={game} washed={false} />
        </div>

        {/* The one bright line on the plate, stopping short of the notch. */}
        <span
          aria-hidden
          className="absolute left-3.5 right-8.5 top-0 h-0.5"
          style={{
            background: `color-mix(in srgb, ${accent} 82%, transparent)`,
          }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <span
            className="grid size-10 shrink-0 place-items-center border"
            style={{
              color: accent,
              borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
              background:
                "color-mix(in srgb, var(--ds-color-background-primary) 55%, transparent)",
            }}
          >
            {Glyph ? <Glyph size={22} /> : null}
          </span>

          <span
            className="inline-flex items-center gap-1.25 px-1.75 py-1 font-display text-2xs font-black leading-compact"
            style={{
              color: accent,
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            }}
          >
            {guest ? <LockIcon size={12} /> : null}
            <span
              aria-hidden
              className="size-1.25 rounded-pill"
              style={{ background: accent }}
            />
            {guest ? "LOG IN" : "FREE"}
          </span>
        </div>

        <p className="relative mt-3 line-clamp-2 font-display text-sm font-black leading-compact tracking-label">
          {entry.title}
        </p>

        <p
          className="relative mt-1.25 line-clamp-2 text-2xs font-semibold leading-tight tracking-wide"
          style={{ color: `color-mix(in srgb, ${accent} 76%, transparent)` }}
        >
          {entry.subtitle}
        </p>
      </div>
    </HudPanel>
  );
}
```

#### `src/features/games/components/quick-play-header.tsx`

**Unchanged.**

```tsx
import { accentVar } from "@/design-system";

const CYAN = accentVar("cyan");

export type QuickPlayHeaderProps = {
  /** How many free games sit under the header. */
  count: number;
};

/** The shelf label above a deck's free games: a title, a rule, and a count. */
export function QuickPlayHeader({ count }: QuickPlayHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <h3 className="font-display text-xs font-black leading-compact tracking-ultra">
        QUICK PLAY
      </h3>

      <span
        aria-hidden
        className="h-px flex-1"
        style={{ background: `color-mix(in srgb, ${CYAN} 28%, transparent)` }}
      />

      <span
        className="shrink-0 border px-2 py-1 font-display text-2xs font-black leading-compact tracking-wide"
        style={{
          color: CYAN,
          borderColor: `color-mix(in srgb, ${CYAN} 38%, transparent)`,
          background: `color-mix(in srgb, ${CYAN} 10%, transparent)`,
        }}
      >
        {count} FREE GAME{count === 1 ? "" : "S"}
      </span>
    </div>
  );
}
```

#### `src/features/games/components/games-trending-feed.tsx`

**Unchanged.**

```tsx
import {
  Badge,
  BentoGrid,
  BentoTile,
  SignalOffIcon,
  SignalPanel,
} from "@/design-system";

import { gameEntryFor, gamesTrendingCatalog } from "@/mocks/games";
import type { GamesTrendingTileConfig } from "../types";
import { ArcadeHeroTile } from "./arcade-hero-tile";
import { QuickGameTile } from "./quick-game-tile";

/** The curated arcade bento — the home screen's GAMES surface. */
export function GamesTrendingFeed() {
  return (
    <BentoGrid>
      {gamesTrendingCatalog.map((config) => (
        <BentoTile key={config.id} span={config.span}>
          <GameTile config={config} />
        </BentoTile>
      ))}
    </BentoGrid>
  );
}

function GameTile({ config }: { config: GamesTrendingTileConfig }) {
  const entry = gameEntryFor(config.sourceId);
  if (!entry) return <Offline id={config.sourceId} />;

  return entry.kind === "hero" ? (
    <ArcadeHeroTile game={config.sourceId} entry={entry} />
  ) : (
    <QuickGameTile game={config.sourceId} entry={entry} />
  );
}

const MUTED = "var(--ds-color-text-muted)";

/** `_TrendingGameUnavailable` — a catalog entry the registry does not cover. */
function Offline({ id }: { id: string }) {
  return (
    <SignalPanel
      accent={MUTED}
      lifted={false}
      pad={false}
      tag={<Badge accent={MUTED}>GAME</Badge>}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3.5 text-muted">
        <SignalOffIcon size={22} />
        <p className="text-center font-display text-2xs font-extrabold leading-tight tracking-wide">
          MODE OFFLINE
          <br />
          {id.toUpperCase()}
        </p>
      </div>
    </SignalPanel>
  );
}
```

#### `src/features/games/components/sport-game-deck.tsx`

**Unchanged.**

```tsx
import { sportModuleFor, type Sport } from "@/domain/sports";

import { deckFor, gameRegistry } from "@/mocks/games";
import { ArcadeHeroTile } from "./arcade-hero-tile";
import { QuickGameTile } from "./quick-game-tile";
import { QuickPlayHeader } from "./quick-play-header";

export type SportGameDeckProps = {
  sport: Sport;
};

/**
 * Everything one sport has to play: its featured games as full-width banners,
 * then the free games on a shelf below.
 *
 * Flutter stacks the banners one per row on a phone. Here they reflow to two
 * and three columns once there is room, so a five-game deck does not become a
 * scroll on a desktop.
 */
export function SportGameDeck({ sport }: SportGameDeckProps) {
  const { heroes, quick } = deckFor(sport);
  const label = sportModuleFor(sport).label.toUpperCase();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <h2 className="sr-only">{label} games</h2>

      {/* A lone featured game keeps the full width the app gives it; several
          share the row rather than stacking into a scroll. */}
      {heroes.length > 0 ? (
        <ul
          className={[
            "grid gap-3",
            heroes.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {heroes.map((id) => (
            <li key={id}>
              <ArcadeHeroTile
                game={id}
                entry={gameRegistry[id]}
                layout="landscape"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {quick.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <QuickPlayHeader count={quick.length} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quick.map((id) => (
              <li key={id}>
                <QuickGameTile game={id} entry={gameRegistry[id]} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
```

### The entry point

#### `src/features/games/index.ts`

**Trimmed.** Exports only what this page uses.

```ts
export { ArcadeHeroTile, type HeroLayout } from "./components/arcade-hero-tile";
export {
  GameScene,
  gameSceneAssets,
  type GameSceneProps,
} from "./components/game-scenes";
export { GamesTrendingFeed } from "./components/games-trending-feed";
export { QuickGameTile } from "./components/quick-game-tile";
export { QuickPlayHeader } from "./components/quick-play-header";
export { SportGameDeck } from "./components/sport-game-deck";
export { gameEntryFor, gameRegistry, type GameEntry } from "@/mocks/games";
export {
  deckFor,
  gameCountForSport,
  sportForGame,
  sportGameDecks,
  type SportDeck,
} from "@/mocks/games";
export { gamesTrendingCatalog } from "@/mocks/games";
export type {
  GameId,
  GameSceneId,
  GameTileKind,
  GamesTrendingTileConfig,
} from "./types";
```

## Step 9: the hub, the page and its layout

### The hub and the page

#### `src/app/(platform)/_components/home-hub.tsx`

**Adapted.** The three ad slots are removed.

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import {
  accentVar,
  GameIcon,
  GlidingTabs,
  MatchIcon,
  type GlidingTab,
} from "@/design-system";
import { sportOrder, type Sport } from "@/domain/sports";
import { gameCountForSport } from "@/features/games";
import {
  AllSportsSelector,
  fixtureCountsBySport,
  SportHubTabs,
  SportMatchFeed,
  type SportHubSelection,
  type SportSelectorCount,
} from "@/features/matches";

const tabs: GlidingTab[] = [
  {
    id: "match",
    label: "MATCH",
    accent: accentVar("cyan"),
    icon: <MatchIcon size={18} />,
  },
  {
    id: "games",
    label: "GAMES",
    accent: accentVar("orange"),
    icon: <GameIcon size={18} />,
  },
];

export type HomeHubProps = {
  /** The trending bento, rendered on the server and handed in as children. */
  matchFeed: ReactNode;
  /** The arcade bento, likewise server-rendered. */
  gamesFeed: ReactNode;
  /**
   * One deck per sport, all server-rendered. Every sport is handed over at
   * once so picking one switches without a round trip.
   */
  sportDecks: Record<Sport, ReactNode>;
};

/**
 * The home surface: the MATCH / GAMES switch over the sport browse strip and
 * the feed. Only the selection lives on the client — the feeds themselves are
 * server-rendered and passed through.
 *
 * Each tab keeps its own sport selection, so switching between them does not
 * reset the other's browse position.
 */
export function HomeHub({ matchFeed, gamesFeed, sportDecks }: HomeHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSport = searchParams.get("sport");
  const initialSport = sportOrder.includes(requestedSport as Sport)
    ? (requestedSport as Sport)
    : null;
  const initialTab = searchParams.get("tab") === "games" ? 1 : 0;
  const [tab, setTab] = useState(initialTab);
  const [matchSport, setMatchSport] = useState<SportHubSelection>(
    initialTab === 0 ? initialSport : null,
  );
  const [gamesSport, setGamesSport] = useState<SportHubSelection>(
    initialTab === 1 ? initialSport : null,
  );
  const [selectorMode, setSelectorMode] = useState<"matches" | "games" | null>(
    null,
  );
  const matchCounts = fixtureCountsBySport();
  const gameCounts = Object.fromEntries(
    sportOrder.map((sport) => [sport, { total: gameCountForSport(sport) }]),
  ) as Record<Sport, SportSelectorCount>;
  const visibleSelectorMode = selectorMode ?? (tab === 0 ? "matches" : "games");

  function persistBrowseState(nextTab: number, sport: SportHubSelection) {
    const params = new URLSearchParams();
    params.set("tab", nextTab === 0 ? "match" : "games");
    if (sport !== null) params.set("sport", sport);
    router.replace(`/?${params.toString()}`);
  }

  function selectTab(nextTab: number) {
    setTab(nextTab);
    persistBrowseState(nextTab, nextTab === 0 ? matchSport : gamesSport);
  }

  function selectSport(
    mode: "matches" | "games",
    selection: SportHubSelection,
  ) {
    if (mode === "matches") setMatchSport(selection);
    else setGamesSport(selection);
    persistBrowseState(mode === "matches" ? 0 : 1, selection);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <GlidingTabs
        label="Match or games"
        tabs={tabs}
        activeIndex={tab}
        onChange={selectTab}
      />

      {tab === 0 ? (
        <div
          role="tabpanel"
          aria-label="Match"
          className="flex min-h-0 flex-1 flex-col"
        >
          <SportHubTabs
            selected={matchSport}
            onSelect={(selection) => selectSport("matches", selection)}
            onMore={() => setSelectorMode("matches")}
            onSearch={() => router.push("/matches/search")}
          />
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {matchSport === null ? (
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                {matchFeed}
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                <SportMatchFeed key={matchSport} sport={matchSport} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          role="tabpanel"
          aria-label="Games"
          className="flex min-h-0 flex-1 flex-col"
        >
          <SportHubTabs
            selected={gamesSport}
            onSelect={(selection) => selectSport("games", selection)}
            onMore={() => setSelectorMode("games")}
          />
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
              {gamesSport === null ? gamesFeed : sportDecks[gamesSport]}
            </div>
          </div>
        </div>
      )}

      <AllSportsSelector
        open={selectorMode !== null}
        mode={visibleSelectorMode}
        selected={visibleSelectorMode === "matches" ? matchSport : gamesSport}
        counts={visibleSelectorMode === "matches" ? matchCounts : gameCounts}
        onSelect={(selection) => {
          selectSport(visibleSelectorMode, selection);
        }}
        onClose={() => setSelectorMode(null)}
      />
    </div>
  );
}
```

#### `src/app/(platform)/page.tsx`

**Unchanged.**

```tsx
import { Suspense, type ReactNode } from "react";

import { sportOrder, type Sport } from "@/domain/sports";
import { GamesTrendingFeed, SportGameDeck } from "@/features/games";
import { TrendingFeed } from "@/features/matches";

import { HomeHub } from "./_components/home-hub";

/** Every sport's deck, rendered up front so the browse strip switches locally. */
const sportDecks = Object.fromEntries(
  sportOrder.map((sport) => [
    sport,
    <SportGameDeck key={sport} sport={sport} />,
  ]),
) as Record<Sport, ReactNode>;

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-background" />}>
      <HomeHub
        matchFeed={<TrendingFeed />}
        gamesFeed={<GamesTrendingFeed />}
        sportDecks={sportDecks}
      />
    </Suspense>
  );
}
```

### Layouts

The root layout loads the two fonts and exposes them as `--font-onest` and `--font-orbitron`, which `tokens.css` reads. It expects the font files at `src/app/fonts/`. StatOz ships them as variable `.woff2` files; copy `onest-latin-variable.woff2` and `orbitron-latin-variable.woff2` from there.

#### `src/app/layout.tsx`

**New.** StatOz's root layout also mounts its auth provider and streak celebration. This one loads the fonts and nothing else.

```tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

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

export const metadata: Metadata = { title: "My app" };

export const viewport: Viewport = { viewportFit: "cover" };

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

If you cannot copy the font files, both fonts are on Google Fonts. Replace the two `localFont` calls with the following. This variant was not part of the build check above, and it needs network access at build time.

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

The hub expects to sit inside a flex column, because its root element is `flex min-h-0 flex-1 flex-col`. This layout provides one, along with the app's background gradient.

#### `src/app/(platform)/layout.tsx`

**New.** StatOz's layout also places the navigation, top bar, breadcrumbs and ad rails. This one keeps the content column.

```tsx
/**
 * Minimal host for the sports section: the app background and a flex column
 * for the page to fill. Replace it with the full navigation shell when the
 * project has one.
 */
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--ds-gradient-app-background)" }}
    >
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
```

Run the app and open `/`. Then work through the [checklist](#checklist).

## Connecting real data and auth

### Fixtures, markets and games

The components read fixtures, markets and games through these exports. Keep the names and return types, and change what is behind them.

| Function                                     | Defined in                          | Called by                  | Returns                      |
| -------------------------------------------- | ----------------------------------- | -------------------------- | ---------------------------- |
| `fixturesForSport(sport)`                    | `mocks/matches/catalog.ts`          | `SportMatchFeed`           | `SportMatch[]`               |
| `matchById(id)`                              | `mocks/matches/catalog.ts`          | `TrendingFeed`             | `SportMatch` or `undefined`  |
| `leagueById(id)`                             | `mocks/matches/catalog.ts`          | `SportMatchFeed`           | `MatchLeague` or `undefined` |
| `fixtureCountsBySport()`                     | `mocks/matches/catalog.ts`          | `HomeHub`                  | `{ total, live }` per sport  |
| `marketById(id)`                             | `mocks/matches/markets.ts`          | `TrendingFeed`             | `PickMarket` or `undefined`  |
| `matchTrendingCatalog`                       | `mocks/matches/trending-catalog.ts` | `TrendingFeed`             | The ordered tile list        |
| `gameRegistry`, `gameEntryFor(id)`           | `mocks/games/game-registry.ts`      | Game tiles and feeds       | `GameEntry`                  |
| `deckFor(sport)`, `gameCountForSport(sport)` | `mocks/games/sport-decks.ts`        | `SportGameDeck`, `HomeHub` | A sport's games              |
| `gamesTrendingCatalog`                       | `mocks/games/trending-catalog.ts`   | `GamesTrendingFeed`        | The ordered tile list        |

Three things to plan for:

1. **These functions are synchronous, and two client components call them directly.** `HomeHub` calls `fixtureCountsBySport()` and `SportMatchFeed` calls `fixturesForSport()`. With an API, fetch in `page.tsx` (a server component) and pass the results down as props, or fetch inside those components with your data-fetching library.
2. **"Today" is the constant `matchDemoAnchor`.** `SportMatchFeed` uses it to pick the starting day, build the list of days, and label TODAY, TOMORROW and YESTERDAY. With real data, pass the current date in from the server. Do not call `new Date()` during render in the client component: the server and the browser can disagree near midnight, which causes a hydration error.
3. **The day list is a fixed window.** It runs from 7 days before the anchor to 4 days after, plus any day that has a fixture. Adjust `availableDays` and `availableWeeks` if you need a different range.

A team needs only `name`, `shortName`, `color` and optionally `secondaryColor` and `badgeTextColor` to draw its crest. Set `badgeTextColor` to a dark value for light crests; it defaults to white.

### Auth

Edit `src/features/auth/index.ts`:

- `useAuthSession()` returns `{ status }`, one of `"authenticated"`, `"guest"`, or `"hydrating"` while the session is still loading.
- `useRequireAuth()` returns a function. A game tile calls it with `{ intent, message, returnTo }` when a player who is not signed in taps it. Open your login prompt there and send the player to `returnTo` afterwards.

What the tiles do in each state:

| Status          | Tile is                           | Labels                                  |
| --------------- | --------------------------------- | --------------------------------------- |
| `authenticated` | A link to the game                | The game's own badge and call to action |
| `guest`         | A button that calls `requireAuth` | LOG IN REQUIRED, LOG IN TO PLAY, LOG IN |
| `hydrating`     | A button that calls `requireAuth` | The game's own labels                   |

In the `hydrating` state StatOz's own `requireAuth` does nothing, so a tap is ignored until the session is known.

### Followed clubs

To turn on the YOUR CLUB pin, make `useProfileIdentity()` return the player's favourites and list the clubs in `followableLeagues`:

```ts
// src/features/profile/index.ts
const demo: ProfileIdentity = { favoriteTeams: { epl: "chelsea" } }; // league id → team id

export function useProfileIdentity(): ProfileIdentity {
  return demo;
}
```

```ts
// src/mocks/onboarding/index.ts
export const followableLeagues: FollowableLeague[] = [
  {
    sport: "football",
    id: "epl",
    name: "English Premier League",
    shortCode: "EPL",
    teams: [
      { id: "chelsea", name: "Chelsea", shortName: "CHE", color: "#034694" },
    ],
  },
];
```

With that in place, the football feed pins Chelsea v Newcastle United at the top of TODAY under a YOUR CLUB heading, marked LIVE NOW. This example was run as part of the check above. A club is matched to a fixture by its **name or short name**, not its id. If the player follows more than one club in a sport, a dropdown appears to switch between them.

`useProfileIdentity` must return the same object on every call while nothing has changed, as the example does. StatOz backs it with `useSyncExternalStore` over local storage.

## What differs from StatOz

1. **No ad slots.** StatOz puts a banner at the top of each feed.
2. **No navigation shell, top bar or breadcrumbs** around the page.
3. **Crest colours are written into the fixture files.** StatOz looks them up at runtime in a generated palette file of about 8,000 lines. This guide carries the looked-up values instead, so the crests are the same.
4. **Market data is the final rendered data.** In StatOz a second catalog (`mocks/picks`) overrides the six trending markets, which decides which read SETTLED and whether a delta pulses. `markets.ts` here holds those overriding values, and `TrendingMarketCard` no longer does the lookup.
5. **No streak chip on hero tiles.** `ArcadeHeroTile` could show a streak count, but nothing on this page sets it, and it needed StatOz's brand artwork.
6. **Auth, profile and followed-club data are adapters** (step 6).
7. **The `index.ts` entry points export less**, because the rest of each feature is out of scope.
8. **`secondaryTextColor` is not set on teams.** The type keeps the field, but nothing on this page reads it.

## Quirks carried over unchanged

These are in StatOz today and are reproduced as they are, so the port matches. Fix them if you prefer.

1. **`sport-match-feed.module.css` uses `--ds-space-3`, which `tokens.css` does not define.** The browser discards that `gap`, so the YOUR CLUB heading row has no gap. The same file uses `--ds-space-2`, which is 0.125rem (2px), not 8px: the spacing tokens are named after pixel values.
2. **The Trending row in the selector can say GAMES on the MATCH tab.** When no fixture is live, its count reads `30 GAMES` instead of `30 FIXTURES`.
3. **`HomeHub` writes the URL as `/?…`.** If you serve the hub from another path, change `persistBrowseState`.
4. **`HomeHub` reads the URL only on first render.** Changing the query string afterwards, without a full navigation, does not update the tabs.
5. **A code comment in `sport-hub-tabs.tsx` says "four sports".** The strip has three sport buttons.
6. **The day count covers one day; the list covers more.** `TODAY (4)` counts today's fixtures, while the list below continues into later days.
7. **One mock market contradicts itself.** `epl_mu_over_1_5` is SETTLED with `Under` shown as the leader at 53%. The tile shows the highest-priced outcome, not the winning one.
8. **Game tiles show no keyboard focus ring.** `HudPanel` puts the link on a clipped layer, and the clip path crops the browser's outline. A tile can be focused and activated with the keyboard, but nothing shows which one has focus. `SignalPanel` solves the same problem by brightening its edge; `HudPanel` needs the same treatment.
9. **A followed club's name can be hard to read.** On a YOUR CLUB card the name takes the club's own colour. A dark colour such as Chelsea's `#034694` has little contrast against the dark card.

## Checklist

At `/`:

- [ ] MATCH is selected, with a cyan plate. Clicking GAMES slides the plate across and turns it orange.
- [ ] The trending grid shows 11 tiles: four columns at 1280px wide, three at 800px, two at 500px.
- [ ] The first tile is Fulham 2 - 3 Chelsea, marked Finished, with a black Fulham crest.
- [ ] Tile labels are in Orbitron, the wide squared-off typeface. If they are in a plain sans-serif, the fonts are not loaded.
- [ ] Hovering a tile lifts it by 2px. Tabbing to a tile in this grid turns its edge solid.

On the sport strip:

- [ ] Clicking the football icon shows `TODAY (4)`, three EPL fixtures with a VIEW MORE link, then a `26 AUG` heading with one more.
- [ ] Chelsea v Newcastle United has a red edge and reads `LIVE 67′` and `IN PLAY`.
- [ ] The arrows move a day at a time. The left arrow reaches `YESTERDAY`.
- [ ] The URL reads `/?tab=match&sport=football`, and reloading keeps that view.
- [ ] Clicking `···` opens the full-screen selector with six rows. Escape closes it.
- [ ] Choosing Motorsport shows `THIS WEEK`, and no icon on the strip is underlined.
- [ ] The search button is present on MATCH and absent on GAMES.

On GAMES:

- [ ] The trending grid shows 10 tiles, each with its illustration on the right.
- [ ] Clicking the football icon shows three banners and a QUICK PLAY shelf labelled `3 FREE GAMES`.
- [ ] Switching back to MATCH returns to the sport you left there.

Finally:

- [ ] `npx tsc --noEmit` reports no errors.
- [ ] `next build` lists `/` as a static route.
