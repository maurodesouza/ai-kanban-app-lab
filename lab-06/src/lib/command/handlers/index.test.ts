import { describe, expect, it, vi } from "vitest";
import { Command } from "#/lib/command";
import { PERSISTENCE_KEY, type StorageLike } from "#/lib/persistence";
import { TaskDraftValidationError } from "#/lib/validation";
import { createRootStore } from "#/stores";
import type { TaskDraft } from "#/types/kanban";
import { registerKanbanHandlers } from "./index";

const draft: TaskDraft = {
    title: " Task ",
    description: "Description",
    priority: "none",
    startDate: "2025-04-01",
    endDate: "2025-04-02",
};

function setup() {
    let id = 0;
    const stores = createRootStore({
        createId: () => `id-${++id}`,
        now: () => new Date("2025-01-01T00:00:00.000Z"),
    });
    const command = new Command();
    const actions = command.getActionsProxy();
    const dispose = registerKanbanHandlers({
        stores,
        command,
        persistence: false,
    });
    return { actions, command, dispose, stores };
}

describe("registerKanbanHandlers", () => {
    it("registers and dispatches every task handler", async () => {
        const { actions, dispose, stores } = setup();

        await actions.kanban.task.add({ ...draft, columnId: "todo" });
        expect(stores.board.tasks["id-1"].title).toBe("Task");

        await actions.kanban.task.edit({
            taskId: "id-1",
            title: " Edited ",
            description: "Changed",
        });
        expect(stores.board.tasks["id-1"]).toMatchObject({
            title: "Edited",
            description: "Changed",
        });

        await actions.kanban.task.setPriority({
            taskId: "id-1",
            priority: "urgent",
        });
        expect(stores.board.tasks["id-1"].priority).toBe("urgent");

        await actions.kanban.task.moveAdjacent({
            taskId: "id-1",
            direction: "next",
        });
        expect(stores.board.tasks["id-1"].columnId).toBe("in-progress");

        await actions.kanban.task.move({
            taskId: "id-1",
            columnId: "done",
            index: 0,
        });
        expect(stores.board.columns.done.taskIds).toEqual(["id-1"]);

        await actions.kanban.task.remove({ taskId: "id-1" });
        expect(stores.board.tasks["id-1"]).toBeUndefined();
        dispose();
    });

    it("registers and dispatches every column handler", async () => {
        const { actions, dispose, stores } = setup();

        await expect(
            actions.kanban.column.add({ title: " Backlog " }),
        ).resolves.toBe("id-1");
        expect(stores.board.columns["id-1"].title).toBe("Backlog");

        await actions.kanban.column.rename({
            columnId: "id-1",
            title: " Later ",
        });
        expect(stores.board.columns["id-1"].title).toBe("Later");

        await actions.kanban.column.reorder({ from: 3, to: 0 });
        expect(stores.board.columnOrder[0]).toBe("id-1");

        await actions.kanban.column.remove({ columnId: "id-1" });
        expect(stores.board.columns["id-1"]).toBeUndefined();
        dispose();
    });

    it("registers and dispatches every filter handler", async () => {
        const { actions, dispose, stores } = setup();

        await actions.kanban.filter.setSearch("query");
        await actions.kanban.filter.setDateRange({
            start: "2025-01-01",
            end: "2025-01-31",
        });
        await actions.kanban.filter.setPriorities(["high", "urgent"]);
        expect(stores.filter.snapshot).toEqual({
            search: "query",
            dateRange: { start: "2025-01-01", end: "2025-01-31" },
            priorities: ["high", "urgent"],
        });

        await actions.kanban.filter.clear();
        expect(stores.filter.snapshot).toEqual({
            search: "",
            dateRange: {},
            priorities: [],
        });
        dispose();
    });

    it("registers and dispatches every dialog and theme handler", async () => {
        const { actions, dispose, stores } = setup();
        const onConfirm = vi.fn();

        await actions.dialog.openTaskForm({
            taskId: "task-1",
            columnId: "todo",
        });
        expect(stores.dialog.current).toEqual({
            type: "taskForm",
            taskId: "task-1",
            columnId: "todo",
        });

        await actions.dialog.openConfirm({
            title: "Delete",
            description: "Cannot be undone",
            onConfirm,
        });
        expect(stores.dialog.current).toMatchObject({
            type: "confirm",
            title: "Delete",
            description: "Cannot be undone",
        });
        if (stores.dialog.current?.type === "confirm") {
            await stores.dialog.current.onConfirm();
        }
        expect(onConfirm).toHaveBeenCalledOnce();

        await actions.dialog.close();
        expect(stores.dialog.current).toBeNull();

        await actions.theme.set("dark");
        expect(stores.theme.value).toBe("dark");
        await actions.theme.toggle();
        expect(stores.theme.value).toBe("light");
        dispose();
    });

    it("rejects invalid add and edit drafts with renderable typed errors and no mutation", async () => {
        const { actions, dispose, stores } = setup();

        const addError = await actions.kanban.task
            .add({ ...draft, title: " " })
            .catch((error: unknown) => error);
        expect(addError).toBeInstanceOf(TaskDraftValidationError);
        if (!(addError instanceof TaskDraftValidationError)) throw addError;
        expect(addError.errors).toEqual({ title: "Title is required" });
        expect(stores.board.tasks).toEqual({});

        await actions.kanban.task.add(draft);
        const original = { ...stores.board.tasks["id-1"] };
        const editError = await actions.kanban.task
            .edit({ taskId: "id-1", endDate: "2025-03-31" })
            .catch((error: unknown) => error);
        expect(editError).toBeInstanceOf(TaskDraftValidationError);
        if (!(editError instanceof TaskDraftValidationError)) throw editError;
        expect(editError.errors).toEqual({
            endDate: "End date must be on or after start date",
        });
        expect(stores.board.tasks["id-1"]).toEqual(original);
        dispose();
    });

    it("disposes every registration and is safe to dispose twice", async () => {
        const { actions, dispose, stores } = setup();
        dispose();
        dispose();

        await expect(actions.theme.set("dark")).resolves.toBeUndefined();
        await expect(
            actions.kanban.column.add({ title: "Ignored" }),
        ).resolves.toBeUndefined();
        expect(stores.theme.value).toBe("light");
        expect(stores.board.columnOrder).toHaveLength(3);
    });

    it("replaces an existing registration cleanly for StrictMode remounts", async () => {
        const command = new Command();
        const actions = command.getActionsProxy();
        const first = createRootStore();
        const second = createRootStore();
        const disposeFirst = registerKanbanHandlers({
            stores: first,
            command,
            persistence: false,
        });
        const disposeSecond = registerKanbanHandlers({
            stores: second,
            command,
            persistence: false,
        });

        await actions.theme.set("dark");
        expect(first.theme.value).toBe("light");
        expect(second.theme.value).toBe("dark");

        disposeFirst();
        await actions.theme.set("light");
        expect(second.theme.value).toBe("light");
        disposeSecond();
    });

    it("disposes its persistence reaction", async () => {
        const stores = createRootStore();
        const command = new Command();
        const actions = command.getActionsProxy();
        const storage: StorageLike = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
        };
        const dispose = registerKanbanHandlers({ stores, command, storage });
        expect(storage.setItem).toHaveBeenCalledWith(
            PERSISTENCE_KEY,
            expect.any(String),
        );

        dispose();
        vi.mocked(storage.setItem).mockClear();
        const disposeWithoutPersistence = registerKanbanHandlers({
            stores,
            command,
            persistence: false,
        });
        await actions.theme.set("dark");

        expect(stores.theme.value).toBe("dark");
        expect(storage.setItem).not.toHaveBeenCalled();
        disposeWithoutPersistence();
    });
});
