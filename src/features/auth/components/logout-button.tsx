"use client";

import { Button } from "@/lib/components/button";

import { useLogout } from "../data/authData";
import { useAuthSession } from "../index";

/** LOG OUT, shown only to a signed-in player. */
export function LogoutButton({ className }: { className?: string }) {
  const { status } = useAuthSession();
  const { pending, logOut } = useLogout();
  if (status !== "authenticated") return null;

  return (
    <Button
      variant="tonal"
      size="lg"
      accent="var(--ds-color-danger)"
      pending={pending}
      onClick={() => void logOut()}
      className={className}
    >
      LOG OUT
    </Button>
  );
}
