import {
  contactUsResponseSchema,
  type ApiResult,
  type ContactIssue,
  type ContactUsResponse,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

export type ContactUsBody = {
  contactIssue: ContactIssue;
  summary: string;
  details: string;
};

/** Sends the signed-in player's message to the team. A guest gets a 401. */
export function submitContactUs(
  body: ContactUsBody,
  options: RequestOptions = {},
): Promise<ApiResult<ContactUsResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.contactUs,
    contactUsResponseSchema.shape.data,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: options.signal,
    },
  );
}
