/**
 * One-time copy of a browser storage value from an old key to a new key.
 * The new key always wins; the old key is only read when the new one is empty.
 * Never throws (blocked storage, private browsing and full quota are ignored).
 * Returns the value now held under the new key, or null when there is none.
 */
export function migrateLegacyKey(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  oldKey: string,
  newKey: string,
  isValid: (raw: string) => boolean,
  removeOld = false,
): string | null {
  try {
    const current = storage.getItem(newKey);
    if (current !== null && current !== "") return current; // new key wins
    const legacy = storage.getItem(oldKey);
    if (legacy === null || !isValid(legacy)) return null;
    storage.setItem(newKey, legacy);
    if (removeOld && storage.getItem(newKey) === legacy) storage.removeItem(oldKey);
    return legacy;
  } catch {
    return null; // blocked storage or full quota: never throw on load
  }
}
