import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  SUPPORT_CHANNELS,
  supportChannelFor,
} from "@/lib/screens/talkToStatoz/channels";
import { TransmissionCompose } from "@/lib/screens/talkToStatoz/transmission-compose";

type Props = PageProps<"/profile/talk-to-statoz/[channel]">;

export function generateStaticParams() {
  return SUPPORT_CHANNELS.map((channel) => ({ channel: channel.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const channel = supportChannelFor((await params).channel);
  if (!channel) return { title: "Talk to StatOz | StatOz" };
  return {
    title: `${channel.title} | Talk to StatOz | StatOz`,
    description: channel.composeHint,
  };
}

// The channel is URL data, so it is read inside Suspense: the shell every
// link to this route shares can't hold one URL's content.
export default function TransmissionPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <Compose params={params} />
    </Suspense>
  );
}

async function Compose({ params }: Pick<Props, "params">) {
  const { channel } = await params;
  if (!supportChannelFor(channel)) notFound();
  return <TransmissionCompose channelId={channel} />;
}
