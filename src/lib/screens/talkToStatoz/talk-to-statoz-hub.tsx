import { IMAGES } from "@/config/images";

import { AccentPanel, DirectoryCard, HowToPlayPage } from "../howToPlay/parts";
import { channelNumber, SUPPORT_CHANNELS } from "./channels";

const SOCIAL_LINKS = [
  {
    label: "INSTAGRAM",
    icon: IMAGES.social.instagram,
    url: "https://www.instagram.com/statozgames/",
  },
  {
    label: "WHATSAPP",
    icon: IMAGES.social.whatsapp,
    url: "https://chat.whatsapp.com/JxKL3sVI7S88qNe0pYXo77?mode=gi_t",
  },
  {
    label: "YOUTUBE",
    icon: IMAGES.social.youtube,
    url: "https://www.youtube.com/@StatozIndia",
  },
  {
    label: "LINKEDIN",
    icon: IMAGES.social.linkedin,
    url: "https://www.linkedin.com/company/statoz/",
  },
  { label: "X", icon: IMAGES.social.x, url: "https://x.com/StatOzindia" },
  {
    label: "REDDIT",
    icon: IMAGES.social.reddit,
    url: "https://www.reddit.com/r/f2p__predictionmarket/",
  },
];

/** `/profile/talk-to-statoz`: one card per support channel, then socials. */
export function TalkToStatozHub() {
  return (
    <HowToPlayPage
      title="TALK TO STATOZ"
      subtitle="// 1:1 DIRECT LINE"
      accent="var(--ds-color-accent-cyan)"
      back="/profile"
    >
      <section className="pb-1">
        <h3 className="font-display text-xs font-black tracking-ultra text-cyan">
          OPEN A CHANNEL
        </h3>
        <p className="mt-1.5 font-sans text-sm leading-body text-subtle">
          Pick a channel. We read every transmission.
        </p>
      </section>

      <ul className="grid gap-3 lg:grid-cols-2">
        {SUPPORT_CHANNELS.map((channel) => (
          <li key={channel.id}>
            <DirectoryCard
              href={`/profile/talk-to-statoz/${channel.id}`}
              accent={channel.accent}
              icon={channel.icon}
              title={channel.title}
              tagline={channel.tagline}
              meta={`CHANNEL ${channelNumber(channel)}`}
            />
          </li>
        ))}
      </ul>

      <AccentPanel accent="var(--ds-color-accent-cyan)" className="p-4">
        <h3 className="font-display text-xs font-black tracking-ultra text-cyan">
          FOLLOW US ON
        </h3>
        <p className="mt-1.5 font-sans text-sm leading-body text-subtle">
          Highlights, hot takes, and the next drop.
        </p>
        <ul className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {SOCIAL_LINKS.map(({ label, icon, url }) => (
            <li key={label}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 border border-line font-display text-2xs font-black tracking-wide text-muted transition-colors duration-150 hover:border-cyan hover:text-foreground focus-visible:border-cyan focus-visible:text-foreground"
              >
                {/* The marks have no fill, so they take the text colour. */}
                <span
                  aria-hidden
                  className="size-4.5 shrink-0 bg-current"
                  style={{
                    mask: `url(${icon}) center / contain no-repeat`,
                  }}
                />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </AccentPanel>
    </HowToPlayPage>
  );
}
