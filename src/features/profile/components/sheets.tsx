"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";

import { siteLinks } from "@/config/navigation";
import type { Sport } from "@/config/sports";
import type { AuthUser } from "@/core";
import { Button } from "@/lib/components/button";
import {
  CheckIcon,
  ChevronRightIcon,
  ForumIcon,
  LockIcon,
  LogoutIcon,
  MenuBookIcon,
  ProfileIcon,
  SettingsIcon,
  type IconProps,
} from "@/lib/icons";
import { accentVar, withAlpha } from "@/styles";

import {
  avatarChoices,
  bannerChoices,
  followableSports,
  toTeam,
} from "../adapters";
import {
  saveClubAndTeams,
  saveProfile,
  useFreeProfileBanners,
  useFreeProfilePics,
  useSignupTournaments,
  useUserAssets,
} from "../data/profile.data";
import type { LookChoice } from "../types";
import { ClubTile, LeagueCard, SportButton } from "../widgets/clubs.widget";
import { Overlay } from "./overlay";

const DANGER = "var(--ds-color-danger)";

/** The settings above LOG OUT: app pages, then the website's. */
const SETTINGS: { label: string; icon: ComponentType<IconProps>; href: string }[] = [
  { label: "ACCOUNT SETTINGS", icon: ProfileIcon, href: "/profile/account-settings" },
  { label: "TERMS AND CONDITIONS", icon: MenuBookIcon, href: siteLinks.terms },
  { label: "FAQS", icon: ForumIcon, href: siteLinks.faq },
  { label: "PRIVACY POLICY", icon: LockIcon, href: siteLinks.privacy },
];

