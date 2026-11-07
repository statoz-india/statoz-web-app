import { sendGAEvent } from "@next/third-parties/google";

import { GA_MEASUREMENT_ID } from "@/core";

/** Every event the web app sends; docs/technical/analytics_events.md says when each fires. */
export type AnalyticsEvent =
  | "web_otp_requested"
  | "web_sign_up"
  | "web_login"
  | "web_login_failed"
  | "web_logout"
  | "web_account_deleted"
  | "web_auth_gate_shown"
  | "web_auth_gate_action"
  | "web_onboarding_started"
  | "web_onboarding_step"
  | "web_321_shown"
  | "web_earn_virtual_currency"
  | "web_sport_tab_selected"
  | "web_select_content"
  | "web_match_tab_selected"
  | "web_quiz_start"
  | "web_quiz_submit"
  | "web_quiz_submit_failed"
  | "web_results_reveal"
  | "web_results_reveal_complete"
  | "web_buy_sheet_open"
  | "web_pick_placed"
  | "web_spend_virtual_currency"
  | "web_pick_failed"
  | "web_quick_pick_load_failed"
  | "web_shop_tab_selected"
  | "web_view_item"
  | "web_shop_purchase"
  | "web_shop_purchase_failed"
  | "web_avatar_changed"
  | "web_banner_changed"
  | "web_clubs_updated"
  | "web_username_changed"
  | "web_coin_history_open"
  | "web_xp_filter_selected"
  | "web_settings_open"
  | "web_settings_link"
  | "web_leaderboard_filter"
  | "web_how_to_play_open"
  | "web_support_message_sent"
  | "web_support_message_failed"
  | "web_rate_limited"
  | "web_load_failed";

/** Never an email, a name or a database `_id`: readable codes only. */
export type AnalyticsParams = Record<string, string | number | boolean>;

/** GA keeps at most 100 characters of a value. */
const MAX_VALUE = 100;

/**
 * Sends one GA event. Production builds only, like the GA script itself, so
 * local testing stays out of the data.
 */
export function track(name: AnalyticsEvent, params: AnalyticsParams = {}) {
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return;
  const clipped = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "string" ? value.slice(0, MAX_VALUE) : value,
    ]),
  );
  sendGAEvent("event", name, clipped);
}
