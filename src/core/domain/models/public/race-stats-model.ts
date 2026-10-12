import type { DeepNullable } from "@/core/domain/types/game-types";

/*
 * An F1 race's stats, as docs/stats.md describes them. A field the guide names
 * without showing its value is typed from the backend's sample summary.
 */

type Track = {
  id: string;
  name: string;
  city: string;
  country: string;
  /** Image URLs of the circuit's layout. */
  picture: string;
  pictureSvg: string;
  lapLengthKm: number;
  raceDistanceKm: number;
  laps: number;
  turns: number;
  /** For example "Clockwise". */
  direction: string;
  /** The year of the circuit's first race. */
  established: number;
  lapRecord: {
    driver: string;
    /** For example "1:20.901". */
    time: string;
    year: number;
    team: string;
  };
};

type Winner = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  /** Image URL of the driver's flag. */
  flag: string;
  team: string;
  /** A hex colour. */
  teamColor: string;
  carNumber: string;
  /** The race time, for example "1:51:15.281". */
  time: string;
  finishPosition: number;
  gridPosition: number;
  positionsGained: number;
  fastestLap: string;
  fastestLapNumber: number;
  pitStops: number;
  lapsLed: number;
  lapsCompleted: number;
  points: number;
};

type ClassificationRow = {
  position: number;
  id: string;
  /** The driver's three-letter code, for example "ANT". */
  code: string;
  name: string;
  team: string;
  /** A hex colour. */
  teamColor: string;
  gridPosition: number;
  positionsGained: number;
  time: string;
  gapSeconds: number;
  lapsCompleted: number;
  lapsBehind: number;
  fastestLap: string;
  pitStops: number;
  points: number;
};

/** What every chart row says about its driver. */
type ChartDriver = {
  id: string;
  /** The driver's three-letter code. */
  code: string;
  name: string;
  team: string;
  /** A hex colour. */
  teamColor: string;
};

/** A lap time as text, and in seconds. Both null when no lap was set. */
type LapTime = { time: string; seconds: number };

/** Chart data the server has already worked out. */
type Charts = {
  gapToLeader: {
    onLeadLap: number;
    lapped: number;
    points: Array<
      ChartDriver & {
        position: number;
        gapSeconds: number;
        /** The winner's race time, then each gap to it: "+3.857". */
        gap: string;
      }
    >;
  };
  weekendPositionTrack: {
    /** The sessions of the weekend, in order, starting with "FP1". */
    stages: string[];
    series: Array<
      ChartDriver & {
        positions: Array<{ stage: string; position: number }>;
      }
    >;
  };
  paceEvolution: {
    stages: string[];
    series: Array<
      ChartDriver & {
        laps: Array<{ stage: string; bestLap: string; seconds: number }>;
      }
    >;
  };
  qualifyingElimination: {
    /** "Q1", "Q2" and "Q3". */
    segments: string[];
    eliminatedInQ1: number;
    eliminatedInQ2: number;
    reachedQ3: number;
    series: Array<
      ChartDriver & {
        position: number;
        q1: LapTime;
        q2: LapTime;
        q3: LapTime;
        /** "Q1" or "Q2", or null for a driver who reached Q3. */
        eliminatedIn: string;
      }
    >;
  };
  gridVsFinish: Array<
    ChartDriver & {
      gridPosition: number;
      finishPosition: number;
      positionsGained: number;
    }
  >;
};

export type RaceSummary = DeepNullable<{
  eventId: string;
  name: string;
  shortName: string;
  seasonYear: number;
  /** The race weekend. */
  startDate: string;
  endDate: string;
  /** The provider's status text: "Scheduled", "In Progress" or "Final". */
  status: string;
  /** True once the race is over, which is when polling should stop. */
  completed: boolean;
  track: Track;
  /** Null until there is one. */
  winner: Winner;
  /** The finishing order, one row per driver. */
  classification: ClassificationRow[];
  charts: Charts;
}>;
