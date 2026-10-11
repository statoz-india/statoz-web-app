# Public API: Frontend Integration Guide

Seven read-only endpoints can now be called **without a login token**. Use them to show matches, trending items and games to a visitor who has not signed in, on the website or in the app before login.

They are available in an environment once the backend release that contains them is deployed there.

## Quick reference

All paths start with `{API_BASE_URL}/api/v1/public-api`. All are `GET`.

| #   | Public endpoint                    | Returns                                               | Logged-in equivalent                            |
| --- | ---------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| 1   | `/matches/:gameType/:date`         | One sport's fixtures for a day, grouped by tournament | `/api/v1/match/matches/:gameType/:date`         |
| 2   | `/motorsport/matchesForDate/:date` | The day's races, as a flat list                       | `/api/v1/match/motorsport/matchesForDate/:date` |
| 3   | `/trending/matches`                | The curated trending list, plus counts                | `/api/v1/trending/matches`                      |
| 4   | `/trending/games`                  | The curated trending mini-games, grouped by sport     | `/api/v1/trending/games`                        |
| 5   | `/games`                           | Sports list for the matches screen                    | `/api/v1/games`                                 |
| 6   | `/games/get-games`                 | Every mini-game, grouped by sport                     | `/api/v1/games/get-games`                       |
| 7   | `/games/gamesTab`                  | Sports list for the games screen                      | `/api/v1/games/gamesTab`                        |

