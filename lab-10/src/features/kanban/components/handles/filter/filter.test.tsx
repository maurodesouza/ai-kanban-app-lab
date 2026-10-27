import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { renderBoard } from "#/features/kanban/test/render-board";
import { resetKanbanStore } from "#/features/kanban/test/render-kanban-handles";
import { actions } from "#/lib/command";

async function seedTasks() {
    const [todo, doing] = kanbanStore.columnOrder;

    await actions.kanban.task.create({
        columnId: todo,
        title: "Design login",
        description: "Wireframes for auth",
        priority: "high",
        startDate: "2026-10-01",
        endDate: "2026-10-05",
    });
    await actions.kanban.task.create({
        columnId: todo,
        title: "Write docs",
        priority: "low",
        startDate: "2026-10-20",
        endDate: "2026-10-22",
    });
    await actions.kanban.task.create({
        columnId: doing,
        title: "Fix auth bug",
        priority: "high",
        startDate: "2026-10-10",
        endDate: "2026-10-12",
    });
}

function visibleTitles() {
    return kanbanStore.$columnsUI.flatMap((column) =>
        column.tasks.map((task) => task.title),
    );
}

describe("filters", () => {
    beforeEach(() => {
        resetKanbanStore();
    });

    it("filters by search, priority and date range, combined", async () => {
        renderBoard();
        await seedTasks();

        await actions.kanban.filter.setSearch({ search: "auth" });
        expect(visibleTitles()).toEqual(["Design login", "Fix auth bug"]);

        await actions.kanban.filter.setPriority({ priority: "high" });
        await actions.kanban.filter.setDateFrom({ date: "2026-10-06" });
        expect(visibleTitles()).toEqual(["Fix auth bug"]);

        await actions.kanban.filter.clear();
        expect(visibleTitles()).toHaveLength(3);
        expect(kanbanStore.$filterUI.showClear).toBe(false);
    });

    it("keeps the date range valid when a bound crosses the other", async () => {
        renderBoard();

        await actions.kanban.filter.setDateTo({ date: "2026-10-10" });
        await actions.kanban.filter.setDateFrom({ date: "2026-10-15" });
        expect(kanbanStore.filters).toMatchObject({
            dateFrom: "2026-10-15",
            dateTo: "2026-10-15",
        });

        await actions.kanban.filter.setDateTo({ date: "2026-10-01" });
        expect(kanbanStore.filters).toMatchObject({
            dateFrom: "2026-10-01",
            dateTo: "2026-10-01",
        });
    });

    it("shows filtered counts and a filtered-empty hint in columns", async () => {
        renderBoard();
        await seedTasks();

        await actions.kanban.filter.setPriority({ priority: "low" });

        const [todo, doing] = kanbanStore.$columnsUI;
        expect(todo.countLabel).toBe("1 / 2");
        expect(doing).toMatchObject({
            countLabel: "0 / 1",
            isEmpty: true,
            emptyLabel: "No matching tasks",
        });
    });

    it("filters the board from the search box and clears it", async () => {
        const user = userEvent.setup();
        renderBoard();
        await seedTasks();

        await user.type(
            screen.getByRole("searchbox", {
                name: "Search tasks by title or description",
            }),
            "docs",
        );

        const todo = screen.getByRole("region", { name: "To Do" });
        expect(
            within(todo).getByRole("heading", { name: "Write docs" }),
        ).toBeInTheDocument();
        expect(
            within(todo).queryByRole("heading", { name: "Design login" }),
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear filters" }));

        expect(
            within(todo).getByRole("heading", { name: "Design login" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Clear filters" }),
        ).not.toBeInTheDocument();
    });
});
