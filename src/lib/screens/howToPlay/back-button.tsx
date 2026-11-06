"use client";

import { useRouter } from "next/navigation";

import { ChevronLeftIcon } from "@/lib/icons";

/** Goes back in this tab, or to `fallback` when the page was opened directly. */
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      title="Back"
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push(fallback)
      }
      className="grid size-9 shrink-0 place-items-center text-foreground transition-colors duration-150 hover:bg-foreground/10"
    >
      <ChevronLeftIcon size={22} />
    </button>
  );
}
