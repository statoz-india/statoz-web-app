# Top bar: page title, daily streak and coin balance

This guide rebuilds StatOz's top bar in another Next.js App Router project. The bar sits at the top of every page inside the main app shell. It shows the page title on the left and, on the right, the player's daily streak and coin balance with a button to buy more coins.

It contains every source file the bar needs, so it can be followed without access to the StatOz repository. The one exception is the two font files, covered in step 6.

**Checked on 11 October 2026.** The 17 files below were assembled into a standalone app on Next.js 16.3.2, React 19.2.8 and Tailwind CSS 4.3.3. That app type-checks and builds. In a browser, its bar matched StatOz's on every property measured: size, colours, fonts, spacing, link targets and labels. Two other starting points were checked as well. The same steps were applied on top of the app from `SPORTS_SECTION.md`, and that combined app type-checks and builds. The stylesheet additions listed for `NAV_BAR.md` were built too, and the bar measured the same.

## What you are building

```
┌────────────────────────────────────────────────────────────────┐
│  StatOz                            flame 6    coin 1,000  [+]  │  78px tall
└────────────────────────────────────────────────────────────────┘
```

| Part         | What it is                                                              | Links to          |
| ------------ | ----------------------------------------------------------------------- | ----------------- |
| Title        | The page's `<h1>`, chosen from the current route                        | Nothing           |
| Streak       | A gold flame and the number of days in a row the player has been active | `/streaks`        |
| Coin balance | The coin artwork and the balance, such as `1,000`                       | Nothing           |
| Add coins    | A small square button with a plus                                       | `/shop?tab=coins` |

The bar is one client component, `PlatformTopBar`, in a single file.

## Scope

This guide covers the bar itself. It does not cover:

