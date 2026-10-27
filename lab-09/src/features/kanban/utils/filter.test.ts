import { describe, expect, it } from "vitest";
import { makeTask } from "../test/fixtures";
import {
    createEmptyFilters,
    matchesFilters,
    parseStoredFilters,
} from "./filter";

const task = makeTask({
    id: "t1",
    columnId: "a",
    title: "Write Docs",
    description: "Cover the API",
    priority: "high",
    startDate: "2026-03-10",
    endDate: "2026-03-15",
});

function matches(filters: Partial<ReturnType<typeof createEmptyFilters>>) {
    return matchesFilters(task, { ...createEmptyFilters(), ...filters }, true);
}

describe("matchesFilters", () => {
    it("matches everything without filters", () => {
        expect(matches({})).toBe(true);
    });

    it("searches title and description case-insensitively", () => {
        expect(matches({ search: "  docs " })).toBe(true);
        expect(matches({ search: "api" })).toBe(true);
        expect(matches({ search: "deploy" })).toBe(false);
    });

    it("matches tasks overlapping the date range", () => {
        expect(matches({ dateFrom: "2026-03-15" })).toBe(true);
        expect(matches({ dateFrom: "2026-03-16" })).toBe(false);
        expect(matches({ dateTo: "2026-03-10" })).toBe(true);
        expect(matches({ dateTo: "2026-03-09" })).toBe(false);
        expect(matches({ dateFrom: "2026-03-01", dateTo: "2026-03-31" })).toBe(
            true,
        );
        expect(matches({ dateFrom: "2026-03-12", dateTo: "2026-03-13" })).toBe(
            true,
        );
    });

    it("ignores the date range when it is not applied", () => {
        expect(
            matchesFilters(
                task,
                { ...createEmptyFilters(), dateFrom: "2026-04-01" },
                false,
            ),
        ).toBe(true);
    });

    it("filters by priority and combines filters", () => {
        expect(matches({ priority: "high" })).toBe(true);
        expect(matches({ priority: "low" })).toBe(false);
        expect(matches({ priority: "high", search: "deploy" })).toBe(false);
    });
});

describe("parseStoredFilters", () => {
    it("accepts valid filters and rejects invalid ones", () => {
        const filters = { ...createEmptyFilters(), priority: "low" };

        expect(parseStoredFilters(filters)).toEqual(filters);
        expect(
            parseStoredFilters({ ...filters, priority: "urgent" }),
        ).toBeNull();
        expect(parseStoredFilters({ ...filters, dateFrom: "soon" })).toBeNull();
        expect(parseStoredFilters(null)).toBeNull();
    });
});
