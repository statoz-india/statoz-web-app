import { GUIDES } from "./guides";
import { DirectoryCard, HowToPlayPage } from "./parts";

/** `/profile/how-to-play`: a short intro and one card per game mode. */
export function HowToPlayHub() {
  return (
    <HowToPlayPage
      title="HOW TO PLAY"
      subtitle="// PICK A MODE TO LEARN"
      accent="var(--ds-color-accent-cyan)"
      back="/profile"
    >
      <section className="pb-1">
        <h3 className="font-display text-xs font-black tracking-ultra text-cyan">
          SEVEN WAYS TO PLAY STATOZ
        </h3>
        <p className="mt-1.5 font-sans text-sm leading-body text-subtle">
          Predict fixtures, take market picks, duel with cards, trade spot
          kicks, or take on the arcade modes. Tap a mode for its quick guide.
        </p>
      </section>

      <ul className="grid gap-3 lg:grid-cols-2">
        {GUIDES.map((guide) => (
          <li key={guide.id}>
            <DirectoryCard
              href={`/profile/how-to-play/${guide.id}`}
              accent={guide.accent}
              icon={guide.icon}
              title={guide.title}
              tagline={guide.tagline}
              meta={`${guide.steps.length} STEPS`}
            />
          </li>
        ))}
      </ul>
    </HowToPlayPage>
  );
}
