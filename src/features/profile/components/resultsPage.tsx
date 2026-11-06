"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BackButton } from "@/lib/screens/howToPlay/back-button";

import { useProfileUser } from "../data/profile.data";
import { HistoryState } from "../widgets/history.widget";

/**
 * The shell of a results page: back, title, and the content once the
 * session is confirmed. A guest is sent to log in and back to `path`.
 */
export function ResultsPage({
  title,
  path,
  children,
}: {
  title: string;
  path: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { signedIn, user } = useProfileUser();

  useEffect(() => {
    if (signedIn === false) {
      router.replace(`/auth?returnTo=${encodeURIComponent(path)}`);
    }
  }, [signedIn, router, path]);

  return (
    <div className="w-full">
      <header className="mx-auto flex min-h-14 w-full max-w-6xl items-center gap-1 pt-2 pr-4 pl-2 lg:pt-3.5">
        <BackButton fallback="/profile" />
        <h1 className="truncate font-display text-xl font-black leading-compact tracking-label text-cyan">
          {title}
        </h1>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 pt-3 pb-7 max-[24rem]:px-3 lg:pt-5">
        {user.data && signedIn !== false ? (
          children
        ) : (
          <HistoryState
            failed={user.status === "error" && signedIn !== false}
            label="your profile"
            onRetry={user.reload}
          />
        )}
      </div>
    </div>
  );
}
