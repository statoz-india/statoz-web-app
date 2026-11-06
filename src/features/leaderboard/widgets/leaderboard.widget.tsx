import Image from "next/image";
import type { ReactNode } from "react";

import { IMAGES } from "@/config/images";
import { PremiumIcon } from "@/lib/icons";

import type { BoardRow } from "../adapters";
import styles from "../css/leaderboard.widget.module.css";

/** #1 gets the champion card, #2 and #3 the runner-up cards. */
const PODIUM_SIZE = 3;

const formatXP = (xp: number) => xp.toLocaleString("en-US");

/**
 * A sport's or tournament's leaderboard: the champion card and the two
 * runners-up, then one row per player from #4 down. In the order the API sent.
 */
export function LeaderboardWidget({ entries }: { entries: BoardRow[] }) {
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

function Champion({ entry }: { entry: BoardRow }) {
  return (
    <div className={`${styles.plate} ${styles.championPlate}`}>
      <div className={styles.champion}>
        <Face size={86} src={entry.avatarUrl} />
        <div className={styles.championText}>
          <div className={styles.rankLine}>
            <span className={styles.championRank}>#{entry.rank}</span>
            <PremiumIcon size={18} className={styles.medal} aria-hidden />
          </div>
          <p className={styles.championName}>{entry.name}</p>
        </div>
        <div className={styles.championScore}>
          <span className={styles.championValue}>
            {formatXP(entry.xp)}
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
  entry: BoardRow;
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
          <Face size={66} src={entry.avatarUrl} />
          <div className={styles.grow}>
            <p className={styles.runnerName}>{entry.name}</p>
            <span className={styles.runnerScore}>
              {formatXP(entry.xp)} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankRow({ entry }: { entry: BoardRow }) {
  return (
    <div className={`${styles.plate} ${styles.rowPlate}`}>
      <div className={styles.row}>
        <span className={styles.rowRank}>#{entry.rank}</span>
        <Face size={48} src={entry.avatarUrl} />
        <div className={styles.rowText}>
          <span className={styles.rowName}>{entry.name}</span>
        </div>
        <div className={styles.rowScore}>
          <span className={styles.rowValue}>{formatXP(entry.xp)}</span>
          <span className={styles.rowUnit}>XP</span>
        </div>
      </div>
    </div>
  );
}

/** An octagon portrait: the player's avatar, or the default face without one. */
function Face({ size, src }: { size: number; src?: string }): ReactNode {
  return (
    <span className={styles.face} style={{ width: size, height: size }} aria-hidden>
      <span className={styles.faceRing} />
      <span className={styles.facePhoto}>
        <Image
          src={src ?? IMAGES.profile.defaultMale}
          alt=""
          fill
          // Avatars are full URLs on the image host.
          unoptimized={src !== undefined}
          sizes={`${size}px`}
          className={styles.faceImage}
        />
      </span>
    </span>
  );
}
