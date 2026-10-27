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

describe("task.filter.byFilters", () => {
    const base = task.create(
        "t1",
        "c1",
        {
            title: "Write release notes",
            description: "Summarize the Q4 changes",
            priority: "high",
            startDate: "2026-10-10",
            endDate: "2026-10-20",
        },
        "now",
    );
    const none = {
        search: "",
        dateFrom: "",
        dateTo: "",
        priority: "all" as const,
    };

    it("matches everything without filters", () => {
        expect(task.filter.byFilters(none)(base)).toBe(true);
    });

    it("searches title and description, case-insensitively", () => {
        expect(
            task.filter.byFilters({ ...none, search: "RELEASE" })(base),
        ).toBe(true);
        expect(task.filter.byFilters({ ...none, search: "q4" })(base)).toBe(
            true,
        );
        expect(task.filter.byFilters({ ...none, search: "budget" })(base)).toBe(
            false,
        );
    });

    it("filters by priority", () => {
        expect(task.filter.byFilters({ ...none, priority: "high" })(base)).toBe(
            true,
        );
        expect(task.filter.byFilters({ ...none, priority: "low" })(base)).toBe(
            false,
        );
    });

    it("filters by overlapping date range", () => {
        expect(
            task.filter.byFilters({
                ...none,
                dateFrom: "2026-10-15",
                dateTo: "2026-10-30",
            })(base),
        ).toBe(true);
        expect(
            task.filter.byFilters({ ...none, dateFrom: "2026-10-21" })(base),
        ).toBe(false);
    });

    it("combines filters with AND", () => {
        expect(
            task.filter.byFilters({
                ...none,
                search: "release",
                priority: "low",
            })(base),
        ).toBe(false);
    });
});
