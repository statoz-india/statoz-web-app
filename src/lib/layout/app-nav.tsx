"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { navDestinations, type NavDestinationId } from "@/config/navigation";
import { useAuthSession, useRequireAuth } from "@/features/auth";
import {
  FootballIcon,
  LockIcon,
  ProfileIcon,
  ShopIcon,
  TrophyIcon,
} from "@/lib/icons";

import { NavRail, type NavRailItem } from "./nav-rail";

export type AppNavProps = {
  activeId?: NavDestinationId;
  orientation?: "bar" | "rail";
  className?: string;
};

const icons: Record<NavDestinationId, ReactNode> = {
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

export function AppNav({ activeId, ...props }: AppNavProps) {
  if (activeId) return <NavItems activeId={activeId} {...props} />;

  // While a route with a dynamic segment is prerendered the URL is not known
  // yet, so the nav that reads it streams in behind one with no item active.
  return (
    <Suspense fallback={<NavItems {...props} />}>
      <RoutedNav {...props} />
    </Suspense>
  );
}

/** The nav with its active item worked out from the URL. */
function RoutedNav(props: Omit<AppNavProps, "activeId">) {
  const pathname = usePathname();
  return <NavItems activeId={destinationForPath(pathname)} {...props} />;
}

function NavItems({ activeId, orientation = "bar", className }: AppNavProps) {
  const session = useAuthSession();
  const requireAuth = useRequireAuth();

  const items: NavRailItem[] = navDestinations.map((destination) => {
    const base = {
      id: destination.id,
      label: destination.label,
      icon: icons[destination.id],
      accent: NAV_ACCENT,
    };

    // Profile needs a session. Until one is confirmed the item is a button
    // that asks for login, so it cannot navigate before auth has resolved.
    // Only a known guest sees the LOG IN label and the lock.
    if (destination.id === "profile" && session.status !== "authenticated") {
      const guest = session.status === "guest";
      return {
        ...base,
        label: guest ? "LOG IN" : base.label,
        icon: guest ? <LockIcon size={20} /> : base.icon,
        onSelect: () => {
          requireAuth({
            intent: "profile",
            message: "Log in to see your profile.",
            returnTo: destination.href,
          });
        },
      };
    }

    return { ...base, href: destination.href };
  });

  return (
    <NavRail
      label="Primary"
      items={items}
      activeId={activeId}
      orientation={orientation}
      className={className}
    />
  );
}
