export type Role =
  | "resident"
  | "champion"
  | "collector"
  | "gardener"
  | "operator"
  | "site_manager";

export type CheckinMethod = "manual";
export type WeightMethod = "calibrated_scale" | "estimated";
export type ContaminationStatus = "clean" | "minor" | "major" | "rejected";
export type CollectionStatus = "completed" | "missed" | "delayed";
export type BatchStatus = "received" | "composting" | "ready" | "failed";
export type QualityStatus = "pending" | "passed" | "failed";
export type BinStatus = "available" | "nearly_full" | "full" | "closed";
export type WasteVerdict = "yes" | "no" | "ask" | "packaging";
export type CommunitySiteType = "community_garden" | "compost_hub" | "community_dropoff";
export type ClientSiteType = "condominium" | "mall" | "market" | "township" | "other";
export type ParticipationMode =
  | "residents_only"
  | "public_dropoff"
  | "tenants_and_staff"
  | "registered_stallholders";
export type SiteVisibility = "block" | "tenant" | "site";
export type SitePublicationStatus = "draft" | "active";

export interface User {
  user_id: string;
  name: string;
  role: Role;
  block_id: string | null;
  email: string;
  password: string;
  language: string;
  client_site_id?: string | null;
}

export interface Block {
  block_id: string;
  block_name: string;
  precinct: string;
  collection_schedule: string;
  assigned_collector_id: string;
  assigned_compost_site: string;
}

export interface Bin {
  bin_id: string;
  block_id: string;
  location_text: string;
  capacity_litres: number;
  status: BinStatus;
  accepted_items: string[];
  ask_first_items: string[];
  rejected_items: string[];
}

export interface Checkin {
  checkin_id: string;
  user_id: string;
  block_id: string;
  bin_id: string;
  timestamp: string;
  checkin_method: CheckinMethod;
}

export interface CommunitySite {
  community_site_id: string;
  name: string;
  site_type: CommunitySiteType;
  area: string;
  dropoff_location: string;
  dropoff_instructions: string;
  schedule: string;
  composting_partner: string;
  reward_note: string;
  accepted_items: string[];
  rejected_items: string[];
  participation_mode: ParticipationMode;
  participant_units: string[];
  visibility: SiteVisibility;
  publication_status: SitePublicationStatus;
  is_sample: boolean;
}

/** A waste source organization that participates with a receiving community site. */
export interface ClientSite {
  client_site_id: string;
  name: string;
  client_type: ClientSiteType;
  area: string;
  collection_point: string;
  collection_schedule: string;
  participant_units: string[];
  community_site_id: string | null;
}

export interface CommunityVisit {
  visit_id: string;
  user_id: string;
  community_site_id: string;
  timestamp: string;
}

export interface SiteRequest {
  site_request_id: string;
  condo_name: string;
  area: string;
  normalized_key: string;
  supporter_user_ids: string[];
  created_at: string;
}

export interface Collection {
  collection_id: string;
  block_id: string;
  bin_id: string;
  collector_id: string;
  collection_datetime: string;
  weight_kg: number;
  weight_method: WeightMethod;
  contamination_status: ContaminationStatus;
  contamination_notes: string;
  destination: string;
  batch_id: string | null;
  status: CollectionStatus;
}

export interface Batch {
  batch_id: string;
  compost_site: string;
  start_date: string;
  input_weight_kg: number;
  source_block_ids: string[];
  composting_method: string;
  expected_ready_date: string;
  actual_ready_date: string | null;
  output_compost_kg: number | null;
  quality_status: QualityStatus;
  quality_notes: string;
  batch_status: BatchStatus;
}

export interface Garden {
  garden_id: string;
  garden_name: string;
  location: string;
  gardener_id: string;
}

export interface CompostUse {
  use_id: string;
  garden_id: string;
  batch_id: string;
  compost_used_kg: number;
  usage_date: string;
  garden_area: string;
  update_notes: string;
  photo_url: string;
}

export interface ChampionIssue {
  issue_id: string;
  block_id: string;
  bin_id: string;
  reporter_id: string;
  timestamp: string;
  kind: string;
  notes: string;
}

export interface WasteItem {
  id: string;
  name: string;
  aliases: string[];
  verdict: WasteVerdict;
  reason: string;
}

export interface AppState {
  users: User[];
  blocks: Block[];
  bins: Bin[];
  checkins: Checkin[];
  community_sites: CommunitySite[];
  client_sites: ClientSite[];
  community_visits: CommunityVisit[];
  site_requests: SiteRequest[];
  collections: Collection[];
  batches: Batch[];
  gardens: Garden[];
  compost_uses: CompostUse[];
  champion_issues: ChampionIssue[];
  waste_items: WasteItem[];
}

export const ROLE_HOME: Record<Role, string> = {
  resident: "/resident",
  champion: "/champion",
  collector: "/collector",
  gardener: "/gardener",
  operator: "/operator",
  site_manager: "/client-site",
};
