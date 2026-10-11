# Public Match Stats: Frontend Integration Guide

Two endpoints return the stats for a match or an F1 race **without a login token**. Use them for the stats screen shown to a visitor who has not signed in.

```
GET {API_BASE_URL}/api/v1/public-api/matchStats/:matchId
GET {API_BASE_URL}/api/v1/public-api/matchStats/f1/race/:matchId
```

They are available in an environment once the backend release that contains them is deployed there. The rules shared by all public endpoints are in [public-api-frontend.md](public-api-frontend.md); the ones that matter here are repeated below.

## Which endpoint to call

| You are showing                         | Call                           | Send as `:matchId`                                    |
| --------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| A football, cricket or basketball match | `/matchStats/:matchId`         | The match's `_id`                                     |
| An F1 race                              | `/matchStats/f1/race/:matchId` | The race's `_id` or its readable id, such as `F1-R18` |

Both ids come from the public match lists:

| List endpoint                                                 | Field to use                         |
| ------------------------------------------------------------- | ------------------------------------ |
| `/matches/:gameType/:date` (team sports)                      | `_id` of an item in `data[].matches` |
| `/matches/racing/:date` or `/motorsport/matchesForDate/:date` | `_id` or `matchId` of a race         |
| `/trending/matches`, items with `type: "match"`               | `data._id`                           |

**The most common mistake:** `/matchStats/:matchId` needs the 24-character `_id`. The readable `matchId` on a team fixture, such as `IPL-M12`, is rejected with a `400`.

---

## Rules

- **No token.** Send no `Authorization` header and no cookies.
- **Read only.** These endpoints return the stats already stored on the server. Calling them does not trigger a refresh.
- **Rate limit.** 60 requests per minute per IP address, shared with every other `/public-api` endpoint. Over the limit the answer is `429` with a **plain-text** body, not JSON.
- **Cache.** A `200` carries `Cache-Control: public, max-age=15`. A browser reuses it for 15 seconds, so stats can be up to 15 seconds old.
- **Size.** One response is roughly 30 to 50 KB. Load stats when the user opens a match, never for every card in a list.

---

## 1. Stats for a match

```
GET /api/v1/public-api/matchStats/:matchId
```

### Response

```jsonc
{
  "statusCode": 200,
  "data": {
    "_id": "66c300000000000000000021",
    "matchUniqueId": "IPL-M12", // the readable match id
    "matchId": "66c300000000000000000001", // the match _id you asked for
    "espnId": "1529302",
    "gameType": "cricket", // "football", "cricket" or "basketball"
    "matchSummary": {
      /* the stats; see "What matchSummary holds" */
    },
    "fetchedAt": "2026-10-10T15:42:10.000Z", // when the stats were last refreshed
    "createdAt": "2026-10-10T14:01:00.000Z",
    "updatedAt": "2026-10-10T15:42:10.000Z",
  },
  "message": "Match stats fetched successfully",
  "success": true,
}
```

Switch on `data.gameType` to choose how to render `matchSummary`. Use `fetchedAt` if you show a "last updated" time.

### Errors

| Status | When                                                      | Body                                                                                                |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `400`  | `matchId` is not a 24-character id                        | `data: { "error": "matchId must be a valid ObjectId" }`, `message: "Match stats cannot be fetched"` |
| `404`  | No stats stored for the match yet, or the match is hidden | `data: null`, `message: "Match stats not found"`                                                    |
| `429`  | Over the rate limit                                       | Plain text: `Too many requests, please try again later.`                                            |

**Treat `404` as "no stats yet", not as a failure.** A match usually has no stats before it starts. Show an empty state such as "Stats will appear once the match begins".

---

## 2. Stats for an F1 race

```
GET /api/v1/public-api/matchStats/f1/race/:matchId
```

`:matchId` is the race's `_id` or its readable id. The readable id is not case-sensitive, so `F1-R18` and `f1-r18` both work.

### Response

The same wrapper as above, with `gameType: "racing"`:

