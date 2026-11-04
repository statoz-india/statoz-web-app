"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import { IMAGES } from "@/config/images";
import type { Sport } from "@/config/sports";
import type { AuthUser } from "@/core";
import { Button } from "@/lib/components/button";
import {
  CheckIcon,
  ChevronRightIcon,
  LogoutIcon,
  SettingsIcon,
} from "@/lib/icons";

import { followableSports, toTeam } from "../adapters";
import { BANNERS, SAMPLE_FRAMES } from "../constants";
import { saveClubAndTeams, useSignupTournaments } from "../data/profile.data";
import { ClubTile, LeagueCard, SportButton } from "../widgets/clubs.widget";
import { Overlay } from "./overlay";

const DANGER = "var(--ds-color-danger)";

export function SettingsSheet({
  onClose,
  onLogout,
  logoutPending,
}: {
  onClose: () => void;
  onLogout: () => void;
  logoutPending: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Overlay title="SETTINGS" icon={SettingsIcon} onClose={onClose}>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex w-full items-center gap-3 px-4.5 py-4 text-left transition-colors duration-150 hover:bg-foreground/4"
      >
        <span className="grid size-9 place-items-center border border-danger/55 bg-danger/12 text-danger">
          <LogoutIcon size={20} />
        </span>
        <span className="flex-1">
          <span className="block font-display text-compact font-black tracking-wide text-danger">
            LOG OUT
          </span>
          <span className="mt-1 block font-sans text-xs text-muted">
            Sign out of StatOz on this device.
          </span>
        </span>
        <ChevronRightIcon size={20} className="text-danger" />
      </button>
      {confirming ? (
        <Overlay
          title="LOG OUT?"
          icon={LogoutIcon}
          accent={DANGER}
          size="dialog"
          onClose={() => setConfirming(false)}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button variant="surface" onClick={() => setConfirming(false)}>
                CANCEL
              </Button>
              <Button
                variant="tonal"
                accent={DANGER}
                pending={logoutPending}
                onClick={onLogout}
              >
                LOG OUT
              </Button>
            </div>
          }
        >
          <p className="px-4.5 py-4 font-sans text-sm text-muted">
            You&apos;ll need to log in again to make picks, predictions and play
            games.
          </p>
        </Overlay>
      ) : null}
    </Overlay>
  );
}

