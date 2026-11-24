// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { actions } from "#/lib/command";
import { useKanban } from "../../../hooks/use-kanban";
import type { KanbanStore } from "../../../store/store";
import type { Task } from "../../../types";
import { KanbanProvider } from "../../kanban-provider";
import { FilterHandle } from "./filter-handle";

let root: Root;
let store: KanbanStore;

function ReadStore() {
    store = useKanban();
    return null;
}

const task: Task = {
    id: "shipment",
    columnId: "todo",
    title: "Shipment",
    description: "Update the PUBLIC page",
    priority: "high",
    startDate: "2026-11-23",
    endDate: "2026-11-25",
};

beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    root = createRoot(document.createElement("div"));
    await act(() =>
        root.render(
            <KanbanProvider>
                <FilterHandle />
                <ReadStore />
            </KanbanProvider>,
        ),
    );
    store.setBoard({
        ...store.board,
        tasks: [
            task,
            {
                ...task,
                id: "other-priority",
                title: "Public guide",
                description: "Unrelated copy",
                priority: "low",
            },
            {
                ...task,
                id: "other-dates",
                startDate: "2026-11-22",
                endDate: "2026-11-24",
            },
        ],
    });
});

afterEach(async () => {
    await act(() => root.unmount());
    vi.unstubAllGlobals();
});

it("combines description or title matches, priority and inclusive date overlap", async () => {
    await actions.filter.setSearch({ value: "  puBLic " });
    expect(store.$columnUI.get("todo")?.count).toBe(3);

    await actions.filter.setPriority({ value: "high" });
    await actions.filter.setDateFrom({ value: "2026-11-25" });
    expect(store.$tasksByColumnUI.get("todo")?.map(({ id }) => id)).toEqual([
        "shipment",
    ]);
    expect(store.$columnUI.get("todo")?.confirmation.description).toContain(
        "3 tasks",
    );

    await actions.filter.setDateFrom({ value: "" });
    await actions.filter.setDateTo({ value: "2026-11-22" });
    expect(store.$tasksByColumnUI.get("todo")?.map(({ id }) => id)).toEqual([
        "other-dates",
    ]);

    await actions.filter.clear();
    expect(store.$columnUI.get("todo")?.count).toBe(3);
    expect(store.board.tasks).toHaveLength(3);
});

it("keeps the last valid date filter applied while editing reversed dates", async () => {
    await actions.filter.setDateFrom({ value: "2026-11-25" });
    await actions.filter.setDateTo({ value: "2026-11-24" });
    expect(store.$filterUI.rangeInvalid).toBe(true);
    expect(store.$filterUI.dateTo).toBe("2026-11-24");
    expect(store.filters.dateTo).toBe("");
    expect(store.$columnUI.get("todo")?.count).toBe(2);

    await actions.filter.setDateTo({ value: "2026-11-26" });
    expect(store.$filterUI.rangeInvalid).toBe(false);
    expect(store.filters.dateTo).toBe("2026-11-26");
});