Each public response has the same shape as its logged-in equivalent, minus a few fields. If you already have types and components for the logged-in endpoints, reuse them and make the fields in [What is different from the logged-in endpoints](#what-is-different-from-the-logged-in-endpoints) optional.

---

## Rules that apply to every endpoint

### No token

Send no `Authorization` header and no cookies. A token is ignored if you send one; it does not add the per-user fields.

### Response envelope

Every JSON response uses the same wrapper as the rest of the API:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "…",
  "success": true
}
```

`success` is `false` whenever `statusCode` is 400 or higher. Dates are ISO strings in UTC.

### Rate limit: 60 requests per minute, shared

- The limit is **60 requests per minute per IP address, counted across all seven endpoints together**.
- Everyone behind the same Wi-Fi or mobile carrier address shares that budget, so keep calls low.
- Over the limit the server answers `429`, and **the body is plain text, not JSON**:

  ```
  Too many requests, please try again later.
  ```

  Don't call `.json()` on a `429`. Stop requesting and try again after up to 60 seconds.

- The response carries `RateLimit-Remaining`, `RateLimit-Reset` and, on a `429`, `Retry-After` (seconds). A mobile app can read them. Browser code on a different origin can't, so just wait.

### Responses are cached for 15 seconds

Every `200` carries `Cache-Control: public, max-age=15`. A browser reuses the response for 15 seconds without asking the server again.

- Live scores and odds can be up to 15 seconds old.
- Polling faster than every 15 seconds gains nothing. If you poll at all, use 30 seconds or more, and stop while the tab or app is in the background.
- Don't add cache-busting query parameters. They defeat the cache and use up the rate limit.

### CORS (websites only)

The API accepts browser calls only from the website origin configured on the server. If a new site or domain gets a CORS error, ask the backend team to allow that origin. Mobile apps are not affected.

### What to call, and when

- Load each endpoint once when its screen opens, and keep the result in app state.
- After the user logs in, switch to the logged-in equivalents from the table above. Only those return the per-user fields.
- Anything that acts for a user still needs a login: answering a quiz, placing a pick, the leaderboard, the profile. The ids in these responses (`quizIds`, `predictionIds`, `_id`) are for opening the right screen after login.

---

## 1. Matches for a sport and day

```
GET /api/v1/public-api/matches/:gameType/:date
```

| Parameter  | Value                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------- |
| `gameType` | `football`, `cricket`, `basketball` or `racing`. Case does not matter.                       |
| `date`     | `YYYY-MM-DD`, the match day **in India time (IST)**, not UTC and not the device's time zone. |

`trending` is also accepted as a `gameType` but normally has no fixtures. For a trending tab, use [endpoint 3](#3-trending-matches).

To get today's date in IST:

```ts
const todayInIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
// "2026-10-10"
```

### Response for a team sport

`data` is a list of tournament sections, already in display order. Matches inside a section are ordered by start time.

```jsonc
{
  "statusCode": 200,
  "data": [
    {
      "tournament": "IPL",
      "tournamentData": {
        // null if the tournament record is missing
        "_id": "66a100000000000000000001",
        "tournament": "IPL",
        "tournamentName": "Indian Premier League",
        "tournamentYear": "2026",
        "primaryColor": "#1B2A6B",
        "secondaryColor": "#F5A623",
        "textColor": "#FFFFFF",
        "gameType": "cricket",
        "displayOrder": 1, // number or null
      },
      "matchCount": 1,
      "matches": [
        {
          "_id": "66c300000000000000000001",
          "matchId": "IPL-M12",
          "matchStartTime": "2026-10-10T14:00:00.000Z",
          "matchStatus": "upcoming",
          "matchEvent": null, // live score object once the feed has data
          "matchBanner": null,
          "tag": "League Stage",
          "gameType": "cricket",
          "tournament": "IPL",
          "espnLeagueName": "ipl",
          "teamA": {
            "_id": "66b200000000000000000001",
            "name": "Mumbai Indians",
            "displayName": "Mumbai",
            "abbreviation": "MI",
            "tournament": "IPL",
            "primaryColor": "#004BA0",
            "secondaryColor": "#FFFFFF",
            "textColor": "#FFFFFF",
            "secondaryTextColor": "#111111",
          },
          "teamB": {
            /* same fields as teamA */
          },
          "quizIds": ["66d400000000000000000001"],
          "predictionIds": ["66e500000000000000000001"],
          "predictionVolume": 3000,
          "eventVolume": 4000,
          "totalVolume": 7000,
          "createdAt": "2026-10-01T06:30:00.000Z",
        },
      ],
    },
  ],
  "message": "Matches fetched successfully",
  "success": true,
}
```

- **`matchStatus`** is one of `upcoming`, `live`, `result`, `canceled`, `abandoned`, `no_result`, `postponed`, `unresolved`, `suspended`.
- **`matchEvent`** is `null` or an object with `id`, `uid`, `name`, `shortName`, `home`, `away`, `score`, `status`, `startTime`, `endTime`, `homeTeamScore`, `awayTeamScore`, `summary`.
- **`predictionVolume`, `eventVolume`, `totalVolume`** are the coins on the match's markets.
- **`quizIds`, `predictionIds`** tell you whether the match has a quiz or a pick. An empty array means none.

### Response for `racing`

The sections are the same, but each item in `matches` is a race, with the fields listed under [endpoint 2](#2-races-for-a-day). This list also includes a race that has no session time yet, when its event window starts on that day.

### Errors

| Status | When                                                 | Body                                                                            |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `400`  | `date` is not `YYYY-MM-DD`                           | `data: null`, `message: "Invalid date format. Use YYYY-MM-DD"`                  |
| `400`  | `gameType` is not in the list (for example `tennis`) | `data: { "error": "gameType must be one of: …" }`, `message: "Invalid request"` |
| `404`  | Nothing on that day                                  | `data: []`, `message: "No matches found for the given date"`                    |

**Treat `404` as an empty day, not as a failure.** Show the "no matches" state. Clients that throw on a 404, such as axios, need a handler for it.

---

## 2. Races for a day

```
GET /api/v1/public-api/motorsport/matchesForDate/:date
```

`date` follows the same rule as above: `YYYY-MM-DD` in IST. `data` is a flat list of races ordered by start time.

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "672900000000000000000001",
      "matchId": "F1-R18",
      "name": "Singapore Grand Prix",
      "description": "Marina Bay Street Circuit",
      "tournament": "F1",
      "tournamentId": "66a100000000000000000002",
      "seasonYear": "2026",
      "tag": "Race",
      "gameType": "racing",
      "matchStatus": "Upcoming",
      "raceEventStartDate": "2026-10-08T00:00:00.000Z",
      "raceEventStopDate": "2026-10-10T18:00:00.000Z",
      "raceStartTime": "2026-10-10T12:00:00.000Z",
      "espnLeagueName": "f1",
      "createdAt": "2026-10-01T06:30:00.000Z",
      "updatedAt": "2026-10-01T06:30:00.000Z"
    }
  ],
  "message": "Motorsport matches fetched successfully",
  "success": true
}
```

- A race returns only these fields, plus `summary` when it is set. A field that is not set on a race, such as `description`, is left out.
- **`matchStatus`** for a race is `Upcoming`, `Ongoing`, `Finished` or `Cancelled`. Note the capital letter, unlike team fixtures.
- Use this endpoint for a flat race list. Use `matches/racing/:date` when racing is shown in the same tournament sections as the other sports.

