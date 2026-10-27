import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import {
    renderKanbanHandles,
    resetKanbanStore,
} from "#/features/kanban/test/render-kanban-handles";
import { actions } from "#/lib/command";
import { ColumnDeleteDialogHandle } from "./column-delete-dialog-handle";

describe("column delete dialog", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    it("presents the column name and how many tasks will be deleted", async () => {
        renderKanbanHandles();
        render(<ColumnDeleteDialogHandle />);
        const columnId = kanbanStore.columnOrder[0];

        expect(kanbanStore.$columnDeleteDialogUI.open).toBe(false);

        await actions.kanban.columnDeleteDialog.open({ columnId });

        expect(kanbanStore.$columnDeleteDialogUI).toMatchObject({
            open: true,
            title: 'Delete "To Do"?',
            description: "This column will be permanently deleted.",
        });

        await actions.kanban.task.create({ columnId, title: "A" });
        await actions.kanban.task.create({ columnId, title: "B" });

        expect(kanbanStore.$columnDeleteDialogUI.description).toBe(
            "This column and its 2 tasks will be permanently deleted.",
        );
    });

    it("closes without deleting, or deletes on confirm", async () => {
        renderKanbanHandles();
        render(<ColumnDeleteDialogHandle />);
        const columnId = kanbanStore.columnOrder[0];

        await actions.kanban.columnDeleteDialog.open({ columnId });
        await actions.kanban.columnDeleteDialog.change({ open: false });

        expect(kanbanStore.$columnDeleteDialogUI.open).toBe(false);
        expect(kanbanStore.columns[columnId]).toBeDefined();

        await actions.kanban.columnDeleteDialog.open({ columnId });
        await actions.kanban.columnDeleteDialog.confirm();

        expect(kanbanStore.$columnDeleteDialogUI.open).toBe(false);
        expect(kanbanStore.columns[columnId]).toBeUndefined();
    });
});
