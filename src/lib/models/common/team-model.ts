export type Team = {
  _id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  /** Not set on a future choice's `teamDetails`. */
  tournament?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  /** Not set on a quiz's teams or a future choice's `teamDetails`. */
  secondaryTextColor?: string;
};
