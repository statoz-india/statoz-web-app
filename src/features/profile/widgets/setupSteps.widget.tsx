"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";

import { sportModules, type Sport } from "@/config/sports";
import type { AuthUser, SignupTeam } from "@/core";
import { Button } from "@/lib/components/button";
import { accentVar, octagonClipPath } from "@/styles";

import { followableSports, toTeam } from "../adapters";
import { AvatarTile, Choice } from "../components/sheets";
import styles from "../css/onboarding.module.css";
import {
  useFreeProfileBanners,
  useFreeProfilePics,
  useSignupTournaments,
} from "../data/profile.data";
import { ClubTile, LeagueCard, SportButton } from "./clubs.widget";
import { StepHeading } from "./setupFrame.widget";

/** The longest name the field takes. */
export const NAME_LIMIT = 48;

/** Step 1. Enter submits, like NEXT. */
export function NameStep({
  name,
  onName,
  onSubmit,
}: {
  name: string;
  onName: (name: string) => void;
  onSubmit: () => void;
}) {
  const id = useId();
  return (
    <>
      <StepHeading
        title="ENTER YOUR NAME"
        subtitle="This is the name other operatives will see."
      />
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label
          htmlFor={id}
          className="mb-2 block font-grotesk text-md font-medium text-subtle"
        >
          ENTER YOUR NAME
        </label>
        <div className={styles.field}>
          <div className={styles.fieldFill}>
            <input
              id={id}
              value={name}
              maxLength={NAME_LIMIT}
              autoComplete="nickname"
              placeholder="Champion’s name"
              onChange={(event) => onName(event.target.value)}
              className="size-full bg-transparent px-4 font-grotesk text-md text-foreground outline-none placeholder:text-disabled"
            />
          </div>
        </div>
      </form>
    </>
  );
}

/** Step 2: the free profile pics. Tapping the chosen one again clears it. */
export function AvatarStep({
  chosen,
  onChoose,
}: {
  chosen: string | null;
  onChoose: (ppId: string | null) => void;
}) {
  const pics = useFreeProfilePics();
  return (
    <>
      <StepHeading
        title="CHOOSE YOUR AVATAR"
        subtitle="This is the face other operatives will see."
      />
      <div className="mt-4">
        <Loaded resource={pics} subject="avatars">
          {(list) => (
            <div
              role="radiogroup"
              aria-label="Avatar"
              className="grid w-full max-w-115 grid-cols-3 gap-4 lg:max-w-none lg:grid-cols-6"
            >
              {list.map((pic) => (
                <AvatarTile
                  key={pic.ppId}
                  label={pic.ppName}
                  src={pic.ppUrl}
                  selected={chosen === pic.ppId}
                  onClick={() =>
                    onChoose(chosen === pic.ppId ? null : pic.ppId)
                  }
                />
              ))}
            </div>
          )}
        </Loaded>
      </div>
    </>
  );
}

/** Step 3: the free profile banners. Tapping the chosen one again clears it. */
export function BannerStep({
  chosen,
  onChoose,
}: {
  chosen: string | null;
  onChoose: (pbId: string | null) => void;
}) {
  const banners = useFreeProfileBanners();
  return (
    <>
      <StepHeading
        title="CHOOSE YOUR BANNER"
        subtitle="This runs across the top of your profile."
      />
      <div className="mt-4">
        <Loaded resource={banners} subject="banners">
          {(list) => (
            <ul className="grid gap-2.5 lg:grid-cols-2">
              {list.map((banner) => (
                <li key={banner.pbId}>
                  <Choice
                    label={`${banner.pbName} banner`}
                    selected={chosen === banner.pbId}
                    onClick={() =>
                      onChoose(chosen === banner.pbId ? null : banner.pbId)
                    }
                    className="block aspect-4/1 w-full"
                  >
                    <Image
                      src={banner.pbUrl}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 448px, 520px"
                      className="object-cover"
                    />
                  </Choice>
                </li>
              ))}
            </ul>
          )}
        </Loaded>
      </div>
    </>
  );
}

type Picks = AuthUser["clubAndTeams"];

/**
 * Step 4: a sport, its leagues, and the clubs of the league on show. A league
 * is followed by its box; picking a club follows its league too.
 */
