import type {
  CommunitySiteType,
  ParticipationMode,
  SiteVisibility,
} from "./types";

export const SITE_TYPES: { value: CommunitySiteType; label: string }[] = [
  { value: "community_garden", label: "Community garden" },
  { value: "compost_hub", label: "Community compost hub" },
  { value: "community_dropoff", label: "Community drop-off point" },
];

export const PARTICIPATION_MODES: { value: ParticipationMode; label: string }[] = [
  { value: "residents_only", label: "Residents only" },
  { value: "public_dropoff", label: "Open public drop-off" },
  { value: "tenants_and_staff", label: "Tenants and staff" },
  { value: "registered_stallholders", label: "Registered stallholders" },
];

export const SITE_VISIBILITIES: { value: SiteVisibility; label: string }[] = [
  { value: "block", label: "Block level" },
  { value: "tenant", label: "Tenant or stall level" },
  { value: "site", label: "Site wide" },
];

export function siteTypeLabel(value: CommunitySiteType) {
  return SITE_TYPES.find((option) => option.value === value)?.label ?? value;
}

export function participationModeLabel(value: ParticipationMode) {
  return PARTICIPATION_MODES.find((option) => option.value === value)?.label ?? value;
}

export function siteVisibilityLabel(value: SiteVisibility) {
  return SITE_VISIBILITIES.find((option) => option.value === value)?.label ?? value;
}
