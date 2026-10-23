// Only add real, permission-cleared photos / videos supplied by the project team.
// Keep empty until footage is available; the illustrated UI remains complete.
export interface ProgrammeAsset {
  photo?: string;
  video?: string;
  credit: string;
  description: string;
  transcript?: string;
}
export const programmeMedia: Partial<Record<"sorting" | "dropoff" | "compost", ProgrammeAsset>> = {};
