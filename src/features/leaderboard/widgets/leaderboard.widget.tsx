import Image from "next/image";
import type { ReactNode } from "react";

import { IMAGES } from "@/config/images";
import type { LeaderboardEntry } from "@/core";
import { PremiumIcon } from "@/lib/icons";

import styles from "../css/leaderboard.widget.module.css";

/** #1 gets the champion card, #2 and #3 the runner-up cards. */
const PODIUM_SIZE = 3;

const formatXP = (xp: number) => xp.toLocaleString("en-US");

/** The board's score: the XP earned in its sport. */
const scoreOf = (entry: LeaderboardEntry) => entry.sportXP;

/**
 * A sport's leaderboard: the champion card and the two runners-up, then one
 * row per player from #4 down. In the order the API sent.
 */
export function LeaderboardWidget({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  const [first, ...runners] = entries.slice(0, PODIUM_SIZE);
  const rows = entries.slice(PODIUM_SIZE);
  if (!first) return null;
  return (
    <div className={`${styles.board} mx-auto max-w-160 my-4`}>
      <Champion entry={first} />
      {runners.length > 0 && (
        <div className={styles.runners}>
          {runners.map((entry, i) => (
            <RunnerUp
              key={entry._id}
              entry={entry}
              placing={i === 0 ? "second" : "third"}
            />
          ))}
        </div>
      )}
      {rows.length > 0 && (
        <div className={styles.rows}>
          {rows.map((entry) => (
            <RankRow key={entry._id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function Champion({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className={`${styles.plate} ${styles.championPlate}`}>
      <div className={styles.champion}>
        <Face size={86} />
        <div className={styles.championText}>
          <div className={styles.rankLine}>
            <span className={styles.championRank}>#{entry.rank}</span>
            <PremiumIcon size={18} className={styles.medal} aria-hidden />
          </div>
          <p className={styles.championName}>{entry.userName}</p>
        </div>
        <div className={styles.championScore}>
          <span className={styles.championValue}>
            {formatXP(scoreOf(entry))}
          </span>
          <span className={styles.championUnit}>XP</span>
        </div>
      </div>
    </div>
  );
}

function RunnerUp({
  entry,
  placing,
}: {
  entry: LeaderboardEntry;
  // #2 is cyan, #3 orange.
  placing: "second" | "third";
}) {
  return (
    <div
      className={`${styles.plate} ${styles.runnerPlate}`}
      data-placing={placing}
    >
      <div className={styles.runner}>
        <span className={styles.runnerRank}>#{entry.rank}</span>
        <div className={styles.runnerRow}>
          <Face size={66} />
          <div className={styles.grow}>
            <p className={styles.runnerName}>{entry.userName}</p>
            <span className={styles.runnerScore}>
              {formatXP(scoreOf(entry))} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className={`${styles.plate} ${styles.rowPlate}`}>
      <div className={styles.row}>
        <span className={styles.rowRank}>#{entry.rank}</span>
        <Face size={48} />
        <div className={styles.rowText}>
          <span className={styles.rowName}>{entry.userName}</span>
        </div>
        <div className={styles.rowScore}>
          <span className={styles.rowValue}>{formatXP(scoreOf(entry))}</span>
          <span className={styles.rowUnit}>XP</span>
        </div>
      </div>
    </div>
  );
}

/** An octagon portrait. The API sends no picture, so it shows the default one. */
function Face({ size }: { size: number }): ReactNode {
  return (
    <span className={styles.face} style={{ width: size, height: size }} aria-hidden>
      <span className={styles.faceRing} />
      <span className={styles.facePhoto}>
        <Image
          src={IMAGES.profile.defaultMale}
          alt=""
          fill
          sizes={`${size}px`}
          className={styles.faceImage}
        />
      </span>
    </span>
  );
}
