import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import {
    renderKanbanHandles,
    resetKanbanStore,
} from "#/features/kanban/test/render-kanban-handles";
import { date } from "#/features/kanban/utils/date/date";
import { actions } from "#/lib/command";
import { TaskDialogHandle } from "./task-dialog-handle";

function setup() {
    renderKanbanHandles();
    render(<TaskDialogHandle />);
}

describe("task dialog", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    it("opens globally with today's dates and the first column", async () => {
        setup();

        await actions.kanban.taskDialog.openCreate({});
        const ui = kanbanStore.$taskDialogUI;

        expect(ui).toMatchObject({
            open: true,
            title: "New task",
            submitLabel: "Create task",
            showColumnSelect: true,
        });
        expect(ui.column.value).toBe(kanbanStore.columnOrder[0]);
        expect(ui.fields.startDate.value).toBe(date.today());
        expect(ui.fields.endDate.value).toBe(date.today());
        expect(ui.fields.priority.value).toBe("medium");
    });

    it("preselects the column when opened from a column", async () => {
        setup();
        const columnId = kanbanStore.columnOrder[1];

        await actions.kanban.taskDialog.openCreate({ columnId });

        expect(kanbanStore.$taskDialogUI.showColumnSelect).toBe(false);
        expect(kanbanStore.taskDialog.columnId).toBe(columnId);
    });

    it("flags an end date before the start date live and blocks submit", async () => {
        setup();
        await actions.kanban.taskDialog.openCreate({});

        await actions.kanban.taskDialog.setField({
            field: "title",
            value: "Ship",
        });
        await actions.kanban.taskDialog.setField({
            field: "startDate",
            value: "2026-10-27",
        });
        await actions.kanban.taskDialog.setField({
            field: "endDate",
            value: "2026-10-20",
        });

        expect(kanbanStore.$taskDialogUI.fields.endDate).toMatchObject({
            invalid: true,
            error: "End date can't be before the start date",
        });

        await actions.kanban.taskDialog.submit();

        expect(kanbanStore.$taskDialogUI.open).toBe(true);
        expect(kanbanStore.tasks).toEqual({});

        await actions.kanban.taskDialog.setField({
            field: "endDate",
            value: "2026-10-30",
        });

        expect(kanbanStore.$taskDialogUI.fields.endDate.invalid).toBe(false);
    });

    it("shows the title error on submit and clears it while typing", async () => {
        setup();
        await actions.kanban.taskDialog.openCreate({});

        await actions.kanban.taskDialog.submit();

        expect(kanbanStore.$taskDialogUI.fields.title.error).toBe(
            "Title is required",
        );

        await actions.kanban.taskDialog.setField({
            field: "title",
            value: "A",
        });

        expect(kanbanStore.$taskDialogUI.fields.title.invalid).toBe(false);
    });

    it("creates the task in the chosen column and closes", async () => {
        setup();
        const columnId = kanbanStore.columnOrder[2];
        await actions.kanban.taskDialog.openCreate({});

        await actions.kanban.taskDialog.setColumn({ columnId });
        await actions.kanban.taskDialog.setField({
            field: "title",
            value: "Release",
        });
        await actions.kanban.taskDialog.setField({
            field: "priority",
            value: "high",
        });
        await actions.kanban.taskDialog.submit();

        const [created] = Object.values(kanbanStore.tasks);

        expect(kanbanStore.$taskDialogUI.open).toBe(false);
        expect(created).toMatchObject({
            columnId,
            title: "Release",
            priority: "high",
        });
    });

    it("edits an existing task with its values prefilled", async () => {
        setup();
        const result = await actions.kanban.task.create({
            columnId: kanbanStore.columnOrder[0],
            title: "Draft",
            description: "First pass",
        });
        if (!result?.ok) throw new Error("task was not created");

        await actions.kanban.taskDialog.openEdit({ taskId: result.taskId });

        expect(kanbanStore.$taskDialogUI).toMatchObject({
            title: "Edit task",
            submitLabel: "Save changes",
            showColumnSelect: false,
        });
        expect(kanbanStore.$taskDialogUI.fields.description.value).toBe(
            "First pass",
        );

        await actions.kanban.taskDialog.setField({
            field: "title",
            value: "Final",
        });
        await actions.kanban.taskDialog.submit();

        expect(kanbanStore.tasks[result.taskId].title).toBe("Final");
        expect(Object.keys(kanbanStore.tasks)).toHaveLength(1);
    });
});
