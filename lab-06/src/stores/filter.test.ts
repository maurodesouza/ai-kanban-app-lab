import { beforeEach, describe, expect, it } from "vitest";
import type { Priority, TaskDraft } from "#/types/kanban";
import { BoardStore } from "./board";
import { FilterStore } from "./filter";

let board: BoardStore;
let filter: FilterStore;
let taskIds: string[];

function draft(
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    priority: Priority,
): TaskDraft {
    return { title, description, startDate, endDate, priority };
}

beforeEach(() => {
    let id = 0;
    board = new BoardStore({ createId: () => `task-${++id}` });
    filter = new FilterStore(board);
    taskIds = [
        board.addTask(
            draft(
                "Plan launch",
                "Coordinate release",
                "2025-01-05",
                "2025-01-10",
                "high",
            ),
            "todo",
        ),
        board.addTask(
            draft(
                "Write docs",
                "LAUNCH guide",
                "2025-01-12",
                "2025-01-15",
                "low",
            ),
            "todo",
        ),
        board.addTask(
            draft(
                "Cleanup",
                "Old records",
                "2025-01-20",
                "2025-01-22",
                "urgent",
            ),
            "todo",
        ),
    ].filter((id): id is string => Boolean(id));
});

describe("FilterStore", () => {
    it("searches title case-insensitively", () => {
        filter.setSearch("PLAN");
        expect(filter.filteredTaskIds("todo")).toEqual([taskIds[0]]);
    });

    it("searches description case-insensitively", () => {
        filter.setSearch("launch GUIDE");
        expect(filter.filteredTaskIds("todo")).toEqual([taskIds[1]]);
    });

    it("matches date intervals with only a start bound", () => {
        filter.setDateRange({ start: "2025-01-14" });
        expect(filter.filteredTaskIds("todo")).toEqual([
            taskIds[1],
            taskIds[2],
        ]);
    });

    it("matches date intervals with only an end bound", () => {
        filter.setDateRange({ end: "2025-01-12" });
        expect(filter.filteredTaskIds("todo")).toEqual([
            taskIds[0],
            taskIds[1],
        ]);
    });

    it("matches intervals intersecting both date bounds inclusively", () => {
        filter.setDateRange({ start: "2025-01-10", end: "2025-01-12" });
        expect(filter.filteredTaskIds("todo")).toEqual([
            taskIds[0],
            taskIds[1],
        ]);
    });

    it("treats empty priorities as all and filters selected priorities", () => {
        expect(filter.filteredTaskIds("todo")).toEqual(taskIds);

        filter.setPriorities(["low", "urgent"]);
        expect(filter.filteredTaskIds("todo")).toEqual([
            taskIds[1],
            taskIds[2],
        ]);
    });

    it("composes search, date, and priority filters", () => {
        filter.setSearch("launch");
        filter.setDateRange({ start: "2025-01-11", end: "2025-01-16" });
        filter.setPriorities(["low", "high"]);

        expect(filter.filteredTaskIds("todo")).toEqual([taskIds[1]]);
    });

    it("preserves column task ordering and clears all filters", () => {
        board.moveTask(taskIds[2], "todo", 0);
        filter.setSearch("old");
        filter.setDateRange({ start: "2025-01-01" });
        filter.setPriorities(["urgent"]);
        expect(filter.filteredTaskIds("todo")).toEqual([taskIds[2]]);

        filter.clear();

        expect(filter.snapshot).toEqual({
            search: "",
            dateRange: {},
            priorities: [],
        });
        expect(filter.filteredTaskIds("todo")).toEqual([
            taskIds[2],
            taskIds[0],
            taskIds[1],
        ]);
    });

    it("returns no IDs for an unknown column", () => {
        expect(filter.filteredTaskIds("missing")).toEqual([]);
    });
});
