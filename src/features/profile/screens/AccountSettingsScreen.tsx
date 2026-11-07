"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type ComponentType, type ReactNode } from "react";

import type { AuthUser } from "@/core";
import { useDeleteAccount } from "@/features/auth";
import { track } from "@/lib/analytics";
import { Button } from "@/lib/components/button";
import { DeleteIcon, EditIcon, MailIcon, ProfileIcon, type IconProps } from "@/lib/icons";
import { BackButton } from "@/lib/screens/howToPlay/back-button";

import { Overlay } from "../components/overlay";
import { saveProfile, useProfileUser } from "../data/profile.data";
import { NAME_LIMIT } from "../widgets/setupSteps.widget";

const DANGER = "var(--ds-color-danger)";

/** `/profile/account-settings`: the player's name and email, and account deletion. */
export function AccountSettingsScreen() {
  const router = useRouter();
  const { signedIn, user } = useProfileUser();
  const deletion = useDeleteAccount();

  useEffect(() => {
    // After a deletion the hook opens the login screen itself.
    if (signedIn === false && !deletion.pending) {
      router.replace("/auth?returnTo=%2Fprofile%2Faccount-settings");
    }
  }, [signedIn, deletion.pending, router]);

  return (
    <div className="w-full">
      <header className="mx-auto flex min-h-14 w-full max-w-180 items-center gap-1 pt-2 pr-4 pl-2 lg:pt-3.5">
        <BackButton fallback="/profile" />
        <h1 className="truncate font-display text-xl font-black leading-compact tracking-label text-cyan">
          ACCOUNT SETTINGS
        </h1>
      </header>
      <main className="mx-auto flex w-full max-w-180 flex-col gap-4 px-4 pt-2 pb-8">
        {user.data ? (
          <>
            <NameCard user={user.data} />
            <Card icon={MailIcon} label="EMAIL">
              <p className="truncate font-grotesk text-lg font-bold">{user.data.email}</p>
            </Card>
            <DangerZone deletion={deletion} />
          </>
        ) : user.status === "error" ? (
          <div className="flex flex-col items-start gap-3 border border-line bg-surface/50 p-4">
            <p className="font-grotesk text-sm text-muted">Couldn&apos;t load your account.</p>
            <Button variant="tonal" size="sm" onClick={user.reload}>
              TRY AGAIN
            </Button>
          </div>
        ) : (
          <div role="status" aria-label="Loading your account" className="h-60 animate-pulse bg-surface-elevated/50" />
        )}
      </main>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  action,
  children,
}: {
  icon: ComponentType<IconProps>;
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border border-line bg-surface/50 p-4">
      <div className="flex min-h-9 items-center gap-2.5">
        <Icon size={20} className="shrink-0 text-cyan" />
        <h2 className="flex-1 font-grotesk text-sm font-semibold tracking-wide text-muted">{label}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The name, with a pencil that turns it into a field; SAVE updates it everywhere. */
function NameCard({ user }: { user: AuthUser }) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const name = user.userName ?? "";
  const editing = draft !== null;
  const trimmed = draft?.trim() ?? "";

  const cancel = () => {
    setDraft(null);
    setFailure(null);
  };

  async function save() {
    if (!trimmed || saving) return;
    if (trimmed === name) return cancel();
    setSaving(true);
    setFailure(null);
    const failed = await saveProfile({ username: trimmed });
    setSaving(false);
    if (failed) setFailure(failed);
    else {
      track("web_username_changed");
      setDraft(null);
    }
  }

  return (
    <Card
      icon={ProfileIcon}
      label="USERNAME"
      action={
        editing ? null : (
          <button
            type="button"
            aria-label="Edit username"
            onClick={() => setDraft(name)}
            className="grid size-9 place-items-center text-cyan transition-colors duration-150 hover:bg-cyan/10"
          >
            <EditIcon size={20} />
          </button>
        )
      }
    >
      {editing ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <label htmlFor={id} className="sr-only">
            Username
          </label>
          <input
            id={id}
            value={draft}
            maxLength={NAME_LIMIT}
            autoComplete="nickname"
            autoFocus
            disabled={saving}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
            }}
            className="h-11 w-full border border-cyan/45 bg-background px-3 font-grotesk text-lg font-bold text-foreground outline-none focus:border-cyan"
          />
          {failure ? (
            <p role="alert" className="font-grotesk text-xs font-bold text-danger">
              {failure}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="surface" size="md" fullWidth disabled={saving} onClick={cancel}>
              CANCEL
            </Button>
            <Button type="submit" size="md" fullWidth pending={saving} disabled={!trimmed}>
              SAVE
            </Button>
          </div>
        </form>
      ) : (
        <p className="truncate font-grotesk text-lg font-bold">{name || "—"}</p>
      )}
    </Card>
  );
}

function DangerZone({ deletion }: { deletion: ReturnType<typeof useDeleteAccount> }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <section className="flex flex-col gap-3 border border-danger/55 bg-surface/50 p-4">
      <h2 className="flex items-center gap-2.5 font-grotesk text-md font-bold tracking-wide text-danger">
        <DeleteIcon size={20} className="shrink-0" />
        DANGER ZONE
      </h2>
      <p className="font-grotesk text-sm text-muted">
        Once you delete your account, there is no going back. All your data will be permanently
        deleted.
      </p>
      <Button
        variant="tonal"
        size="lg"
        accent={DANGER}
        fullWidth
        leadingIcon={<DeleteIcon size={20} />}
        onClick={() => setConfirming(true)}
        className="mt-1"
      >
        DELETE ACCOUNT
      </Button>
      {confirming ? (
        <Overlay
          title="DELETE ACCOUNT?"
          icon={DeleteIcon}
          accent={DANGER}
          size="dialog"
          onClose={() => {
            if (!deletion.pending) setConfirming(false);
          }}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button variant="surface" disabled={deletion.pending} onClick={() => setConfirming(false)}>
                CANCEL
              </Button>
              <Button
                variant="tonal"
                accent={DANGER}
                pending={deletion.pending}
                onClick={() => void deletion.deleteAccount()}
              >
                DELETE
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 px-4.5 py-4">
            <p className="font-sans text-sm text-muted">
              Your account will be deleted and you&apos;ll be signed out on every device. Signing
              in again with the same email starts a brand-new account; your coins, XP and
              purchases won&apos;t come back.
            </p>
            {deletion.error ? (
              <p role="alert" className="font-grotesk text-xs font-bold text-danger">
                {deletion.error}
              </p>
            ) : null}
          </div>
        </Overlay>
      ) : null}
    </section>
  );
}
