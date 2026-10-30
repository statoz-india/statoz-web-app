import { accentVar } from "@/styles/colors";

import { AuthHero } from "../components/auth-hero";
import { AuthPanel, type AuthPanelProps } from "../components/auth-panel";
import { authHeroMedia } from "../constants";

export type AuthScreenProps = Omit<AuthPanelProps, "className">;

/**
 * The sign-up / log-in screen: the hero on top on phones (5:4), and a
 * full-height split from `lg`. UI only; the sign-in logic comes in through the
 * panel's callbacks.
 */
export function AuthScreen(panel: AuthScreenProps) {
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
        <AuthPanel {...panel} className="mx-auto w-full max-w-md" />
      </div>
    </div>
  );
}
