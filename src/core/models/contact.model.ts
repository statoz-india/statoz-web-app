import { z } from "zod";

export const contactIssueSchema = z.enum([
  "BUG",
  "FEATURE_REQUEST",
  "DATA_MISMATCH",
  "SHOUTOUT",
]);
export type ContactIssue = z.infer<typeof contactIssueSchema>;

export const contactUsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    contactIssue: contactIssueSchema,
    summary: z.string(),
    details: z.string(),
    submittedBy: z.string(),
    _id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type ContactUsResponse = z.infer<typeof contactUsResponseSchema>;