export function ClubsStep({
  picks,
  onPicks,
}: {
  picks: Picks;
  onPicks: (picks: Picks) => void;
}) {
  const tournaments = useSignupTournaments();
  const sports = followableSports(tournaments.data ?? []);
  const [sportId, setSportId] = useState<Sport | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);

  const current = sports.find((s) => s.sport === sportId) ?? sports[0];
  const league =
    current?.tournaments.find((t) => t._id === leagueId) ??
    current?.tournaments[0];
  const picked = (id: string) => picks.find((p) => p.tournament === id);

  const toggleLeague = (id: string) =>
    onPicks(
      picks.some((p) => p.tournament === id)
        ? picks.filter((p) => p.tournament !== id)
        : [...picks, { tournament: id, teams: [] }],
    );
  const toggleTeam = (id: string, team: string) =>
    onPicks(
      picks.some((p) => p.tournament === id)
        ? picks.map((p) =>
            p.tournament === id
              ? {
                  ...p,
                  teams: p.teams.includes(team)
                    ? p.teams.filter((t) => t !== team)
                    : [...p.teams, team],
                }
              : p,
          )
        : [...picks, { tournament: id, teams: [team] }],
    );

  // Each followed club counts, and so does a followed league with none picked.
  const followed = picks.reduce((n, p) => n + Math.max(p.teams.length, 1), 0);
  const subtitle =
    current?.sport === "racing"
      ? "Pick your Formula 1 constructor. No league selection needed."
      : followed
        ? `${followed} followed — tap any club to update your picks.`
        : "Pick a sport, choose leagues, or tap any club to follow it.";

  return (
    <>
      <StepHeading title="CHOOSE CLUBS" subtitle={subtitle} />
      <div className="mt-4">
        {current && league ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
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
              <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                {league.teams.map((team) => (
                  <li key={team._id}>
                    <ClubTile
                      team={toTeam(current.sport, team)}
                      badge={<SetupBadge team={team} sport={current.sport} />}
                      selected={!!picked(league._id)?.teams.includes(team._id)}
                      dim={!picked(league._id)}
                      onClick={() => toggleTeam(league._id, team._id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 font-grotesk text-sm leading-body text-muted">
                {league.tournamentName} fields individual athletes, so its
                line-up arrives with each tournament. Follow it now and pick a
                favourite later.
              </p>
            )}
          </>
        ) : (
          <Status
            status={tournaments.status}
            subject="clubs"
            onRetry={tournaments.reload}
          />
        )}
      </div>
    </>
  );
}

/**
 * The setup's 40px club badge: an octagon in the club's colour with a stripe
 * of its second colour along the bottom, sitting on a darker lip.
 */
function SetupBadge({ team, sport }: { team: SignupTeam; sport: Sport }) {
  const color = team.primaryColor ?? accentVar(sportModules[sport].accent);
  const stripe = team.secondaryColor ?? color;
  return (
    <span aria-hidden className="relative block size-10 shrink-0">
      <span
        className="absolute inset-x-0 top-1 h-9"
        style={{
          clipPath: octagonClipPath,
          background: `color-mix(in srgb, ${color} 42%, var(--ds-color-shade))`,
        }}
      />
      <span
        className="absolute inset-x-0 top-0 grid h-9 place-items-center font-display text-2xs font-bold leading-compact"
        style={{
          clipPath: octagonClipPath,
          background: `linear-gradient(to top, ${stripe} 0 11%, ${color} 11%)`,
          color: team.textColor ?? "var(--ds-color-text-default)",
        }}
      >
        {team.abbreviation}
      </span>
    </span>
  );
}

type ListResource<T> = {
  status: "loading" | "ready" | "error";
  data?: T[];
  reload: () => void;
};

/** A list once it's loaded; loading, failure and empty states otherwise. */
function Loaded<T>({
  resource,
  subject,
  children,
}: {
  resource: ListResource<T>;
  subject: string;
  children: (list: T[]) => ReactNode;
}) {
  if (resource.data?.length) return children(resource.data);
  return (
    <Status
      status={resource.data ? "ready" : resource.status}
      subject={subject}
      onRetry={resource.reload}
    />
  );
}

function Status({
  status,
  subject,
  onRetry,
}: {
  status: "loading" | "ready" | "error";
  subject: string;
  onRetry: () => void;
}) {
  if (status === "loading") {
    return (
      <div
        role="status"
        aria-label={`Loading ${subject}`}
        className="h-40 animate-pulse bg-surface-elevated/50"
      />
    );
  }
  if (status === "error") {
    return (
      <div className="grid justify-items-start gap-3 py-6">
        <p className="font-grotesk text-sm text-muted">
          Couldn&apos;t load the {subject}.
        </p>
        <Button variant="tonal" size="sm" onClick={onRetry}>
          TRY AGAIN
        </Button>
      </div>
    );
  }
  return (
    <p className="py-6 font-grotesk text-sm text-muted">
      No {subject} to choose from yet.
    </p>
  );
}
