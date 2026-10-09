# Primary navigation: bottom bar and side rail

This guide shows how to rebuild StatOz's primary navigation in another Next.js App Router project. A single component renders the same four destinations two ways:

- **Below 1024px (`lg`)**, as a **bottom bar**. It sticks to the bottom of the viewport and leaves room for the iPhone home indicator.
- **From 1024px up**, as a **side rail**. It is a 14rem column on the left that stays full height while the page scrolls.

Both use the same items, colours, and active state, so the navigation looks the same after the layout changes.

The code below is copied from the StatOz web app. Only the import paths changed, and the parts tied to StatOz's own auth system were made generic.

## Requirements

- Next.js 15 or later with the App Router. StatOz runs Next 16.3 and React 19.2.
- Tailwind CSS v4. The component relies on v4's numeric spacing scale (`min-h-15`) and on `@theme inline`. On Tailwind v3, replace `min-h-15` with `min-h-[3.75rem]` and move the theme mapping into `tailwind.config`.
- A `@/` path alias that points at `src/`.

## Files

```
src/
├── app/
│   ├── globals.css              # tokens + Tailwind theme mapping (step 1)
│   ├── layout.tsx               # fonts + viewport (step 2)
│   └── (app)/layout.tsx         # page shell that places the bar and rail (step 6)
├── components/nav/
│   ├── icon.tsx                 # base SVG wrapper for icons (step 3)
│   ├── nav-icons.tsx            # the four destination icons + lock (step 3)
│   ├── nav-rail.tsx             # the presentational component (step 4)
│   └── platform-nav.tsx         # client wrapper: works out which item is active (step 5)
└── config/navigation.ts         # destination list (step 5)
```

In StatOz these live in `src/design-system/components/navigation/nav-rail/`, `src/features/shell/components/platform-nav.tsx`, `src/shared/config/navigation.ts`, and `src/app/(platform)/layout.tsx`.

---

## 1. Tokens and Tailwind theme

The navigation only needs a few StatOz tokens. Add them to `globals.css`. If the project already has a `:root` block and `@theme`, merge these into them.

```css
@import "tailwindcss";

:root {
  color-scheme: dark;

  --ds-color-background-primary: #0d111a;
  --ds-color-text-default: #ffffff;
  /* Inactive nav items */
  --ds-color-text-disabled: #6a7282;
  /* Active nav item */
  --ds-color-accent-violet: #c27aff;
  /* Keyboard focus ring */
  --ds-color-accent-cyan: #5cdfff;

  /* Nav surface: slightly translucent so content scrolling under the sticky
     bar shows through faintly. */
  --ds-gradient-nav-bar: linear-gradient(
    to top,
    rgb(14 22 43 / 97.6%) 0%,
    rgb(28 40 60 / 97.6%) 100%
  );
  --ds-gradient-app-background: linear-gradient(
    135deg,
    #010916 0%,
    #0e2646 100%
  );

  --ds-font-body: var(--font-onest), "Onest", system-ui, sans-serif;
  --ds-font-display:
    var(--font-orbitron), "Orbitron", var(--font-onest), "Onest", system-ui,
    sans-serif;

  --ds-text-2xs: 0.625rem; /* bar labels, 10px */
  --ds-text-xs: 0.6875rem; /* rail labels, 11px */
  --ds-leading-tight: 1.2;
}

@theme inline {
  --font-sans: var(--ds-font-body);
  --font-display: var(--ds-font-display);
  --text-2xs: var(--ds-text-2xs);
  /* Overrides Tailwind's default text-xs (0.75rem). */
  --text-xs: var(--ds-text-xs);
  /* Overrides Tailwind's default leading-tight (1.25). */
  --leading-tight: var(--ds-leading-tight);
}

body {
  background: var(--ds-color-background-primary);
  color: var(--ds-color-text-default);
  font-family: var(--ds-font-body);
}

:focus-visible {
  outline: 2px solid var(--ds-color-accent-cyan);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
  }
}
```

Note that the `--text-xs` and `--leading-tight` lines change `text-xs` and `leading-tight` across the whole project. If that affects existing pages, give the two tokens new names (for example `--text-nav-rail` and `--leading-nav`) and update the matching class names in `nav-rail.tsx`.

## 2. Fonts and viewport

Labels are set in **Orbitron**, with Onest as the fallback and body font. StatOz ships both as variable woff2 files from `src/app/fonts/` instead of using `next/font/google`. That's because the Google loader quietly falls back to Arial metrics when the build can't fetch the font. Copy `onest-latin-variable.woff2` and `orbitron-latin-variable.woff2` from StatOz, or use `next/font/google` if your builds always have network access.

