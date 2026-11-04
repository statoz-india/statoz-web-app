"use client";

import Image from "next/image";
import Link from "next/link";

import { formatInt } from "@/utils";

import { Cut, EditButton, Panel } from "../components/surfaces";
import styles from "../css/profile.module.css";
import type { Profile } from "../types";

const CYAN = "var(--ds-color-accent-cyan)";

/** Google photos and uploads are remote; the optimiser only knows our files. */
const isRemote = (src: string) => /^https?:/.test(src);

export function ProfileHero({
  profile,
  avatarSrc,
  frameColor,
  bannerSrc,
  onEditAvatar,
  onEditBanner,
}: {
  profile: Profile;
  avatarSrc: string;
  frameColor: string | null;
  bannerSrc: string;
  onEditAvatar: () => void;
  onEditBanner: () => void;
  onFriends?: () => void;
}) {
  const { level } = profile;
  return (
    <div className="relative">
      <div className="relative h-51.5 overflow-hidden lg:h-60">
        <Image
          src={bannerSrc}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1040px, 100vw"
          unoptimized={isRemote(bannerSrc)}
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-19 bg-linear-to-b from-background/0 via-background/72 via-62% to-background" />
        <EditButton
          label="Change banner"
          onClick={onEditBanner}
          className="absolute top-3 right-3"
        />
      </div>

      {/* The face straddles the banner and the panel. */}
      <div className="absolute top-18 left-7 z-10 size-26 lg:top-21 lg:left-10 lg:size-32">
        <div
          className="absolute bottom-0 left-0 size-24 overflow-hidden border-2 border-cyan bg-surface-elevated lg:size-30"
          style={{
            boxShadow: `0 4px 0 var(--ds-color-fixture-shadow), 0 0 18px -6px color-mix(in srgb, ${CYAN} 75%, transparent)`,
            outline: frameColor ? `3px solid ${frameColor}` : undefined,
            outlineOffset: 2,
          }}
        >
          <Image
            src={avatarSrc}
            alt=""
            fill
            sizes="120px"
            unoptimized={isRemote(avatarSrc)}
            className="object-cover object-top"
          />
        </div>
        <EditButton
          label="Change avatar"
          onClick={onEditAvatar}
          className="absolute top-0 right-0"
        />
      </div>

      <div className="relative mx-2 -mt-21.5 lg:mx-0 lg:-mt-27">
        <Panel className="relative px-5 pt-19 pb-5 lg:grid lg:grid-cols-2 lg:gap-10 lg:px-7 lg:pt-21">
          <LevelChip level={level.level} />

          <div>
            <h2 className="font-display text-2xl font-black leading-compact tracking-label">
              {profile.name}
            </h2>

            <Link
              href="/profile/xp"
              aria-label="XP progress"
              className="group mt-4.5 block lg:max-w-90"
            >
              <div className="flex justify-between font-display text-2xs font-black text-muted transition-colors duration-150 group-hover:text-cyan">
                <span className="tracking-wide">XP</span>
                <span className="ds-tabular tracking-tight">
                  {formatInt(level.xp)}
                  {level.next === null ? "" : ` / ${formatInt(level.next)}`}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Progress to the next level"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(level.progress * 100)}
                className="mt-1.75 h-1.5 overflow-hidden rounded-sm bg-background/70"
              >
                <div
                  className={`${styles.grow} h-full bg-cyan`}
                  style={{ width: `${level.progress * 100}%` }}
                />
              </div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LevelChip({ level }: { level: number }) {
  return (
    <Link
      href="/profile/xp"
      aria-label={`Level ${level}, XP progress`}
      className="absolute top-4.5 right-4 drop-shadow-[0_3px_6px_rgb(0_0_0/50%)] transition-transform duration-150 hover:-translate-y-px motion-reduce:transform-none lg:right-6"
    >
      <Cut
        edge={`color-mix(in srgb, ${CYAN} 85%, transparent)`}
        fill="linear-gradient(to bottom, var(--ds-color-background-elevated), var(--ds-color-background-secondary))"
        width="1.4px"
        className="flex items-baseline gap-1.5 px-3.5 py-1.5"
      >
        <span className="font-display text-micro font-black tracking-ultra text-cyan/85">
          LVL
        </span>
        <span className="ds-tabular font-display text-xl font-black text-cyan">
          {level}
        </span>
      </Cut>
    </Link>
  );
}
