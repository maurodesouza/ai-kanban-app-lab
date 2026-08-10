import { describe, expect, it } from "vitest";
import type { TaskDraft } from "#/types/kanban";
import { createTaskDraftDefaults, localDate, validateTaskDraft } from "./index";

const validDraft: TaskDraft = {
    title: " Task ",
    description: "Description",
    priority: "medium",
    startDate: "2025-02-01",
    endDate: "2025-02-02",
};

describe("task validation", () => {
    it("formats a local date without UTC conversion", () => {
        expect(localDate(new Date(2025, 0, 9, 23, 30))).toBe("2025-01-09");
    });

    it("creates defaults using the supplied local day", () => {
        expect(createTaskDraftDefaults(new Date(2025, 6, 4))).toEqual({
            title: "",
            description: "",
            priority: "none",
            startDate: "2025-07-04",
            endDate: "2025-07-04",
        });
    });

    it("requires a title and returns a field-level error", () => {
        expect(validateTaskDraft({ ...validDraft, title: "   " })).toEqual({
            success: false,
            errors: { title: "Title is required" },
        });
    });

    it("rejects an end date before the start date", () => {
        expect(
            validateTaskDraft({
                ...validDraft,
                startDate: "2025-02-03",
                endDate: "2025-02-02",
            }),
        ).toEqual({
            success: false,
            errors: { endDate: "End date must be on or after start date" },
        });
    });

    it("returns a typed valid result with a trimmed title", () => {
        expect(validateTaskDraft(validDraft)).toEqual({
            success: true,
            data: { ...validDraft, title: "Task" },
        });
    });
});
