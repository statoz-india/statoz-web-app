"use client";

import { sportModuleFor, type Sport } from "@/config/sports";
import { accentVar, FlameIcon } from "@/utils";
import {
  UnderlineTabs,
  type UnderlineTab,
} from "@/widgets/ui/components/underline-tabs";

import { SportIcon } from "./sport-icon";

/** `null` is the Trending destination; a sport narrows the feed to that sport. */
export type SportHubSelection = Sport | null;

export type SportHubTabsProps = {
  /** The sports the API lists for this tab, in its order. */
  sports: Sport[];
  /** Whether the API lists Trending ahead of them. */
  trending?: boolean;
  selected: SportHubSelection;
  onSelect: (selection: SportHubSelection) => void;
};

/** Browse strip above the feed: Trending, then every sport the API sent. */
export function SportHubTabs({
  sports,
  trending = true,
  selected,
  onSelect,
}: SportHubTabsProps) {
  const destinations: SportHubSelection[] = [
    ...(trending ? [null] : []),
    ...sports,
  ];
  const tabs: UnderlineTab[] = destinations.map((sport) =>
    sport === null
      ? { id: "trending", label: "TRENDING", icon: <FlameIcon size={21} /> }
      : {
          id: sport,
          label: sportModuleFor(sport).label.toUpperCase(),
          icon: <SportIcon sport={sport} size={21} />,
        },
  );
  const accentOf = (sport: SportHubSelection) =>
    accentVar(sport ? sportModuleFor(sport).accent : "cyan");

  return (
    <UnderlineTabs
      label="Browse by sport"
      tabs={tabs}
      activeIndex={destinations.indexOf(selected)}
      accent={accentOf(selected)}
      iconColors={destinations.map(accentOf)}
      onChange={(index) => onSelect(destinations[index] ?? null)}
    />
  );
}
