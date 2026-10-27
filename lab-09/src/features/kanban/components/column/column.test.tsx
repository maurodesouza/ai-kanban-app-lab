import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { makeBoard } from "#/features/kanban/test/fixtures";
import { modalStore } from "#/store/modal/store";
import { renderApp, resetStores } from "#/test/render-app";

function columnTitles() {
    return kanbanStore.$orderedColumns.map((column) => column.title);
}

describe("Board and columns", () => {
    beforeEach(() => {
        resetStores();
    });

    it("renders every column with its title and task count", () => {
        renderApp(makeBoard());

        expect(screen.getByRole("heading", { name: "Kanban" })).toBeVisible();
        expect(screen.getByText("3 columns · 3 tasks")).toBeVisible();
        expect(
            screen.getByRole("button", { name: "Rename column To Do" }),
        ).toBeVisible();
        expect(screen.getByLabelText("2 tasks")).toHaveTextContent("2");
    });

    it("adds a column from the ghost column, in rename mode", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(screen.getByRole("button", { name: "Add column" }));

        const input = screen.getByRole("textbox", { name: "Column name" });
        expect(input).toHaveValue("New column");
        expect(input).toHaveFocus();

        await user.clear(input);
        await user.type(input, "Review{Enter}");

        expect(columnTitles()).toEqual(["To Do", "Doing", "Done", "Review"]);
    });

    it("renames a column on blur and cancels with Escape", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Rename column To Do" }),
        );
        const input = screen.getByRole("textbox", { name: "Column name" });
        await user.clear(input);
        await user.type(input, "Backlog");
        await user.tab();

        expect(columnTitles()[0]).toBe("Backlog");

        await user.click(
            screen.getByRole("button", { name: "Rename column Backlog" }),
        );
        await user.type(
            screen.getByRole("textbox", { name: "Column name" }),
            " changed{Escape}",
        );

        expect(columnTitles()[0]).toBe("Backlog");
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("renames a column with Enter", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Rename column Done" }),
        );
        const input = screen.getByRole("textbox", { name: "Column name" });
        await user.clear(input);
        await user.type(input, "Shipped{Enter}");

        expect(columnTitles()[2]).toBe("Shipped");
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("keeps the previous title when the new one is empty", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Rename column To Do" }),
        );
        await user.clear(screen.getByRole("textbox", { name: "Column name" }));
        await user.keyboard("{Enter}");

        expect(columnTitles()[0]).toBe("To Do");
    });

    it("moves columns and disables the buttons at the edges", async () => {
        const { user } = renderApp(makeBoard());

        expect(
            screen.getByRole("button", { name: "Move column To Do left" }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Move column Done right" }),
        ).toBeDisabled();

        await user.click(
            screen.getByRole("button", { name: "Move column To Do right" }),
        );

        expect(columnTitles()).toEqual(["Doing", "To Do", "Done"]);
    });

    it("deletes a column and its tasks after confirmation", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Delete column To Do" }),
        );

        const dialog = await screen.findByRole("alertdialog");
        expect(within(dialog).getByText('Delete "To Do"?')).toBeInTheDocument();
        expect(
            within(dialog).getByText(
                "This will also delete its 2 tasks. This action cannot be undone.",
            ),
        ).toBeInTheDocument();

        await user.click(
            within(dialog).getByRole("button", { name: "Delete column" }),
        );

        expect(columnTitles()).toEqual(["Doing", "Done"]);
        expect(Object.keys(kanbanStore.tasks)).toEqual(["t3"]);
        expect(modalStore.current).toBeNull();
        expect(kanbanStore.$columnDeleteDialogUI.title).toBe('Delete "To Do"?');
    });

    it("keeps the column when the deletion is cancelled", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Delete column Done" }),
        );
        const dialog = await screen.findByRole("alertdialog");
        expect(
            within(dialog).getByText(
                "This column has no tasks. This action cannot be undone.",
            ),
        ).toBeInTheDocument();

        await user.click(
            within(dialog).getByRole("button", { name: "Cancel" }),
        );

        await waitFor(() => expect(modalStore.current).toBeNull());
        expect(columnTitles()).toEqual(["To Do", "Doing", "Done"]);
    });
});
