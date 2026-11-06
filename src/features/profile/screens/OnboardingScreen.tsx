"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthUser, UpdateUserBody } from "@/core";
import { useAuthSession, useCurrentUser } from "@/features/auth";

import styles from "../css/onboarding.module.css";
import { saveProfile } from "../data/profile.data";
import {
  ArenaBackdrop,
  SETUP_WIDTH,
  SetupDock,
  SetupTopBar,
  WelcomeSplash,
} from "../widgets/setupFrame.widget";
import {
  AvatarStep,
  BannerStep,
  ClubsStep,
  NameStep,
} from "../widgets/setupSteps.widget";
import { CoinReward } from "../widgets/coinReward.widget";
import { LaunchCountdown } from "../widgets/launchCountdown.widget";

const HELPERS = [
  "STEP 1 OF 4 // IDENTIFY YOUR OPERATIVE",
  "STEP 2 OF 4 // PICK YOUR FACE",
  "STEP 3 OF 4 // SET YOUR COLOURS",
  "STEP 4 OF 4 // PICK SPORTS, LEAGUES, AND CLUBS IN ONE PLACE",
];
const LAST = HELPERS.length - 1;
/** Every new wallet opens with this; the reward screen only shows it. */
const WELCOME_BONUS = 1000;

/** Only paths on this site, so `returnTo` cannot send the player elsewhere. */
function returnPath(returnTo: string | null): string {
  return returnTo?.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.startsWith("/onboarding")
    ? returnTo
    : "/";
}

/**
 * A new account's profile setup: the welcome splash, then name, avatar,
 * banner and clubs. Each step saves when its NEXT is pressed; the clubs save
 * on FINISH SETUP. The launch countdown and the welcome bonus follow, then it
 * ends where the player was heading (`?returnTo`).
 */
export function OnboardingScreen() {
  const router = useRouter();
  const returnTo = returnPath(useSearchParams().get("returnTo"));
  const { status } = useAuthSession();
  const user = useCurrentUser();

  const [phase, setPhase] = useState<"setup" | "launch" | "reward">("setup");
  const [splash, setSplash] = useState(true);
  const [step, setStep] = useState(0);
  // `null` until edited: a Google account arrives with its name filled in.
  const [name, setName] = useState<string | null>(null);
  const [pic, setPic] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [picks, setPicks] = useState<AuthUser["clubAndTeams"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Setup is for a signed-in account only.
  useEffect(() => {
    if (status === "guest") router.replace("/auth");
  }, [status, router]);

  const typedName = name ?? user?.userName ?? "";
  const clubs = picks ?? user?.clubAndTeams ?? [];

  const go = (next: number) => {
    setFailure(null);
    setStep(next);
  };
  const leave = () => router.replace(returnTo);
  const launch = () => setPhase("launch");

  async function next() {
    const body: UpdateUserBody | null =
      step === 0
        ? { username: typedName.trim() }
        : step === 1
          ? pic ? { ppId: pic } : null
          : step === 2
            ? banner ? { pbId: banner } : null
            : { clubAndTeams: clubs };
    if (body) {
      setSaving(true);
      setFailure(null);
      const failed = await saveProfile(body);
      setSaving(false);
      if (failed) return setFailure(failed);
    }
    if (step === LAST) launch();
    else go(step + 1);
  }

  if (phase === "reward") {
    return (
      <CoinReward
        amount={WELCOME_BONUS}
        balance={user?.coins ?? WELCOME_BONUS}
        onComplete={leave}
      />
    );
  }

  return (
    <div className="relative min-h-dvh text-foreground">
      <ArenaBackdrop />
      {phase === "launch" ? (
        <LaunchCountdown onEnter={() => setPhase("reward")} />
      ) : splash ? (
        <WelcomeSplash onDone={() => setSplash(false)} />
      ) : (
        <div className="relative flex h-dvh flex-col">
          <SetupTopBar
            // No skipping the name; the last step's skip leaves setup.
            skipLabel={step === 0 ? null : step === LAST ? "DECIDE LATER" : "SKIP"}
            onSkip={() => (step === LAST ? launch() : go(step + 1))}
          />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <div
              key={step}
              className={`${styles.enter} ${SETUP_WIDTH} pt-3 pb-2 lg:flex lg:min-h-full lg:flex-col lg:justify-center`}
            >
              {step === 0 ? (
                <NameStep
                  name={typedName}
                  onName={setName}
                  onSubmit={() => {
                    if (typedName.trim() && !saving) void next();
                  }}
                />
              ) : step === 1 ? (
                <AvatarStep chosen={pic} onChoose={setPic} />
              ) : step === 2 ? (
                <BannerStep chosen={banner} onChoose={setBanner} />
              ) : (
                <ClubsStep picks={clubs} onPicks={setPicks} />
              )}
              {failure ? (
                <p
                  role="alert"
                  className="mt-3 font-grotesk text-sm text-danger"
                >
                  {failure}
                </p>
              ) : null}
            </div>
          </main>
          <SetupDock
            step={step}
            steps={HELPERS.length}
            helper={HELPERS[step]}
            last={step === LAST}
            nextDisabled={step === 0 && !typedName.trim()}
            saving={saving}
            onPrevious={step === 0 ? null : () => go(step - 1)}
            onNext={() => void next()}
          />
        </div>
      )}
    </div>
  );
}
