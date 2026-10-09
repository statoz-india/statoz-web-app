"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { navDestinations, type NavDestinationId } from "@/config/navigation";
import { FootballIcon, ProfileIcon, ShopIcon, TrophyIcon } from "@/utils";

import { NavRail, type NavRailItem } from "./nav-rail";

export type PlatformNavProps = {
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
