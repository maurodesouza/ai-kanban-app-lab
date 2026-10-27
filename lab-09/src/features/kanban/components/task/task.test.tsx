import {
    act,
    fireEvent,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { makeBoard, makeTask } from "#/features/kanban/test/fixtures";
import { actions } from "#/lib/command";
import { modalStore } from "#/store/modal/store";
import { renderApp, resetStores } from "#/test/render-app";

function column(name: string) {
    return screen.getByRole("region", { name: `${name} tasks` });
}

describe("Tasks", () => {
    beforeEach(() => {
        resetStores();
    });

    it("renders task cards with priority and dates", () => {
        const board = makeBoard();
        board.tasks.t1 = makeTask({
            id: "t1",
            columnId: "a",
            title: "Design",
            description: "Wireframes",
            priority: "high",
        });
        renderApp(board);

        const todo = column("To Do");
        expect(within(todo).getByText("Design")).toBeVisible();
        expect(within(todo).getByText("Wireframes")).toBeVisible();
        expect(
            within(todo).getByRole("button", {
                name: "Change priority of Design (High)",
            }),
        ).toHaveTextContent("High");
        const card = within(todo).getByText("Design").closest("article");
        if (!card) throw new Error("card not found");
        expect(within(card).getByText("Jan 10 → Jan 12")).toBeVisible();
        expect(within(column("Done")).getByText("No tasks yet")).toBeVisible();
    });

    it("adds a task from the header into the first column", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(screen.getByRole("button", { name: "Add task" }));
        const dialog = await screen.findByRole("dialog");
        await user.type(within(dialog).getByLabelText("Title"), "From header");
        await user.click(
            within(dialog).getByRole("button", { name: "Create task" }),
        );

        await waitFor(() => expect(modalStore.current).toBeNull());
        expect(within(column("To Do")).getByText("From header")).toBeVisible();
    });

    it("adds a task directly into a column", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Add task to Done" }),
        );
        const dialog = await screen.findByRole("dialog");
        await user.type(
            within(dialog).getByLabelText("Title"),
            "Ship it{Enter}",
        );

        await waitFor(() =>
            expect(within(column("Done")).getByText("Ship it")).toBeVisible(),
        );
    });

    it("shows the date error and does not save", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(screen.getByRole("button", { name: "Edit Task t1" }));
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByLabelText("Title")).toHaveValue("Task t1");

        fireEvent.change(within(dialog).getByLabelText("End date"), {
            target: { value: "2026-01-01" },
        });

        expect(
            await within(dialog).findByText(
                "End date cannot be before the start date.",
            ),
        ).toBeVisible();
        expect(
            within(dialog).getByRole("button", { name: "Save changes" }),
        ).toBeDisabled();
        expect(kanbanStore.tasks.t1.endDate).toBe("2026-01-12");
    });

    it("deletes a task", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", { name: "Delete Task t1" }),
        );

        expect(screen.queryByText("Task t1")).not.toBeInTheDocument();
    });

    it("moves a task to adjacent columns with buttons", async () => {
        const { user } = renderApp(makeBoard());

        expect(
            screen.getByRole("button", {
                name: "Move Task t1 to the previous column",
            }),
        ).toBeDisabled();

        await user.click(
            screen.getByRole("button", {
                name: "Move Task t1 to the next column",
            }),
        );

        expect(within(column("Doing")).getByText("Task t1")).toBeVisible();
    });

    it("changes the priority from the card", async () => {
        const { user } = renderApp(makeBoard());

        await user.click(
            screen.getByRole("button", {
                name: "Change priority of Task t1 (Medium)",
            }),
        );
        await user.click(
            await screen.findByRole("menuitemradio", { name: "High" }),
        );

        expect(kanbanStore.tasks.t1.priority).toBe("high");
        await waitFor(() => expect(kanbanStore.priorityMenuTaskId).toBeNull());
    });

    it("drags a task into another column", () => {
        renderApp(makeBoard());

        const card = screen.getByText("Task t1").closest("article");
        if (!card) throw new Error("card not found");
        const dataTransfer = { setData: () => {}, effectAllowed: "" };

        fireEvent.dragStart(card, { dataTransfer });
        expect(card).toHaveAttribute("data-dragging");

        fireEvent.dragEnter(column("Done"));
        expect(column("Done")).toHaveAttribute("data-drop-target");

        fireEvent.drop(column("Done"));

        expect(kanbanStore.tasks.t1.columnId).toBe("c");
        expect(kanbanStore.draggingTaskId).toBeNull();
        expect(kanbanStore.dropTargetColumnId).toBeNull();
    });

    it("ignores a drag that ends without a drop", async () => {
        renderApp(makeBoard());

        await act(() => actions.kanban.task.dragStart({ taskId: "t1" }));
        await act(() => actions.kanban.task.dragEnter({ columnId: "b" }));
        await act(() => actions.kanban.task.dragEnd());
        await act(() => actions.kanban.task.drop({ columnId: "b" }));

        expect(kanbanStore.tasks.t1.columnId).toBe("a");
    });
});
