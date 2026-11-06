import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GUIDES, guideFor } from "@/lib/screens/howToPlay/guides";
import { HowToPlayGuide } from "@/lib/screens/howToPlay/how-to-play-guide";

type Props = PageProps<"/profile/how-to-play/[mode]">;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ mode: guide.id }));
}

// The mode is URL data, so it is read inside Suspense: the shell every link
// to this route shares can't hold one URL's content.
export default function HowToPlayGuidePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <Guide params={params} />
    </Suspense>
  );
}

async function Guide({ params }: Pick<Props, "params">) {
  const guide = guideFor((await params).mode);
  if (!guide) notFound();
  return <HowToPlayGuide guide={guide} />;
}
