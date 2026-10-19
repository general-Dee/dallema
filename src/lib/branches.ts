import type { Branch, DeliveryZone, Settings } from "./types";

/**
 * Dalema's branches. Settings saved before branches existed have none, so fall back to a single
 * branch built from `settings.address`. An empty branch address means "not confirmed yet" and is
 * hidden in the UI.
 */
export function shopBranches(settings: Settings): Branch[] {
  if (settings.branches && settings.branches.length > 0) return settings.branches;
  return [{ id: "kaduna", name: "Kaduna branch", city: "Kaduna", address: settings.address }];
}

export interface ZoneGroup {
  branch: Branch | null;
  zones: DeliveryZone[];
}

/** Delivery zones grouped by branch, in branch order. Zones with no (or an unknown) branch form one trailing group. */
export function zonesByBranch(settings: Settings): ZoneGroup[] {
  const branches = settings.branches ?? [];
  const groups: ZoneGroup[] = branches.map((branch) => ({
    branch,
    zones: settings.zones.filter((zone) => zone.branchId === branch.id),
  }));
  const known = new Set(branches.map((branch) => branch.id));
  const loose = settings.zones.filter((zone) => !zone.branchId || !known.has(zone.branchId));
  if (loose.length > 0) groups.push({ branch: null, zones: loose });
  return groups.filter((group) => group.zones.length > 0);
}

/** Branches whose address is known, as "Kaduna: No. 70 …" lines. */
export function branchLines(settings: Settings): string[] {
  return shopBranches(settings)
    .filter((branch) => branch.address.trim())
    .map((branch) => `${branch.city}: ${branch.address}`);
}

/** Where a pickup order can be collected, e.g. "No. 70 … (Kaduna) or 45 Gana Street … (Abuja)". */
export function pickupPlaces(settings: Settings): string {
  const known = shopBranches(settings).filter((branch) => branch.address.trim());
  if (known.length === 0) return settings.address;
  if (known.length === 1) return known[0].address;
  return known.map((branch) => `${branch.address} (${branch.city})`).join(" or ");
}
