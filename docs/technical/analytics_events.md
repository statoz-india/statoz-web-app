# Analytics events (Google Analytics 4)

Every event worth sending from the web app, what fires it, and what it
carries. Page views are already counted automatically, so no event here is
needed just because a screen opened.

---

## 1. How events are sent

GA loads from `src/app/layout.tsx` through `@next/third-parties`, in
production builds only. Events go through its `sendGAEvent`, but never
directly: every call goes through one wrapper, `src/lib/analytics/`, so names
are typed and nothing fires in dev:

- `track(name, params)` sends one event. It does nothing outside production
  builds or without a measurement ID, and cuts string values to 100 characters.
- `<TrackView event params />` sends an event when it mounts, for something a
  Server Component shows (a guide page, an error state).
- `AnalyticsEvent` lists every name below; a new event is added there first.

```ts
import { track } from "@/lib/analytics";

track("web_pick_placed", { pick_type: "future", stake: 50 });
```

The **Added** column says whether the event is in the code.

### Rules

- **Names:** every event starts with `web_`, so the web app's events stay apart from the mobile app's in the same property. `snake_case`, at most 40 characters including the prefix. Never start a name with GA's reserved `ga_`, `google_` or `firebase_`.
- **Parameters:** at most 25 per event, values at most 100 characters.
- **No personal data:**
  - never send an email, username, name or Firebase uid;
  - never send a Mongo `_id`; use readable codes only (`quizId`, `predictionId`, `futureId`, `eventId`, `matchId`, `ppId`, `pbId`).
- **Fire once, after it really happened.** "Placed" events fire on the API's success, not on the button press. Failures get their own event.
- **Custom parameters need registering.** To report on one (like `sport` or `pick_type`), add it in GA → Admin → Custom definitions → Create custom dimension, scope *Event*. Numbers used as amounts (`stake`, `xp`) become custom *metrics*.

### Shared parameters

The same names are reused across events, so one custom dimension covers them all.

| Parameter | Values | Meaning |
| --- | --- | --- |
| `sport` | `football`, `cricket`, `basketball`, `racing`, … | The sport, as the app's `Sport` keys |
| `pick_type` | `prediction`, `event`, `future` | Which market |
| `pick_id` | e.g. `EPL-M65-P27` | The market's code |
| `outcome` | `A` / `B` / `D`, `Y` / `N` / `M`, or a `choiceId` | The option backed |
| `quiz_id` | e.g. `FIFA-M98-Q98` | The quiz's code |
| `match_id` | e.g. `FIFA-M98` | The match's readable code |
| `location` | see each event | Where in the app it happened |
| `method` | `email_otp`, `google` | How the player signed in |
| `reason` | short text | Why something failed, the message shown to the player |

---

## 2. Account and sign-in (`features/auth`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_otp_requested` | The OTP email is sent successfully | — | `useEmailOtpLogin`, `authData.ts` | true |
| `web_sign_up` ⭐ | Login succeeds with `isNewUser: true` | `method` | `useEmailOtpLogin`, `useGoogleLogin` | true |
| `web_login` ⭐ | Login succeeds with `isNewUser: false` | `method` | same | true |
| `web_login_failed` | Wrong or expired code, Google error, backend refusal (not when the Google popup is just closed) | `method`, `reason` | same | true |
| `web_logout` | LOG OUT confirmed | — | `useLogout` | true |
| `web_account_deleted` | `delete-user` succeeds | — | `useDeleteAccount` | true |
| `web_auth_gate_shown` | The login gate opens for a guest | `intent` (e.g. `lock a pick`, `play this quiz`, `view this pick`) | `AuthGateHost` / `useRequireAuth` | true |
| `web_auth_gate_action` | The guest answers the gate | `intent`, `action`: `log_in` / `not_now` | `AuthGateDialog` | true |

---

