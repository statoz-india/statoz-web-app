/** Which of the two teams a stat, an event or a player belongs to. */
export type StatsSide = "home" | "away";

export type StatsLocation = {
  venue: string;
  city: string;
  country: string;
  neutralSite: boolean;
};

/**
 * `T` as match stats have to be read: any field can be null, at every depth,
 * above all before and early in a match. A list is still a list, but it can be
 * empty.
 */
export type DeepNullable<T> = T extends readonly (infer Item)[]
  ? DeepNullable<Item>[]
  : T extends object
    ? { [Key in keyof T]: DeepNullable<T[Key]> | null }
    : T;
