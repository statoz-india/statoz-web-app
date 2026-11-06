import type { ComponentType } from "react";

import type { ContactIssue } from "@/core";
import {
  AutoAwesomeIcon,
  BugReportIcon,
  HeartIcon,
  SyncAltIcon,
  type IconProps,
} from "@/lib/icons";

export type SupportChannel = {
  /** The URL segment: `/profile/talk-to-statoz/<id>`. */
  id: string;
  /** What the API files it under. */
  issue: ContactIssue;
  title: string;
  /** The hub card's one-line description. */
  tagline: string;
  composeSubtitle: string;
  /** What to write, said once at the top of the form. */
  composeHint: string;
  summaryHint: string;
  detailsHint: string;
  icon: ComponentType<IconProps>;
  accent: string;
};

/** The array order is the channel number: append, never reorder. */
export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: "bug",
    issue: "BUG",
    title: "Bug",
    tagline: "Something broke, crashed, or refused to load.",
    composeSubtitle: "// CHANNEL 01 · DEFECT SIGNAL",
    composeHint:
      "Tell us what you tapped, what you expected, and what actually happened.",
    summaryHint: "Short summary of the bug",
    detailsHint: "Steps to reproduce, screens, match IDs…",
    icon: BugReportIcon,
    accent: "var(--ds-color-danger)",
  },
  {
    id: "feature",
    issue: "FEATURE_REQUEST",
    title: "Feature Request",
    tagline: "A mode, tool, or unlock you want on the pitch.",
    composeSubtitle: "// CHANNEL 02 · NEW BUILD",
    composeHint: "Pitch the feature. What would it unlock for you?",
    summaryHint: "Name the feature",
    detailsHint: "How should it work? Why does it matter?",
    icon: AutoAwesomeIcon,
    accent: "var(--ds-color-accent-cyan)",
  },
  {
    id: "mismatch",
    issue: "DATA_MISMATCH",
    title: "Score / Data Mismatch",
    tagline: "Wrong score, odds, lineup, or live feed drift.",
    composeSubtitle: "// CHANNEL 03 · DATA SYNC",
    composeHint:
      "Flag the fixture, market, or stat that doesn't match reality.",
    summaryHint: "Match / market that looks wrong",
    detailsHint: "What did you see vs what should it be?",
    icon: SyncAltIcon,
    accent: "var(--ds-color-accent-orange)",
  },
  {
    id: "shoutout",
    issue: "SHOUTOUT",
    title: "Shoutout",
    tagline: "Love a moment, mode, or beat? Send it up.",
    composeSubtitle: "// CHANNEL 04 · FAN SIGNAL",
    composeHint: "Tell us what slapped. We live for these.",
    summaryHint: "What made you cheer?",
    detailsHint: "Share the moment — mode, card, streak, vibe…",
    icon: HeartIcon,
    accent: "var(--ds-color-accent-gold)",
  },
];

export function supportChannelFor(id: string): SupportChannel | undefined {
  return SUPPORT_CHANNELS.find((channel) => channel.id === id);
}

/** "01".."04": the array position, zero-padded. */
export function channelNumber(channel: SupportChannel): string {
  return String(SUPPORT_CHANNELS.indexOf(channel) + 1).padStart(2, "0");
}
