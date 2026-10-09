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