| Status | When                       | Body                                                                    |
| ------ | -------------------------- | ----------------------------------------------------------------------- |
| `400`  | `date` is not `YYYY-MM-DD` | `data: null`, `message: "Invalid date format. Use YYYY-MM-DD"`          |
| `404`  | No races that day          | `data: []`, `message: "No motorsport matches found for the given date"` |

---

## 3. Trending matches

```
GET /api/v1/public-api/trending/matches
```

No parameters. Always `200`.

```jsonc
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "674b…01",
        "type": "prediction",
        "order": 0,
        "data": {
          /* a prediction */
        },
      },
      {
        "_id": "674b…02",
        "type": "event",
        "order": 1,
        "data": {
          /* an event */
        },
      },
      {
        "_id": "674b…03",
        "type": "future",
        "order": 2,
        "data": {
          /* a future */
        },
      },
      {
        "_id": "674b…04",
        "type": "quiz",
        "order": 3,
        "data": {
          /* a quiz */
        },
      },
      {
        "_id": "674b…05",
        "type": "match",
        "order": 4,
        "data": {
          /* a match */
        },
      },
    ],
    "counts": { "picks": 12, "futures": 3, "events": 7 },
  },
  "message": "Trending matches fetched successfully",
  "success": true,
}
```

- **`items`** is already in display order. Render by `type`.
- **`order`** can have gaps. A hidden or deleted item is left out of the public list.
- **`counts`** is the number of picks, futures and events that are upcoming or live.
- When nothing is trending, `items` is `[]` and `message` is `"No trending matches found"`.

### What `data` holds for each `type`

