// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { actions, command } from "#/lib/command";
import { useKanban } from "../../../hooks/use-kanban";
import type { KanbanStore } from "../../../store/store";
import { KanbanProvider } from "../../kanban-provider";
import { TaskHandle } from "./task-handle";

let root: Root;
let store: KanbanStore;
let disposeModal: () => void;

function ReadStore() {
    store = useKanban();
    return null;
}

beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const disposeOpen = command.handle("modal.open", async () => {});
    const disposeClose = command.handle("modal.close", async () => {});
    disposeModal = () => {
        disposeOpen();
        disposeClose();
    };
    root = createRoot(document.createElement("div"));
    await act(() =>
        root.render(
            <KanbanProvider>
                <TaskHandle />
                <ReadStore />
            </KanbanProvider>,
        ),
    );
});

afterEach(async () => {
    await act(() => root.unmount());
    disposeModal();
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

it("defaults to today locally and validates the title and both dates before saving", async () => {
    vi.setSystemTime(new Date(2026, 10, 24, 23, 59));
    await actions.task.openCreate({});
    expect(store.$taskDraftUI).toMatchObject({
        chooseColumn: true,
        values: {
            columnId: "todo",
            startDate: "2026-11-24",
            endDate: "2026-11-24",
            priority: "medium",
        },
    });

    await actions.task.changeField({ field: "startDate", value: "2026-11-25" });
    await actions.task.submit();
    expect(store.board.tasks).toHaveLength(0);
    expect(store.taskDraft?.errors).toMatchObject({
        title: "Enter a task title.",
        endDate: "End date must be on or after the start date.",
    });

    await actions.task.changeField({ field: "title", value: "  Launch  " });
    await actions.task.changeField({ field: "endDate", value: "2026-11-25" });
    await actions.task.changeField({ field: "columnId", value: "done" });
    await actions.task.submit();
    expect(store.board.tasks[0]).toMatchObject({
        columnId: "done",
        title: "Launch",
    });
});

it("creates in a fixed column and edits with a stable ID and destination", async () => {
    await actions.task.openCreate({ columnId: "in-progress" });
    expect(store.$taskDraftUI?.chooseColumn).toBe(false);
    await actions.task.changeField({ field: "columnId", value: "done" });
    await actions.task.changeField({ field: "title", value: "Launch" });
    await actions.task.submit();

    const [created] = store.board.tasks;
    expect(created.columnId).toBe("in-progress");

    await actions.task.openEdit({ taskId: created.id });
    expect(store.taskDraft?.values.title).toBe("Launch");
    await actions.task.changeField({
        field: "description",
        value: "Ready for review",
    });
    await actions.task.submit();
    expect(store.board.tasks[0]).toEqual({
        ...created,
        description: "Ready for review",
    });

    await actions.task.setPriority({ taskId: created.id, priority: "high" });
    expect(store.$taskUI.get(created.id)?.priority).toBe("high");
    expect(store.$taskDraftUI).toBeNull();
    await actions.task.delete({ taskId: created.id });
    expect(store.board.tasks).toHaveLength(0);
});

it("shares destination rules between adjacent movement and drag-and-drop", async () => {
    const moving = {
        id: "moving",
        columnId: "todo",
        title: "Move me",
        description: "Still intact",
        priority: "high",
        startDate: "2026-11-24",
        endDate: "2026-11-25",
    } as const;
    const destinationTask = {
        ...moving,
        id: "existing",
        columnId: "in-progress",
    };
    store.setBoard({ ...store.board, tasks: [moving, destinationTask] });

    await actions.task.move({ taskId: moving.id, direction: "previous" });
    expect(store.board.tasks[0]).toEqual(moving);
    await actions.task.move({ taskId: moving.id, direction: "next" });
    expect(
        store.$tasksByColumnUI.get("in-progress")?.map((task) => task.id),
    ).toEqual(["existing", "moving"]);

    await actions.task.dragStart({ taskId: moving.id });
    await actions.task.dragEnd({ taskId: moving.id });
    await actions.task.drop({ columnId: "done" });
    expect(store.$tasksByColumnUI.get("done")).toBeUndefined();

    await actions.task.dragStart({ taskId: moving.id });
    await actions.task.drop({ columnId: "done" });
    expect(store.board.tasks).toEqual([
        destinationTask,
        { ...moving, columnId: "done" },
    ]);
    expect(store.draggedTaskId).toBeNull();
});
