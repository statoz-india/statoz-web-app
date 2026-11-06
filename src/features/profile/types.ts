export type Team = {
  id: string;
  code: string;
  name: string;
  league: string;
  /** The team's own colour, for its crest. */
  color: string;
};

export type CoinRange = {
  id: string;
  label: string;
  /** The balance at the range's start, then after each change in it. */
  values: number[];
  earned: number;
  spent: number;
};

export type StatBand = {
  id: "predicts" | "picks";
  title: string;
  /** Accent token name. */
  accent: "cyan" | "lime";
  cells: { label: string; value: number; suffix?: string }[];
};

/** Everything the profile page shows. */
export type Profile = {
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  coins: number;
  level: {
    level: number;
    xp: number;
    /** The XP this level starts at. */
    start: number;
    next: number | null;
    progress: number;
  };
};

/** A pic or banner the player can put on their profile. */
export type LookChoice = {
  /** `ppId` or `pbId`, which `update-user` takes. */
  id: string;
  label: string;
  src: string;
};
