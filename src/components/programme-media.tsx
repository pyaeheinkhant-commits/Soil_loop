import { programmeMedia } from "@/lib/programme-media";
import { RealMedia } from "./real-media";
import { Card } from "./ui";

export function ProgrammeMedia({ stage }: { stage: keyof typeof programmeMedia }) {
  const asset = programmeMedia[stage];
  if (!asset) return null;
  return <Card className="mt-4 space-y-3"><h2 className="font-display text-xl">See it in our neighbourhood</h2><RealMedia {...asset} /><p className="text-sm leading-6 text-soil-600">{asset.description}</p></Card>;
}
