import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ModalHandle } from "#/components/handles/modal/modal-handle";
import { KanbanHandle } from "#/features/kanban/components/handles/kanban/kanban-handle";
import { kanbanStore } from "#/features/kanban/store/store";
import { makeBoard } from "#/features/kanban/test/fixtures";
import { BOARD_STORAGE_KEY } from "#/features/kanban/utils/board";
import { today } from "#/features/kanban/utils/date";
import {
    END_DATE_ERROR,
    TITLE_REQUIRED_ERROR,
} from "#/features/kanban/utils/task";
import { taskFormStore } from "#/features/task-form/store/store";
import { actions } from "#/lib/command";
import { modalStore } from "#/store/modal/store";
import { resetStores } from "#/test/render-app";
import { TaskFormHandle } from "./task-form-handle";

function mount() {
    localStorage.setItem(
        BOARD_STORAGE_KEY,
        JSON.stringify({ version: 1, board: makeBoard() }),
    );

    return render(
        <>
            <ModalHandle />
            <KanbanHandle />
            <TaskFormHandle />
        </>,
    );
}

describe("TaskFormHandle", () => {
    beforeEach(() => {
        resetStores();
    });

    it("opens an empty create form with today's dates", async () => {
        mount();

        await act(() =>
            actions.taskForm.open({ mode: "create", columnId: "b" }),
        );

        expect(modalStore.current).toBe("task-form");
        expect(taskFormStore).toMatchObject({
            mode: "create",
            columnId: "b",
            title: "",
            priority: "medium",
            startDate: today(),
            endDate: today(),
        });
    });

    it("opens the edit form with the task values", async () => {
        mount();

        await act(() => actions.taskForm.open({ mode: "edit", taskId: "t3" }));

        expect(taskFormStore).toMatchObject({
            mode: "edit",
            taskId: "t3",
            title: "Task t3",
            startDate: "2026-01-10",
            endDate: "2026-01-12",
        });
    });

    it("creates the task in the chosen column and closes", async () => {
        mount();

        await act(() =>
            actions.taskForm.open({ mode: "create", columnId: "c" }),
        );
        await act(() =>
            actions.taskForm.change({ field: "title", value: "Release" }),
        );
        await act(() => actions.taskForm.submit());

        const [taskId] = kanbanStore.columns.c.taskIds;
        expect(kanbanStore.tasks[taskId].title).toBe("Release");
        expect(modalStore.current).toBeNull();
    });

    it("updates the task on submit in edit mode", async () => {
        mount();

        await act(() => actions.taskForm.open({ mode: "edit", taskId: "t1" }));
        await act(() =>
            actions.taskForm.change({ field: "priority", value: "high" }),
        );
        await act(() => actions.taskForm.submit());

        expect(kanbanStore.tasks.t1.priority).toBe("high");
        expect(modalStore.current).toBeNull();
    });

    it("shows the title error on submit and clears it while typing", async () => {
        mount();

        await act(() => actions.taskForm.open({ mode: "create" }));
        await act(() => actions.taskForm.submit());

        expect(taskFormStore.errors).toEqual({ title: TITLE_REQUIRED_ERROR });
        expect(modalStore.current).toBe("task-form");

        await act(() =>
            actions.taskForm.change({ field: "title", value: "Fixed" }),
        );

        expect(taskFormStore.errors).toEqual({});
    });

    it("validates the end date live and blocks the submit", async () => {
        mount();

        await act(() => actions.taskForm.open({ mode: "edit", taskId: "t1" }));
        await act(() =>
            actions.taskForm.change({
                field: "startDate",
                value: "2026-02-01",
            }),
        );

        expect(taskFormStore.errors).toEqual({ endDate: END_DATE_ERROR });

        await act(() => actions.taskForm.submit());
        expect(kanbanStore.tasks.t1.startDate).toBe("2026-01-10");

        await act(() =>
            actions.taskForm.change({ field: "endDate", value: "2026-02-03" }),
        );
        expect(taskFormStore.errors).toEqual({});
    });

    it("closes without saving on cancel", async () => {
        mount();

        await act(() => actions.taskForm.open({ mode: "create" }));
        await act(() =>
            actions.taskForm.change({ field: "title", value: "Draft" }),
        );
        await act(() => actions.taskForm.cancel());

        expect(modalStore.current).toBeNull();
        expect(Object.keys(kanbanStore.tasks)).toHaveLength(3);
    });
});
