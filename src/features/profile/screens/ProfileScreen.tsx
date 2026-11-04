"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { IMAGES } from "@/config/images";
import type { AuthUser } from "@/core";
import { SignalOffIcon } from "@/lib/icons";
import { NoDataState } from "@/lib/ui/no-data-state";

import {
  coinRanges,
  followedGroups,
  toProfile,
  toStatBands,
} from "../adapters";
import {
  AvatarSheet,
  BannerSheet,
  ClubsSheet,
  SettingsSheet,
} from "../components/sheets";
import {
  BANNERS,
  SAMPLE_FRAMES,
} from "../constants";
import {
  useCoinMap,
  useProfileUser,
  useSignupTournaments,
  useUserStats,
} from "../data/profile.data";
import { CoinHistorySheet } from "../widgets/coin.history";
import { CoinTrackerWidget } from "../widgets/coin-tracker.widget";
import { FollowingWidget } from "../widgets/following.widget";
import { ProfileHero } from "../widgets/profile-hero.widget";
import { ActionRows } from "../widgets/sidebar.widget";
import { StatBandWidget } from "../widgets/stat-band.widget";

export type ProfileScreenProps = {
  /** Signs the player out; the page wires it to the auth feature. */
  onLogout: () => void;
  logoutPending: boolean;
};

/**
 * The player's profile. A guest is sent to log in, since the profile comes
 * from the session cookies.
 */
export function ProfileScreen(props: ProfileScreenProps) {
  const router = useRouter();
  const { signedIn, user } = useProfileUser();

  useEffect(() => {
    if (signedIn === false) router.replace("/auth?returnTo=%2Fprofile");
  }, [signedIn, router]);

  if (!user.data || signedIn === false) {
    return user.status === "error" && signedIn !== false ? (
      <NoDataState
        icon={SignalOffIcon}
        title="Couldn't load your profile"
        message="Check your connection and try again."
        action={
          <button
            type="button"
            onClick={user.reload}
            className="inline-flex min-h-10 items-center bg-cyan/12 px-5 font-display text-xs font-bold tracking-wide text-cyan transition-colors duration-200 hover:bg-cyan/20"
          >
            TRY AGAIN
          </button>
        }
      />
    ) : (
      <div
        role="status"
        aria-label="Loading your profile"
        className="mx-auto h-80 w-full max-w-160 animate-pulse bg-surface-elevated/50 lg:max-w-260"
      />
    );
  }

  // Keyed, so the next player starts from their own choices.
  return <ProfileView key={user.data._id} user={user.data} {...props} />;
}

type OverlayId =
  | "settings"
  | "clubs"
  | "avatar"
  | "banner"
  | "history";

function ProfileView({
  user,
  onLogout,
  logoutPending,
}: ProfileScreenProps & { user: AuthUser }) {
  const profile = toProfile(user);
  const [overlay, setOverlay] = useState<OverlayId | null>(null);
  const [avatar, setAvatar] = useState<"photo" | "default">(
    profile.avatarUrl ? "photo" : "default",
  );
  const [frame, setFrame] = useState("none");
  const [banner, setBanner] = useState(profile.bannerUrl ? "yours" : "default");
  const tournaments = useSignupTournaments();
  const coinMap = useCoinMap();
  const stats = useUserStats();
  // Fixed when the page opens, so the ranges don't shift while it's open.
  const [now] = useState(() => Date.now());
  const close = () => setOverlay(null);

  const avatarSrc =
    avatar === "photo" && profile.avatarUrl
      ? profile.avatarUrl
      : IMAGES.profile.defaultMale;
  const bannerSrc =
    banner === "yours" && profile.bannerUrl
      ? profile.bannerUrl
      : (BANNERS.find((b) => b.id === banner) ?? BANNERS[0]).src;
  const groups = followedGroups(tournaments.data ?? [], user.clubAndTeams);

  return (
    <div className="mx-auto w-full max-w-160 pb-7 lg:max-w-260">
      <ProfileHero
        profile={profile}
        avatarSrc={avatarSrc}
        frameColor={SAMPLE_FRAMES.find((f) => f.id === frame)?.color ?? null}
        bannerSrc={bannerSrc}
        onEditAvatar={() => setOverlay("avatar")}
        onEditBanner={() => setOverlay("banner")}
      />

      <div className="flex flex-col gap-3.5 px-4 pt-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-5 lg:px-0 lg:pt-5">
        <div className="flex flex-col gap-3.5">
          <FollowingWidget groups={groups} onEdit={() => setOverlay("clubs")} />
          <CoinTrackerWidget
            balance={profile.coins}
            ranges={
              coinMap.data
                ? coinRanges(coinMap.data.points, profile.coins, now)
                : null
            }
            failed={coinMap.status === "error"}
            onRetry={coinMap.reload}
            onHistory={() => setOverlay("history")}
          />
          {stats.data ? (
            toStatBands(stats.data).map((band, index) => (
              <StatBandWidget key={band.id} band={band} delay={160 + index * 40} />
            ))
          ) : stats.status === "error" ? (
            <p className="flex items-center justify-between gap-3 border border-line px-3.5 py-3 font-sans text-sm text-muted">
              Couldn&apos;t load your stats.
              <button
                type="button"
                onClick={stats.reload}
                className="font-display text-2xs font-black tracking-wide text-cyan hover:text-foreground"
              >
                TRY AGAIN
              </button>
            </p>
          ) : (
            <div
              role="status"
              aria-label="Loading your stats"
              className="h-60 animate-pulse bg-surface-elevated/50"
            />
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <ActionRows onSettings={() => setOverlay("settings")} />
        </div>
      </div>

      {overlay === "settings" ? (
        <SettingsSheet
          onClose={close}
          onLogout={onLogout}
          logoutPending={logoutPending}
        />
      ) : overlay === "clubs" ? (
        <ClubsSheet picks={user.clubAndTeams} onClose={close} />
      ) : overlay === "avatar" ? (
        <AvatarSheet
          photoUrl={profile.avatarUrl}
          avatar={avatar}
          frame={frame}
          onAvatar={setAvatar}
          onFrame={setFrame}
          onClose={close}
        />
      ) : overlay === "banner" ? (
        <BannerSheet
          apiBanner={profile.bannerUrl}
          banner={banner}
          onChoose={setBanner}
          onClose={close}
        />
      ) : overlay === "history" ? (
        <CoinHistorySheet balance={profile.coins} onClose={close} />
      ) : null}
    </div>
  );
}
