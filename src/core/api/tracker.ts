import {
  coinMapResponseSchema,
  coinTrackerResponseSchema,
  xpMapResponseSchema,
  xpTrackerResponseSchema,
  type ApiResult,
  type CoinMapResponse,
  type CoinTrackerResponse,
  type LedgerType,
  type XpMapResponse,
  type XpSource,
  type XpTrackerResponse,
  type XpType,
} from "@/core/models";

import { authenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

export type XpTrackerQuery = {
  page?: number;
  /** 1–50; 20 when left out. */
  limit?: number;
  xpType?: XpType;
  xpSource?: XpSource;
};

/** The player's XP changes, newest first, one page at a time. */
export function getXpTracker(
  query: XpTrackerQuery = {},
  options: RequestOptions = {},
): Promise<ApiResult<XpTrackerResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.xpTracker(toQuery(query)),
    xpTrackerResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/**
 * Net XP per IST day. A plain date in `from` or `to` means midnight UTC, so
 * send the IST offset for whole days.
 */
export function getXpMap(
  query: { from?: string; to?: string } = {},
  options: RequestOptions = {},
): Promise<ApiResult<XpMapResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.xpTrackerMap(toQuery(query)),
    xpMapResponseSchema.shape.data,
    { signal: options.signal },
  );
}

export type CoinTrackerQuery = {
  page?: number;
  /** 1–50; 20 when left out. */
  limit?: number;
  ledgerType?: LedgerType;
  ledgerSource?: string;
};

/** The player's coin changes, newest first, one page at a time. */
export function getCoinTracker(
  query: CoinTrackerQuery = {},
  options: RequestOptions = {},
): Promise<ApiResult<CoinTrackerResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.coinTracker(toQuery(query)),
    coinTrackerResponseSchema.shape.data,
    { signal: options.signal },
  );
}

/** The balance after each coin change, oldest first. */
export function getCoinMap(
  query: { from?: string; to?: string } = {},
  options: RequestOptions = {},
): Promise<ApiResult<CoinMapResponse["data"]>> {
  return authenticatedFetch(
    ENDPOINTS.coinTrackerMap(toQuery(query)),
    coinMapResponseSchema.shape.data,
    { signal: options.signal },
  );
}

function toQuery(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return params.toString();
}
