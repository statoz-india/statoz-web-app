"use client";

import { useEffect, useId, useRef } from "react";

import { useScrollLock } from "@/hooks/useScrollLock";
import { Button } from "@/lib/components/button";
import { LockIcon } from "@/lib/icons";
import { HoloCard, holoLayer } from "@/lib/ui/holo-card";
import { accentVar } from "@/styles/colors";

export type AuthGateRequest = {
  /** Lower-case phrase completing "LOG IN TO …", e.g. "view your profile", "lock a pick", "play". */
  intent: string;
  /** Body text. Falls back to a generic line about unlocking the feature. */
  message?: string;
  /** Where to land after login. Not used by the UI itself. */
  returnTo?: string;
  /** Runs on NOT NOW, for a page that can't be shown without an account. */
  onCancel?: () => void;
};

export type AuthGateDialogProps = {
  request: AuthGateRequest;
  /** NOT NOW, Escape, or a press on the scrim. Pass a stable function. */
  onCancel: () => void;
  /** LOG IN. */
  onContinue: () => void;
};

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The modal a guest sees when they try something that needs an account.
 * Deciding when to open it, and where LOG IN leads, is the caller's job.
 */
export function AuthGateDialog({
  request,
  onCancel,
  onContinue,
}: AuthGateDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    // The first control is the close cross, so a stray Enter dismisses rather than navigates.
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  const title = holoLayer(36, 220);
  const note = holoLayer(18, 300);
  const actions = holoLayer(30, 380);
  return (
    <div
      ref={panelRef}
      // Opaque, so the gate looks the same over every page. It leaves the nav
      // uncovered: the bottom bar (5.25rem, `--platform-nav-height` in the app
      // layout) on phones, and the side rail of the centred shell from `lg`.
      className="fixed inset-x-0 top-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-100 bg-background lg:bottom-0 lg:left-[calc(max(0px,(100vw-80rem)/2)+14rem)]"
      role="presentation"
    >
      <HoloCard
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        icon={<LockIcon size={48} />}
        onClose={onCancel}
        className="flex size-full items-center justify-center px-4 py-12"
        // mousedown, so a text drag that starts in the card and ends beside it does not close it.
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onCancel();
        }}
      >
        <h2
          id={titleId}
          className={`${title.className} mt-4 font-display font-black leading-tight`}
          style={title.style}
        >
          <span className="mb-2 block text-2xs tracking-ultra text-cyan">
            {"// ACCOUNT REQUIRED"}
          </span>
          <span className="block text-xl tracking-wide text-foreground">
            LOG IN TO {request.intent.toUpperCase()}
          </span>
        </h2>
        <p
          id={descriptionId}
          className={`${note.className} mt-3 max-w-xs text-balance text-sm leading-relaxed text-muted`}
          style={note.style}
        >
          {request.message ??
            "Log in to unlock this feature and keep your StatOz progress."}
        </p>
        <div
          className={`${actions.className} mt-8 grid w-full grid-cols-2 gap-2`}
          style={actions.style}
        >
          <Button variant="surface" size="lg" onClick={onCancel}>
            NOT NOW
          </Button>
          <Button
            variant="tonal"
            size="lg"
            onClick={onContinue}
            accent={accentVar("cyan")}
          >
            LOG IN
          </Button>
        </div>
      </HoloCard>
    </div>
  );
}
