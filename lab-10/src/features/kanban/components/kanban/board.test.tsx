import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { renderBoard } from "#/features/kanban/test/render-board";
import { resetKanbanStore } from "#/features/kanban/test/render-kanban-handles";
import { actions } from "#/lib/command";

function columnHeadings() {
    return screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent);
}

describe("Kanban board", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    it("renders the seeded columns and the ghost column", () => {
        renderBoard();

        expect(columnHeadings()).toEqual(["To Do", "In Progress", "Done"]);
        expect(
            screen.getByRole("button", { name: "Add column" }),
        ).toBeInTheDocument();
    });

    it("adds a column from the ghost column straight into rename mode", async () => {
        const user = userEvent.setup();
        renderBoard();

        await user.click(screen.getByRole("button", { name: "Add column" }));
        const input = await screen.findByRole("textbox", {
            name: "Column name",
        });
        await user.clear(input);
        await user.type(input, "Review{Enter}");

        expect(columnHeadings()).toEqual([
            "To Do",
            "In Progress",
            "Done",
            "Review",
        ]);
    });

    it("renames a column and restores the title on Escape", async () => {
        const user = userEvent.setup();
        renderBoard();

        await user.dblClick(screen.getByRole("heading", { name: "To Do" }));
        const input = screen.getByRole("textbox", { name: "Column name" });
        await user.clear(input);
        await user.type(input, "Backlog{Escape}");

        expect(columnHeadings()[0]).toBe("To Do");

        await user.dblClick(screen.getByRole("heading", { name: "To Do" }));
        await user.clear(screen.getByRole("textbox", { name: "Column name" }));
        await user.type(
            screen.getByRole("textbox", { name: "Column name" }),
            "Backlog{Enter}",
        );

        expect(columnHeadings()[0]).toBe("Backlog");
    });

    it("moves columns with the arrows, disabled at the edges", async () => {
        const user = userEvent.setup();
        renderBoard();

        expect(
            screen.getByRole("button", { name: "Move column To Do left" }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Move column Done right" }),
        ).toBeDisabled();

        await user.click(
            screen.getByRole("button", { name: "Move column To Do right" }),
        );

        expect(columnHeadings()).toEqual(["In Progress", "To Do", "Done"]);
    });

    it("asks for confirmation before deleting a column and its tasks", async () => {
        const user = userEvent.setup();
        renderBoard();
        const columnId = kanbanStore.columnOrder[0];

        await actions.kanban.task.create({ columnId, title: "Doomed" });

        await user.click(
            screen.getByRole("button", { name: "Column To Do options" }),
        );
        await user.click(
            await screen.findByRole("menuitem", { name: "Delete column" }),
        );
        const dialog = await screen.findByRole("alertdialog");

        expect(
            within(dialog).getByText(
                "This column and its 1 task will be permanently deleted.",
            ),
        ).toBeInTheDocument();

        await user.click(
            within(dialog).getByRole("button", { name: "Cancel" }),
        );
        await waitFor(() =>
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
        );
        expect(columnHeadings()).toContain("To Do");

        await user.click(
            screen.getByRole("button", { name: "Column To Do options" }),
        );
        await user.click(
            await screen.findByRole("menuitem", { name: "Delete column" }),
        );
        await user.click(
            within(await screen.findByRole("alertdialog")).getByRole("button", {
                name: "Delete column",
            }),
        );

        await waitFor(() => expect(columnHeadings()).not.toContain("To Do"));
        expect(kanbanStore.tasks).toEqual({});
    });
});
