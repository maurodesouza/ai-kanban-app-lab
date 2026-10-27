import { describe, expect, it } from "vitest";
import { array } from "./array";

describe("array", () => {
    it("moves an item to a new index", () => {
        expect(array.move(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
        expect(array.move(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    });

    it("clamps the target index when moving and inserting", () => {
        expect(array.move(["a", "b"], 0, 9)).toEqual(["b", "a"]);
        expect(array.insert(["a", "b"], -3, "x")).toEqual(["x", "a", "b"]);
        expect(array.insert(["a", "b"], 9, "x")).toEqual(["a", "b", "x"]);
    });

    it("removes an item without mutating the original list", () => {
        const list = ["a", "b"];

        expect(array.without(list, "a")).toEqual(["b"]);
        expect(list).toEqual(["a", "b"]);
    });
});