export function ClubsSheet({
  picks,
  onClose,
}: {
  picks: AuthUser["clubAndTeams"];
  onClose: () => void;
}) {
  const tournaments = useSignupTournaments();
  const sports = followableSports(tournaments.data ?? []);
  const [draft, setDraft] = useState(picks);
  const [sportId, setSportId] = useState<Sport | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const current = sports.find((s) => s.sport === sportId) ?? sports[0];
  const league =
    current?.tournaments.find((t) => t._id === leagueId) ??
    current?.tournaments[0];
  const picked = (id: string) => draft.find((p) => p.tournament === id);

  const toggleLeague = (id: string) =>
    setDraft((list) =>
      list.some((p) => p.tournament === id)
        ? list.filter((p) => p.tournament !== id)
        : [...list, { tournament: id, teams: [] }],
    );
  // A club is saved under its league, so picking one follows the league too.
  const toggleTeam = (id: string, team: string) =>
    setDraft((list) =>
      list.some((p) => p.tournament === id)
        ? list.map((p) =>
            p.tournament === id
              ? {
                  ...p,
                  teams: p.teams.includes(team)
                    ? p.teams.filter((t) => t !== team)
                    : [...p.teams, team],
                }
              : p,
          )
        : [...list, { tournament: id, teams: [team] }],
    );

  async function save() {
    setSaving(true);
    setFailure(null);
    try {
      const result = await saveClubAndTeams(draft);
      if (result.success) return onClose();
      setFailure(
        "errors" in result && result.errors?.length
          ? result.errors.map(String).join(". ")
          : "Couldn't save your clubs. Try again.",
      );
    } catch {
      setFailure("Couldn't save your clubs. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Overlay
      title="EDIT CLUBS"
      size="full"
      onClose={onClose}
      footer={
        <>
          {failure ? (
            <p role="alert" className="mb-3 font-sans text-xs text-danger">
              {failure}
            </p>
          ) : null}
          <Button
            fullWidth
            pending={saving}
            disabled={!current}
            onClick={() => void save()}
          >
            SAVE
          </Button>
        </>
      }
    >
      {current && league ? (
        <div className="px-4 pt-3.5 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {sports.map(({ sport }) => (
              <SportButton
                key={sport}
                sport={sport}
                selected={sport === current.sport}
                onClick={() => {
                  setSportId(sport);
                  setLeagueId(null);
                }}
              />
            ))}
          </div>
          {/* Formula 1 is motorsport's only league, so it shows no cards. */}
          {current.sport !== "racing" ? (
            <div className="mt-3 flex gap-2.5 overflow-x-auto scrollbar-none">
              {current.tournaments.map((t) => (
                <LeagueCard
                  key={t._id}
                  league={t}
                  showing={t._id === league._id}
                  followed={!!picked(t._id)}
                  onShow={() => setLeagueId(t._id)}
                  onFollow={() => toggleLeague(t._id)}
                />
              ))}
            </div>
          ) : null}
          {league.teams.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {league.teams.map((team) => (
                <li key={team._id}>
                  <ClubTile
                    team={toTeam(current.sport, team)}
                    selected={!!picked(league._id)?.teams.includes(team._id)}
                    dim={!picked(league._id)}
                    onClick={() => toggleTeam(league._id, team._id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 font-sans text-sm leading-body text-muted">
              {league.tournamentName} fields individual athletes, so its line-up
              arrives with each tournament. Follow it now and pick a favourite
              later.
            </p>
          )}
        </div>
      ) : tournaments.status === "error" ? (
        <div className="grid justify-items-center gap-3 px-4.5 py-10 text-center">
          <p className="font-sans text-sm text-muted">
            Couldn&apos;t load the clubs.
          </p>
          <Button variant="tonal" size="sm" onClick={tournaments.reload}>
            TRY AGAIN
          </Button>
        </div>
      ) : tournaments.status === "loading" ? (
        <div
          role="status"
          aria-label="Loading clubs"
          className="m-4 h-60 animate-pulse bg-surface-elevated/50"
        />
      ) : (
        <p className="px-4.5 py-10 text-center font-sans text-sm text-muted">
          No clubs to follow yet.
        </p>
      )}
    </Overlay>
  );
}

/** Square picker tile; the chosen one gets a cyan edge. */
function Choice({
  selected,
  label,
  onClick,
  className = "",
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      className={`relative overflow-hidden border-2 transition-colors duration-150 ${selected ? "border-cyan" : "border-line hover:border-line-strong"} ${className}`}
    >
      {children}
      {selected ? (
        <CheckIcon
          size={14}
          className="absolute top-1 right-1 bg-background/80 text-cyan"
        />
      ) : null}
    </button>
  );
}

export function AvatarSheet({
  photoUrl,
  avatar,
  frame,
  onAvatar,
  onFrame,
  onClose,
}: {
  photoUrl: string | null;
  avatar: "photo" | "default";
  frame: string;
  onAvatar: (avatar: "photo" | "default") => void;
  onFrame: (frame: string) => void;
  onClose: () => void;
}) {
  const avatars = [
    ...(photoUrl
      ? [{ id: "photo" as const, label: "Google photo", src: photoUrl }]
      : []),
    {
      id: "default" as const,
      label: "Default",
      src: IMAGES.profile.defaultMale,
    },
  ];
  return (
    <Overlay title="AVATAR" onClose={onClose}>
      <div className="px-4.5 py-4">
        <h3 className="font-display text-micro font-black tracking-ultra text-muted">
          FACE
        </h3>
        <div className="mt-2.5 flex gap-2.5">
          {avatars.map((a) => (
            <Choice
              key={a.id}
              label={a.label}
              selected={avatar === a.id}
              onClick={() => onAvatar(a.id)}
              className="size-20 bg-surface-elevated"
            >
              <Image
                src={a.src}
                alt=""
                fill
                sizes="80px"
                unoptimized={a.src.startsWith("http")}
                className="object-cover object-top"
              />
            </Choice>
          ))}
        </div>

        <h3 className="mt-5 font-display text-micro font-black tracking-ultra text-muted">
          FRAME
        </h3>
        <div className="mt-2.5 flex flex-wrap gap-2.5">
          {SAMPLE_FRAMES.map((f) => (
            <Choice
              key={f.id}
              label={`${f.label} frame`}
              selected={frame === f.id}
              onClick={() => onFrame(f.id)}
              className="grid size-14 place-items-center bg-surface"
            >
              <span
                className="size-8 border-2 border-line-strong"
                style={
                  f.color ? { outline: `3px solid ${f.color}` } : undefined
                }
              />
            </Choice>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

export function BannerSheet({
  apiBanner,
  banner,
  onChoose,
  onClose,
}: {
  apiBanner: string | null;
  banner: string;
  onChoose: (banner: string) => void;
  onClose: () => void;
}) {
  const banners = [
    ...(apiBanner ? [{ id: "yours", label: "Yours", src: apiBanner }] : []),
    ...BANNERS,
  ];
  return (
    <Overlay title="BANNER" onClose={onClose}>
      <ul className="grid gap-2.5 px-4.5 py-4">
        {banners.map((b) => (
          <li key={b.id}>
            <Choice
              label={`${b.label} banner`}
              selected={banner === b.id}
              onClick={() => onChoose(b.id)}
              className="block aspect-4/1 w-full"
            >
              <Image
                src={b.src}
                alt=""
                fill
                sizes="500px"
                unoptimized={b.src.startsWith("http")}
                className="object-cover"
              />
            </Choice>
          </li>
        ))}
      </ul>
    </Overlay>
  );
}
