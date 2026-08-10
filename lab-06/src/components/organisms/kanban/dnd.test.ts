import { describe, expect, it } from "vitest";
import { resolveColumnReorder, resolveTaskMove } from "./dnd";

const columns = {
    todo: { taskIds: ["hidden-a", "task-a", "hidden-b", "task-b"] },
    doing: { taskIds: ["task-c", "task-d"] },
    done: { taskIds: [] },
};

const visibleByColumn: Record<string, string[]> = {
    todo: ["task-a", "task-b"],
    doing: ["task-c", "task-d"],
    done: [],
};
const visibleTaskIds = (columnId: string) => visibleByColumn[columnId] ?? [];

describe("Kanban drag resolution", () => {
    it("resolves a same-column task reorder to the exact full-list index", () => {
        expect(
            resolveTaskMove({
                active: { type: "task", taskId: "task-b", columnId: "todo" },
                over: { type: "task", taskId: "task-a", columnId: "todo" },
                columns,
                visibleTaskIds,
            }),
        ).toEqual({ taskId: "task-b", columnId: "todo", index: 1 });
    });

    it("resolves a cross-column drop over a task", () => {
        expect(
            resolveTaskMove({
                active: { type: "task", taskId: "task-a", columnId: "todo" },
                over: { type: "task", taskId: "task-d", columnId: "doing" },
                columns,
                visibleTaskIds,
                afterOverTask: true,
            }),
        ).toEqual({ taskId: "task-a", columnId: "doing", index: 2 });
    });

    it("resolves a drop into an empty column", () => {
        expect(
            resolveTaskMove({
                active: { type: "task", taskId: "task-a", columnId: "todo" },
                over: { type: "column-drop", columnId: "done" },
                columns,
                visibleTaskIds,
            }),
        ).toEqual({ taskId: "task-a", columnId: "done", index: 0 });
    });

    it("maps filtered visible ordering into full ordering without losing hidden tasks", () => {
        const payload = resolveTaskMove({
            active: { type: "task", taskId: "task-a", columnId: "todo" },
            over: { type: "task", taskId: "task-b", columnId: "todo" },
            columns,
            visibleTaskIds,
            afterOverTask: true,
        });

        expect(payload).toEqual({
            taskId: "task-a",
            columnId: "todo",
            index: 3,
        });
        const reordered = columns.todo.taskIds.filter((id) => id !== "task-a");
        reordered.splice(payload?.index ?? 0, 0, "task-a");
        expect(reordered).toEqual(["hidden-a", "hidden-b", "task-b", "task-a"]);
    });

    it("resolves horizontal column reordering from a plain order array", () => {
        expect(
            resolveColumnReorder(
                { type: "column", columnId: "done" },
                { type: "column", columnId: "todo" },
                ["todo", "doing", "done"],
            ),
        ).toEqual({ from: 2, to: 0 });
    });
});
