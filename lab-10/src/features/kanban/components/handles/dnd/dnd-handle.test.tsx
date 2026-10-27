import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { renderBoard } from "#/features/kanban/test/render-board";
import { resetKanbanStore } from "#/features/kanban/test/render-kanban-handles";
import { actions } from "#/lib/command";

async function createTask(columnIndex: number, title: string) {
    const result = await actions.kanban.task.create({
        columnId: kanbanStore.columnOrder[columnIndex],
        title,
    });

    if (!result?.ok) throw new Error("task was not created");

    return result.taskId;
}

describe("DndHandle", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    it("drops a task on an empty column", async () => {
        renderBoard();
        const taskId = await createTask(0, "Drag me");
        const done = kanbanStore.columnOrder[2];

        await actions.kanban.dnd.start({ id: taskId, type: "task" });
        expect(kanbanStore.$dragOverlayUI.task?.title).toBe("Drag me");

        await actions.kanban.dnd.end({
            active: { id: taskId, type: "task" },
            over: { id: done, type: "column" },
        });

        expect(kanbanStore.tasks[taskId].columnId).toBe(done);
        expect(kanbanStore.$dragOverlayUI.task).toBeNull();
    });

    it("drops a task before another task in another column", async () => {
        renderBoard();
        const moving = await createTask(0, "Moving");
        const target = await createTask(1, "Target");

        await actions.kanban.dnd.end({
            active: { id: moving, type: "task" },
            over: { id: target, type: "task" },
        });

        expect(kanbanStore.columns[kanbanStore.columnOrder[1]].taskIds).toEqual(
            [moving, target],
        );
    });

    it("reorders tasks inside the same column", async () => {
        renderBoard();
        const first = await createTask(0, "First");
        const second = await createTask(0, "Second");

        await actions.kanban.dnd.end({
            active: { id: first, type: "task" },
            over: { id: second, type: "task" },
        });

        expect(kanbanStore.columns[kanbanStore.columnOrder[0]].taskIds).toEqual(
            [second, first],
        );
    });

    it("reorders columns and ignores drops outside any target", async () => {
        renderBoard();
        const [todo, doing, done] = kanbanStore.columnOrder;

        await actions.kanban.dnd.end({
            active: { id: todo, type: "column" },
            over: { id: done, type: "column" },
        });
        await actions.kanban.dnd.end({
            active: { id: doing, type: "column" },
            over: null,
        });

        expect(kanbanStore.columnOrder).toEqual([doing, done, todo]);
    });
});
