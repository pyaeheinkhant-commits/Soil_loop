import type { AppState, Batch, Collection, CompostUse } from "./types";

export function acceptedKg(collection: Omit<Collection, "collection_id">) {
  if (collection.status !== "completed" || collection.contamination_status === "rejected") return 0;
  return collection.accepted_weight_kg ?? collection.weight_kg;
}

export function availableKg(state: AppState, batchId: string) {
  const batch = state.batches.find((b) => b.batch_id === batchId);
  const used = state.compost_uses.filter((u) => u.batch_id === batchId).reduce((sum, u) => sum + u.compost_used_kg, 0);
  return Math.max(0, Math.round(((batch?.output_compost_kg ?? 0) - used) * 1000) / 1000);
}

export function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function validateCollection(state: AppState, input: Omit<Collection, "collection_id">) {
  const block = state.blocks.find((b) => b.block_id === input.block_id);
  requireValid(block && state.bins.some((b) => b.bin_id === input.bin_id && b.block_id === input.block_id), "Choose a valid block and bin.");
  requireValid(Number.isFinite(Date.parse(input.collection_datetime)), "Enter a valid collection date and time.");
  requireValid(Number.isFinite(input.weight_kg) && input.weight_kg >= 0, "Weight must be a positive number.");
  if (input.status !== "completed") {
    requireValid(input.weight_kg === 0 && !input.batch_id && (input.accepted_weight_kg ?? 0) === 0, "Missed or delayed pickups cannot add weight to a batch.");
    requireValid(input.contamination_notes.trim(), "Explain the missed or delayed pickup.");
    return;
  }
  requireValid(input.weight_kg > 0, "Enter the collected weight above zero.");
  const accepted = acceptedKg(input);
  requireValid(Number.isFinite(accepted) && accepted >= 0 && accepted <= input.weight_kg, "Accepted weight must be between zero and the collected weight.");
  if (input.contamination_status !== "clean" || accepted < input.weight_kg) {
    requireValid(input.contamination_notes.trim(), "Add a reason and guidance for the block.");
  }
  if (input.contamination_status === "rejected") {
    requireValid(!input.batch_id && (input.accepted_weight_kg ?? 0) === 0, "Rejected loads cannot enter a compost batch.");
    return;
  }
  requireValid(accepted > 0, "Use Rejected when no material is accepted.");
  const batch = state.batches.find((b) => b.batch_id === input.batch_id);
  requireValid(batch && ["received", "composting"].includes(batch.batch_status) && batch.quality_status !== "failed", "Choose an open batch. Ready or failed batches cannot receive scraps.");
  requireValid(batch.compost_site === input.destination && input.destination === block.assigned_compost_site, "The destination must match the block partner and compost batch.");
  requireValid(malaysiaDate(new Date(input.collection_datetime)) >= batch.start_date, "The collection cannot predate its batch.");
}

export function validateBatch(state: AppState, batch: Batch) {
  requireValid(batch.compost_site.trim() && batch.composting_method.trim(), "Enter a partner and composting method.");
  requireValid(/^\d{4}-\d{2}-\d{2}$/.test(batch.start_date) && Number.isFinite(Date.parse(batch.start_date)), "Enter a valid start date.");
  requireValid(Number.isFinite(Date.parse(batch.expected_ready_date)) && batch.expected_ready_date >= batch.start_date, "Expected ready date must be on or after the start date.");
  requireValid(batch.output_compost_kg === null || (Number.isFinite(batch.output_compost_kg) && batch.output_compost_kg >= 0), "Compost output cannot be negative or invalid.");
  const used = state.compost_uses.filter((u) => u.batch_id === batch.batch_id).reduce((sum, u) => sum + u.compost_used_kg, 0);
  requireValid((batch.output_compost_kg ?? 0) >= used, "Output cannot be less than compost already used.");
  if (used > 0) requireValid(batch.batch_status === "ready" && batch.quality_status === "passed", "This batch has garden use records; keep it ready and quality-passed.");
  if (batch.batch_status === "ready") {
    requireValid(batch.quality_status === "passed" && (batch.output_compost_kg ?? 0) > 0 && batch.input_weight_kg > 0, "Ready compost needs accepted input, a passed quality check and a measured output above zero.");
    requireValid(batch.quality_notes.trim(), "Describe the maturity, odour and contamination checks.");
    requireValid(batch.actual_ready_date && Number.isFinite(Date.parse(batch.actual_ready_date)) && batch.actual_ready_date >= batch.start_date, "Enter an actual ready date on or after the start date.");
  }
}

export function validMediaUrl(value: string, allowData = false) {
  if (!value) return true;
  if (allowData && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
  if (/^\/(?!\/)[^\s\\]+$/.test(value)) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function validateCompostUse(state: AppState, input: Omit<CompostUse, "use_id">) {
  const batch = state.batches.find((b) => b.batch_id === input.batch_id);
  requireValid(batch?.batch_status === "ready" && batch.quality_status === "passed", "Only ready, quality-passed compost can be used.");
  requireValid(state.gardens.some((g) => g.garden_id === input.garden_id), "Choose a garden.");
  requireValid(Number.isFinite(input.compost_used_kg) && input.compost_used_kg > 0 && input.compost_used_kg <= availableKg(state, input.batch_id), "Quantity must be above zero and within the batch's available compost.");
  requireValid(Number.isFinite(Date.parse(input.usage_date)) && input.usage_date >= (batch.actual_ready_date ?? batch.start_date), "Usage date cannot predate the batch becoming ready.");
  requireValid(input.garden_area.trim() && input.update_notes.trim(), "Add the garden beds and a short update.");
  requireValid(validMediaUrl(input.photo_url, true) && validMediaUrl(input.video_url ?? ""), "Use an HTTPS media URL or a path under /media/.");
  if (input.photo_url || input.video_url) requireValid(input.media_credit?.trim(), "Add a photographer or source credit for real media.");
  if (input.video_url) requireValid(input.video_description?.trim(), "Add a text description or transcript of the video.");
  if (input.request_id) requireValid(state.compost_requests.some((r) => r.request_id === input.request_id && r.garden_id === input.garden_id), "The request must belong to this garden.");
}

// These inputs describe the Malaysian pilot, regardless of the viewer's device zone.
export function malaysiaDateTime(date = new Date()) {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
export function malaysiaDate(date = new Date()) { return malaysiaDateTime(date).slice(0, 10); }