const SETTING_ROW =
  "flex w-full items-center gap-3 px-4.5 py-4 text-left transition-colors duration-150 hover:bg-foreground/4";

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
      <ul className="border-b border-line">
        {SETTINGS.map(({ label, icon: Icon, href }) => {
          const content = (
            <>
              <span className="grid size-9 place-items-center border border-cyan/45 bg-cyan/10 text-cyan">
                <Icon size={20} />
              </span>
              <span className="flex-1 font-display text-compact font-black tracking-wide">
                {label}
              </span>
              <ChevronRightIcon size={20} className="text-muted" />
            </>
          );
          return (
            <li key={label}>
              {href.startsWith("/") ? (
                <Link href={href} className={SETTING_ROW}>
                  {content}
                </Link>
              ) : (
                // The website's pages open in a new tab, so the app stays where it was.
                <a href={href} target="_blank" rel="noopener noreferrer" className={SETTING_ROW}>
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>
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
export function Choice({
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

/** A square portrait; the chosen one gets a lime edge, glow and seal. */
export function AvatarTile({
  label,
  src,
  selected,
  onClick,
}: {
  label: string;
  src: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onClick}
      className={`relative aspect-square w-full bg-surface transition-[transform,border-color,background-color,box-shadow] duration-150 hover:-translate-y-px active:translate-y-0 motion-reduce:transform-none ${selected ? "border-2 border-lime" : "border border-line-subtle hover:border-line-strong"}`}
      style={{
        boxShadow: selected
          ? `0 0 14px -2px ${withAlpha(accentVar("lime"), 0.18)}`
          : undefined,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes="142px"
        className="object-cover object-top"
      />
      {selected ? (
        <span
          aria-hidden
          className="absolute top-0 left-0 grid size-6.5 place-items-center bg-lime text-inverse"
        >
          <CheckIcon size={17} />
        </span>
      ) : null}
    </button>
  );
}

export function AvatarSheet({
  current,
  onClose,
}: {
  current: string | null;
  onClose: () => void;
}) {
  const assets = useUserAssets();
  const free = useFreeProfilePics();
  return (
    <LookSheet
      kind="avatar"
      current={current}
      choices={
        assets.data && free.data ? avatarChoices(assets.data, free.data) : null
      }
      resources={[assets, free]}
      onSave={(ppId) => saveProfile({ ppId })}
      onClose={onClose}
    />
  );
}

export function BannerSheet({
  current,
  onClose,
}: {
  current: string | null;
  onClose: () => void;
}) {
  const assets = useUserAssets();
  const free = useFreeProfileBanners();
  return (
    <LookSheet
      kind="banner"
      current={current}
      choices={
        assets.data && free.data ? bannerChoices(assets.data, free.data) : null
      }
      resources={[assets, free]}
      onSave={(pbId) => saveProfile({ pbId })}
      onClose={onClose}
    />
  );
}

const LOOKS = {
  avatar: { title: "CUSTOMISE PROFILE", noun: "avatars", action: "DONE", size: "full" },
  banner: { title: "BANNER", noun: "banners", action: "SAVE", size: "sheet" },
} as const;

/**
 * The owned and free items in one grid; the footer button equips the one
 * picked. Closing any other way keeps what was saved.
 */
function LookSheet({
  kind,
  current,
  choices,
  resources,
  onSave,
  onClose,
}: {
  kind: keyof typeof LOOKS;
  /** The image on the profile now, to tick its item. */
  current: string | null;
  /** `null` until both lists load. */
  choices: LookChoice[] | null;
  resources: { status: "loading" | "ready" | "error"; reload: () => void }[];
  /** Resolves to the message to show, or `null` once saved. */
  onSave: (id: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const look = LOOKS[kind];
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const currentId = choices?.find((c) => c.src === current)?.id ?? null;
  // The avatar picker always shows a face, so an unknown one starts on the first.
  const selected =
    draft ?? currentId ?? (kind === "avatar" ? (choices?.[0]?.id ?? null) : null);

  async function save() {
    if (!selected) return;
    if (selected === currentId) return onClose();
    setSaving(true);
    setFailure(null);
    const message = await onSave(selected);
    setSaving(false);
    if (message) setFailure(message);
    else onClose();
  }

  return (
    <Overlay
      title={look.title}
      size={look.size}
      onClose={onClose}
      footer={
        choices?.length ? (
          <>
            {failure ? (
              <p role="alert" className="mb-3 font-sans text-xs text-danger">
                {failure}
              </p>
            ) : null}
            <Button
              fullWidth
              pending={saving}
              disabled={kind === "banner" ? !draft || draft === currentId : !selected}
              onClick={() => void save()}
            >
              {look.action}
            </Button>
          </>
        ) : undefined
      }
    >
      {choices?.length && kind === "avatar" ? (
        <div className="flex flex-col items-center px-5 pt-5 pb-6">
          <div className="relative size-27.5 border-2 border-cyan bg-surface-elevated">
            <Image
              src={choices.find((c) => c.id === selected)?.src ?? choices[0].src}
              alt=""
              fill
              unoptimized
              sizes="110px"
              className="object-cover object-top"
            />
          </div>
          <div className="mt-5 h-px w-full bg-line-muted" />
          <div
            role="radiogroup"
            aria-label="Avatar"
            className="mt-5 grid w-full max-w-115 grid-cols-3 gap-4"
          >
            {choices.map((c) => (
              <AvatarTile
                key={c.id}
                label={c.label}
                src={c.src}
                selected={selected === c.id}
                onClick={() => setDraft(c.id)}
              />
            ))}
          </div>
        </div>
      ) : choices?.length ? (
        <ul className="grid gap-2.5 px-4.5 py-4">
          {choices.map((c) => (
            <li key={c.id}>
              <Choice
                label={`${c.label} banner`}
                selected={selected === c.id}
                onClick={() => setDraft(c.id)}
                className="block aspect-4/1 w-full"
              >
                <Image
                  src={c.src}
                  alt=""
                  fill
                  unoptimized
                  sizes="500px"
                  className="object-cover"
                />
              </Choice>
            </li>
          ))}
        </ul>
      ) : resources.some((r) => r.status === "error") ? (
        <div className="grid justify-items-center gap-3 px-4.5 py-10 text-center">
          <p className="font-sans text-sm text-muted">
            Couldn&apos;t load the {look.noun}.
          </p>
          <Button
            variant="tonal"
            size="sm"
            onClick={() => resources.forEach((r) => r.reload())}
          >
            TRY AGAIN
          </Button>
        </div>
      ) : choices ? (
        <p className="px-4.5 py-10 text-center font-sans text-sm text-muted">
          No {look.noun} to choose yet.
        </p>
      ) : (
        <div
          role="status"
          aria-label={`Loading ${look.noun}`}
          className="m-4 h-40 animate-pulse bg-surface-elevated/50"
        />
      )}
    </Overlay>
  );
}