```jsonc
{
  "statusCode": 200,
  "data": {
    "_id": "66c300000000000000000025",
    "matchUniqueId": "F1-R18", // the readable race id
    "matchId": "672900000000000000000001", // the race _id
    "espnId": "600057442",
    "gameType": "racing",
    "matchSummary": {
      /* the race stats; see "racing" below */
    },
    "fetchedAt": "2026-09-06T13:20:00.000Z",
    "createdAt": "2026-09-04T10:35:00.000Z",
    "updatedAt": "2026-09-06T13:20:00.000Z",
  },
  "message": "F1 race stats fetched successfully",
  "success": true,
}
```

### Errors

| Status | When                                        | Body                                                     |
| ------ | ------------------------------------------- | -------------------------------------------------------- |
| `404`  | No such race, or the race is hidden         | `data: null`, `message: "Motorsport match not found"`    |
| `404`  | The race exists but has no stats stored yet | `data: null`, `message: "F1 race stats not found"`       |
| `429`  | Over the rate limit                         | Plain text: `Too many requests, please try again later.` |

Show the same "no stats yet" state for both `404`s. There is no `400` on this endpoint.

A race's `_id` also works on `/matchStats/:matchId` and returns the same stats. Its readable id does not.

---

## What `matchSummary` holds

`matchSummary` has the same structure as on the logged-in stats endpoints, so existing stats components can be reused as they are.

Three things apply to every sport:

- **Any field can be `null` and any list can be empty**, especially before and early in a match. Guard each section before rendering it.
- **Sections marked "may be missing"** were added to the stats later. A match whose stats were stored before then does not have them.
- **Times inside `matchSummary`** are strings as the stats provider sends them, such as `"2026-05-31T14:00Z"`.

### `cricket`

| Key            | What it is                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `matchDetails` | Header: league, title, stage, format, start, `status`, `completed`, `result`, `location`, `toss`, `score`, player of the match, officials |
| `teamStats`    | Head-to-head rows: `name`, `label`, `available`, `home`, `away`, `higher`                                                                 |
| `innings`      | One row per innings: team, `runs`, `wickets`, `overs`, `fours`, `sixes`, `target`, `score`, `current`                                     |
| `scorecard`    | One entry per innings with `batting`, `bowling`, `extras`, `fallOfWickets`, `partnerships`, `didNotBat`                                   |
| `notes`        | Match notes: `innings`, `kind`, `text`                                                                                                    |
| `commentary`   | Ball by ball: `over`, `ball`, `batter`, `bowler`, `runs`, `boundary`, `wicket`, `score`, `shortText`, `text`                              |
| `teams`        | Two teams with `captain`, `keeper` and `players`                                                                                          |

```jsonc
"matchDetails": {
  "gameType": "cricket",
  "league": "Indian Premier League",
  "leagueAbbreviation": "IPL",
  "stage": "Final",
  "format": "T20",
  "start": "2026-05-31T14:00Z",
  "status": "Result",
  "state": "post",
  "completed": true,
  "result": "RCB won by 5 wkts (12b rem)",
  "location": { "venue": "Narendra Modi Stadium, Motera, Ahmedabad", "city": "Ahmedabad", "country": "India", "neutralSite": true },
  "toss": { "team": "Royal Challengers Bengaluru", "decision": "bowl" },
  "score": {
    "home": { "team": "Royal Challengers Bengaluru", "abbreviation": "RCB", "teamId": "335970", "score": "161/5 (18/20 ov, target 156)", "runs": 161, "wickets": 5, "overs": 18, "innings": [2] },
    "away": { /* same fields */ },
    "display": "RCB 161/5 (18/20 ov, target 156) v GT 155/8",
    "winner": "Royal Challengers Bengaluru",
    "winnerId": "335970"
  }
  // …plus season, title, date, time, end, seriesNote, attendance, innings, playerOfTheMatch, officials
},
"teamStats": [
  { "name": "runs", "label": "Runs", "available": true, "home": 161, "away": 155, "higher": "home" }
],
"scorecard": [
  {
    "innings": 1,
    "battingTeam": "Gujarat Titans",
    "bowlingTeam": "Royal Challengers Bengaluru",
    "runs": 155, "wickets": 8, "overs": 20, "runRate": 7.75, "score": "155/8",
    "extras": { "total": 5, "wides": 4, "noballs": 0, "byes": 0, "legByes": 1 },
    "batting": [ /* id, name, position, runs, balls, fours, sixes, strikeRate, dismissal, notOut, score */ ],
    "bowling": [ /* id, name, overs, maidens, runs, wickets, economy, dots, wides, noballs, figures */ ],
    "fallOfWickets": [],
    "partnerships": [],
    "didNotBat": ["Mohammed Siraj"]
  }
]
```

