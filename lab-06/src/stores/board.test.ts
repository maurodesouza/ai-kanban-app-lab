import { describe, expect, it } from "vitest";
import type { TaskDraft } from "#/types/kanban";
import { BoardStore } from "./board";

const draft: TaskDraft = {
    title: " Task ",
    description: "Description",
    priority: "none",
    startDate: "2025-01-10",
    endDate: "2025-01-12",
};

function createBoard(...ids: string[]) {
    let index = 0;
    return new BoardStore({
        createId: () => ids[index++] ?? `id-${index}`,
        now: () => new Date("2025-01-01T12:00:00.000Z"),
    });
}

function addTask(board: BoardStore, columnId = "todo", value = draft) {
    const taskId = board.addTask(value, columnId);
    if (!taskId) throw new Error("Task was not added");
    return taskId;
}

describe("BoardStore tasks", () => {
    it("seeds normalized Todo, In Progress, and Done columns", () => {
        const board = createBoard();

        expect(board.columnOrder).toEqual(["todo", "in-progress", "done"]);
        expect(Object.values(board.columns).map(({ title }) => title)).toEqual([
            "Todo",
            "In Progress",
            "Done",
        ]);
        expect(board.tasks).toEqual({});
    });

    it("adds and edits a trimmed task while retaining normalized ordering", () => {
        const board = createBoard("task-1");
        const taskId = addTask(board);

        expect(board.columns.todo.taskIds).toEqual(["task-1"]);
        expect(board.tasks[taskId]).toMatchObject({
            id: "task-1",
            columnId: "todo",
            title: "Task",
        });

        board.editTask(taskId, { title: " Updated ", description: "Edited" });

        expect(board.tasks[taskId]).toMatchObject({
            title: "Updated",
            description: "Edited",
        });
        expect(board.columns.todo.taskIds).toEqual([taskId]);
    });

    it("removes a task from both normalized records and taskIds", () => {
        const board = createBoard("task-1");
        const taskId = addTask(board);

        board.removeTask(taskId);

        expect(board.tasks[taskId]).toBeUndefined();
        expect(board.columns.todo.taskIds).toEqual([]);
    });

    it("sets task priority", () => {
        const board = createBoard("task-1");
        const taskId = addTask(board);

        board.setPriority(taskId, "urgent");

        expect(board.tasks[taskId].priority).toBe("urgent");
    });

    it("moves tasks between columns at a clamped target index", () => {
        const board = createBoard("task-1", "task-2", "task-3");
        const first = addTask(board);
        const second = addTask(board, "in-progress");
        const third = addTask(board, "in-progress");

        board.moveTask(first, "in-progress", 1);

        expect(board.columns.todo.taskIds).toEqual([]);
        expect(board.columns["in-progress"].taskIds).toEqual([
            second,
            first,
            third,
        ]);
        expect(board.tasks[first].columnId).toBe("in-progress");

        board.moveTask(first, "done", 99);
        expect(board.columns.done.taskIds).toEqual([first]);
    });

    it("reorders tasks in the same column without duplicates", () => {
        const board = createBoard("task-1", "task-2", "task-3");
        const first = addTask(board);
        const second = addTask(board);
        const third = addTask(board);

        board.moveTask(first, "todo", 2);

        expect(board.columns.todo.taskIds).toEqual([second, third, first]);
    });

    it("moves adjacent and does nothing at board edges", () => {
        const board = createBoard("first", "last");
        const first = addTask(board);
        const last = addTask(board, "done");

        board.moveAdjacent(first, "prev");
        board.moveAdjacent(last, "next");
        expect(board.tasks[first].columnId).toBe("todo");
        expect(board.tasks[last].columnId).toBe("done");

        board.moveAdjacent(first, "next");
        expect(board.tasks[first].columnId).toBe("in-progress");
        expect(board.columns["in-progress"].taskIds).toEqual([first]);
    });

    it("ignores moves with missing tasks or target columns", () => {
        const board = createBoard("task-1");
        const taskId = addTask(board);

        board.moveTask(taskId, "missing", 0);
        board.moveTask("missing", "done", 0);

        expect(board.tasks[taskId].columnId).toBe("todo");
        expect(board.columns.todo.taskIds).toEqual([taskId]);
    });
});

describe("BoardStore columns", () => {
    it("adds and renames columns with trimmed titles", () => {
        const board = createBoard("column-1");

        const columnId = board.addColumn(" Backlog ");
        board.renameColumn(columnId, " Planned ");

        expect(columnId).toBe("column-1");
        expect(board.columns[columnId].title).toBe("Planned");
        expect(board.columnOrder.at(-1)).toBe(columnId);
    });

    it("uses a default title for omitted or blank column titles", () => {
        const board = createBoard("column-1", "column-2");

        expect(board.columns[board.addColumn()].title).toBe("New Column");
        expect(board.columns[board.addColumn("   ")].title).toBe("New Column");
    });

    it("removes a column and cascades deletion to its tasks", () => {
        const board = createBoard("task-1");
        const taskId = addTask(board, "in-progress");

        board.removeColumn("in-progress");

        expect(board.columns["in-progress"]).toBeUndefined();
        expect(board.columnOrder).toEqual(["todo", "done"]);
        expect(board.tasks[taskId]).toBeUndefined();
    });

    it("reorders columns and clamps the target index", () => {
        const board = createBoard();

        board.reorderColumn(0, 99);
        expect(board.columnOrder).toEqual(["in-progress", "done", "todo"]);

        board.reorderColumn(2, -4);
        expect(board.columnOrder).toEqual(["todo", "in-progress", "done"]);
    });

    it("ignores invalid column operations", () => {
        const board = createBoard();

        board.renameColumn("missing", "Title");
        board.removeColumn("missing");
        board.reorderColumn(-1, 2);
        board.reorderColumn(9, 0);

        expect(board.columnOrder).toEqual(["todo", "in-progress", "done"]);
    });
});
