"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, type ReactNode } from "react";

import { IMAGES } from "@/config/images";
import { ArrowLeftIcon, ArrowRightIcon } from "@/lib/icons";

import styles from "../css/onboarding.module.css";

/** Behind the welcome splash and every setup step. */
export function ArenaBackdrop() {
  return (
    <div aria-hidden className={styles.backdrop}>
      <div className={styles.photo}>
        <Image
          src={IMAGES.backgrounds.predictions.penalty_arena}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className={styles.scrim} />
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
    </div>
  );
}

/** The splash moves on by itself after this long, or this long with reduced motion. */
const SPLASH_MS = 3000;
const SPLASH_REDUCED_MS = 600;

/**
 * The logo spins in under WELCOME TO STATOZ, then hands over to setup. A tap,
 * a click or any key skips it.
 */
export function WelcomeSplash({ onDone }: { onDone: () => void }) {
  const done = useEffectEvent(onDone);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => done(),
      reduced ? SPLASH_REDUCED_MS : SPLASH_MS,
    );
    const skip = () => done();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className={`${styles.logoPop} relative size-30 sm:size-37.5`}>
        <span aria-hidden className={styles.bloom} />
        <div className={`${styles.logoSpin} relative size-full`}>
          <Image
            src={IMAGES.icons.appLogo}
            alt="StatOz"
            fill
            priority
            sizes="150px"
            className="object-contain"
          />
        </div>
      </div>
      <p
        className={`${styles.welcome} mt-7 font-display text-sm font-extrabold leading-compact tracking-max text-muted`}
      >
        WELCOME TO
      </p>
      <h1
        className={`${styles.statoz} mt-3 font-display text-celebration font-black leading-compact tracking-display text-cyan`}
      >
        STATOZ
      </h1>
    </div>
  );
}

/** PROFILE SETUP, with SKIP on the right when the step allows it. */
export function SetupTopBar({
  skipLabel,
  onSkip,
}: {
  skipLabel: string | null;
  onSkip: () => void;
}) {
  return (
    <header className="relative flex h-15 shrink-0 items-center gap-3 border-b-[1.4px] border-cyan bg-surface-elevated/55 pr-2.5 pl-4.5">
      <span aria-hidden className="h-5.5 w-1 shrink-0 bg-cyan" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-md font-black leading-tight tracking-ultra text-foreground">
          PROFILE SETUP
        </p>
        <p className="font-display text-2xs font-extrabold leading-compact tracking-mega text-cyan/70">
          SYS://OPERATIVE-INIT
        </p>
      </div>
      {skipLabel ? (
        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 px-3 py-2 font-display text-xs font-extrabold tracking-mega text-cyan transition-opacity duration-150 hover:opacity-75"
        >
          {skipLabel}
        </button>
      ) : null}
    </header>
  );
}

/** The width the step body and the dock share. */
export const SETUP_WIDTH = "mx-auto w-full max-w-130 px-6 lg:max-w-224";

/** A step's title and subtitle, above its content. */
export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: ReactNode;
}) {
  return (
    <>
      <h1 className="font-display text-title font-black leading-tight tracking-ultra text-foreground">
        {title}
      </h1>
      <p className="mt-1.5 font-grotesk text-sm leading-body text-muted">
        {subtitle}
      </p>
    </>
  );
}

/** The step meter, PREVIOUS / NEXT, and the line under them. */
export function SetupDock({
  step,
  steps,
  helper,
  last,
  nextDisabled,
  saving,
  onPrevious,
  onNext,
}: {
  step: number;
  steps: number;
  helper: string;
  last: boolean;
  nextDisabled: boolean;
  saving: boolean;
  onPrevious: (() => void) | null;
  onNext: () => void;
}) {
  return (
    <footer className={`${SETUP_WIDTH} relative shrink-0 pt-4 pb-5.5`}>
      <div aria-hidden className="flex gap-2">
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            className={`${styles.segment} ${i === step ? styles.current : ""} h-2 flex-1`}
            style={{
              background:
                i < step
                  ? "var(--ds-gradient-step-passed)"
                  : i === step
                    ? "var(--ds-gradient-step-current)"
                    : "var(--ds-color-border-default)",
            }}
          />
        ))}
      </div>
      <div className="mt-3.5 flex gap-3.5">
        {onPrevious ? (
          <button
            type="button"
            disabled={saving}
            onClick={onPrevious}
            className={`${styles.button} ${styles.previous} min-w-0 flex-1`}
          >
            <span
              className={`${styles.previousFill} flex size-full items-center justify-center gap-3 px-5 font-grotesk text-question font-semibold text-foreground`}
            >
              <ArrowLeftIcon size={20} className="shrink-0" />
              PREVIOUS
            </span>
          </button>
        ) : null}
        <div className={`${styles.nextGlow} min-w-0 flex-1`}>
          <button
            type="button"
            disabled={nextDisabled || saving}
            aria-busy={saving}
            onClick={onNext}
            className={`${styles.button} flex w-full items-center justify-center gap-3 bg-cyan px-5 font-grotesk text-question font-semibold text-inverse`}
          >
            {saving ? "SAVING…" : last ? "FINISH SETUP" : "NEXT"}
            {!saving && !last ? (
              <ArrowRightIcon size={20} className="shrink-0" />
            ) : null}
          </button>
        </div>
      </div>
      <p className="mt-3 text-center font-grotesk text-sm text-muted">
        {helper}
      </p>
    </footer>
  );
}
