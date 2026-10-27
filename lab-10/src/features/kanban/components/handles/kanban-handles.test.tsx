import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import {
    renderKanbanHandles,
    resetKanbanStore,
} from "#/features/kanban/test/render-kanban-handles";
import { board } from "#/features/kanban/utils/board/board";
import { date } from "#/features/kanban/utils/date/date";
import { actions } from "#/lib/command";

function columnTitles() {
    return kanbanStore.$orderedColumns.map((column) => column.title);
}

function storedSnapshot() {
    return JSON.parse(localStorage.getItem(board.storageKey) ?? "null");
}

async function createTask(columnIndex: number, title: string) {
    const result = await actions.kanban.task.create({
        columnId: kanbanStore.columnOrder[columnIndex],
        title,
    });

    if (!result?.ok) throw new Error("task was not created");

    return result.taskId;
}

describe("kanban handles", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    describe("persistence", () => {
        it("seeds the default columns on first run and stores them", () => {
            renderKanbanHandles();

            expect(kanbanStore.$isHydrated).toBe(true);
            expect(columnTitles()).toEqual(["To Do", "In Progress", "Done"]);
            expect(storedSnapshot().columnOrder).toEqual(
                kanbanStore.columnOrder,
            );
        });

        it("restores the stored board after a reload", async () => {
            const first = renderKanbanHandles();
            await actions.kanban.column.rename({
                columnId: kanbanStore.columnOrder[0],
                title: "Backlog",
            });
            await createTask(0, "Persist me");
            first.unmount();
            resetKanbanStore();

            renderKanbanHandles();

            expect(columnTitles()[0]).toBe("Backlog");
            expect(
                Object.values(kanbanStore.tasks).map((task) => task.title),
            ).toEqual(["Persist me"]);
        });

        it("falls back to the seed when storage is corrupt", () => {
            localStorage.setItem(board.storageKey, "{not json");

            renderKanbanHandles();

            expect(columnTitles()).toEqual(["To Do", "In Progress", "Done"]);
        });
    });

    describe("columns", () => {
        it("adds a column at the end and returns its id", async () => {
            renderKanbanHandles();

            const columnId = await actions.kanban.column.add();

            expect(kanbanStore.columnOrder.at(-1)).toBe(columnId);
            expect(columnTitles().at(-1)).toBe("New column");
        });

        it("renames with a trimmed title and ignores empty titles", async () => {
            renderKanbanHandles();
            const columnId = kanbanStore.columnOrder[0];

            await actions.kanban.column.rename({ columnId, title: "  Ideas " });
            await actions.kanban.column.rename({ columnId, title: "   " });

            expect(kanbanStore.columns[columnId].title).toBe("Ideas");
        });

        it("moves columns by index and by offset, clamped to the edges", async () => {
            renderKanbanHandles();
            const [todo] = kanbanStore.columnOrder;

            await actions.kanban.column.moveBy({ columnId: todo, offset: -1 });
            expect(columnTitles()).toEqual(["To Do", "In Progress", "Done"]);

            await actions.kanban.column.moveBy({ columnId: todo, offset: 1 });
            expect(columnTitles()).toEqual(["In Progress", "To Do", "Done"]);

            await actions.kanban.column.move({ columnId: todo, toIndex: 99 });
            expect(columnTitles()).toEqual(["In Progress", "Done", "To Do"]);
        });

        it("deletes a column together with all of its tasks", async () => {
            renderKanbanHandles();
            const columnId = kanbanStore.columnOrder[0];
            await createTask(0, "A");
            await createTask(0, "B");
            const keep = await createTask(1, "C");

            await actions.kanban.column.delete({ columnId });

            expect(kanbanStore.columns[columnId]).toBeUndefined();
            expect(Object.keys(kanbanStore.tasks)).toEqual([keep]);
            expect(Object.keys(storedSnapshot().tasks)).toEqual([keep]);
        });
    });

    describe("tasks", () => {
        it("creates a task with today's dates and the default priority", async () => {
            renderKanbanHandles();

            const taskId = await createTask(0, "Write tests");

            expect(kanbanStore.tasks[taskId]).toMatchObject({
                title: "Write tests",
                priority: "medium",
                startDate: date.today(),
                endDate: date.today(),
            });
            expect(
                kanbanStore.columns[kanbanStore.columnOrder[0]].taskIds,
            ).toEqual([taskId]);
        });

        it("rejects an empty title or an end date before the start date", async () => {
            renderKanbanHandles();
            const columnId = kanbanStore.columnOrder[0];

            const result = await actions.kanban.task.create({
                columnId,
                title: "",
                startDate: "2026-10-27",
                endDate: "2026-10-26",
            });

            expect(result).toEqual({
                ok: false,
                errors: {
                    title: "Title is required",
                    endDate: "End date can't be before the start date",
                },
            });
            expect(kanbanStore.tasks).toEqual({});
        });

        it("updates a task and keeps invalid updates out", async () => {
            renderKanbanHandles();
            const taskId = await createTask(0, "Draft");

            await actions.kanban.task.update({
                taskId,
                title: "Final",
                description: "Ready",
                priority: "high",
                startDate: "2026-11-01",
                endDate: "2026-11-03",
            });
            const invalid = await actions.kanban.task.update({
                taskId,
                endDate: "2026-10-01",
            });

            expect(invalid?.ok).toBe(false);
            expect(kanbanStore.tasks[taskId]).toMatchObject({
                title: "Final",
                description: "Ready",
                priority: "high",
                startDate: "2026-11-01",
                endDate: "2026-11-03",
            });
        });

        it("deletes a task", async () => {
            renderKanbanHandles();
            const taskId = await createTask(0, "Remove me");

            await actions.kanban.task.delete({ taskId });

            expect(kanbanStore.tasks[taskId]).toBeUndefined();
            expect(
                kanbanStore.$tasksByColumn[kanbanStore.columnOrder[0]],
            ).toEqual([]);
        });

        it("moves a task between columns at a given position", async () => {
            renderKanbanHandles();
            const [todo, doing] = kanbanStore.columnOrder;
            const moving = await createTask(0, "Move");
            const existing = await createTask(1, "Stay");

            await actions.kanban.task.move({
                taskId: moving,
                toColumnId: doing,
                toIndex: 0,
            });

            expect(kanbanStore.columns[todo].taskIds).toEqual([]);
            expect(kanbanStore.columns[doing].taskIds).toEqual([
                moving,
                existing,
            ]);
            expect(kanbanStore.tasks[moving].columnId).toBe(doing);
        });

        it("moves a task to adjacent columns and stops at the edges", async () => {
            renderKanbanHandles();
            const [todo, doing] = kanbanStore.columnOrder;
            const taskId = await createTask(0, "Step");

            await actions.kanban.task.moveAdjacent({
                taskId,
                direction: "left",
            });
            expect(kanbanStore.tasks[taskId].columnId).toBe(todo);

            await actions.kanban.task.moveAdjacent({
                taskId,
                direction: "right",
            });
            expect(kanbanStore.tasks[taskId].columnId).toBe(doing);
        });

        it("changes the priority directly", async () => {
            renderKanbanHandles();
            const taskId = await createTask(0, "Urgent");

            await actions.kanban.task.setPriority({ taskId, priority: "low" });

            expect(kanbanStore.tasks[taskId].priority).toBe("low");
        });
    });
});