## 3. Onboarding (`/onboarding`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_onboarding_started` ⭐ | Setup opens for a new account (the welcome splash finishes) | — | `OnboardingScreen` | true |
| `web_onboarding_step` | A step is saved or skipped | `step`: `name` / `avatar` / `banner` / `clubs`, `skipped`: `true` / `false` | `OnboardingScreen` `next()` and skip | true |
| `web_321_shown` ⭐ | The 3·2·1 countdown starts (setup finished, or DECIDE LATER on the last step) | `clubs_count` (clubs followed, across leagues) | `OnboardingScreen` `launch()` | true |
| `web_earn_virtual_currency` | The coin reward shows | `virtual_currency_name`: `Oz`, `value`: `1000`, `source`: `welcome_bonus` | `OnboardingScreen` (countdown's `onEnter`) | true |

---

## 4. Home (`/`, `features/homescreen`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_sport_tab_selected` | A different sport tab is chosen | `sport` (or `trending`), `location`: `tabs` / `sports_quiz_card` | `home-hub.tsx` `selectTab` | true |
| `web_select_content` ⭐ | A trending card is opened | `content_type`: `match` / `race` / `quiz` / `prediction` / `future` / `event` / `reveal_result`, `content_id` (its code, from the card's link), `location`: `home_trending` | `Opens` in `TrendingFeed.tsx`; not sent when a guest's tap opens the login gate | true |

`web_select_content` with `content_type: reveal_result` is the REVEAL RESULTS card
(`revealResults.widget.tsx`), which opens a quiz's results.

---

## 5. Match page (`/match/[id]`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_match_tab_selected` | PREDICT / PICKS / STATS is chosen (not the default PREDICT on open) | `tab`: `predict` / `picks` / `stats`, `match_id`, `sport` | `match-tabs-view.tsx` | true |

---

## 6. Quizzes (`/quiz/[id]`, `/quiz/[id]/results`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_quiz_start` | The play screen opens for a quiz that still takes answers | `quiz_id`, `sport`, `questions` | `QuizPlay` | true |
| `web_quiz_submit` ⭐ | Answers are sent successfully | `quiz_id`, `sport`, `answered`, `questions` | `sendAnswers`, `quiz.data.ts` | true |
| `web_quiz_submit_failed` | Sending answers fails | `quiz_id`, `reason` | same | true |
| `web_results_reveal` ⭐ | REVEAL RESULTS succeeds (`markResultsViewed`) | `quiz_id`, `sport`, `xp` | `revealResults`, `quiz.data.ts` | true |
| `web_results_reveal_complete` | CONTINUE on the settlement overlay | `quiz_id`, `correct`, `questions`, `perfect`, `skipped_animation` | `RevealOverlay` (`revealResults.tsx`) | true |
| `web_earn_virtual_currency` | The same moment as `web_results_reveal`, when `xp` > 0 | `virtual_currency_name`: `XP`, `value`, `source`: `quiz` | same | true |

---

## 7. Picks: predictions, events, futures

Picks are placed from the pick page (`/picks/[type]/[id]`) and from cards
through the quick pick (`QuickPick`), so every event carries `location`:

- `pick_page`
- `home_card`
- `match_tab`

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_buy_sheet_open` | The BUY sheet opens on an option | `pick_type`, `pick_id`, `outcome`, `odds` (%), `location` | `trackBuySheet`: `PickDetailScreen` (BUY), `QuickPick` (market loaded) | true |
| `web_pick_placed` ⭐ | The bet is accepted by the API | `pick_type`, `pick_id`, `outcome`, `stake`, `shares`, `odds` (before the bet), `location` | `trackBet`: `placeBet` (pick page), `QuickPick` | true |
| `web_spend_virtual_currency` | The same moment as `web_pick_placed` | `virtual_currency_name`: `Oz`, `value` (stake), `item_name`: `pick_type` | same | true |
| `web_pick_failed` | The API refuses the bet (not enough coins, market closed, rate limit) | `pick_type`, `pick_id`, `outcome`, `odds`, `reason`, `location` | same | true |
| `web_quick_pick_load_failed` | A card's quick pick can't load the market | `pick_type`, `pick_id`, `location` | `QuickPick` | true |

The shared helpers are in `src/lib/components/pick-sheet/pickEvents.ts`.

---

## 8. Shop (`/shop`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_shop_tab_selected` | AVATARS / BANNERS / CARDS is chosen | `tab` | `shopScreen.tsx` | true |
| `web_view_item` | The BUY dialog opens on an item | `item_type`: `avatar` / `banner` / `card`, `item_name`, `price`, `item_id` (`ppId` / `pbId`; a card has none) | `BuyDialog` | true |
| `web_shop_purchase` ⭐ | `buyItem` succeeds | `item_type`, `item_name`, `price`, `item_id` | `buyItem` (`shop.data.ts`) | true |
| `web_spend_virtual_currency` | The same moment, when `price` > 0 | `virtual_currency_name`: `Oz`, `value`, `item_name`: `item_type` | same | true |
| `web_shop_purchase_failed` | `buyItem` returns an error | `item_type`, `item_name`, `price`, `item_id`, `reason` | same | true |

The item's parameters come from `itemParams` in `features/shop/adapters.ts`.

---

## 9. Profile and settings (`/profile`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_avatar_changed` | The avatar sheet saves a new pic | `item_id` (`ppId`) | `AvatarSheet` | true |
| `web_banner_changed` | The banner sheet saves a new banner | `item_id` (`pbId`) | `BannerSheet` | true |
| `web_clubs_updated` | The clubs sheet saves | `clubs_count` (clubs followed, across leagues) | `ClubsSheet` | true |
| `web_username_changed` | Account Settings saves a new name (never send the name) | — | `AccountSettingsScreen` `NameCard` | true |
| `web_coin_history_open` | The coin history sheet opens | — | `ProfileScreen` | true |
| `web_xp_filter_selected` | A different TYPE chip on XP PROGRESS is chosen | `filter`: `all` / `earned` / `lost` / `games` / `predictions` | `XPScreen` | true |
| `web_settings_open` | The SETTINGS sheet opens | — | `ProfileScreen` | true |
| `web_settings_link` | A row in SETTINGS is tapped | `link`: `account_settings` / `terms` / `faq` / `privacy` | `SettingsSheet` | true |

---

## 10. Leaderboard (`/leaderboard`)

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_leaderboard_filter` | The sport or tournament is changed | `sport`, `tournament` (`ALL` for the sport-wide board) | `Leaderboard.screen.tsx` | true |

---

## 11. Help and support

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_how_to_play_open` | A guide opens | `mode`: `predict` / `pick` / `pitch-duel` / `penalty-shootout` / `football-bingo` / `football-chess` / `hoop-duel` | `how-to-play-guide.tsx` (`TrackView`) | true |
| `web_support_message_sent` | `submitContactUs` succeeds | `channel`: `bug` / `feature` / `mismatch` / `shoutout` | `transmission-compose.tsx` | true |
| `web_support_message_failed` | `submitContactUs` fails | `channel`, `reason` | same | true |

---

## 12. Reliability

These help spot problems players hit without telling anyone.

| Event | Fires when | Parameters | Code | Added |
| --- | --- | --- | --- | --- |
| `web_rate_limited` | A feed's error state shows for a 429 (`RateLimitedError`) | `area` (what failed, e.g. `trending`, `this match's quizzes`) | `FeedError` (`TrackView`) | true |
| `web_load_failed` | A feed's error state shows for any other failure | `area`, `reason` | `FeedError` (`TrackView`) | true |

Only the screens that use `FeedError` (home, match tabs) report these. The
pick, quiz, profile and shop screens have their own error states and send
nothing yet.

---

## 13. Key events (conversions)

In GA → Admin → Events, mark these as **key events**. They're the ones marked
⭐ above.

| Key event | Why |
| --- | --- |
| `web_sign_up` | New players |
| `web_321_shown` | Finished setup |
| `web_quiz_submit` | Played a quiz |
| `web_pick_placed` | Placed a pick |
| `web_results_reveal` | Came back for results |
| `web_shop_purchase` | Spent coins in the shop |

Useful funnels (GA → Explore → Funnel exploration):

- **New player:** `web_sign_up` → `web_onboarding_started` → `web_321_shown` → first `web_quiz_submit` or `web_pick_placed`
- **Pick:** `web_select_content` (prediction or future) → `web_buy_sheet_open` → `web_pick_placed`
- **Quiz:** `web_quiz_start` → `web_quiz_submit` → `web_results_reveal` → `web_results_reveal_complete`
- **Guest:** `web_auth_gate_shown` → `web_auth_gate_action` (`log_in`) → `web_login` or `web_sign_up`

---

## 14. Order to build

1. `src/lib/analytics/` with `track()`, `TrackView` and the event names as a typed list.
2. Sign-in and onboarding (sections 2–3).
3. Quiz and pick events (sections 6–7).
4. Shop and profile (sections 8–9).
5. Navigation, help and reliability (sections 4, 5, 10–12).

After each step, check the events in GA → Admin → **DebugView**. To see your
own browser there, install the *Google Analytics Debugger* extension. Then
register the custom dimensions and mark the key events (section 13).
