import { afterEach, describe, expect, it, vi } from "vitest";
import { readJSON, writeJSON } from ".";

describe("storage", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the fallback for a missing key", () => {
        expect(readJSON("missing", { ok: true })).toEqual({ ok: true });
    });

    it("round-trips JSON values", () => {
        writeJSON("key", { a: 1 });

        expect(readJSON("key", null)).toEqual({ a: 1 });
    });

    it("returns the fallback for invalid JSON", () => {
        localStorage.setItem("key", "{not json");

        expect(readJSON("key", "fallback")).toBe("fallback");
    });

    it("never throws when storage is unavailable", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("blocked");
        });

        expect(readJSON("key", 1)).toBe(1);
        expect(() => writeJSON("key", 2)).not.toThrow();
    });
});
