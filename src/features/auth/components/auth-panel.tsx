"use client";

import Link from "next/link";
import { useState } from "react";

import { ChevronRightIcon, GoogleMark } from "@/lib/icons";

import { Button } from "@/lib/components/button";
import { InputField } from "@/lib/components/input-fields";
import { Divider } from "@/lib/components/divider";

export type AuthPanelProps = {
  onEmailSubmit: (email: string) => void | Promise<void>;
  onGoogle: () => void | Promise<void>;
  /** A server- or provider-side error to show under the field. */
  error?: string;
  emailPending?: boolean;
  googlePending?: boolean;
  className?: string;
};

/** Lenient on purpose: something@domain.tld, with a TLD of 2 or more. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The sign-up / log-in form. UI only: the callbacks carry whatever the auth
 * provider needs.
 *
 * Google sits above the terms line and the submit button last, under it, so
 * pressing SIGN UP / LOG IN reads as agreeing to the terms.
 */
export function AuthPanel({
  onEmailSubmit,
  onGoogle,
  error,
  emailPending,
  googlePending,
  className,
}: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

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
          const value = email.trim();
          if (!EMAIL.test(value)) {
            setLocalError("Enter a valid email address");
            return;
          }
          setLocalError(null);
          void onEmailSubmit(value);
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
          error={localError ?? error}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setLocalError(null);
          }}
          required
        />

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
          pending={emailPending}
          trailingIcon={<ChevronRightIcon size={18} />}
        >
          SIGN UP / LOG IN
        </Button>
      </form>
    </div>
  );
}
