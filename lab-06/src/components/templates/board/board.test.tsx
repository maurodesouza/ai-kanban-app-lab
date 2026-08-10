import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { actions } from "#/lib/command";
import { registerKanbanHandlers } from "#/lib/command/handlers";
import { localDate } from "#/lib/validation";
import { getRootStore, resetRootStore } from "#/stores";
import type { TaskDraft } from "#/types/kanban";
import { Board } from "./board";

const draft: TaskDraft = {
    title: "Existing task",
    description: "Existing description",
    priority: "low",
    startDate: "2026-08-10",
    endDate: "2026-08-12",
};

let id = 0;
let disposeHandlers: (() => void) | undefined;

beforeEach(() => {
    localStorage.clear();
    id = 0;
    const stores = resetRootStore({
        createId: () => `generated-${++id}`,
        now: () => new Date("2026-08-10T12:00:00.000Z"),
    });
    disposeHandlers = registerKanbanHandlers({ stores, persistence: false });
});

afterEach(() => {
    cleanup();
    disposeHandlers?.();
    localStorage.clear();
});

function renderBoard() {
    return render(<Board />);
}

async function seedTask(columnId = "todo") {
    const previousTaskIds = new Set(Object.keys(getRootStore().board.tasks));
    await actions.kanban.task.add({ ...draft, columnId });
    const taskId = Object.keys(getRootStore().board.tasks).find(
        (id) => !previousTaskIds.has(id),
    );
    if (!taskId) throw new Error("Could not seed task");
    return taskId;
}

async function openGlobalAdd() {
    fireEvent.click(screen.getAllByRole("button", { name: "Add task" })[0]);
    return screen.findByRole("dialog", { name: "Add task" });
}

