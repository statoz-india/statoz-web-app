"use client";

import { accentVar } from "@/styles/colors";

import { AuthHero } from "../components/auth-hero";
import { AuthPanel, type AuthPanelProps } from "../components/auth-panel";
import { authHeroMedia } from "../constants";
import { useEmailOtpLogin, useGoogleLogin } from "../data/authData";

export type AuthScreenProps = Partial<Omit<AuthPanelProps, "className">>;

/**
 * The sign-up / log-in screen: the hero on top on phones (5:4), and a
 * full-height split from `lg`. The email code or Google signs in, or creates
 * the account, then returns to `?returnTo`.
 */
export function AuthScreen({
  onEmailSubmit,
  onOtpSubmit,
  onGoogle,
  ...panel
}: AuthScreenProps) {
  const login = useEmailOtpLogin();
  const google = useGoogleLogin();
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[1.05fr_minmax(26rem,0.95fr)]">
      <AuthHero
        media={authHeroMedia}
        className="aspect-5/4 shrink-0 lg:aspect-auto lg:min-h-dvh"
      />

      <div
        className="flex flex-1 flex-col justify-center border-t bg-surface lg:border-l lg:border-t-0"
        style={{
          borderColor: `color-mix(in srgb, ${accentVar("cyan")} 22%, transparent)`,
        }}
      >
        <AuthPanel
          // One error at a time: starting either way clears the other's.
          error={google.error ?? login.error}
          emailPending={login.emailPending}
          otpPending={login.otpPending}
          googlePending={google.pending}
          {...panel}
          onEmailSubmit={
            onEmailSubmit ??
            ((email) => {
              google.clearError();
              return login.sendCode(email);
            })
          }
          onOtpSubmit={
            onOtpSubmit ??
            ((email, otp) => {
              google.clearError();
              return login.verifyCode(email, otp);
            })
          }
          onGoogle={
            onGoogle ??
            (() => {
              login.clearError();
              return google.signIn();
            })
          }
          className="mx-auto w-full max-w-md"
        />
      </div>
    </div>
  );
}