### `football`

| Key            | What it is                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `matchDetails` | Header: league, season, `kickoff`, `status`, `completed`, `location`, `attendance`, `score`, `scorers`                                   |
| `topStats`     | Head-to-head rows. `home` and `away` are objects: `value`, `display`, `share`                                                            |
| `timeline`     | Match events in order: `minute`, `period`, `kind`, `label`, `side`, `team`, `player`, `assist`, `playerIn`, `playerOut`, `card`, `score` |
| `momentum`     | `totalMinutes`, `halftimeMinute`, `home`, `away`, a `series` of per-minute values, and `goals`                                           |
| `shotMap`      | Shots plotted on the pitch: `available`, `pitch`, `home`, `away`, `shots`. **May be missing.**                                           |
| `territory`    | Where play happened: `available`, `grid`, `home`, `away` with `thirds` and `cells`. **May be missing.**                                  |
| `commentary`   | Text commentary: `minute`, `period`, `kind`, `text`, `team`, `side`, `players`                                                           |
| `teams`        | Two teams with `formation`, `lineupsConfirmed` and `players`                                                                             |

```jsonc
"matchDetails": {
  "gameType": "football",
  "league": "English Premier League",
  "kickoff": "2026-08-24T19:00Z",
  "status": "Full Time",
  "completed": true,
  "location": { "venue": "Craven Cottage", "city": "London", "country": "England", "neutralSite": false },
  "attendance": 27461,
  "score": {
    "home": { "team": "Fulham", "abbreviation": "FUL", "score": 2 },
    "away": { "team": "Chelsea", "abbreviation": "CHE", "score": 3 },
    "display": "2-3",
    "winner": "Chelsea"
  },
  "scorers": [ /* id, name, team, teamId, minute, period, type, assist, shootout */ ]
},
"topStats": [
  {
    "name": "possessionPct", "label": "Possession", "available": true,
    "home": { "value": 61.5, "display": "61.5%", "share": 61.5 },
    "away": { "value": 38.5, "display": "38.5%", "share": 38.5 },
    "higher": "home"
  }
],
"teams": [
  {
    "id": "370", "name": "Fulham", "abbreviation": "FUL", "homeAway": "home",
    "formation": "4-2-3-1", "lineupsConfirmed": true,
    "players": [ /* id, name, shortName, jersey, position, positionName, starter, formationPlace */ ]
  }
]
```

Check `shotMap.available` and `territory.available` before drawing those two; `false` means there is nothing to draw.

### `basketball`

