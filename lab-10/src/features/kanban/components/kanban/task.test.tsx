import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { renderBoard } from "#/features/kanban/test/render-board";
import { resetKanbanStore } from "#/features/kanban/test/render-kanban-handles";
import { actions } from "#/lib/command";

function column(name: string) {
    return screen.getByRole("region", { name });
}

async function createTask(columnIndex: number, title: string) {
    const result = await actions.kanban.task.create({
        columnId: kanbanStore.columnOrder[columnIndex],
        title,
    });

    if (!result?.ok) throw new Error("task was not created");

    return result.taskId;
}

describe("Kanban tasks", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    it("creates a task from the global button in the chosen column", async () => {
        const user = userEvent.setup();
        renderBoard();

        await user.click(screen.getByRole("button", { name: "New task" }));
        const dialog = await screen.findByRole("dialog");
        await user.type(
            within(dialog).getByRole("textbox", { name: "Title" }),
            "Plan sprint",
        );
        await user.click(
            within(dialog).getByRole("button", { name: "Create task" }),
        );

        await waitFor(() =>
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
        );
        expect(
            within(column("To Do")).getByRole("heading", {
                name: "Plan sprint",
            }),
        ).toBeInTheDocument();
    });

    it("creates a task directly in a column", async () => {
        const user = userEvent.setup();
        renderBoard();

        await user.click(
            screen.getByRole("button", { name: "Add task to Done" }),
        );
        const dialog = await screen.findByRole("dialog");

        expect(within(dialog).queryByText("Column")).not.toBeInTheDocument();

        await user.type(
            within(dialog).getByRole("textbox", { name: "Title" }),
            "Celebrate",
        );
        await user.click(
            within(dialog).getByRole("button", { name: "Create task" }),
        );

        await waitFor(() =>
            expect(
                within(column("Done")).getByRole("heading", {
                    name: "Celebrate",
                }),
            ).toBeInTheDocument(),
        );
    });

    it("shows an error and keeps the dialog open when the end date is before the start date", async () => {
        const user = userEvent.setup();
        renderBoard();

        await user.click(screen.getByRole("button", { name: "New task" }));
        const dialog = await screen.findByRole("dialog");
        await user.type(
            within(dialog).getByRole("textbox", { name: "Title" }),
            "Late",
        );
        await actions.kanban.taskDialog.setField({
            field: "startDate",
            value: "2026-10-27",
        });
        await actions.kanban.taskDialog.setField({
            field: "endDate",
            value: "2026-10-01",
        });
        await user.click(
            within(dialog).getByRole("button", { name: "Create task" }),
        );

        expect(
            await within(dialog).findByText(
                "End date can't be before the start date",
            ),
        ).toBeInTheDocument();
        expect(kanbanStore.tasks).toEqual({});
    });

    it("moves a task to adjacent columns, disabled at the edges", async () => {
        const user = userEvent.setup();
        renderBoard();
        await createTask(0, "Walk");

        expect(
            await screen.findByRole("button", {
                name: "Move Walk to the previous column",
            }),
        ).toBeDisabled();

        await user.click(
            screen.getByRole("button", {
                name: "Move Walk to the next column",
            }),
        );

        expect(
            within(column("In Progress")).getByRole("heading", {
                name: "Walk",
            }),
        ).toBeInTheDocument();
    });

    it("changes the priority from the card without opening the dialog", async () => {
        const user = userEvent.setup();
        renderBoard();
        const taskId = await createTask(0, "Fix bug");

        await user.click(
            await screen.findByRole("button", {
                name: "Priority: Medium. Change priority of Fix bug",
            }),
        );
        await user.click(
            await screen.findByRole("menuitemradio", { name: "High" }),
        );

        expect(kanbanStore.tasks[taskId].priority).toBe("high");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("edits and deletes a task from the card", async () => {
        const user = userEvent.setup();
        renderBoard();
        const taskId = await createTask(0, "Old name");

        await user.click(
            await screen.findByRole("button", { name: "Edit Old name" }),
        );
        const dialog = await screen.findByRole("dialog");
        const title = within(dialog).getByRole("textbox", { name: "Title" });
        await user.clear(title);
        await user.type(title, "New name");
        await user.click(
            within(dialog).getByRole("button", { name: "Save changes" }),
        );

        await waitFor(() =>
            expect(kanbanStore.tasks[taskId].title).toBe("New name"),
        );

        await user.click(
            screen.getByRole("button", { name: "Delete New name" }),
        );

        expect(kanbanStore.tasks[taskId]).toBeUndefined();
        expect(
            within(column("To Do")).getByText("No tasks yet"),
        ).toBeInTheDocument();
    });
});