```tsx
// src/app/layout.tsx
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

/**
 * Without viewport-fit=cover, iOS reports env(safe-area-inset-bottom) as 0,
 * so the bottom bar's home-indicator padding does nothing.
 */
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

> StatOz itself does not export `viewportFit: "cover"` yet, so its safe-area padding currently resolves to 0 on iOS. Include it in the new project.

## 3. Icons

The icons are inline Material Symbols paths, so the project doesn't need an icon library. They are filled with `currentColor`, which is what lets the active colour on the parent link change the icon too. Any icon library that uses `currentColor` (for example `lucide-react`) works as well. Pass it at `size={20}`.

```tsx
// src/components/nav/icon.tsx
import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Rendered size in px, applied to both axes. */
  size?: number;
  /** Accessible name. Omit to hide the icon from assistive technology. */
  title?: string;
};

/** A square, currentColor-filled SVG, hidden from screen readers unless titled. */
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

```tsx
// src/components/nav/nav-icons.tsx
import { Icon, type IconProps } from "./icon";

/** Material Symbols `sports_soccer`. */
export function FootballIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm242 112q26 0 51-4t49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4Zm-90-200h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
    </Icon>
  );
}

/** Material Symbols `storefront`. */
export function ShopIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M841-518v318q0 33-23.5 56.5T761-120H201q-33 0-56.5-23.5T121-200v-318q-23-21-35.5-54t-.5-72l42-136q8-26 28.5-43t47.5-17h556q27 0 47 16.5t29 43.5l42 136q12 39-.5 71T841-518Zm-272-42q27 0 41-18.5t11-41.5l-22-140h-78v148q0 21 14 36.5t34 15.5Zm-180 0q23 0 37.5-15.5T441-612v-148h-78l-22 140q-4 24 10.5 42t37.5 18Zm-178 0q18 0 31.5-13t16.5-33l22-154h-78l-40 134q-6 20 6.5 43t41.5 23Zm540 0q29 0 42-23t6-43l-42-134h-76l22 154q3 20 16.5 33t31.5 13ZM201-200h560v-282q-5 2-6.5 2H751q-27 0-47.5-9T663-518q-18 18-41 28t-49 10q-27 0-50.5-10T481-518q-17 18-39.5 28T393-480q-29 0-52.5-10T299-518q-21 21-41.5 29.5T211-480h-4.5q-2.5 0-5.5-2v282Zm560 0H201h560Z" />
    </Icon>
  );
}

/** Material Symbols `emoji_events`. */
export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z" />
    </Icon>
  );
}

/** Material Symbols `person`. */
export function ProfileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
    </Icon>
  );
}

/** Material Symbols `lock`. Replaces the profile icon for signed-out users. */
export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
    </Icon>
  );
}
```

## 4. `NavRail`: the presentational component

This component has no state and doesn't read the URL. It takes a list of items and the active id, and draws them in either orientation. It's a Server Component; it doesn't need `"use client"`, because a client component (step 5) renders it.

Each item has **either** an `href`, which renders a `<Link>`, **or** an `onSelect`, which renders a `<button>`. The type allows only one of the two. Use `onSelect` for destinations that shouldn't navigate, such as a login prompt.

```tsx
// src/components/nav/nav-rail.tsx
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

### Visual spec

|                     | Bar (`orientation="bar"`)                                           | Rail (`orientation="rail"`)                 |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| Item layout         | icon above label, centred; items share the width equally (`flex-1`) | icon beside label, left-aligned, full width |
| Item padding        | `px-1`, gap 0.375rem                                                | `px-4 py-3`, gap 0.75rem                    |
| Label size          | `text-2xs` (0.625rem)                                               | `text-xs` (0.6875rem)                       |
| Nav padding         | `px-2 py-3`                                                         | `py-4`                                      |
| Gap between items   | 0.375rem                                                            | 0.375rem                                    |
| Minimum item height | 3.75rem                                                             | 3.75rem                                     |

States:

- **Inactive**: text and icon in `--ds-color-text-disabled` (#6a7282), label `font-semibold`, no background.
- **Active**: text and icon in the item's `accent`, label `font-black`, and a background of the accent at 10% (`color-mix(in srgb, accent 10%, transparent)`). The item also gets `aria-current="page"`.
- **Transition**: colour and background fade over 200ms.
- **Focus**: the global `:focus-visible` cyan outline from step 1.
- **Shape**: square corners. StatOz doesn't round its navigation.

## 5. Destinations and the client wrapper

Keep the list of destinations as plain data. Icons and colours stay in the component that draws them.

```ts
// src/config/navigation.ts
/** Ids of the primary destinations. */
export type NavDestinationId = "sports" | "shop" | "leaderboard" | "profile";

