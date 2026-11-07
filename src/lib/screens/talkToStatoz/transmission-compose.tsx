"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { getSignedIn, submitContactUs } from "@/core";
import { track } from "@/lib/analytics";
import { Button } from "@/lib/components/button";
import { CheckIcon, SendIcon } from "@/lib/icons";

import { AccentPanel, HowToPlayPage, IconTile } from "../howToPlay/parts";
import { supportChannelFor, type SupportChannel } from "./channels";
import styles from "./css/talk-to-statoz.module.css";

const SUMMARY_MAX = 200;
const DETAILS_MAX = 5000;
const SENT_MS = 2200;
const HUB = "/profile/talk-to-statoz";

/** `/profile/talk-to-statoz/<id>`: a summary, the details, and TRANSMIT. */
export function TransmissionCompose({ channelId }: { channelId: string }) {
  // Looked up here: the channel holds an icon component, which can't be
  // passed from the server page.
  const channel = supportChannelFor(channelId) as SupportChannel;
  const router = useRouter();
  const pathname = usePathname();
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  // Errors show from the first empty TRANSMIT on, then update live.
  const [submittedEmpty, setSubmittedEmpty] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const toLogin = () =>
    router.push(`/auth?returnTo=${encodeURIComponent(pathname)}`);

  async function transmit() {
    if (summary.trim() === "" || details.trim() === "") {
      setSubmittedEmpty(true);
      return;
    }
    if (pending || sent) return;
    // A known guest goes straight to login; the API would only answer 401.
    if (getSignedIn() === false) return toLogin();

    setPending(true);
    setFailure(null);
    try {
      const result = await submitContactUs({
        contactIssue: channel.issue,
        summary: summary.trim(),
        details: details.trim(),
      });
      if (result.success) {
        track("web_support_message_sent", { channel: channel.id });
        return setSent(true);
      }
      if (result.statusCode === 401) return toLogin();
      const reason =
        result.statusCode === 429
          ? "Too many messages. Please try again in a few minutes."
          : "errors" in result && result.errors?.length
            ? result.errors.map(String).join(". ")
            : "Signal lost. Try again in a moment.";
      track("web_support_message_failed", { channel: channel.id, reason });
      setFailure(reason);
    } catch {
      const reason = "Signal lost. Try again in a moment.";
      track("web_support_message_failed", { channel: channel.id, reason });
      setFailure(reason);
    } finally {
      setPending(false);
    }
  }

  return (
    <HowToPlayPage
      title={channel.title.toUpperCase()}
      subtitle={channel.composeSubtitle}
      accent={channel.accent}
      back={HUB}
      fill
    >
      <form
        noValidate
        // Nothing can be edited or sent twice while the send-off plays.
        inert={sent}
        onSubmit={(event) => {
          event.preventDefault();
          void transmit();
        }}
        className="flex flex-1 flex-col gap-4.5 lg:mx-auto lg:w-full lg:max-w-176 lg:flex-none"
      >
        <AccentPanel accent={channel.accent} className="flex items-start gap-3.5 p-4">
          <IconTile icon={channel.icon} accent={channel.accent} size={48} />
          <div>
            <h3 className="font-display text-base font-black tracking-tight">
              {channel.title.toUpperCase()}
            </h3>
            <p className="mt-1.75 font-sans text-sm leading-body text-subtle">
              {channel.composeHint}
            </p>
          </div>
        </AccentPanel>

        <TransmissionField
          label="Summary"
          hint={channel.summaryHint}
          value={summary}
          onValue={setSummary}
          maxLength={SUMMARY_MAX}
          error={
            submittedEmpty && summary.trim() === ""
              ? "Add a one-line summary."
              : null
          }
        />
        <TransmissionField
          label="Details"
          hint={channel.detailsHint}
          value={details}
          onValue={setDetails}
          maxLength={DETAILS_MAX}
          rows={6}
          error={
            submittedEmpty && details.trim() === ""
              ? "Tell us the rest — we need the details."
              : null
          }
        />

        {/* Docked at the bottom on phones, within thumb reach. */}
        <div className="mt-auto lg:mt-0">
          {failure ? (
            <p role="alert" className="mb-2.5 font-sans text-xs text-danger">
              {failure}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            fullWidth
            accent={channel.accent}
            pending={pending}
            trailingIcon={<SendIcon size={20} />}
          >
            {pending ? "TRANSMITTING…" : "TRANSMIT"}
          </Button>
        </div>
      </form>

      {sent ? (
        <TransmissionSent
          accent={channel.accent}
          channelTitle={channel.title}
          onDone={() => router.push(HUB)}
        />
      ) : null}
    </HowToPlayPage>
  );
}

function TransmissionField({
  label,
  hint,
  value,
  onValue,
  maxLength,
  rows,
  error,
}: {
  label: string;
  hint: string;
  value: string;
  onValue: (value: string) => void;
  maxLength: number;
  rows?: number;
  error: string | null;
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const shared = {
    id,
    value,
    placeholder: hint,
    maxLength,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? messageId : undefined,
    className: styles.field,
    onChange: (event: { target: { value: string } }) =>
      onValue(event.target.value),
  };
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-display text-2xs font-bold tracking-ultra text-muted"
      >
        {label.toUpperCase()}
      </label>
      {rows ? <textarea {...shared} rows={rows} /> : <input {...shared} type="text" />}
      {error ? (
        <p id={messageId} role="alert" className="font-sans text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TransmissionSent({
  accent,
  channelTitle,
  onDone,
}: {
  accent: string;
  channelTitle: string;
  onDone: () => void;
}) {
  // Kept in a ref, so a re-render can't restart the timer.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const timer = window.setTimeout(() => done.current(), SENT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={styles.scrim}
      style={{ "--channel-accent": accent } as CSSProperties}
    >
      <div className={styles.stack}>
        <span className={styles.badge}>
          <span aria-hidden className={styles.flash} />
          <span className={styles.seal}>
            <CheckIcon size={36} />
          </span>
        </span>
        <div className={styles.text}>
          <p
            className="font-display text-badge font-black tracking-label"
            style={{ color: accent }}
          >
            TRANSMISSION SENT
          </p>
          <p className="mt-1.5 font-display text-xs font-black tracking-mega text-muted">
            {channelTitle.toUpperCase()}
          </p>
          <p className="mt-2 font-sans text-sm text-subtle">
            Signal locked. We&apos;ll take it from here.
          </p>
        </div>
      </div>
    </div>
  );
}
