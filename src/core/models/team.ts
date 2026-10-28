import { z } from "zod";

export const teamSchema = z.object({
  _id: z.string(),
  name: z.string(),
  displayName: z.string(),
  abbreviation: z.string(),
  /** Not set on a future choice's `teamDetails`. */
  tournament: z.string().optional(),
  logo: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  textColor: z.string(),
  /** Not set on a quiz's teams or a future choice's `teamDetails`. */
  secondaryTextColor: z.string().optional(),
});
export type Team = z.infer<typeof teamSchema>;