- **The pages it links to**, `/streaks` and `/shop`. Those links return 404 until you build them.
- **The wallet and the streak tracker.** The bar only reads a coin balance and a list of active days. Step 4 provides small stand-ins for both, and [Connecting a real wallet and streak](#connecting-a-real-wallet-and-streak) explains how to replace them.
- **The breadcrumb trail** StatOz shows under the bar, and the navigation around it. The navigation is in `NAV_BAR.md`.

## How it behaves

### Title

The title comes from the current path:

| Path                  | Title       |
| --------------------- | ----------- |
| Starts with `/shop`   | Shop        |
| Exactly `/decks`      | Deck Locker |
| Starts with `/decks/` | Loadout     |
| Anything else         | StatOz      |

Passing a `title` prop overrides this. A title too long for the space is cut off with an ellipsis, so it never pushes the streak and coins off screen.

### Streak

- The number is how many calendar days in a row the player has been active, counted in the player's own time zone.
- **A streak survives a missed "today".** Counting starts from today if the player has been active today, and otherwise from yesterday. It only drops to 0 once a whole calendar day has passed with no activity.
- **It shows `—` until the page has loaded in the browser.** The server cannot know the player's clock or their stored history, so it renders a dash, and the real number replaces it after hydration.

### Coin balance

- The balance is formatted with thousands separators, as in `1,000`.
- The digits are tabular (all the same width), so the number does not shift sideways when it changes.
- Passing a `coins` prop overrides the balance read from the wallet.

### Everything else

- **The bar is not sticky.** It scrolls away with the page.
- **It is shown to everyone**, signed in or not. There is no auth check in it.
- **One accent colour** drives the bottom border, the glow behind the title, and the add-coins button. It defaults to cyan and can be changed with the `accent` prop. The flame is always gold.

### Props

| Prop     | Type                    | Default                       | Effect                                    |
| -------- | ----------------------- | ----------------------------- | ----------------------------------------- |
| `title`  | `string`                | From the route                | Replaces the title                        |
| `coins`  | `number`                | From the wallet               | Replaces the balance                      |
| `accent` | `string` (a CSS colour) | `var(--ds-color-accent-cyan)` | Border tint, title glow, add-coins button |

### Measurements

These were measured in the browser and are identical in StatOz and in the app built from this guide.

|                  |                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Bar              | 78px tall (`h-19.5`), background `#1a253a`                                                              |
| Bottom border    | 1px, the accent at 26% opacity                                                                          |
| Shadow           | `0 4px 0 rgb(0 0 0 / 20%)`: a hard edge with no blur                                                    |
| Padding          | 16px left, 14px right, 12px between items                                                               |
| Title            | Orbitron, 22px, weight 900, line height 1, letter spacing 0.02em, with a 12px glow of the accent at 30% |
| Streak           | 22px flame in `#fdc700`, then the number at 13px, weight 900                                            |
| Coin             | 18 × 18px image, then the number at 13px, weight 900                                                    |
| Add-coins button | 28 × 28px, filled with the accent, with a 17px plus in `#081019`                                        |

### Accessibility

- The bar is a `<header>` and its title is the page's `<h1>`. Pages shown beneath it should start their own headings at `<h2>`.
- The streak link is labelled `Daily streak: 6 days`. The button is labelled `Add coins`.
- The coin image is decorative and has an empty `alt`.
- Keyboard focus shows the cyan outline defined in `globals.css`.

## Requirements

- **Next.js 15 or later with the App Router.** Built here on 16.3.2 with React 19.2.8.
- **Tailwind CSS v4** through `@tailwindcss/postcss`. Built here on 4.3.3. The bar uses v4's fractional spacing (`h-19.5`) and `@theme inline`.
- **A `@/` path alias pointing at `src/`.**
- **The Onest and Orbitron fonts**, exposed as the CSS variables `--font-onest` and `--font-orbitron` (step 6).
- No other packages.

## How to use this guide

Create each file below at the path shown. **Paths match StatOz's own folder layout, so every import works without editing.**

Each file is labelled:

- **Unchanged**: identical to the StatOz file.
- **Trimmed**: StatOz's file holds more; this version keeps only what the bar uses.
- **New**: written for this guide, to stand in for a part of StatOz that is out of scope.

There are 5 unchanged, 7 trimmed and 5 new files.

Where you start depends on what the project already has:

| You have already followed | What to do                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SPORTS_SECTION.md`       | Skip steps 1 and 2; you have those files and a fuller stylesheet. In step 3 you already have `colors.ts` and `icon.tsx`. Add `PlusIcon` to your existing `glyphs.tsx`, create `brand.tsx` and the coin image, and add one line to `design-system/index.ts`. Do steps 4 and 5 in full. In step 6, replace your `(platform)/layout.tsx` with the one shown. |
| `NAV_BAR.md` only         | In step 1, add the listed lines to your existing `globals.css` instead of replacing it. Do steps 2 to 5 in full. In step 6, keep your layouts and add the bar to the navigation shell.                                                                                                                                                                    |
| Neither                   | Do every step as written.                                                                                                                                                                                                                                                                                                                                 |

All 17 files. Those with no tag are unchanged:

```
├── src/
│   ├── app/
│   │   ├── globals.css   [new]
│   │   ├── layout.tsx   [new]
│   │   └── (platform)/
│   │       └── layout.tsx   [new]
│   ├── shared/
│   │   ├── config/
│   │   │   ├── base-path.ts
│   │   │   └── index.ts   [trimmed]
│   │   └── utils/
│   │       ├── format.ts
│   │       └── index.ts   [trimmed]
│   ├── design-system/
│   │   ├── tokens/
│   │   │   └── colors.ts   [trimmed]
│   │   ├── icons/
│   │   │   ├── icon.tsx
│   │   │   ├── glyphs.tsx   [trimmed]
│   │   │   └── brand.tsx   [trimmed]
│   │   └── index.ts   [trimmed]
│   └── features/
│       ├── economy/
│       │   └── index.ts   [new]
│       ├── streaks/
│       │   └── index.ts   [new]
│       └── shell/
│           ├── components/
│           │   └── platform-top-bar.tsx
│           └── index.ts   [trimmed]
└── public/assets/icons/
    └── oz_coins.svg
```

## Step 1: styles

The bar needs a handful of design values. They are defined as CSS variables under `:root`, and the `@theme inline` block maps them to the Tailwind class names the bar uses: `bg-surface-nav`, `text-inverse`, `font-display`, `text-sm`, `text-2xl`, `leading-compact` and `tracking-tight`.

The file also replaces four values Tailwind already defines, and that change applies across the whole project: `font-sans` becomes Onest, `text-sm` becomes 13px, `text-2xl` becomes 22px, and `tracking-tight` becomes 0.02em, which is wider than normal instead of tighter. The other names are new.

#### `src/app/globals.css`

**New.** Only the tokens the top bar uses. Every value is copied from StatOz's `tokens.css` and `globals.css`.

```css
@import "tailwindcss";

:root {
  color-scheme: dark;

  --ds-color-background-primary: #0d111a;
  /* The top bar's surface */
  --ds-color-background-nav: #1a253a;
  --ds-color-text-default: #ffffff;
  /* Dark ink for content on an accent fill: the plus on the add-coins button */
  --ds-color-text-inverse: #081019;
  /* Default accent: the border tint, the title glow, the add-coins button */
  --ds-color-accent-cyan: #5cdfff;
  /* The streak flame */
  --ds-color-accent-gold: #fdc700;

  --ds-gradient-app-background: linear-gradient(
    135deg,
    #010916 0%,
    #0e2646 100%
  );
  /* A hard-edged shadow with no blur, cast under the bar */
  --ds-shadow-hard-drop: 0 4px 0 rgb(0 0 0 / 20%);

  --ds-font-body: var(--font-onest), "Onest", system-ui, sans-serif;
  --ds-font-display:
    var(--font-orbitron), "Orbitron", var(--font-onest), "Onest", system-ui,
    sans-serif;

  --ds-text-sm: 0.8125rem; /* streak and coin numbers, 13px */
  --ds-text-2xl: 1.375rem; /* the title, 22px */
  --ds-leading-compact: 1;
  --ds-tracking-tight: 0.02em;
  --ds-numeric-tabular: "tnum" 1;
}

@theme inline {
  --color-surface-nav: var(--ds-color-background-nav);
  --color-inverse: var(--ds-color-text-inverse);
  --font-display: var(--ds-font-display);
  --leading-compact: var(--ds-leading-compact);
  /* The next four replace Tailwind's own values for these class names. */
  --font-sans: var(--ds-font-body);
  --text-sm: var(--ds-text-sm);
  --text-2xl: var(--ds-text-2xl);
  --tracking-tight: var(--ds-tracking-tight);
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
```

**If you already have `globals.css` from `NAV_BAR.md`**, keep it and add these. Under `:root`:

```css
--ds-color-background-nav: #1a253a;
--ds-color-text-inverse: #081019;
--ds-color-accent-gold: #fdc700;
--ds-shadow-hard-drop: 0 4px 0 rgb(0 0 0 / 20%);
--ds-text-sm: 0.8125rem;
--ds-text-2xl: 1.375rem;
--ds-leading-compact: 1;
--ds-tracking-tight: 0.02em;
--ds-numeric-tabular: "tnum" 1;
```

Inside `@theme inline`:

```css
--color-surface-nav: var(--ds-color-background-nav);
--color-inverse: var(--ds-color-text-inverse);
--text-sm: var(--ds-text-sm);
--text-2xl: var(--ds-text-2xl);
--leading-compact: var(--ds-leading-compact);
--tracking-tight: var(--ds-tracking-tight);
```

And at the end of the file:

```css
.ds-tabular {
  font-feature-settings: var(--ds-numeric-tabular);
  font-variant-numeric: tabular-nums;
}
```

## Step 2: shared helpers

`publicAsset` prefixes a path with `NEXT_PUBLIC_BASE_PATH` when the app is served from a sub-path, and otherwise returns it unchanged. `formatInt` produces the `1,000` on the bar.

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

## Step 3: icons and the coin artwork

The bar draws two kinds of image:

- **The flame and the plus are icons.** They are inline SVG filled with `currentColor`, so they take the colour of the text around them. That is how the flame becomes gold and the plus becomes dark.
- **The coin is artwork.** It has its own colours, so it is a separate SVG file loaded through `next/image`.

`accentVar("gold")` returns `var(--ds-color-accent-gold)`. The bar passes those strings around as colours.

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

**Trimmed.** StatOz's file has 111 icons. These are the two the top bar draws, each copied exactly.

```tsx
import { Icon, type IconProps } from "./icon";

/** Material Symbols `local_fire_department` (outlined). */
export function FlameIcon(props: IconProps) {
  return (
    <Icon viewBox="0 -960 960 960" {...props}>
      <path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z" />
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
```

`BrandIcon` draws artwork in a square box. The coin file is 21 × 20, not square, and Tailwind's base styles set `height: auto` on every image. Without the `aspect-square object-contain` classes below, the browser would shrink the coin to about 17px tall, and Next.js would log a warning in development that only one of width and height was changed.

#### `src/design-system/icons/brand.tsx`

**Trimmed.** StatOz registers four pieces of artwork and a Google mark. This keeps the coin, which is the only one the top bar shows.

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

#### `src/design-system/index.ts`

**Trimmed.** Exports only the pieces in this step.

```ts
export { accentVar, type AccentName } from "./tokens/colors";
export { Icon, type IconProps } from "./icons/icon";
export * from "./icons/glyphs";
export * from "./icons/brand";
```

**If you already have `design-system/index.ts` from `SPORTS_SECTION.md`**, keep it and add this one line:

```ts
export * from "./icons/brand";
```

Create the coin image exactly as shown:

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

## Step 4: adapters for the wallet and the streak

The bar reads two things that belong to other parts of StatOz: the coin balance and the streak. These two files stand in for them, with the same names and shapes as StatOz's real modules, so the bar's own file is unchanged.

As written, the wallet always holds 1,000 coins and the streak is always 6 days. That matches what a new player sees in StatOz.

#### `src/features/economy/index.ts`

**New.** Stands in for StatOz's economy feature, with the one hook the top bar uses.

```ts
/**
 * Wallet adapter. Stands in for StatOz's economy store with the one hook the
 * top bar reads. Return the player's real balance from here.
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

The streak file keeps StatOz's real counting logic. Only the data behind it is a demo.

#### `src/features/streaks/index.ts`

**New.** Stands in for StatOz's streak feature. The four date and streak functions are copied exactly from StatOz's `streak-store.ts`.

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

## Step 5: the top bar

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

**Trimmed.** StatOz also exports its navigation and breadcrumbs from here.

```ts
export {
  PlatformTopBar,
  type PlatformTopBarProps,
} from "./components/platform-top-bar";
```

**If `features/shell/index.ts` already exists**, add the export to it instead of replacing the file.

## Step 6: mounting it

The root layout loads the two fonts and exposes them as `--font-onest` and `--font-orbitron`, which `globals.css` reads. It expects the font files at `src/app/fonts/`. StatOz ships them as variable `.woff2` files; copy `onest-latin-variable.woff2` and `orbitron-latin-variable.woff2` from there. This file is the same as the root layout in `NAV_BAR.md` and `SPORTS_SECTION.md`.

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

The bar goes at the top of the content column, above `<main>`.

#### `src/app/(platform)/layout.tsx`

**New.** StatOz's layout also places the navigation, breadcrumbs and ad rails. This one keeps the content column with the bar at its top.

```tsx
import { PlatformTopBar } from "@/features/shell";

/**
 * Minimal host for the top bar: the app background, the bar, and a flex column
 * for the page beneath it. Replace it with the full navigation shell when the
 * project has one.
 */
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--ds-gradient-app-background)" }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl min-w-0 flex-col">
        <PlatformTopBar />
        <main className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**If you have the navigation shell from `NAV_BAR.md`**, keep that layout. Import the bar and put it where the placeholder comment is:

```tsx
import { PlatformTopBar } from "@/features/shell";

// inside the content column:
<div className="flex min-w-0 flex-1 flex-col">
  <PlatformTopBar />
  <main className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
    {children}
  </main>
</div>;
```

On wide screens this puts the bar to the right of the side rail, not across the full width. That is how StatOz lays it out.

Run the app, open any page, and work through the [checklist](#checklist).

## Connecting a real wallet and streak

### Wallet

Edit `src/features/economy/index.ts` so that `useEconomy()` returns `{ coins }` for the current player.

If the balance is only known in the browser (from local storage, or after a request), the server and the browser will render different numbers on first load. React reports that as a hydration error unless the hook is built for it. Use `useSyncExternalStore` and give it a fixed value for the server, as the streak adapter does. StatOz does this with a local-storage store whose server value is the opening balance of 1,000.

If the server already knows the balance, the simpler route is to pass it down: `<PlatformTopBar coins={balance} />`.

### Streak

Edit `src/features/streaks/index.ts`. The bar needs `activeDays.overall`: the list of days the player was active, each as a `YYYY-MM-DD` key **in the player's local time zone**. `localDateKey()` builds such a key from a `Date`.

Keep three things as they are:

- **`currentStreak`.** It counts back day by day from today, or from yesterday when today has no activity yet.
- **The empty `serverSnapshot`.** It is what makes the server and the first browser render agree.
- **`useIsStreakHydrated`.** It returns `false` on the server and during hydration, then `true`. The bar shows `—` while it is `false`.

Replace `getSnapshot` and `subscribe`:

- `getSnapshot` must return **the same object** on every call until the data changes. Returning a new object each time makes React re-render in a loop.
- `subscribe` should call its listener whenever the data changes, and return a function that stops listening.

StatOz also notifies its listeners at local midnight, so a tab left open overnight updates its streak. The adapter here does not.

## What differs from StatOz

1. **The wallet and the streak tracker are adapters** (step 4). StatOz keeps both in local storage, with purchases, rewards, milestones and a celebration screen behind them.
2. **`brand.tsx` registers one piece of artwork** instead of four, and has no Google mark.
3. **`glyphs.tsx` has two icons** instead of 111.
4. **`globals.css` is a subset** of StatOz's two style files. Every value in it is copied from them.
5. **The layout has no navigation, breadcrumbs or ad rails.**

## Quirks carried over unchanged

These are in StatOz today and are reproduced as they are, so the port matches. Fix them if you prefer.

1. **The coin balance has no loading placeholder.** The server always renders the wallet's server value. A returning player briefly sees that number before their real balance replaces it. The streak avoids this with its `—`.
2. **The streak's screen-reader label is wrong until hydration.** The server HTML shows `—` but labels the link `Daily streak: 0 days`.
3. **The right-hand group is named `AuthenticatedStats`**, but it is shown to signed-out visitors too.
4. **Title matching is loose.** `pathname.startsWith("/shop")` also matches a path such as `/shopping`. The titles are fixed English strings inside the component.
5. **The add-coins button is 28 × 28px.** That meets the 24px minimum in WCAG 2.2 level AA, but it is smaller than the 44px usually recommended for touch.
6. **`BrandIcon` forwards a `priority` prop to `next/image`.** Next.js 16 deprecated `priority` in favour of `preload`. The bar does not set it, so nothing is affected here.

## Checklist

- [ ] The bar is 78px tall with a dark slate background, a faint cyan line along the bottom, and a hard shadow under it.
- [ ] The title reads `StatOz` in Orbitron, the wide squared-off typeface, with a soft cyan glow. If it is in a plain sans-serif, the fonts are not loaded.
- [ ] On the right: a gold flame with `6`, the coin with `1,000`, and a cyan square with a dark plus.
- [ ] The coin is 18 × 18px and not squashed.
- [ ] `/shop` shows `Shop`, `/decks` shows `Deck Locker`, and `/decks/anything` shows `Loadout`.
- [ ] Viewing the page source shows `—` where the streak goes. The number appears once the page loads.
- [ ] On a narrow screen, a long title ends in an ellipsis and the streak and coins stay in view.
- [ ] Tabbing reaches the streak link and then the add-coins button, each with a cyan outline.
- [ ] `npx tsc --noEmit` reports no errors, and `next build` succeeds.
