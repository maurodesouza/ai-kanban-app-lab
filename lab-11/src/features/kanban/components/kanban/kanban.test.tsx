// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actions, command } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";
import type { KanbanStore } from "../../store/store";
import { ColumnHandle } from "../handles/column/column-handle";
import { Kanban } from "./kanban";

let root: Root;
let host: HTMLDivElement;
let store: KanbanStore;

function ReadStore() {
    store = useKanban();
    return null;
}

beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    host = document.createElement("div");
    root = createRoot(host);
    await act(() =>
        root.render(
            <Kanban.Provider>
                <ColumnHandle />
                <ReadStore />
                <Kanban.Columns
                    render={(column) => (
                        <section data-column={column.id}>
                            <h2>{column.title}</h2>
                            <Kanban.Tasks
                                columnId={column.id}
                                render={(task) => <strong>{task.title}</strong>}
                            />
                        </section>
                    )}
                />
            </Kanban.Provider>,
        ),
    );
});

afterEach(async () => {
    await act(() => root.unmount());
    vi.unstubAllGlobals();
});

describe("column commands and board composition", () => {
    it("renders caller-owned column and task structures and scopes each task to its column", async () => {
        await act(() =>
            store.setBoard({
                ...store.board,
                tasks: [
                    {
                        id: "task",
                        columnId: "done",
                        title: "Only in Done",
                        description: "",
                        priority: "low",
                        startDate: "2026-11-24",
                        endDate: "2026-11-24",
                    },
                ],
            }),
        );

        expect(
            host.querySelector('[data-column="done"] strong')?.textContent,
        ).toBe("Only in Done");
        expect(host.querySelector('[data-column="todo"] strong')).toBeNull();
    });

    it("appends from an empty board, validates rename, and respects reorder boundaries", async () => {
        const disposeOpen = command.handle("modal.open", async () => {});
        const disposeClose = command.handle("modal.close", async () => {});
        try {
            await act(async () => {
                store.setBoard({ columns: [], tasks: [] });
                await actions.column.create();
                await actions.column.create();
                const [first, second] = store.board.columns;
                expect(first.title).toBe("New column");
                await actions.column.openRename({ columnId: first.id });
                await actions.column.changeTitle({ title: "   " });
                await actions.column.rename();
                expect(store.$columnRenameUI?.error).toBe(
                    "Enter a column name.",
                );
                await actions.column.changeTitle({ title: "  Backlog  " });
                await actions.column.rename();
                await actions.column.move({
                    columnId: first.id,
                    direction: "previous",
                });
                expect(store.board.columns.map((column) => column.id)).toEqual([
                    first.id,
                    second.id,
                ]);
                await actions.column.move({
                    columnId: first.id,
                    direction: "next",
                });
                expect(
                    store.board.columns.map((column) => column.title),
                ).toEqual(["New column", "Backlog"]);
            });
        } finally {
            disposeOpen();
            disposeClose();
        }
    });

    it("counts attached tasks and waits for the confirm command before deleting", async () => {
        const open = vi.fn(async () => {});
        const disposeOpen = command.handle("modal.open", open);
        const disposeClose = command.handle("modal.close", async () => {});
        const task = {
            title: "Task",
            description: "",
            priority: "low",
            startDate: "2026-11-24",
            endDate: "2026-11-24",
        } as const;

        try {
            await act(async () => {
                store.setBoard({
                    ...store.board,
                    tasks: [
                        { ...task, id: "remove-me", columnId: "todo" },
                        { ...task, id: "keep-me", columnId: "done" },
                    ],
                });
                await actions.column.requestDelete({ columnId: "todo" });
                expect(open).toHaveBeenCalledTimes(1);
                expect(
                    store.$columnUI.get("todo")?.confirmation.description,
                ).toContain("1 task");
                await actions.modal.close();
                expect(store.board.tasks).toHaveLength(2);
                await actions.column.requestDelete({ columnId: "todo" });
                await actions.column.delete({ columnId: "todo" });
                expect(store.board.columns.map((column) => column.id)).toEqual([
                    "in-progress",
                    "done",
                ]);
                expect(store.board.tasks.map((task) => task.id)).toEqual([
                    "keep-me",
                ]);
            });
        } finally {
            disposeOpen();
            disposeClose();
        }
    });
});