Each one has the same shape as on the logged-in trending endpoint. Full examples are in the [appendix](#appendix-full-trending-item-examples).

| `type`       | Main fields in `data`                                                                                                                                                                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `prediction` | `predictionId`, `predictionStatus`, `teamA`, `teamB`, `matchId`, `matchStartTime`, `matchEvent`, `tag`, `gameType`, `tournamentData`, `coinsOnTeamA`, `coinsOnTeamB`, `coinsOnDraw`, `totalCoins`, `oddsTeamA`, `oddsTeamB`, `oddsDraw`, and `winningTeam` once decided                                                                    |
| `event`      | `eventId`, `eventName`, `eventDescription`, `eventImage`, `eventStatus`, `haveThreeOptions`, the `yes…` / `no…` / `maybe…` placeholder texts and colors, `coinsOnYes`, `coinsOnNo`, `coinsOnMaybe`, `totalCoins`, `oddsYes`, `oddsNo`, `oddsMaybe`, `entryStartTime`, `entryCloseTime`, `tournamentData`, and `winningOption` once decided |
| `future`     | `futureId`, `eventName`, `eventDescription`, `eventImage`, `futureStatus`, `choices`, `correctChoice`, `totalCoinsPlaced`, `entryStartTime`, `entryCloseTime`, `tournamentData`                                                                                                                                                            |
| `quiz`       | `quizId`, `quizStatus`, `teamA`, `teamB`, `matchId`, `matchStartTime`, `matchEvent`, `matchBanner`, `tag`, `gameType`, `entryStartTime`, `entryStopTime`                                                                                                                                                                                   |
| `match`      | The same fields as a fixture in [endpoint 1](#1-matches-for-a-sport-and-day), without the three volume fields                                                                                                                                                                                                                              |

- **Odds** (`oddsTeamA`, `oddsYes`, a choice's `odds`, and so on) are percentages from 0 to 100.
- **`oddsDraw`** is `null` unless the match is football. The `maybe…` fields are `null` unless `haveThreeOptions` is `true`.
- **A future's `choices`** are sorted by `odds`, highest first. A choice can have `isVisible: false`; don't display those.
- **A quiz** carries no questions or answers. Those need a login.
- **Image fields** (`eventImage`, `matchBanner`, a team's `logo`, and so on) hold the same values the logged-in endpoints return. Handle them the same way.

---

## 4. Trending games

```
GET /api/v1/public-api/trending/games
```

No parameters. Always `200`. `data` has one section per sport, in a fixed order: `trending`, `football`, `cricket`, `basketball`, `tennis`, `racing`. A sport with no trending games still appears, with `games: []`.

```json
{
  "statusCode": 200,
  "data": [
    { "gameType": "trending", "icon": "local_fire_department", "games": [] },
    {
      "gameType": "football",
      "icon": "sports_soccer",
      "games": [
        {
          "_id": "673a00000000000000000001",
          "title": "Penalty Shootout",
          "subtitle": "Beat the keeper",
          "key": "penalty-shootout",
          "gameType": "football",
          "isQuickPlay": true,
          "isLive": true,
          "message": null,
          "displayOrder": 1
        }
      ]
    },
    { "gameType": "cricket", "icon": "sports_cricket", "games": [] },
    { "gameType": "basketball", "icon": "sports_basketball", "games": [] },
    { "gameType": "tennis", "icon": "sports_tennis", "games": [] },
    { "gameType": "racing", "icon": "sports_motorsports", "games": [] }
  ],
  "message": "Trending games fetched successfully",
  "success": true
}
```

A game has these nine fields:

| Field                   | Meaning                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `_id`                   | The game's id                                                       |
| `title`, `subtitle`     | Display text                                                        |
| `key`                   | Unique text key for the game                                        |
| `gameType`              | The sport section it belongs to                                     |
| `isQuickPlay`, `isLive` | `true` or `false`. Same meaning as on the logged-in games endpoints |
| `message`               | Text or `null`. Same meaning as on the logged-in games endpoints    |
| `displayOrder`          | Position within its sport, or `null`                                |

`icon` is a Material icon name.

---

## 5. Sports list for the matches screen

```
GET /api/v1/public-api/games
```

No parameters. Always `200`. A fixed list, with no database read behind it.

```json
{
  "statusCode": 200,
  "data": [
    { "gameType": "trending", "icon": "local_fire_department" },
    { "gameType": "football", "icon": "sports_soccer" },
    { "gameType": "cricket", "icon": "sports_cricket" },
    { "gameType": "basketball", "icon": "sports_basketball" },
    { "gameType": "racing", "icon": "sports_motorsports" }
  ],
  "message": "Games fetched successfully",
  "success": true
}
```

These `gameType` values are the ones [endpoint 1](#1-matches-for-a-sport-and-day) accepts.

---

## 6. All games

```
GET /api/v1/public-api/games/get-games
```

No parameters. Always `200`. Same shape as [trending games](#4-trending-games), but with every game instead of the curated ones.

- Sections come in the same fixed sport order, and an empty sport has `games: []`.
- Games inside a sport are already sorted: ordered games first by `displayOrder`, then unordered ones (`displayOrder: null`), newest first.
- Each game has the same nine fields.
- Games with `isLive: false` are included, as on the logged-in endpoint. Treat them the way the logged-in app does.
- `message` on the envelope is `"Games fetched successfully"`.

---

## 7. Sports list for the games screen

```
GET /api/v1/public-api/games/gamesTab
```

No parameters. Always `200`. A fixed list like [endpoint 5](#5-sports-list-for-the-matches-screen), with `tennis` added:

```json
{
  "statusCode": 200,
  "data": [
    { "gameType": "trending", "icon": "local_fire_department" },
    { "gameType": "football", "icon": "sports_soccer" },
    { "gameType": "cricket", "icon": "sports_cricket" },
    { "gameType": "basketball", "icon": "sports_basketball" },
    { "gameType": "tennis", "icon": "sports_tennis" },
    { "gameType": "racing", "icon": "sports_motorsports" }
  ],
  "message": "Tab games fetched successfully",
  "success": true
}
```

---

## What is different from the logged-in endpoints

Make these fields optional in any type you share between the public and logged-in calls.

| Endpoint              | Not in the public response                                                              | What to do in the UI                                                               |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. Matches            | `hasUserAttemptedQuiz`, `hasViewedResults`                                              | Don't show "attempted" or "results ready" states. Show the plain quiz entry point. |
| 1. Matches            | `createdByUserData`                                                                     | Nothing. It is admin data the app does not display.                                |
| 1. Matches            | Fixtures the admin has hidden                                                           | Nothing. They are simply absent.                                                   |
| 1 and 2. Races        | `createdBy`, `isVisible`, `__v`                                                         | Nothing.                                                                           |
| 3. Trending matches   | `createdByUserData` on predictions, events, quizzes and matches; `createdBy` on futures | Nothing.                                                                           |
| 3. Trending matches   | Hidden predictions, quizzes and matches; deleted or cancelled events                    | Nothing. They are simply absent.                                                   |
| 4 and 6. Games        | `createdAt`, `updatedAt`, `__v` on each game                                            | Nothing, unless you sort or display by those dates.                                |
| 5 and 7. Sports lists | No difference                                                                           |                                                                                    |

---

## Example client

A small wrapper that covers the three cases that differ from the rest of the API: no token, a plain-text `429`, and `404` meaning "empty".

```ts
const PUBLIC_API = `${API_BASE_URL}/api/v1/public-api`;

export class RateLimitedError extends Error {}

/** `empty` is returned when the server answers 404 ("nothing for this day"). */
export async function publicGet<T>(path: string, empty: T): Promise<T> {
  const res = await fetch(`${PUBLIC_API}${path}`); // no Authorization header

  if (res.status === 429) throw new RateLimitedError(); // body is plain text
  if (res.status === 404) return empty;

  const body = await res.json();
  if (!body.success) throw new Error(body.message);
  return body.data as T;
}

const todayInIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );

// Usage
const sports = await publicGet<Sport[]>("/games", []);
const sections = await publicGet<TournamentSection[]>(
  `/matches/cricket/${todayInIST()}`,
  [],
);
const trending = await publicGet<Trending>("/trending/matches", {
  items: [],
  counts: { picks: 0, futures: 0, events: 0 },
});
```

On a `RateLimitedError`, keep showing what you already have and retry after a minute. Don't retry in a loop.

---

## Checklist before release

- [ ] No `Authorization` header or cookies are sent to `/public-api` paths.
- [ ] The date sent to endpoints 1 and 2 is the IST date. Check it between midnight and 05:30 IST, when the UTC date is still the previous day.
- [ ] A day with no matches shows the empty state, not an error.
- [ ] A `429` is handled without a JSON parse error and without a retry loop.
- [ ] Nothing in the logged-out UI depends on `hasUserAttemptedQuiz`, `hasViewedResults` or `createdByUserData`.
- [ ] Games with `isLive: false` behave as they do in the logged-in app.
- [ ] A future's choices with `isVisible: false` are not shown.
- [ ] After login, the screens switch to the logged-in endpoints.
- [ ] No polling faster than every 30 seconds, and none while in the background.

---

## Appendix: full trending item examples

The `data` of each item type in [endpoint 3](#3-trending-matches).

### `prediction`

```jsonc
{
  "_id": "66e500000000000000000001",
  "predictionId": "IPL-M12-P1",
  "predictionStatus": "ACTIVE",
  "isVisible": true,
  "matchId": "IPL-M12",
  "matchStartTime": "2026-10-10T14:00:00.000Z",
  "matchEvent": null,
  "matchEventEspnId": null,
  "tag": "League Stage",
  "gameType": "cricket",
  "espnLeagueName": "ipl",
  "tournament": "IPL",
  "tournamentData": {
    "tournament": "IPL",
    "tournamentName": "Indian Premier League",
    "tournamentYear": "2026",
    "primaryColor": "#1B2A6B",
    "secondaryColor": "#F5A623",
    "textColor": "#FFFFFF",
  },
  "teamA": {
    "_id": "66b200000000000000000001",
    "name": "Mumbai Indians",
    "displayName": "Mumbai",
    "abbreviation": "MI",
    "tournament": "IPL",
    "primaryColor": "#004BA0",
    "secondaryColor": "#FFFFFF",
    "textColor": "#FFFFFF",
    "secondaryTextColor": "#111111",
  },
  "teamB": {
    /* same fields as teamA */
  },
  "entryStartTime": "2026-10-09T06:00:00.000Z",
  "coinsOnTeamA": 1800,
  "coinsOnTeamB": 1200,
  "coinsOnDraw": 0,
  "initialCoinsOnTeamA": 1000,
  "initialCoinsOnTeamB": 1000,
  "initialCoinsOnDraw": 0,
  "totalCoins": 3000,
  "oddsTeamA": 60,
  "oddsTeamB": 40,
  "oddsDraw": null,
  "createdAt": "2026-10-01T06:30:00.000Z",
  // "winningTeam" and "winningTeamId" appear once the result is set
}
```

### `event`

```jsonc
{
  "_id": "66f600000000000000000001",
  "eventId": "IPL-EV-7",
  "eventName": "Will the match go to a super over?",
  "eventDescription": "Settles on the official result.",
  "eventImage": "…",
  "eventDescriptionImage": null,
  "eventStatus": "ACTIVE",
  "pickType": "EVENT",
  "isRacingMatchEvent": false,
  "tournament": "66a100000000000000000001", // an id here, not the code
  "tournamentData": {
    /* same six fields as in a prediction */
  },
  "haveThreeOptions": false,
  "yesPlaceholder": "Yes",
  "noPlaceholder": "No",
  "maybePlaceholder": null,
  "yesPlaceholderColor": "#2CA85E",
  "noPlaceholderColor": "#D64545",
  "maybePlaceholderColor": null,
  "yesTextColor": "#FFFFFF",
  "noTextColor": "#FFFFFF",
  "maybeTextColor": null,
  "entryStartTime": "2026-10-09T06:00:00.000Z",
  "entryCloseTime": "2026-10-10T14:00:00.000Z",
  "coinsOnYes": 1500,
  "coinsOnNo": 2500,
  "coinsOnMaybe": null,
  "initialCoinsOnYes": 1000,
  "initialCoinsOnNo": 1000,
  "initialCoinsOnMaybe": null,
  "totalCoins": 4000,
  "oddsYes": 37.5,
  "oddsNo": 62.5,
  "oddsMaybe": null,
  "createdAt": "2026-10-01T06:30:00.000Z",
  "updatedAt": "2026-10-01T06:30:00.000Z",
  // "winningOption" ("Y", "N" or "M") appears once the result is set
}
```

### `future`

```jsonc
{
  "_id": "671800000000000000000001",
  "futureId": "FUT-3",
  "eventName": "Who wins IPL 2026?",
  "eventDescription": "Settles after the final.",
  "eventImage": "…",
  "futureStatus": "ACTIVE",
  "pickType": "FUTURE",
  "entryStartTime": "2026-09-01T00:00:00.000Z",
  "entryCloseTime": "2026-11-20T00:00:00.000Z",
  "totalCoinsPlaced": 2000,
  "correctChoice": null, // null or missing until settled, then the winning choice object
  "tournamentData": {
    /* same six fields as in a prediction */
  },
  "choices": [
    {
      "_id": "670700000000000000000001",
      "choiceId": "FUT-3-C1",
      "choiceName": "Mumbai",
      "choiceCoins": 3000,
      "initialCoinsOnChoice": 1000,
      "odds": 75,
      "isVisible": true,
      "placeholderColor": "#2CA85E",
      "textColor": "#FFFFFF",
      "teamDetails": {
        // null when the choice is not a team
        "_id": "66b200000000000000000001",
        "name": "Mumbai Indians",
        "displayName": "Mumbai",
        "abbreviation": "MI",
        "logo": "…",
        "primaryColor": "#004BA0",
        "secondaryColor": "#FFFFFF",
        "textColor": "#FFFFFF",
      },
      "createdAt": "2026-10-01T06:30:00.000Z",
      "updatedAt": "2026-10-01T06:30:00.000Z",
    },
    // …more choices, highest odds first
  ],
  "createdAt": "2026-10-01T06:30:00.000Z",
  "updatedAt": "2026-10-01T06:30:00.000Z",
}
```

### `quiz`

```jsonc
{
  "_id": "66d400000000000000000001",
  "quizId": "IPL-M12-Q1",
  "quizStatus": "UPCOMING",
  "isVisible": true,
  "matchId": "IPL-M12",
  "matchStartTime": "2026-10-10T14:00:00.000Z",
  "matchEvent": null,
  "matchEventEspnId": null,
  "matchBanner": null,
  "tag": "League Stage",
  "gameType": "cricket",
  "espnLeagueName": "ipl",
  "tournament": "IPL",
  "teamA": {
    /* team fields, without secondaryTextColor */
  },
  "teamB": {
    /* team fields, without secondaryTextColor */
  },
  "entryStartTime": "2026-10-10T06:00:00.000Z",
  "entryStopTime": "2026-10-10T14:00:00.000Z",
  "createdAt": "2026-10-01T06:30:00.000Z",
}
```

### `match`

```jsonc
{
  "_id": "66c300000000000000000001",
  "matchId": "IPL-M12",
  "matchStartTime": "2026-10-10T14:00:00.000Z",
  "matchStatus": "upcoming",
  "matchEvent": null,
  "matchBanner": null,
  "tag": "League Stage",
  "gameType": "cricket",
  "tournament": "IPL",
  "espnLeagueName": "ipl",
  "teamA": {
    /* same fields as in endpoint 1 */
  },
  "teamB": {
    /* same fields as in endpoint 1 */
  },
  "quizIds": ["66d400000000000000000001"],
  "predictionIds": ["66e500000000000000000001"],
  "createdAt": "2026-10-01T06:30:00.000Z",
}
```
