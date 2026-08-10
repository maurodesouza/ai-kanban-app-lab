import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("Board filters", () => {
    async function seed(overrides: Partial<TaskDraft>, columnId = "todo") {
        await actions.kanban.task.add({ ...draft, ...overrides, columnId });
    }

    it("debounces search for 250ms and matches task titles and descriptions", async () => {
        vi.useFakeTimers();
        try {
            await seed({ title: "Searchable title", description: "Other" });
            await seed({ title: "Other title", description: "Hidden keyword" });
            await seed({ title: "Unrelated", description: "Nothing" });
            renderBoard();

            const search = screen.getByRole("searchbox", {
                name: "Search tasks",
            });
            fireEvent.change(search, { target: { value: "searchable" } });
            expect((search as HTMLInputElement).value).toBe("searchable");
            expect(getRootStore().filter.search).toBe("");

            await act(() => vi.advanceTimersByTimeAsync(249));
            expect(getRootStore().filter.search).toBe("");
            await act(() => vi.advanceTimersByTimeAsync(1));
            expect(getRootStore().filter.search).toBe("searchable");
            expect(screen.getByText("Searchable title")).toBeDefined();
            expect(screen.queryByText("Other title")).toBeNull();

            fireEvent.change(search, { target: { value: "keyword" } });
            await act(() => vi.advanceTimersByTimeAsync(250));
            expect(getRootStore().filter.search).toBe("keyword");
            expect(screen.getByText("Other title")).toBeDefined();
            expect(screen.queryByText("Searchable title")).toBeNull();
        } finally {
            vi.useRealTimers();
        }
    });

    it("accepts either date bound independently and both bounds together", async () => {
        renderBoard();
        const start = screen.getByLabelText("Filter start date");
        const end = screen.getByLabelText("Filter end date");

        fireEvent.change(start, { target: { value: "2026-08-11" } });
        await waitFor(() =>
            expect(getRootStore().filter.dateRange).toEqual({
                start: "2026-08-11",
            }),
        );
        fireEvent.change(start, { target: { value: "" } });
        fireEvent.change(end, { target: { value: "2026-08-20" } });
        await waitFor(() =>
            expect(getRootStore().filter.dateRange).toEqual({
                end: "2026-08-20",
            }),
        );
        fireEvent.change(start, { target: { value: "2026-08-15" } });
        await waitFor(() =>
            expect(getRootStore().filter.dateRange).toEqual({
                start: "2026-08-15",
                end: "2026-08-20",
            }),
        );
    });

    it("supports all five priorities as a multi-select and empty means all", async () => {
        await seed({ title: "Low task", priority: "low" });
        await seed({ title: "Urgent task", priority: "urgent" });
        renderBoard();

        fireEvent.click(
            screen.getByRole("button", { name: "Filter by priority" }),
        );
        expect(screen.getAllByRole("checkbox")).toHaveLength(5);
        fireEvent.click(screen.getByRole("checkbox", { name: "Low" }));
        await waitFor(() =>
            expect(getRootStore().filter.priorities).toEqual(["low"]),
        );
        expect(screen.getByText("Low task")).toBeDefined();
        expect(screen.queryByText("Urgent task")).toBeNull();

        fireEvent.click(screen.getByRole("checkbox", { name: "Urgent" }));
        await waitFor(() =>
            expect(getRootStore().filter.priorities).toEqual(["low", "urgent"]),
        );
        expect(screen.getByText("Urgent task")).toBeDefined();

        fireEvent.click(screen.getByRole("checkbox", { name: "Low" }));
        fireEvent.click(screen.getByRole("checkbox", { name: "Urgent" }));
        await waitFor(() =>
            expect(getRootStore().filter.priorities).toEqual([]),
        );
        expect(screen.getByText("Low task")).toBeDefined();
        expect(screen.getByText("Urgent task")).toBeDefined();
    });

    it("combines search, date, and priority filters", async () => {
        await seed({
            title: "Matching task",
            description: "release candidate",
            priority: "high",
            startDate: "2026-08-15",
            endDate: "2026-08-17",
        });
        await seed({
            title: "Wrong priority",
            description: "release candidate",
            priority: "low",
            startDate: "2026-08-15",
            endDate: "2026-08-17",
        });
        await seed({
            title: "Wrong date",
            description: "release candidate",
            priority: "high",
            startDate: "2026-09-01",
            endDate: "2026-09-02",
        });
        await actions.kanban.filter.setSearch("release");
        await actions.kanban.filter.setDateRange({
            start: "2026-08-14",
            end: "2026-08-20",
        });
        await actions.kanban.filter.setPriorities(["high"]);
        renderBoard();

        expect(screen.getByText("Matching task")).toBeDefined();
        expect(screen.queryByText("Wrong priority")).toBeNull();
        expect(screen.queryByText("Wrong date")).toBeNull();
    });

    it("shows clear only for active filters, resets all, and cancels stale search", async () => {
        vi.useFakeTimers();
        try {
            renderBoard();
            expect(
                screen.queryByRole("button", { name: "Clear filters" }),
            ).toBeNull();
            await act(() => actions.kanban.filter.setSearch("active"));
            const clear = screen.getByRole("button", { name: "Clear filters" });
            const search = screen.getByRole("searchbox", {
                name: "Search tasks",
            });
            fireEvent.change(search, { target: { value: "stale" } });
            fireEvent.click(clear);
            await act(() => vi.advanceTimersByTimeAsync(250));

            expect(getRootStore().filter.snapshot).toEqual({
                search: "",
                dateRange: {},
                priorities: [],
            });
            expect((search as HTMLInputElement).value).toBe("");
            expect(
                screen.queryByRole("button", { name: "Clear filters" }),
            ).toBeNull();
        } finally {
            vi.useRealTimers();
        }
    });

    it("keeps every column visible and explicitly displays empty states", async () => {
        await seed({ title: "Only visible task" }, "todo");
        await actions.kanban.filter.setSearch("no matches");
        renderBoard();

        expect(screen.getByRole("region", { name: "Todo" })).toBeDefined();
        expect(
            screen.getByRole("region", { name: "In Progress" }),
        ).toBeDefined();
        expect(screen.getByRole("region", { name: "Done" })).toBeDefined();
        expect(screen.getAllByText("No tasks to display.")).toHaveLength(3);
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
