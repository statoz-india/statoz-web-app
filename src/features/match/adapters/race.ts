import type { RaceSummary } from "@/core";

import type {
  F1ClassificationRow,
  F1RaceReport,
  F1SessionResult,
} from "../types";
import { present } from "./shared";

/**
 * An F1 race's stats as the race report reads them.
 *
 * The API sends the finishing order in full, and for the sessions before it
 * only each driver's place and best lap, so a session's list is built from
 * those two charts.
 */

/** A crest colour for a driver whose team has none. */
const FALLBACK_COLOR = "#5cdfff";

/** The stages of a weekend that are not a session a driver sets a time in. */
const NOT_A_SESSION = new Set(["GRID", "FIN"]);

/** Null until the race has a finishing order. */
export function toRaceReport(
  id: string,
  summary: RaceSummary,
): F1RaceReport | undefined {
  const race = present(summary.classification).map(
    (entry, index): F1ClassificationRow => ({
      position: entry.position ?? index + 1,
      driverId: entry.id ?? entry.code ?? String(index),
      name: entry.name ?? entry.code ?? "Unknown driver",
      constructor: entry.team ?? "—",
      color: entry.teamColor || FALLBACK_COLOR,
      grid: entry.gridPosition ?? entry.position ?? index + 1,
      status: (entry.lapsBehind ?? 0) > 0 ? "Lapped" : "Classified",
      gap: entry.time ?? "",
      fastestLap: entry.fastestLap ?? undefined,
      pitStops: entry.pitStops ?? undefined,
    }),
  );
  if (race.length === 0) return undefined;
  const byDriver = new Map(race.map((entry) => [entry.driverId, entry]));

  const track = summary.track;
  const charts = summary.charts;
  const weekend = present(charts?.weekendPositionTrack?.series);
  const stages = present(charts?.weekendPositionTrack?.stages);
  const pace = present(charts?.paceEvolution?.series);
  const qualifying = present(charts?.qualifyingElimination?.series);

  /** A driver's best lap in a session, as text. */
  const bestLap = (driverId: string, stage: string): string => {
    if (stage.toLowerCase().includes("qual")) {
      const laps = qualifying.find((entry) => entry.id === driverId);
      const time = laps?.q3?.time ?? laps?.q2?.time ?? laps?.q1?.time;
      if (time) return time;
    }
    return (
      present(pace.find((entry) => entry.id === driverId)?.laps).find(
        (lap) => lap.stage === stage,
      )?.bestLap ?? ""
    );
  };

  const sessions: F1SessionResult[] = stages
    .filter((stage) => !NOT_A_SESSION.has(stage.toUpperCase()))
    .map((stage) => ({
      id: stage,
      label: stage,
      classification: weekend
        .flatMap((driver, index): F1ClassificationRow[] => {
          const position = present(driver.positions).find(
            (entry) => entry.stage === stage,
          )?.position;
          if (position == null) return [];
          const driverId = driver.id ?? driver.code ?? String(index);
          const known = byDriver.get(driverId);
          const out = qualifying.find(
            (entry) => entry.id === driverId,
          )?.eliminatedIn;
          return [
            {
              position,
              driverId,
              name: driver.name ?? known?.name ?? driver.code ?? "",
              constructor: driver.team ?? known?.constructor ?? "—",
              color: driver.teamColor || known?.color || FALLBACK_COLOR,
              grid: known?.grid ?? position,
              status:
                stage.toLowerCase().includes("qual") && out
                  ? `OUT IN ${out}`
                  : "Classified",
              gap: bestLap(driverId, stage),
            },
          ];
        })
        .sort((a, b) => a.position - b.position),
    }))
    .filter((session) => session.classification.length > 0);

  const record = track?.lapRecord;
  return {
    id,
    name: summary.name ?? "",
    abbreviation: (summary.shortName ?? summary.name ?? "RACE").toUpperCase(),
    season: summary.seasonYear ?? 0,
    circuit: {
      fullName: track?.name ?? summary.name ?? "",
      asset: track?.pictureSvg || track?.picture || "",
      laps: track?.laps ?? 0,
      turns: track?.turns ?? 0,
      lengthKm: track?.lapLengthKm ?? 0,
      distanceKm: track?.raceDistanceKm ?? 0,
      direction: track?.direction ?? "",
      established: track?.established ?? 0,
      lapRecord: record?.time ?? "—",
      lapRecordDriver: record?.driver ?? "",
    },
    winner: race[0],
    pole: race.reduce((best, entry) => (entry.grid < best.grid ? entry : best)),
    biggestGain: race.reduce((best, entry) =>
      entry.grid - entry.position > best.grid - best.position ? entry : best,
    ),
    race,
    sessions,
    weekendTicks: stages,
    weekendDrivers: race.slice(0, 8).flatMap((entry) => {
      const driver = weekend.find(
        (candidate) => candidate.id === entry.driverId,
      );
      if (!driver) return [];
      const positions = present(driver.positions);
      return [
        {
          id: entry.driverId,
          name: entry.name,
          abbreviation: driver.code ?? entry.name.slice(0, 3).toUpperCase(),
          constructor: entry.constructor,
          color: entry.color,
          // A driver who missed a session is drawn at the back of the field.
          positions: stages.map(
            (stage) =>
              positions.find((position) => position.stage === stage)
                ?.position ?? race.length,
          ),
        },
      ];
    }),
  };
}
