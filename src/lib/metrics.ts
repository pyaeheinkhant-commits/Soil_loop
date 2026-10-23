import type {
  AppState,
  Collection,
  ContaminationStatus,
} from "./types";
import { acceptedKg } from "./operations";

export function isAccepted(collection: Collection) {
  return (
    collection.status === "completed" &&
    collection.contamination_status !== "rejected"
  );
}

export function divertedKg(state: AppState, blockId?: string) {
  return state.collections
    .filter((c) => isAccepted(c) && (!blockId || c.block_id === blockId))
    .reduce((sum, c) => sum + acceptedKg(c), 0);
}

export function compostProducedKg(state: AppState) {
  return state.batches
    .filter((b) => b.batch_status === "ready" && b.quality_status === "passed" && b.output_compost_kg)
    .reduce((sum, b) => sum + (b.output_compost_kg ?? 0), 0);
}

export function compostUsedKg(state: AppState) {
  return state.compost_uses.reduce((sum, u) => sum + u.compost_used_kg, 0);
}

export function contaminationRate(state: AppState) {
  const done = state.collections.filter((c) => c.status === "completed");
  if (!done.length) return 0;
  const dirty = done.filter((c) => c.contamination_status !== "clean").length;
  return dirty / done.length;
}

export function checkinCount(state: AppState, userId: string) {
  return state.checkins.filter((c) => c.user_id === userId).length;
}

export function communityVisitCount(
  state: AppState,
  userId: string,
  communitySiteId?: string,
) {
  return state.community_visits.filter(
    (visit) =>
      visit.user_id === userId &&
      (!communitySiteId || visit.community_site_id === communitySiteId),
  ).length;
}

export function blockCheckins(state: AppState, blockId: string) {
  return state.checkins.filter((c) => c.block_id === blockId).length;
}

export function conversionRate(inputKg: number, outputKg: number | null) {
  if (!inputKg || !outputKg) return null;
  return outputKg / inputKg;
}

export function contaminationLabel(status: ContaminationStatus) {
  return {
    clean: "Clean",
    minor: "Minor",
    major: "Major",
    rejected: "Rejected",
  }[status];
}

export function perBlockRows(state: AppState) {
  return state.blocks.map((block) => {
    const cols = state.collections.filter((c) => c.block_id === block.block_id);
    const done = cols.filter((c) => c.status === "completed");
    const dirty = done.filter((c) => c.contamination_status !== "clean").length;
    return {
      block,
      diverted: divertedKg(state, block.block_id),
      checkins: blockCheckins(state, block.block_id),
      contamination: done.length ? dirty / done.length : 0,
      collections: done.length,
    };
  });
}
