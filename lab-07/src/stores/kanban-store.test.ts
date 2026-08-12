import { beforeEach, describe, expect, it } from "vitest";
import { KanbanStore } from "#/stores/kanban-store";
import type { TaskInput } from "#/types/domain";

function makeInput(overrides: Partial<TaskInput> = {}): TaskInput {
    return {
        title: "Test task",
        description: "A description",
        priority: "medium",
        startDate: "2026-01-01",
        endDate: "2026-01-02",
        ...overrides,
    };
}

beforeEach(() => {
    localStorage.clear();
});

function createBoard(): KanbanStore {
    return new KanbanStore();
}

describe("KanbanStore", () => {
    describe("defaults", () => {
        it("seeds three default columns on first run", () => {
            const store = createBoard();
            expect(store.columns).toHaveLength(3);
            expect(store.columns.map((c) => c.title)).toEqual([
                "Backlog",
                "In Progress",
                "Done",
            ]);
        });

        it("starts with empty taskIds in every column", () => {
            const store = createBoard();
            for (const column of store.columns) {
                expect(column.taskIds).toEqual([]);
            }
        });
    });

    describe("addTask", () => {
        it("adds a task to the first column when no columnId is given", () => {
            const store = createBoard();
            const id = store.addTask(makeInput());
            expect(id).toBeDefined();
            expect(store.columns[0].taskIds).toContain(id);
            expect(store.tasks.get(id!)?.title).toBe("Test task");
        });

        it("adds a task to the specified column", () => {
            const store = createBoard();
            const targetId = store.columns[1].id;
            const id = store.addTask(makeInput(), targetId);
            expect(store.columns[1].taskIds).toContain(id);
            expect(store.tasks.get(id!)?.columnId).toBe(targetId);
        });

        it("defaults startDate and endDate to today when empty", () => {
            const store = createBoard();
            const today = new Date().toISOString().slice(0, 10);
            const id = store.addTask(makeInput({ startDate: "", endDate: "" }));
            const task = store.tasks.get(id!);
            expect(task?.startDate).toBe(today);
            expect(task?.endDate).toBe(today);
        });

        it("clamps endDate to startDate when endDate is before startDate", () => {
            const store = createBoard();
            const id = store.addTask(
                makeInput({ startDate: "2026-02-10", endDate: "2026-02-01" }),
            );
            const task = store.tasks.get(id!);
            expect(task?.startDate).toBe("2026-02-10");
            expect(task?.endDate).toBe("2026-02-10");
        });
    });

    describe("editTask", () => {
        it("updates task fields", () => {
            const store = createBoard();
            const id = store.addTask(makeInput());
            store.editTask(id!, makeInput({ title: "Updated" }));
            expect(store.tasks.get(id!)?.title).toBe("Updated");
        });

        it("clamps endDate on edit", () => {
            const store = createBoard();
            const id = store.addTask(makeInput());
            store.editTask(
                id!,
                makeInput({ startDate: "2026-03-10", endDate: "2026-03-01" }),
            );
            expect(store.tasks.get(id!)?.endDate).toBe("2026-03-10");
        });
    });

    describe("deleteTask", () => {
        it("removes the task from the store and its column", () => {
            const store = createBoard();
            const id = store.addTask(makeInput());
            store.deleteTask(id!);
            expect(store.tasks.get(id!)).toBeUndefined();
            expect(store.columns[0].taskIds).not.toContain(id);
        });
    });

    describe("moveTask", () => {
        it("moves a task to another column", () => {
            const store = createBoard();
            const id = store.addTask(makeInput());
            const targetColumnId = store.columns[2].id;

            store.moveTask(id!, targetColumnId);

            expect(store.columns[0].taskIds).not.toContain(id);
            expect(store.columns[2].taskIds).toContain(id);
            expect(store.tasks.get(id!)?.columnId).toBe(targetColumnId);
        });

        it("reorders within a column when toIndex is provided", () => {
            const store = createBoard();
            const colId = store.columns[0].id;
            const a = store.addTask(makeInput({ title: "A" }), colId);
            const b = store.addTask(makeInput({ title: "B" }), colId);
            const c = store.addTask(makeInput({ title: "C" }), colId);

            store.moveTask(c!, colId, 0);

            expect(store.columns[0].taskIds).toEqual([c, a, b]);
        });

        it("appends to the end when toIndex is undefined", () => {
            const store = createBoard();
            const colId = store.columns[0].id;
            const targetColId = store.columns[1].id;
            store.addTask(makeInput({ title: "A" }), colId);
            const b = store.addTask(makeInput({ title: "B" }), colId);

            store.moveTask(b!, targetColId);

            expect(store.columns[1].taskIds).toEqual([b]);
        });

        it("does nothing for a non-existent task", () => {
            const store = createBoard();
            const original = store.columns.map((c) => [...c.taskIds]);
            store.moveTask("nonexistent", store.columns[1].id);
            expect(store.columns.map((c) => [...c.taskIds])).toEqual(original);
        });
    });

    describe("setTaskPriority", () => {
        it("changes the priority without opening the modal", () => {
            const store = createBoard();
            const id = store.addTask(makeInput({ priority: "low" }));
            store.setTaskPriority(id!, "high");
            expect(store.tasks.get(id!)?.priority).toBe("high");
        });
    });

    describe("setFilter / columnsWithTasks", () => {
        it("filters by search term on title", () => {
            const store = createBoard();
            store.addTask(makeInput({ title: "Buy groceries" }));
            store.addTask(makeInput({ title: "Walk dog" }));
            store.setFilter({ search: "groceries" });

            const tasks = store.columnsWithTasks[0].tasks;
            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe("Buy groceries");
        });

        it("filters by search term on description", () => {
            const store = createBoard();
            store.addTask(
                makeInput({ title: "X", description: "Important stuff" }),
            );
            store.addTask(
                makeInput({ title: "Y", description: "Other things" }),
            );
            store.setFilter({ search: "important" });

            const tasks = store.columnsWithTasks[0].tasks;
            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe("X");
        });

        it("filters by priority", () => {
            const store = createBoard();
            store.addTask(makeInput({ priority: "low" }));
            store.addTask(makeInput({ priority: "high" }));
            store.setFilter({ priority: "high" });

            const tasks = store.columnsWithTasks[0].tasks;
            expect(tasks).toHaveLength(1);
            expect(tasks[0].priority).toBe("high");
        });

        it('"all" priority clears the priority filter', () => {
            const store = createBoard();
            store.addTask(makeInput({ priority: "low" }));
            store.addTask(makeInput({ priority: "high" }));
            store.setFilter({ priority: "high" });
            store.setFilter({ priority: "all" });

            expect(store.columnsWithTasks[0].tasks).toHaveLength(2);
        });

        it("filters by date range (overlap)", () => {
            const store = createBoard();
            store.addTask(
                makeInput({ startDate: "2026-01-01", endDate: "2026-01-05" }),
            );
            store.addTask(
                makeInput({ startDate: "2026-02-01", endDate: "2026-02-05" }),
            );
            store.setFilter({
                dateRange: { start: "2026-01-03", end: "2026-01-10" },
            });

            const tasks = store.columnsWithTasks[0].tasks;
            expect(tasks).toHaveLength(1);
            expect(tasks[0].startDate).toBe("2026-01-01");
        });
    });

    describe("addColumn", () => {
        it("creates a column with a default title", () => {
            const store = createBoard();
            const id = store.addColumn();
            expect(id).toBeDefined();
            expect(store.columns.at(-1)?.title).toBe("New Column");
        });

        it("creates a column with a custom title", () => {
            const store = createBoard();
            store.addColumn("Review");
            expect(store.columns.at(-1)?.title).toBe("Review");
        });
    });

    describe("renameColumn", () => {
        it("updates the column title", () => {
            const store = createBoard();
            const colId = store.columns[0].id;
            store.renameColumn(colId, "Todo");
            expect(store.columns[0].title).toBe("Todo");
        });
    });

    describe("moveColumn", () => {
        it("reorders columns", () => {
            const store = createBoard();
            const firstId = store.columns[0].id;
            store.moveColumn(firstId, 2);
            expect(store.columns[2].id).toBe(firstId);
        });

        it("clamps to valid range", () => {
            const store = createBoard();
            const firstId = store.columns[0].id;
            store.moveColumn(firstId, 99);
            expect(store.columns.at(-1)?.id).toBe(firstId);
        });
    });

    describe("deleteColumn", () => {
        it("removes the column and cascades task deletion", () => {
            const store = createBoard();
            const colId = store.columns[0].id;
            const taskId = store.addTask(makeInput(), colId);

            store.deleteColumn(colId);

            expect(store.columns.find((c) => c.id === colId)).toBeUndefined();
            expect(store.tasks.get(taskId!)).toBeUndefined();
        });
    });

    describe("getAdjacentColumnId", () => {
        it("returns null at the left edge", () => {
            const store = createBoard();
            expect(
                store.getAdjacentColumnId(store.columns[0].id, "left"),
            ).toBeNull();
        });

        it("returns null at the right edge", () => {
            const store = createBoard();
            const lastId = store.columns.at(-1)!.id;
            expect(store.getAdjacentColumnId(lastId, "right")).toBeNull();
        });

        it("returns the adjacent column id", () => {
            const store = createBoard();
            expect(
                store.getAdjacentColumnId(store.columns[0].id, "right"),
            ).toBe(store.columns[1].id);
        });
    });
});