| Key             | What it is                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matchDetails`  | Header: league, `gameNote`, `tipoff`, `status`, `completed`, `period`, `clock`, `overtime`, `location`, `broadcast`, `series`, `score`, `periods`, `officials`, `leaders` |
| `lineScore`     | Score by period: `periods`, `home`, `away`, `overtime`                                                                                                                    |
| `topStats`      | Head-to-head rows: `name`, `label`, `available`, `home`, `away`, `higher`. Here `home` and `away` are numbers                                                             |
| `turningPoints` | Biggest win-probability swings: `period`, `clock`, `homeWinPercentage`, `awayWinPercentage`, `homeScore`, `awayScore`, `swing`, `text`                                    |
| `playByPlay`    | Plays in order: `period`, `clock`, `kind`, `label`, `text`, `side`, `players`, `scoringPlay`, `points`, `homeScore`, `awayScore`, `made`, `coordinate`                    |
| `injuries`      | Per team: `team`, `teamId`, `injuries`                                                                                                                                    |
| `teams`         | Two teams with `starters` and `players`, each player carrying the box score                                                                                               |

```jsonc
"matchDetails": {
  "gameType": "basketball",
  "league": "National Basketball Association",
  "leagueAbbreviation": "NBA",
  "gameNote": "NBA Finals - Game 5",
  "tipoff": "2026-06-14T00:30Z",
  "status": "Final",
  "completed": true,
  "period": null,
  "clock": null,
  "overtime": false,
  "score": {
    "home": { "team": "San Antonio Spurs", "abbreviation": "SA", "score": 90, "record": "62-20" },
    "away": { "team": "New York Knicks", "abbreviation": "NY", "score": 94, "record": "53-29" },
    "display": "90-94",
    "margin": 4,
    "winner": "New York Knicks"
  }
  // …plus season, date, time, location, attendance, broadcast, series, periods, officials, leaders
},
"lineScore": {
  "periods": [ { "period": 1, "label": "Q1", "home": 23, "away": 13 } ],
  "home": { "team": "San Antonio Spurs", "abbreviation": "SA", "total": 90 },
  "away": { "team": "New York Knicks", "abbreviation": "NY", "total": 94 },
  "overtime": false
},
"topStats": [
  { "name": "fieldGoalPct", "label": "Field Goal %", "available": true, "home": 38, "away": 36, "higher": "home" }
]
```

A player in `teams[].players` has: `id`, `name`, `shortName`, `jersey`, `position`, `starter`, `didNotPlay`, `reason`, `ejected`, `minutes`, `points`, `fieldGoals`, `threePointFieldGoals`, `freeThrows`, `rebounds`, `assists`, `turnovers`, `steals`, `blocks`, `offensiveRebounds`, `defensiveRebounds`, `fouls`, `plusMinus`.

### `racing`

| Key                                          | What it is                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `eventId`, `name`, `shortName`, `seasonYear` | The race                                                                                                                  |
| `startDate`, `endDate`                       | The race weekend                                                                                                          |
| `status`, `completed`                        | Provider status text, such as `"Scheduled"`, `"In Progress"`, `"Final"`                                                   |
| `track`                                      | Circuit: `name`, `city`, `country`, `picture`, `lapLengthKm`, `raceDistanceKm`, `laps`, `turns`, `direction`, `lapRecord` |
| `winner`                                     | The winner, or `null` until there is one                                                                                  |
| `classification`                             | Finishing order, one row per driver                                                                                       |
| `charts`                                     | Ready-made chart data: `gapToLeader`, `weekendPositionTrack`, `paceEvolution`, `qualifyingElimination`, `gridVsFinish`    |

```jsonc
{
  "eventId": "600057442",
  "name": "Pirelli Italian Grand Prix",
  "shortName": "Pirelli Italian GP",
  "seasonYear": 2026,
  "startDate": "2026-09-04T10:30Z",
  "endDate": "2026-09-06T13:00Z",
  "status": "Final",
  "completed": true,
  "track": {
    "id": "615",
    "name": "Autodromo Nazionale Monza",
    "city": "Monza",
    "country": "Italy",
    "picture": "https://…",
    "pictureSvg": "https://…",
    "lapLengthKm": 5.793,
    "raceDistanceKm": 306.72,
    "laps": 53,
    "turns": 11,
    "direction": "Clockwise",
    "established": 1950,
    "lapRecord": {
      "driver": "Lando Norris",
      "time": "1:20.901",
      "year": 2025,
      "team": "McLaren",
    },
  },
  "winner": {
    "id": "5829",
    "name": "Kimi Antonelli",
    "shortName": "K. Antonelli",
    "country": "Italy",
    "flag": "https://…",
    "team": "Mercedes",
    "teamColor": "#00D2BE",
    "carNumber": "12",
    "time": "1:51:15.281",
    "finishPosition": 1,
    "gridPosition": 19,
    "positionsGained": 18,
    "fastestLap": "1:23.504",
    "fastestLapNumber": 53,
    "pitStops": 2,
    "lapsLed": 1,
    "lapsCompleted": 53,
    "points": 25,
  },
  "classification": [
    {
      "position": 1,
      "id": "5829",
      "code": "ANT",
      "name": "Kimi Antonelli",
      "team": "Mercedes",
      "teamColor": "#00D2BE",
      "gridPosition": 19,
      "positionsGained": 18,
      "time": "1:51:15.281",
      "gapSeconds": 0,
      "lapsCompleted": 53,
      "lapsBehind": 0,
      "fastestLap": "1:23.504",
      "pitStops": 2,
      "points": 25,
    },
  ],
  "charts": {
    "gapToLeader": {
      "onLeadLap": 15,
      "lapped": 7,
      "points": [
        /* position, code, name, team, teamColor, gapSeconds, gap */
      ],
    },
    "weekendPositionTrack": {
      "stages": ["FP1", "…"],
      "series": [
        /* code, name, team, teamColor, positions */
      ],
    },
    "paceEvolution": {
      "stages": ["FP1", "…"],
      "series": [
        /* code, name, team, teamColor, laps */
      ],
    },
    "qualifyingElimination": {
      "segments": ["Q1", "Q2", "Q3"],
      "eliminatedInQ1": 6,
      "eliminatedInQ2": 6,
      "reachedQ3": 10,
      "series": [
        /* code, name, position, q1, q2, q3, eliminatedIn */
      ],
    },
    "gridVsFinish": [
      /* code, name, team, teamColor, gridPosition, finishPosition, positionsGained */
    ],
  },
}
```

---

## Keeping stats up to date during a live match

The socket that pushes live stats needs a login, so a logged-out screen has to poll.

- Poll **no faster than every 30 seconds**. The 15-second cache means a faster poll returns the same data.
- Poll **only while the stats screen is open** and the tab or app is in the foreground.
- **Stop polling when the match is over.** Use the `completed` flag in `matchSummary` (`matchDetails.completed` for team sports, `completed` for a race).
- On a `429`, keep showing the stats you have and wait a minute before trying again.

Every poll counts against the shared limit of 60 requests per minute per IP address, and visitors on the same network share it.

---

## What is different from the logged-in endpoints

|                                  | Logged-in (`/api/v1/match/matchStats/…`) | Public              |
| -------------------------------- | ---------------------------------------- | ------------------- |
| Token                            | Required                                 | Not sent            |
| `matchSummary`                   | Full                                     | The same, unchanged |
| `__v` on the stats record        | Returned                                 | Not returned        |
| Stats for a hidden match or race | Returned                                 | `404`               |
| Live updates                     | Socket push                              | Polling             |
| Caching                          | None                                     | 15 seconds          |

After the user logs in, switch to the logged-in endpoints and the socket.

---

## Example client

```ts
const PUBLIC_API = `${API_BASE_URL}/api/v1/public-api`;

