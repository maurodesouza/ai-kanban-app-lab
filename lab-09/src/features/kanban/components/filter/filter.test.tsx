import { act, fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { makeBoard, makeTask } from "#/features/kanban/test/fixtures";
import type { Board } from "#/features/kanban/types";
import {
    DATE_RANGE_ERROR,
    FILTERS_STORAGE_KEY,
} from "#/features/kanban/utils/filter";
import { actions } from "#/lib/command";
import { renderApp, resetStores } from "#/test/render-app";

function filterBoard(): Board {
    const board = makeBoard();
    board.tasks.t1 = makeTask({
        id: "t1",
        columnId: "a",
        title: "Design login",
        priority: "high",
        startDate: "2026-01-01",
        endDate: "2026-01-05",
    });
    board.tasks.t2 = makeTask({
        id: "t2",
        columnId: "a",
        title: "Fix bug",
        description: "Login redirect loops",
        priority: "low",
        startDate: "2026-02-01",
        endDate: "2026-02-03",
    });
    board.tasks.t3 = makeTask({
        id: "t3",
        columnId: "b",
        title: "Write docs",
        priority: "medium",
        startDate: "2026-03-01",
        endDate: "2026-03-02",
    });
    return board;
}

function visibleTitles() {
    return Object.values(kanbanStore.$columnTaskIds)
        .flat()
        .map((id) => kanbanStore.tasks[id].title);
}

describe("Filters", () => {
    beforeEach(() => {
        resetStores();
    });

    it("searches by title and description", async () => {
        const { user } = renderApp(filterBoard());

        await user.type(
            screen.getByRole("searchbox", { name: "Search tasks" }),
            "LOGIN",
        );

        expect(visibleTitles()).toEqual(["Design login", "Fix bug"]);
        expect(screen.queryByText("Write docs")).not.toBeInTheDocument();
        expect(
            within(
                screen.getByRole("region", { name: "Doing tasks" }),
            ).getByText("No matching tasks"),
        ).toBeVisible();
        expect(screen.getByLabelText("2 of 2 tasks")).toHaveTextContent("2/2");
    });

    it("filters by an overlapping date range", () => {
        renderApp(filterBoard());

        fireEvent.change(screen.getByLabelText("From"), {
            target: { value: "2026-01-04" },
        });
        fireEvent.change(screen.getByLabelText("To"), {
            target: { value: "2026-02-01" },
        });

        expect(visibleTitles()).toEqual(["Design login", "Fix bug"]);
    });

    it("shows an error and ignores an inverted date range", () => {
        renderApp(filterBoard());

        fireEvent.change(screen.getByLabelText("To"), {
            target: { value: "2026-01-01" },
        });
        fireEvent.change(screen.getByLabelText("From"), {
            target: { value: "2026-02-01" },
        });

        expect(screen.getByText(DATE_RANGE_ERROR)).toBeVisible();
        expect(visibleTitles()).toHaveLength(3);
    });

    it("filters by priority and combines with search", async () => {
        renderApp(filterBoard());

        await act(() => actions.kanban.filter.priority({ priority: "low" }));
        expect(visibleTitles()).toEqual(["Fix bug"]);

        await act(() => actions.kanban.filter.search({ value: "design" }));
        expect(visibleTitles()).toEqual([]);
    });

    it("selects a priority from the select", async () => {
        const { user } = renderApp(filterBoard());

        await user.click(screen.getByRole("combobox", { name: "Priority" }));
        await user.click(await screen.findByRole("option", { name: "High" }));

        expect(kanbanStore.priorityFilter).toBe("high");
        expect(visibleTitles()).toEqual(["Design login"]);
    });

    it("clears every filter", async () => {
        const { user } = renderApp(filterBoard());
        const clear = screen.getByRole("button", { name: "Clear filters" });

        expect(clear).toBeDisabled();

        await act(() => actions.kanban.filter.priority({ priority: "low" }));
        await act(() =>
            actions.kanban.filter.dateRange({
                from: "2026-02-01",
                to: "2026-01-01",
            }),
        );
        await user.click(clear);

        expect(visibleTitles()).toHaveLength(3);
        expect(kanbanStore.dateRangeError).toBeNull();
        expect(clear).toBeDisabled();
    });

    it("persists and restores the filters", async () => {
        const { unmount } = renderApp(filterBoard());

        await act(() => actions.kanban.filter.search({ value: "docs" }));
        expect(
            JSON.parse(localStorage.getItem(FILTERS_STORAGE_KEY) ?? ""),
        ).toEqual({
            search: "docs",
            dateFrom: "",
            dateTo: "",
            priority: "all",
        });

        unmount();
        resetStores();
        renderApp();

        expect(kanbanStore.search).toBe("docs");
        expect(visibleTitles()).toEqual(["Write docs"]);
    });

    it("keeps moving filtered tasks between columns", async () => {
        renderApp(filterBoard());

        await act(() => actions.kanban.filter.search({ value: "login" }));
        await act(() =>
            actions.kanban.task.moveAdjacent({
                taskId: "t1",
                direction: "right",
            }),
        );

        expect(kanbanStore.$columnTaskIds.b).toEqual(["t1"]);
    });
});
