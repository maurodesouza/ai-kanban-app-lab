import { describe, expect, it } from "vitest";
import { task } from "./task";

const valid = {
    title: "Write docs",
    description: "",
    priority: "medium" as const,
    startDate: "2026-10-27",
    endDate: "2026-10-28",
};

describe("task", () => {
    it("accepts valid fields", () => {
        expect(task.validate(valid)).toEqual({});
    });

    it("requires a title", () => {
        expect(task.validate({ ...valid, title: "   " })).toEqual({
            title: "Title is required",
        });
    });

    it("rejects an end date before the start date", () => {
        expect(task.validate({ ...valid, endDate: "2026-10-26" })).toEqual({
            endDate: "End date can't be before the start date",
        });
    });

    it("accepts the same start and end date", () => {
        expect(task.validate({ ...valid, endDate: valid.startDate })).toEqual(
            {},
        );
    });

    it("creates a trimmed task", () => {
        const created = task.create(
            "t1",
            "c1",
            { ...valid, title: "  Hi  " },
            "now",
        );

        expect(created).toMatchObject({
            id: "t1",
            columnId: "c1",
            title: "Hi",
            createdAt: "now",
            updatedAt: "now",
        });
    });
});
