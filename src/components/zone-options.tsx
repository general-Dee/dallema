import { zonesByBranch } from "@/lib/branches";
import type { DeliveryZone, Settings } from "@/lib/types";

/** <option>s for a zone <select>, grouped by branch city with <optgroup> when branches are set. */
export function ZoneOptions({ settings, label }: { settings: Settings; label: (zone: DeliveryZone) => string }) {
  const groups = zonesByBranch(settings);
  if (groups.length <= 1) {
    return (
      <>
        {settings.zones.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {label(zone)}
          </option>
        ))}
      </>
    );
  }
  return (
    <>
      {groups.map((group) => (
        <optgroup key={group.branch?.id ?? "other"} label={group.branch ? group.branch.city : "Other"}>
          {group.zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {label(zone)}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