export class RateLimitedError extends Error {}

type StatsRecord<Summary> = {
  _id: string;
  matchUniqueId: string;
  matchId: string;
  espnId: string;
  gameType: "football" | "cricket" | "basketball" | "racing";
  matchSummary: Summary;
  fetchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Returns null when there are no stats yet (the server answers 404). */
async function getStats<Summary>(
  path: string,
): Promise<StatsRecord<Summary> | null> {
  const res = await fetch(`${PUBLIC_API}${path}`); // no Authorization header

  if (res.status === 429) throw new RateLimitedError(); // body is plain text
  if (res.status === 404) return null;

  const body = await res.json();
  if (!body.success) throw new Error(body.message);
  return body.data;
}

// `match._id` is the 24-character id, not the readable matchId.
export const getMatchStats = (match: { _id: string }) =>
  getStats<CricketSummary | FootballSummary | BasketballSummary>(
    `/matchStats/${match._id}`,
  );

// A race can be addressed by either id.
export const getRaceStats = (race: { _id: string }) =>
  getStats<RaceSummary>(`/matchStats/f1/race/${race._id}`);
```

---

## Checklist before release

- [ ] Team-sport stats are requested with the match's `_id`, not `IPL-M12`-style ids.
- [ ] A `404` on either endpoint shows the "no stats yet" state, not an error.
- [ ] A `429` is handled without a JSON parse error and without a retry loop.
- [ ] No `Authorization` header or cookies are sent.
- [ ] Each section of `matchSummary` is guarded against `null`, an empty list or a missing key, including `shotMap` and `territory` for football.
- [ ] Stats are loaded when a match is opened, not for every card in a list.
- [ ] Polling is at 30 seconds or slower, stops when the match is `completed`, and pauses in the background.
- [ ] After login, the screen switches to the logged-in endpoints.
