"use client";

import { sportModuleFor } from "@/config/sports";
import { accentVar } from "@/styles";
import { FlameIcon } from "@/lib/icons";
import { UnderlineTabs, type UnderlineTab } from "@/lib/ui/underline-tabs";

import type { SportHubSelection } from "../types";
import { SportIcon } from "./sport-icon";

export type SportHubTabsProps = {
  /** The tabs, in the API's order. */
  destinations: SportHubSelection[];
  selected: SportHubSelection;
  onSelect: (selection: SportHubSelection) => void;
};

/** Browse strip above the feed: one tab for each entry the API sent. */
export function SportHubTabs({
  destinations,
  selected,
  onSelect,
}: SportHubTabsProps) {
  const tabs: UnderlineTab[] = destinations.map((tab) =>
    tab === "trending"
      ? { id: tab, label: "TRENDING", icon: <FlameIcon size={21} /> }
      : {
          id: tab,
          label: sportModuleFor(tab).label.toUpperCase(),
          icon: <SportIcon sport={tab} size={21} />,
        },
  );
  const accentOf = (tab: SportHubSelection) =>
    accentVar(tab === "trending" ? "cyan" : sportModuleFor(tab).accent);

  return (
    <UnderlineTabs
      label="Browse by sport"
      tabs={tabs}
      activeIndex={destinations.indexOf(selected)}
      accent={accentOf(selected)}
      iconColors={destinations.map(accentOf)}
      onChange={(index) => {
        const tab = destinations[index];
        if (tab !== undefined) onSelect(tab);
      }}
    />
  );
}
