import { z } from "zod";

/**
 * The bodies every `/api/` endpoint answers with. A success carries `data`;
 * an error comes in one of two shapes, depending on how the backend made it.
 */

/** A 2xx response. `data` is checked against the endpoint's schema. */
export const apiSuccessSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    statusCode: z.number(),
    data,
    message: z.string(),
    success: z.literal(true),
  });

export type ApiSuccess<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: true;
};

/** An error thrown with `ApiError`: no `data`, and `errors` only on some. */
export const apiErrorSchema = z.object({
  statusCode: z.number(),
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.unknown()).optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** An error returned as an `ApiResponse`: `data` is usually `null`. */
export const apiErrorResponseSchema = z.object({
  statusCode: z.number(),
  data: z.unknown(),
  message: z.string(),
  success: z.literal(false),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

export type ApiResult<T> = ApiSuccess<T> | ApiError | ApiErrorResponse;