export type NavDestination = {
  id: NavDestinationId;
  label: string;
  href: string;
};

/** The primary destinations, in bar and rail order. */
export const navDestinations: NavDestination[] = [
  { id: "sports", label: "SPORTS", href: "/" },
  { id: "shop", label: "SHOP", href: "/shop" },
  { id: "leaderboard", label: "TOP", href: "/leaderboard" },
  { id: "profile", label: "PROFILE", href: "/profile" },
];
```

The wrapper is the only client component. It reads the pathname and picks the active destination:

- **The longest matching `href` wins.** `/profile/history` therefore highlights PROFILE.
- **`/` never matches by prefix.** If it did, every page would highlight the home destination. Any path that matches nothing falls back to `sports`, which is the home destination.

```tsx
// src/components/nav/platform-nav.tsx
"use client";

import { usePathname } from "next/navigation";

import { navDestinations, type NavDestinationId } from "@/config/navigation";

import { FootballIcon, ProfileIcon, ShopIcon, TrophyIcon } from "./nav-icons";
import { NavRail, type NavRailItem } from "./nav-rail";

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

/** Every destination shares one violet accent so no single tab dominates. */
const NAV_ACCENT = "var(--ds-color-accent-violet)";

/**
 * Which destination the current URL belongs to. Longest matching href wins,
 * and the root href is only ever an exact match.
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

export function PlatformNav({
  activeId,
  orientation = "bar",
  className,
}: PlatformNavProps) {
  const pathname = usePathname();
  const active = activeId ?? destinationForPath(pathname);

  const items: NavRailItem[] = navDestinations.map((destination) => ({
    id: destination.id,
    label: destination.label,
    icon: icons[destination.id],
    accent: NAV_ACCENT,
    href: destination.href,
  }));

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

Under this rule, a path the list doesn't cover, such as `/settings`, highlights the home destination. If those pages should highlight nothing, make `destinationForPath` return `undefined` when nothing matches and change the type to `NavDestinationId | undefined`. If your project uses a `basePath`, `usePathname()` already removes it, so no extra handling is needed.

### Optional: gating a destination behind login

In StatOz, a signed-out user sees PROFILE as **LOG IN** with a lock icon. Tapping it opens a login prompt instead of navigating. To do the same, swap the `items` mapping for the code below and connect your own session and login prompt:

```tsx
import { LockIcon } from "./nav-icons";

// inside PlatformNav:
const { isSignedIn } = useSession(); // your auth hook
const openLogin = useOpenLoginDialog(); // your login prompt

const items: NavRailItem[] = navDestinations.map((destination) => {
  const base = {
    id: destination.id,
    label: destination.label,
    icon: icons[destination.id],
    accent: NAV_ACCENT,
  };

  if (destination.id === "profile" && !isSignedIn) {
    return {
      ...base,
      label: "LOG IN",
      icon: <LockIcon size={20} />,
      onSelect: () => openLogin({ returnTo: "/profile" }),
    };
  }

  return { ...base, href: destination.href };
});
```

StatOz handles three session states: `guest`, `authenticated`, and `hydrating` while the session loads. It shows LOG IN and the lock only to `guest`. While `hydrating`, the item keeps the PROFILE label and icon but still uses `onSelect` instead of a link, so it can't navigate before auth has resolved. If your auth also has a loading state, consider doing the same.

## 6. Placing it in the layout

Render `PlatformNav` **twice** in the route group's layout: once as the rail (shown at `lg` and up) and once as the bar (hidden at `lg` and up). This uses only CSS breakpoints, with no JavaScript media queries, so the server-rendered HTML is already correct and nothing shifts on hydration.

```tsx
// src/app/(app)/layout.tsx
import type { CSSProperties } from "react";

import { PlatformNav } from "@/components/nav/platform-nav";

/**
 * Navigation sits at the bottom on phones and moves to a side rail once there
 * is room for it.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh"
      style={
        {
          background: "var(--ds-gradient-app-background)",
          /**
           * The bar's height, published because the bar is sticky and floats
           * over the page: anything docked above it has to offset by exactly
           * this. The bar below is sized from the same value, so the two
           * cannot drift.
           */
          "--platform-nav-height": "5.25rem",
        } as CSSProperties
      }
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl min-w-0 flex-col lg:flex-row">
        {/* Side rail: lg and up */}
        <div className="hidden shrink-0 lg:block lg:w-56">
          <div className="sticky top-0 h-dvh">
            <PlatformNav orientation="rail" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* top bar / breadcrumbs go here */}
          <main className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
            {children}
          </main>
        </div>

        {/* Bottom bar: below lg */}
        <PlatformNav className="sticky bottom-0 z-20 h-[calc(var(--platform-nav-height)+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] lg:hidden" />
      </div>
    </div>
  );
}
```

How the layout works:

- **The bar uses `sticky`, not `fixed`.** It is the last child of a `min-h-dvh` column, so on a short page it sits at the bottom, and on a long page it sticks to the viewport bottom while content scrolls under it. Because it stays in the normal flow, the page needs no extra bottom padding to stop the bar covering the last row of content.
- **Height is 5.25rem plus the safe-area inset**, with the inset added as bottom padding. The tap targets keep their full size above the home indicator.
- **The rail is 14rem wide (`w-56`)** and its inner wrapper is `sticky top-0 h-dvh`, so it stays full height while the content scrolls.
- **The content column has `min-w-0`**, so wide children such as tables and carousels can't push the rail off screen.
- StatOz uses a wider version of this layout: a three-column grid at `2xl` that adds 10rem ad rails on both sides. The navigation itself doesn't depend on that grid, so it isn't included here.

### Docking UI above the bar

The bar is sticky, so anything else fixed to the bottom of a page (an action bar, a "your rank" card) has to sit above it. Use the published variable instead of a hard-coded number:

```css
.actionBar {
  position: fixed;
  bottom: var(--platform-nav-height, 0);
}

