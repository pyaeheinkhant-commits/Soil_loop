"use client";

import { cloneSeed } from "./seed";
import type {
  AppState,
  Batch,
  BinStatus,
  ClientSite,
  CommunitySite,
  Collection,
  CompostUse,
} from "./types";

const KEY = "soilloop-demo-v1";
const SESSION = "soilloop-user";
const EVENT = "soilloop-change";
const SERVER_STATE = cloneSeed();
const SITE_TYPE_VALUES = ["community_garden", "compost_hub", "community_dropoff"] as const;
const PARTICIPATION_VALUES = ["residents_only", "public_dropoff", "tenants_and_staff", "registered_stallholders"] as const;
const VISIBILITY_VALUES = ["block", "tenant", "site"] as const;
const PUBLICATION_VALUES = ["draft", "active"] as const;

let cache: AppState | null = null;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

function hydrate(): AppState {
  const seed = cloneSeed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const storedUsers = Array.isArray(parsed.users) ? parsed.users : [];
    const seededUserIds = new Set(seed.users.map((user) => user.user_id));
    const users = [
      ...seed.users.map((user) => storedUsers.find((stored) => stored.user_id === user.user_id) ?? user),
      ...storedUsers.filter((stored) => !seededUserIds.has(stored.user_id)),
    ];
    const storedSites = Array.isArray(parsed.community_sites)
      ? (parsed.community_sites as Partial<CommunitySite>[])
      : [];
    const communitySites: CommunitySite[] = storedSites.length
      ? storedSites.map((stored, index) => {
          const fallback = seed.community_sites.find(
            (site) => site.community_site_id === stored.community_site_id,
          ) ?? seed.community_sites[index];
          const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
            typeof value === "string" && values.includes(value as T);
          return {
            ...fallback,
            ...stored,
            community_site_id:
              stored.community_site_id ?? fallback?.community_site_id ?? nextId("SITE"),
            site_type: isOneOf(SITE_TYPE_VALUES, stored.site_type)
              ? stored.site_type
              : fallback?.site_type ?? "community_dropoff",
            participation_mode: isOneOf(PARTICIPATION_VALUES, stored.participation_mode)
              ? stored.participation_mode
              : fallback?.participation_mode ?? "residents_only",
            visibility: isOneOf(VISIBILITY_VALUES, stored.visibility)
              ? stored.visibility
              : fallback?.visibility ?? "site",
            publication_status: isOneOf(PUBLICATION_VALUES, stored.publication_status)
              ? stored.publication_status
              : fallback?.publication_status ?? "active",
            reward_note: stored.reward_note ?? fallback?.reward_note ?? "",
            accepted_items: Array.isArray(stored.accepted_items)
              ? stored.accepted_items
              : fallback?.accepted_items ?? [],
            rejected_items: Array.isArray(stored.rejected_items)
              ? stored.rejected_items
              : fallback?.rejected_items ?? [],
            participant_units: Array.isArray(stored.participant_units)
              ? stored.participant_units
              : fallback?.participant_units ?? [],
            is_sample: stored.is_sample ?? fallback?.is_sample ?? false,
          };
        })
      : seed.community_sites;
    return {
      ...seed,
      ...parsed,
      users,
      community_sites: communitySites,
      client_sites: Array.isArray(parsed.client_sites)
        ? (parsed.client_sites as ClientSite[])
        : seed.client_sites,
      waste_items: seed.waste_items,
    };
  } catch {
    return seed;
  }
}

export function loadState(): AppState {
  if (typeof window === "undefined") return SERVER_STATE;
  if (!cache) cache = hydrate();
  return cache;
}

export function saveState(state: AppState) {
  cache = structuredClone(state);
  localStorage.setItem(KEY, JSON.stringify(cache));
  emit();
}

export function resetState() {
  cache = cloneSeed();
  localStorage.removeItem(KEY);
  emit();
}

export function getSessionUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
}

export function setSessionUserId(userId: string | null) {
  if (userId) localStorage.setItem(SESSION, userId);
  else localStorage.removeItem(SESSION);
  emit();
}

export function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== KEY && event.key !== SESSION) return;
    cache = hydrate();
    listener();
  };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addCheckin(userId: string, blockId: string, binId: string) {
  const state = structuredClone(loadState());
  state.checkins.push({
    checkin_id: nextId("CHK"),
    user_id: userId,
    block_id: blockId,
    bin_id: binId,
    timestamp: new Date().toISOString(),
    checkin_method: "manual",
  });
  saveState(state);
}

export function addCommunityVisit(userId: string, communitySiteId: string) {
  const state = structuredClone(loadState());
  const user = state.users.find((candidate) => candidate.user_id === userId);
  const site = state.community_sites.find(
    (candidate) => candidate.community_site_id === communitySiteId,
  );
  if (!user || user.role !== "resident" || !site) return null;

  const visit = {
    visit_id: nextId("VIS"),
    user_id: userId,
    community_site_id: communitySiteId,
    timestamp: new Date().toISOString(),
  };
  state.community_visits.push(visit);
  saveState(state);
  return visit;
}

