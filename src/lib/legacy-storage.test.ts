import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { migrateLegacyKey } from "./legacy-storage.ts";

const OLD = "dallema-store-v1";
const NEW = "dalema-store-v1";
const validJson = (raw: string) => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
};

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe("migrateLegacyKey", () => {
  it("copies the legacy value when the new key is missing", () => {
    const storage = fakeStorage({ [OLD]: '{"state":{"cart":[1]},"version":4}' });
    const result = migrateLegacyKey(storage, OLD, NEW, validJson);
    assert.equal(result, '{"state":{"cart":[1]},"version":4}');
    assert.equal(storage.data.get(NEW), '{"state":{"cart":[1]},"version":4}');
    assert.equal(storage.data.has(OLD), true); // old key kept by default
  });

  it("lets the new key win when both are present", () => {
    const storage = fakeStorage({ [OLD]: '{"state":{"cart":["old"]}}', [NEW]: '{"state":{"cart":["new"]}}' });
    const result = migrateLegacyKey(storage, OLD, NEW, validJson, true);
    assert.equal(result, '{"state":{"cart":["new"]}}');
    assert.equal(storage.data.get(NEW), '{"state":{"cart":["new"]}}');
    assert.equal(storage.data.has(OLD), true); // never touches old when new exists
  });

  it("treats an empty new value as missing", () => {
    const storage = fakeStorage({ [OLD]: '{"state":{}}', [NEW]: "" });
    assert.equal(migrateLegacyKey(storage, OLD, NEW, validJson), '{"state":{}}');
    assert.equal(storage.data.get(NEW), '{"state":{}}');
  });

  it("does not copy a corrupted legacy value", () => {
    const storage = fakeStorage({ [OLD]: "{not json" });
    assert.equal(migrateLegacyKey(storage, OLD, NEW, validJson, true), null);
    assert.equal(storage.data.has(NEW), false);
    assert.equal(storage.data.get(OLD), "{not json");
  });

  it("returns null when neither key exists", () => {
    const storage = fakeStorage();
    assert.equal(migrateLegacyKey(storage, OLD, NEW, validJson), null);
    assert.equal(storage.data.size, 0);
  });

  it("never throws when storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    assert.doesNotThrow(() => migrateLegacyKey(blocked, OLD, NEW, validJson, true));
    assert.equal(migrateLegacyKey(blocked, OLD, NEW, validJson, true), null);
  });

  it("never throws when the quota is full and keeps the old key", () => {
    const storage = fakeStorage({ [OLD]: '{"state":{}}' });
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    assert.equal(migrateLegacyKey(storage, OLD, NEW, validJson, true), null);
    assert.equal(storage.data.has(OLD), true);
    assert.equal(storage.data.has(NEW), false);
  });

  it("removeOld=true removes the old key after a successful copy", () => {
    const storage = fakeStorage({ [OLD]: '{"state":{}}' });
    assert.equal(migrateLegacyKey(storage, OLD, NEW, validJson, true), '{"state":{}}');
    assert.equal(storage.data.has(OLD), false);
    assert.equal(storage.data.get(NEW), '{"state":{}}');
  });

  it("removeOld=true keeps the old key when the copy did not stick", () => {
    const storage = fakeStorage({ [OLD]: '{"state":{}}' });
    storage.setItem = () => undefined; // silently drops the write
    migrateLegacyKey(storage, OLD, NEW, validJson, true);
    assert.equal(storage.data.has(OLD), true);
  });
});