describe("Board task interactions", () => {
    it("provides keyboard-accessible drag handles without capturing task actions", async () => {
        const taskId = await seedTask("todo");
        renderBoard();

        const columnHandle = screen.getByRole("button", {
            name: "Drag Todo column",
        });
        const taskHandle = screen.getByRole("button", {
            name: `Drag ${draft.title} task`,
        });
        expect(columnHandle.getAttribute("tabindex")).toBe("0");
        expect(taskHandle.getAttribute("tabindex")).toBe("0");
        expect(columnHandle.getAttribute("aria-roledescription")).toBe(
            "sortable",
        );
        expect(taskHandle.getAttribute("aria-roledescription")).toBe(
            "sortable",
        );

        fireEvent.click(screen.getByRole("button", { name: "Edit task" }));
        await screen.findByRole("dialog", { name: "Edit task" });
        expect(getRootStore().dialog.current).toMatchObject({ taskId });
    });

    it("opens global and per-column add with the correct column defaults", async () => {
        renderBoard();

        await openGlobalAdd();
        expect(
            (screen.getByLabelText("Column") as HTMLSelectElement).value,
        ).toBe("todo");
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(getRootStore().dialog.current).toBeNull());

        const done = screen.getByRole("region", { name: "Done" });
        fireEvent.click(
            within(done).getByRole("button", { name: "Add task to column" }),
        );
        await screen.findByRole("dialog", { name: "Add task" });
        expect(
            (screen.getByLabelText("Column") as HTMLSelectElement).value,
        ).toBe("done");
    });

    it("submits a complete add payload and defaults dates to today", async () => {
        renderBoard();
        await openGlobalAdd();

        expect(
            (screen.getByLabelText("Start date") as HTMLInputElement).value,
        ).toBe(localDate());
        expect(
            (screen.getByLabelText("End date") as HTMLInputElement).value,
        ).toBe(localDate());
        fireEvent.change(screen.getByLabelText("Title"), {
            target: { value: "New task" },
        });
        fireEvent.change(screen.getByLabelText("Description"), {
            target: { value: "Details" },
        });
        fireEvent.change(screen.getByLabelText("Priority"), {
            target: { value: "urgent" },
        });
        fireEvent.change(screen.getByLabelText("Start date"), {
            target: { value: "2026-08-20" },
        });
        fireEvent.change(screen.getByLabelText("End date"), {
            target: { value: "2026-08-22" },
        });
        fireEvent.change(screen.getByLabelText("Column"), {
            target: { value: "in-progress" },
        });
        fireEvent.click(
            within(screen.getByRole("dialog", { name: "Add task" })).getByRole(
                "button",
                { name: "Add task" },
            ),
        );

        await waitFor(() => expect(getRootStore().dialog.current).toBeNull());
        expect(getRootStore().board.tasks["generated-1"]).toMatchObject({
            title: "New task",
            description: "Details",
            priority: "urgent",
            startDate: "2026-08-20",
            endDate: "2026-08-22",
            columnId: "in-progress",
        });
    });

    it("prefills and submits edit, then confirms task deletion", async () => {
        const taskId = await seedTask("in-progress");
        renderBoard();

        fireEvent.click(screen.getByRole("button", { name: "Edit task" }));
        await screen.findByRole("dialog", { name: "Edit task" });
        expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe(
            draft.title,
        );
        fireEvent.change(screen.getByLabelText("Title"), {
            target: { value: "Edited task" },
        });
        fireEvent.change(screen.getByLabelText("Priority"), {
            target: { value: "high" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
        await waitFor(() => expect(getRootStore().dialog.current).toBeNull());
        expect(getRootStore().board.tasks[taskId]).toMatchObject({
            title: "Edited task",
            description: draft.description,
            priority: "high",
            startDate: draft.startDate,
            endDate: draft.endDate,
        });

        fireEvent.click(screen.getByRole("button", { name: "Delete task" }));
        expect(getRootStore().board.tasks[taskId]).toBeDefined();
        await screen.findByRole("dialog", {
            name: /Delete “Edited task” task/,
        });
        fireEvent.click(
            screen.getByRole("button", { name: "Delete permanently" }),
        );
        await waitFor(() =>
            expect(getRootStore().board.tasks[taskId]).toBeUndefined(),
        );
    });

    it("changes priority directly without opening edit and moves only to adjacent columns", async () => {
        const firstTask = await seedTask("todo");
        const lastTask = await seedTask("done");
        renderBoard();

        const firstCard = document.querySelector(
            `[data-task-id="${firstTask}"]`,
        );
        const lastCard = document.querySelector(`[data-task-id="${lastTask}"]`);
        if (!firstCard || !lastCard) throw new Error("Task cards not rendered");
        const priority = within(firstCard as HTMLElement).getByRole(
            "combobox",
            {
                name: "Task priority",
            },
        );
        fireEvent.change(priority, { target: { value: "urgent" } });
        await waitFor(() =>
            expect(getRootStore().board.tasks[firstTask].priority).toBe(
                "urgent",
            ),
        );
        expect(getRootStore().dialog.current).toBeNull();

        expect(
            within(firstCard as HTMLElement).getByRole<HTMLButtonElement>(
                "button",
                { name: "Move task to previous column" },
            ).disabled,
        ).toBe(true);
        expect(
            within(lastCard as HTMLElement).getByRole<HTMLButtonElement>(
                "button",
                { name: "Move task to next column" },
            ).disabled,
        ).toBe(true);
        fireEvent.click(
            within(firstCard as HTMLElement).getByRole("button", {
                name: "Move task to next column",
            }),
        );
        await waitFor(() =>
            expect(getRootStore().board.tasks[firstTask].columnId).toBe(
                "in-progress",
            ),
        );
    });

    it("renders validation errors from the command and leaves state unchanged", async () => {
        const taskId = await seedTask();
        renderBoard();
        fireEvent.click(screen.getByRole("button", { name: "Edit task" }));
        await screen.findByRole("dialog", { name: "Edit task" });

        const original = { ...getRootStore().board.tasks[taskId] };
        fireEvent.change(screen.getByLabelText("End date"), {
            target: { value: "2026-08-01" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

        expect(
            await screen.findByText("End date must be on or after start date"),
        ).toBeDefined();
        expect(getRootStore().board.tasks[taskId]).toEqual(original);
        expect(getRootStore().dialog.current?.type).toBe("taskForm");
    });
});

describe("Board column interactions", () => {
    it("adds a ghost column immediately, focuses inline rename, and commits rename", async () => {
        renderBoard();
        fireEvent.click(screen.getByRole("button", { name: "Add column" }));

        await waitFor(() =>
            expect(getRootStore().board.columnOrder).toContain("generated-1"),
        );
        const input = await screen.findByRole("textbox", {
            name: "Rename New Column column",
        });
        expect(document.activeElement).toBe(input);
        fireEvent.change(input, { target: { value: "Review" } });
        fireEvent.keyDown(input, { key: "Enter" });
        await waitFor(() =>
            expect(getRootStore().board.columns["generated-1"].title).toBe(
                "Review",
            ),
        );
    });

    it("renames, reorders, and requires destructive confirmation before deleting a column", async () => {
        await seedTask("in-progress");
        renderBoard();

        fireEvent.click(
            screen.getByRole("button", { name: "Rename Todo column" }),
        );
        const rename = screen.getByRole("textbox", {
            name: "Rename Todo column",
        });
        fireEvent.change(rename, { target: { value: "Backlog" } });
        fireEvent.blur(rename);
        await waitFor(() =>
            expect(getRootStore().board.columns.todo.title).toBe("Backlog"),
        );

        const todo = screen.getByRole("region", { name: "Backlog" });
        expect(
            within(todo).getByRole<HTMLButtonElement>("button", {
                name: "Move column left",
            }).disabled,
        ).toBe(true);
        fireEvent.click(
            within(todo).getByRole("button", { name: "Move column right" }),
        );
        await waitFor(() =>
            expect(getRootStore().board.columnOrder).toEqual([
                "in-progress",
                "todo",
                "done",
            ]),
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Delete In Progress column",
            }),
        );
        expect(getRootStore().board.columns["in-progress"]).toBeDefined();
        const dialog = await screen.findByRole("dialog", {
            name: /Delete “In Progress” column/,
        });
        expect(dialog.textContent).toContain("all tasks in it");
        fireEvent.click(
            within(dialog).getByRole("button", { name: "Delete permanently" }),
        );
        await waitFor(() =>
            expect(getRootStore().board.columns["in-progress"]).toBeUndefined(),
        );
        expect(Object.keys(getRootStore().board.tasks)).toHaveLength(0);
    });
});
