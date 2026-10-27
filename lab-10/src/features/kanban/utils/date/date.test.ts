import { afterEach, describe, expect, it, vi } from "vitest";
import { date } from "./date";

describe("date", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns today as a local YYYY-MM-DD date", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 7, 23, 30));

        expect(date.today()).toBe("2026-10-07");
    });

    it("validates ISO dates and compares them", () => {
        expect(date.is.isoDate("2026-10-27")).toBe(true);
        expect(date.is.isoDate("27/10/2026")).toBe(false);
        expect(date.is.before("2026-10-26", "2026-10-27")).toBe(true);
        expect(date.is.before("2026-10-27", "2026-10-27")).toBe(false);
    });

    it("formats a single day and a range", () => {
        expect(date.format.range("2026-10-27", "2026-10-27")).toBe("Oct 27");
        expect(date.format.range("2026-10-27", "2026-11-02")).toBe(
            "Oct 27 – Nov 2",
        );
    });

    it("detects overlap with open-ended bounds", () => {
        const start = "2026-10-10";
        const end = "2026-10-20";

        expect(date.has.overlap(start, end, "", "")).toBe(true);
        expect(date.has.overlap(start, end, "2026-10-20", "")).toBe(true);
        expect(date.has.overlap(start, end, "2026-10-21", "")).toBe(false);
        expect(date.has.overlap(start, end, "", "2026-10-09")).toBe(false);
        expect(date.has.overlap(start, end, "2026-10-01", "2026-10-10")).toBe(
            true,
        );
    });
});
