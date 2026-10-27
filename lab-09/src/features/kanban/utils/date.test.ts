import { describe, expect, it } from "vitest";
import { formatDateRange, isBefore, isDateString, today } from "./date";

describe("date utils", () => {
    it("formats today as a local YYYY-MM-DD date", () => {
        expect(today(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    });

    it("validates date strings", () => {
        expect(isDateString("2026-01-05")).toBe(true);
        expect(isDateString("05/01/2026")).toBe(false);
        expect(isDateString(undefined)).toBe(false);
    });

    it("compares dates", () => {
        expect(isBefore("2026-01-04", "2026-01-05")).toBe(true);
        expect(isBefore("2026-01-05", "2026-01-05")).toBe(false);
    });

    it("formats a single day and a range", () => {
        expect(formatDateRange("2026-01-05", "2026-01-05")).toBe("Jan 5");
        expect(formatDateRange("2026-01-05", "2026-02-10")).toBe(
            "Jan 5 → Feb 10",
        );
    });
});