/* A full-height page that must not run under the bar */
.page {
  height: calc(100dvh - var(--platform-nav-height, 0px));
}
```

For a docked element that needs to clear the home indicator as well, use `calc(var(--platform-nav-height) + env(safe-area-inset-bottom))`.

Routes that shouldn't show the navigation, such as fullscreen games or onboarding, go in a separate route group whose layout doesn't render `PlatformNav`. StatOz uses `(platform)`, `(fullscreen)`, and `(onboarding)` for this.

## Customising

- **Per-destination colours.** `accent` is set per item, and StatOz gives every item violet on purpose. To colour each tab differently, replace `NAV_ACCENT` with a map, for example `{ sports: "var(--ds-color-accent-cyan)", shop: "var(--ds-color-accent-gold)", … }`. The 10% background tint follows the accent automatically.
- **Adding a destination.** Add the id to `NavDestinationId`, add an entry to `navDestinations`, and add an icon to `icons`. TypeScript reports an error if the icon is missing. The bar works best with 3–5 items. Each one gets `flex-1`, so six or more get cramped on a 360px screen.
- **Bar height.** Change only `--platform-nav-height`. The bar and every element docked above it read that one value.
- **Breakpoint.** Change every `lg:` in the layout together (the rail wrapper's `hidden lg:block lg:w-56`, the column's `lg:flex-row`, and the bar's `lg:hidden`). If they don't change together, both navs or neither will show at some widths.

## Accessibility

- `<nav aria-label="Primary">` makes the navigation a landmark. Both copies are in the DOM, but CSS hides one with `display: none`, so assistive technology only ever finds one.
- The current destination has `aria-current="page"`, and the gated button version has it too.
- Icons have `aria-hidden` and the visible label serves as the accessible name. If you hide the labels to make an icon-only bar, add `aria-label` to the link or button.
- Items are at least 60px tall and, in the bar, a quarter of the screen width wide, which is well above the 44px minimum tap target.
- The `prefers-reduced-motion` rule from step 1 turns off the colour fade.

## Checklist

- [ ] At 375px wide, the bar is pinned to the bottom, all four items are equal width, and the labels are in Orbitron.
- [ ] At 1024px and up, the bar is gone and the 14rem rail stays visible while the page scrolls.
- [ ] `/`, `/shop`, `/leaderboard`, `/profile`, and a nested route such as `/profile/history` each highlight the right item.
- [ ] The active item is violet with a faint violet background and a heavier label. Inactive items are grey.
- [ ] Tabbing through the items shows the cyan focus ring.
- [ ] On an iPhone with a home indicator, the bar has space beneath its items (this requires `viewportFit: "cover"`).
- [ ] The page's last row of content isn't hidden behind the bar.