function normalizeRequestPart(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function supportSiteRequest(condoName: string, area: string, userId: string) {
  const name = condoName.trim().replace(/\s+/g, " ");
  const location = area.trim().replace(/\s+/g, " ");
  const normalizedKey = `${normalizeRequestPart(name)}::${normalizeRequestPart(location)}`;
  if (!name || !location || normalizedKey === "::") {
    return { siteRequest: null, added: false };
  }

  const state = structuredClone(loadState());
  const user = state.users.find((candidate) => candidate.user_id === userId);
  if (!user || user.role !== "resident") return { siteRequest: null, added: false };

  let siteRequest = state.site_requests.find(
    (candidate) => candidate.normalized_key === normalizedKey,
  );
  if (siteRequest) {
    if (siteRequest.supporter_user_ids.includes(userId)) {
      return { siteRequest, added: false };
    }
    siteRequest.supporter_user_ids.push(userId);
  } else {
    siteRequest = {
      site_request_id: nextId("REQ"),
      condo_name: name,
      area: location,
      normalized_key: normalizedKey,
      supporter_user_ids: [userId],
      created_at: new Date().toISOString(),
    };
    state.site_requests.push(siteRequest);
  }

  saveState(state);
  return { siteRequest, added: true };
}

export type CommunitySiteInput = Omit<CommunitySite, "community_site_id" | "is_sample"> & {
  community_site_id?: string;
};

export function saveCommunitySite(input: CommunitySiteInput) {
  const state = structuredClone(loadState());
  const existingIndex = input.community_site_id
    ? state.community_sites.findIndex(
        (site) => site.community_site_id === input.community_site_id,
      )
    : -1;
  const existing = existingIndex >= 0 ? state.community_sites[existingIndex] : undefined;
  const site: CommunitySite = {
    ...input,
    community_site_id: existing?.community_site_id ?? nextId("SITE"),
    is_sample: existing?.is_sample ?? false,
  };

  if (existingIndex >= 0) state.community_sites[existingIndex] = site;
  else state.community_sites.unshift(site);

  saveState(state);
  return site;
}

export function updateManagedClientSite(
  clientSiteId: string,
  userId: string,
  patch: Pick<ClientSite, "collection_point" | "collection_schedule" | "participant_units">,
) {
  const state = structuredClone(loadState());
  const user = state.users.find((candidate) => candidate.user_id === userId);
  const site = state.client_sites.find((candidate) => candidate.client_site_id === clientSiteId);
  if (!user || user.role !== "site_manager" || user.client_site_id !== clientSiteId || !site) {
    return null;
  }
  Object.assign(site, patch);
  saveState(state);
  return site;
}

export function addCollection(input: Omit<Collection, "collection_id">) {
  const state = structuredClone(loadState());
  const collection: Collection = {
    ...input,
    collection_id: nextId("COL"),
  };
  state.collections.push(collection);
  if (collection.batch_id && collection.contamination_status !== "rejected") {
    const batch = state.batches.find((b) => b.batch_id === collection.batch_id);
    if (batch) {
      batch.input_weight_kg += collection.weight_kg;
      if (!batch.source_block_ids.includes(collection.block_id)) {
        batch.source_block_ids.push(collection.block_id);
      }
    }
  }
  saveState(state);
  return collection;
}

export function updateBatch(batchId: string, patch: Partial<Batch>) {
  const state = structuredClone(loadState());
  const batch = state.batches.find((b) => b.batch_id === batchId);
  if (!batch) return;
  Object.assign(batch, patch);
  saveState(state);
}

export function addCompostUse(input: Omit<CompostUse, "use_id">) {
  const state = structuredClone(loadState());
  state.compost_uses.push({ ...input, use_id: nextId("USE") });
  saveState(state);
}

export function updateBinStatus(binId: string, status: BinStatus) {
  const state = structuredClone(loadState());
  const bin = state.bins.find((b) => b.bin_id === binId);
  if (!bin) return;
  bin.status = status;
  saveState(state);
}

export function addChampionIssue(input: {
  block_id: string;
  bin_id: string;
  reporter_id: string;
  kind: string;
  notes: string;
}) {
  const state = structuredClone(loadState());
  state.champion_issues.push({
    ...input,
    issue_id: nextId("ISS"),
    timestamp: new Date().toISOString(),
  });
  saveState(state);
}

export function searchWaste(query: string, state: AppState) {
  const q = query.trim().toLowerCase();
  if (!q) return state.waste_items;
  return state.waste_items.filter((item) => {
    const hay = [item.name, ...item.aliases].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
