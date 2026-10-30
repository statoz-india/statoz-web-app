"use client";

import Link from "next/link";
import { useState } from "react";

import { ChevronRightIcon, GoogleMark } from "@/lib/icons";

import { Button } from "@/lib/components/button";
import { InputField } from "@/lib/components/input-fields";
import { Divider } from "@/lib/components/divider";

export type AuthPanelProps = {
  /** Sends the code. The code field appears once this resolves; a throw keeps it hidden. */
  onEmailSubmit: (email: string) => void | Promise<void>;
  /** Checks the 6-digit code sent to `email`. */
  onOtpSubmit: (email: string, otp: string) => void | Promise<void>;
  onGoogle: () => void | Promise<void>;
  /** A server- or provider-side error to show under the field in use. */
  error?: string;
  emailPending?: boolean;
  otpPending?: boolean;
  googlePending?: boolean;
  className?: string;
};

/** Lenient on purpose: something@domain.tld, with a TLD of 2 or more. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_LENGTH = 6;
const OTP = new RegExp(`^\\d{${OTP_LENGTH}}$`);

/**
 * The sign-up / log-in form. UI only: the callbacks carry whatever the auth
 * provider needs. The email goes first; once the code is sent, a 6-digit
 * code field appears under it.
 *
 * Google sits above the terms line and the submit button last, under it, so
 * pressing SIGN UP / LOG IN reads as agreeing to the terms.
 */
export function AuthPanel({
  onEmailSubmit,
  onOtpSubmit,
  onGoogle,
  error,
  emailPending,
  otpPending,
  googlePending,
  className,
}: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  async function submitEmail() {
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setLocalError("Enter a valid email address");
      return;
    }
    setLocalError(null);
    try {
      await onEmailSubmit(value);
      setCodeSentTo(value);
    } catch {
      // The caller shows why through `error`; the code field stays hidden.
    }
  }

  function submitOtp(sentTo: string) {
    if (!OTP.test(otp)) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setOtpError(null);
    void onOtpSubmit(sentTo, otp);
  }

  return (
    <div
      className={["flex flex-col gap-6 px-5 pb-9 pt-7", className]
        .filter(Boolean)
        .join(" ")}
    >
      <h1 className="font-display text-3xl font-black leading-tight tracking-tight">
        LET&apos;S GET STARTED
      </h1>

      {/* `noValidate`: the field's own error line replaces the browser's bubbles. */}
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (codeSentTo) submitOtp(codeSentTo);
          else void submitEmail();
        }}
      >
        <InputField
          label="Enter Your Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="champion@arena.com"
          hint="Enter a valid email address"
          error={localError ?? (codeSentTo ? undefined : error)}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setLocalError(null);
            // The code is tied to the address it was sent to.
            setCodeSentTo(null);
            setOtp("");
            setOtpError(null);
          }}
          required
        />

        {codeSentTo && (
          <InputField
            label="Enter the 6-digit code"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            placeholder="000000"
            hint={`Sent to ${codeSentTo}`}
            error={otpError ?? error}
            value={otp}
            onChange={(event) => {
              setOtp(
                event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH),
              );
              setOtpError(null);
            }}
            autoFocus
            required
          />
        )}

        <Divider label="OR" />

        <Button
          variant="surface"
          size="lg"
          fullWidth
          onClick={() => void onGoogle()}
          pending={googlePending}
          leadingIcon={<GoogleMark size={20} />}
        >
          SIGN IN WITH GOOGLE
        </Button>

        <p className="text-xs leading-relaxed text-muted">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-subtle underline underline-offset-2"
          >
            Terms of Service
          </Link>{" "}
          &amp;{" "}
          <Link
            href="/privacy"
            className="text-subtle underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>

        <Button
          type="submit"
          variant="tonal"
          size="lg"
          fullWidth
          pending={codeSentTo ? otpPending : emailPending}
          trailingIcon={<ChevronRightIcon size={18} />}
        >
          SIGN UP / LOG IN
        </Button>
      </form>
    </div>
  );
}
