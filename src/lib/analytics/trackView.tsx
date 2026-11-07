"use client";

import { useEffect } from "react";

import { track, type AnalyticsEvent, type AnalyticsParams } from "./track";

/**
 * Sends `event` once when it mounts, and again if the event or its params
 * change. Lets a Server Component report that something was shown.
 */
export function TrackView({
  event,
  params = {},
}: {
  event: AnalyticsEvent;
  params?: AnalyticsParams;
}) {
  // Compared by value, so a new object with the same params sends nothing.
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, JSON.parse(key) as AnalyticsParams);
  }, [event, key]);
  return null;
}
