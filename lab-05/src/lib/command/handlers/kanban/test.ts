import { actions } from "#/lib/command";
import {
    getColumns,
    getFilteredTasks,
    getTaskById,
    kanbanState,
    resetKanbanState,
} from "#/stores/kanban";
import "../index";

describe("kanban command handlers", () => {
    beforeEach(() => resetKanbanState());

    it("adds a column", async () => {
        const before = kanbanState.columns.length;

        await actions.kanban.column.add({ title: "New Column" });

        expect(kanbanState.columns.length).toBe(before + 1);
        expect(kanbanState.columnOrder.length).toBe(before + 1);
    });

    it("removes a column and its tasks", async () => {
        const columnId = kanbanState.columns[0]?.id as string;
        const before = kanbanState.tasks.filter(
            (task) => task.columnId === columnId,
        ).length;

        await actions.kanban.column.remove({ columnId });

        expect(
            kanbanState.columns.some((column) => column.id === columnId),
        ).toBe(false);
        expect(kanbanState.columnOrder).not.toContain(columnId);
        expect(
            kanbanState.tasks.filter((task) => task.columnId === columnId)
                .length,
        ).toBeLessThan(before);
    });

    it("renames a column", async () => {
        const columnId = kanbanState.columns[0]?.id as string;

        await actions.kanban.column.rename({ columnId, title: "Renamed" });

        expect(
            kanbanState.columns.find((column) => column.id === columnId)?.title,
        ).toBe("Renamed");
    });

    it("reorders columns", async () => {
        const [first, second] = kanbanState.columnOrder;

        await actions.kanban.column.reorder({ from: 0, to: 1 });

        expect(kanbanState.columnOrder[0]).toBe(second);
        expect(kanbanState.columnOrder[1]).toBe(first);
    });

    it("adds, edits and removes a task", async () => {
        const columnId = getColumns()[0]?.id as string;

        await actions.kanban.task.add({
            columnId,
            title: "Task X",
            description: "Description",
        });

        const task = getFilteredTasks(columnId).at(-1);

        expect(task?.title).toBe("Task X");

        const id = task?.id as string;

        await actions.kanban.task.edit({
            taskId: id,
            title: "Updated",
            description: "Updated description",
        });

        expect(getTaskById(id)?.title).toBe("Updated");

        await actions.kanban.task.remove({ taskId: id });

        expect(getTaskById(id)).toBeUndefined();
    });

    it("sets and clears filters", async () => {
        await actions.kanban.filter.setText("Welcome");

        expect(kanbanState.filter.text).toBe("Welcome");

        await actions.kanban.filter.setDateRange({
            start: "2026-08-01",
            end: "2026-08-30",
        });

        expect(kanbanState.filter.dateRange.start).toBe("2026-08-01");

        await actions.kanban.filter.setStatus(["todo"]);

        expect(kanbanState.filter.statuses).toEqual(["todo"]);

        await actions.kanban.filter.clear();

        expect(kanbanState.filter.text).toBe("");
        expect(kanbanState.filter.dateRange).toEqual({});
        expect(kanbanState.filter.statuses).toEqual([]);
    });
});
