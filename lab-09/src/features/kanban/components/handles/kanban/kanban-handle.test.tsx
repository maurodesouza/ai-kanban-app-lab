import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { kanbanStore } from "#/features/kanban/store/store";
import { makeBoard } from "#/features/kanban/test/fixtures";
import {
    BOARD_STORAGE_KEY,
    createEmptyBoard,
} from "#/features/kanban/utils/board";
import { today } from "#/features/kanban/utils/date";
import {
    END_DATE_ERROR,
    TITLE_REQUIRED_ERROR,
} from "#/features/kanban/utils/task";
import { actions } from "#/lib/command";
import { KanbanHandle, NO_COLUMN_ERROR } from "./kanban-handle";

function storeBoard(board = makeBoard()) {
    localStorage.setItem(
        BOARD_STORAGE_KEY,
        JSON.stringify({ version: 1, board }),
    );
}

function readStoredBoard() {
    return JSON.parse(localStorage.getItem(BOARD_STORAGE_KEY) ?? "null")?.board;
}

function mountWithBoard(board = makeBoard()) {
    storeBoard(board);
    return render(<KanbanHandle />);
}

describe("KanbanHandle", () => {
    beforeEach(() => {
        kanbanStore.setBoard(createEmptyBoard());
        kanbanStore.setIsHydrated(false);
    });

    describe("hydration and persistence", () => {
        it("seeds To Do, In Progress and Done without stored data", () => {
            render(<KanbanHandle />);

            expect(kanbanStore.isHydrated).toBe(true);
            expect(
                kanbanStore.$orderedColumns.map((column) => column.title),
            ).toEqual(["To Do", "In Progress", "Done"]);
            expect(kanbanStore.tasks).toEqual({});
        });

        it("restores the stored board", () => {
            mountWithBoard();

            expect(kanbanStore.$snapshot).toEqual(makeBoard());
        });

        it.each([
            ["invalid JSON", "{nope"],
            [
                "wrong version",
                JSON.stringify({ version: 99, board: makeBoard() }),
            ],
            [
                "dangling task reference",
                JSON.stringify({
                    version: 1,
                    board: { ...makeBoard(), tasks: {} },
                }),
            ],
            ...(
                [
                    [
                        "unknown priority",
                        (b) => {
                            b.tasks.t1.priority = "urgent" as never;
                        },
                    ],
                    [
                        "missing description",
                        (b) => {
                            delete (b.tasks.t1 as Partial<typeof b.tasks.t1>)
                                .description;
                        },
                    ],
                    [
                        "invalid date",
                        (b) => {
                            b.tasks.t1.endDate = "soon";
                        },
                    ],
                    [
                        "duplicate column ids",
                        (b) => {
                            b.columnOrder.push("a");
                        },
                    ],
                    [
                        "non-string column title",
                        (b) => {
                            b.columns.a.title = 42 as never;
                        },
                    ],
                    [
                        "orphan task",
                        (b) => {
                            b.columns.a.taskIds = ["t1"];
                        },
                    ],
                ] as [string, (board: ReturnType<typeof makeBoard>) => void][]
            ).map(([name, corrupt]) => {
                const board = makeBoard();
                corrupt(board);
                return [name, JSON.stringify({ version: 1, board })];
            }),
        ])("falls back to the seed board on %s", (_, raw) => {
            localStorage.setItem(BOARD_STORAGE_KEY, raw);

            render(<KanbanHandle />);

            expect(kanbanStore.columnOrder).toHaveLength(3);
            expect(kanbanStore.tasks).toEqual({});
        });

        it("writes every change to localStorage", async () => {
            mountWithBoard();

            await act(() => actions.kanban.task.delete({ taskId: "t1" }));

            expect(readStoredBoard().columns.a.taskIds).toEqual(["t2"]);
        });

        it("clears the drop target when the drag leaves the column", async () => {
            mountWithBoard();

            await act(() => actions.kanban.task.dragStart({ taskId: "t1" }));
            await act(() => actions.kanban.task.dragEnter({ columnId: "b" }));
            await act(() => actions.kanban.task.dragLeave({ columnId: "a" }));
            expect(kanbanStore.dropTargetColumnId).toBe("b");

            await act(() => actions.kanban.task.dragLeave({ columnId: "b" }));
            expect(kanbanStore.dropTargetColumnId).toBeNull();
        });

        it("disposes every handler on unmount", async () => {
            const { unmount } = mountWithBoard();
            unmount();

            await actions.kanban.column.create();

            expect(kanbanStore.columnOrder).toHaveLength(3);
        });
    });

    describe("columns", () => {
        it("creates a column at the end", async () => {
            mountWithBoard();

            await act(() => actions.kanban.column.create());

            const last = kanbanStore.$orderedColumns.at(-1);
            expect(kanbanStore.columnOrder).toHaveLength(4);
            expect(last?.title).toBe("New column");
            expect(last?.taskIds).toEqual([]);
        });

        it("renames a column with a trimmed title", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.column.rename({
                    columnId: "a",
                    title: "  Backlog ",
                }),
            );

            expect(kanbanStore.columns.a.title).toBe("Backlog");
        });

        it("ignores an empty title", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.column.rename({ columnId: "a", title: "   " }),
            );

            expect(kanbanStore.columns.a.title).toBe("To Do");
        });

        it("moves a column left and right", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.column.move({
                    columnId: "b",
                    direction: "left",
                }),
            );
            expect(kanbanStore.columnOrder).toEqual(["b", "a", "c"]);

            await act(() =>
                actions.kanban.column.move({
                    columnId: "b",
                    direction: "right",
                }),
            );
            expect(kanbanStore.columnOrder).toEqual(["a", "b", "c"]);
        });

        it("does nothing when moving past the edges", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.column.move({
                    columnId: "a",
                    direction: "left",
                }),
            );
            await act(() =>
                actions.kanban.column.move({
                    columnId: "c",
                    direction: "right",
                }),
            );

            expect(kanbanStore.columnOrder).toEqual(["a", "b", "c"]);
        });

        it("deletes a column together with its tasks", async () => {
            mountWithBoard();

            await act(() => actions.kanban.column.delete({ columnId: "a" }));

            expect(kanbanStore.columnOrder).toEqual(["b", "c"]);
            expect(kanbanStore.columns.a).toBeUndefined();
            expect(Object.keys(kanbanStore.tasks)).toEqual(["t3"]);
        });
    });

    describe("tasks", () => {
        it("creates a task in the first column with today's defaults", async () => {
            mountWithBoard();

            const result = await act(() =>
                actions.kanban.task.create({ title: "  Write tests  " }),
            );

            expect(result).toMatchObject({ ok: true });
            if (!result?.ok) return;

            const task = kanbanStore.tasks[result.taskId];
            expect(task).toMatchObject({
                title: "Write tests",
                description: "",
                priority: "medium",
                startDate: today(),
                endDate: today(),
                columnId: "a",
            });
            expect(kanbanStore.columns.a.taskIds.at(-1)).toBe(result.taskId);
        });

        it("creates a task in a specific column", async () => {
            mountWithBoard();

            const result = await act(() =>
                actions.kanban.task.create({
                    title: "Ship",
                    columnId: "c",
                    priority: "high",
                }),
            );

            expect(
                result?.ok && kanbanStore.tasks[result.taskId],
            ).toMatchObject({
                columnId: "c",
                priority: "high",
            });
        });

        it("rejects an empty title and an end date before the start date", async () => {
            mountWithBoard();

            const result = await act(() =>
                actions.kanban.task.create({
                    title: " ",
                    startDate: "2026-03-10",
                    endDate: "2026-03-09",
                }),
            );

            expect(result).toEqual({
                ok: false,
                errors: {
                    title: TITLE_REQUIRED_ERROR,
                    endDate: END_DATE_ERROR,
                },
            });
            expect(Object.keys(kanbanStore.tasks)).toHaveLength(3);
        });

        it("rejects a global create when there is no column", async () => {
            mountWithBoard({ columnOrder: [], columns: {}, tasks: {} });

            const result = await act(() =>
                actions.kanban.task.create({ title: "Orphan" }),
            );

            expect(result).toEqual({
                ok: false,
                errors: { column: NO_COLUMN_ERROR },
            });
        });

        it("updates a task", async () => {
            mountWithBoard();

            const result = await act(() =>
                actions.kanban.task.update({
                    taskId: "t1",
                    title: "Renamed",
                    description: "Details",
                    priority: "low",
                    startDate: "2026-04-01",
                    endDate: "2026-04-02",
                }),
            );

            expect(result).toEqual({ ok: true, taskId: "t1" });
            expect(kanbanStore.tasks.t1).toMatchObject({
                title: "Renamed",
                description: "Details",
                priority: "low",
                startDate: "2026-04-01",
                endDate: "2026-04-02",
            });
        });

        it("rejects an update with an end date before the start date", async () => {
            mountWithBoard();

            const result = await act(() =>
                actions.kanban.task.update({
                    taskId: "t1",
                    title: "Renamed",
                    description: "",
                    priority: "low",
                    startDate: "2026-04-02",
                    endDate: "2026-04-01",
                }),
            );

            expect(result).toEqual({
                ok: false,
                errors: { endDate: END_DATE_ERROR },
            });
            expect(kanbanStore.tasks.t1.title).toBe("Task t1");
        });

        it("deletes a task", async () => {
            mountWithBoard();

            await act(() => actions.kanban.task.delete({ taskId: "t1" }));

            expect(kanbanStore.tasks.t1).toBeUndefined();
            expect(kanbanStore.columns.a.taskIds).toEqual(["t2"]);
        });

        it("moves a task to another column and ignores the same column", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.task.move({ taskId: "t1", columnId: "c" }),
            );
            expect(kanbanStore.columns.c.taskIds).toEqual(["t1"]);

            const updatedAt = kanbanStore.tasks.t1.updatedAt;
            vi.setSystemTime(new Date("2030-01-01T00:00:00.000Z"));
            await act(() =>
                actions.kanban.task.move({ taskId: "t1", columnId: "c" }),
            );
            vi.useRealTimers();

            expect(kanbanStore.columns.c.taskIds).toEqual(["t1"]);
            expect(kanbanStore.tasks.t1.updatedAt).toBe(updatedAt);
        });

        it("moves a task to the adjacent columns and stops at the edges", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.task.moveAdjacent({
                    taskId: "t1",
                    direction: "left",
                }),
            );
            expect(kanbanStore.tasks.t1.columnId).toBe("a");

            await act(() =>
                actions.kanban.task.moveAdjacent({
                    taskId: "t1",
                    direction: "right",
                }),
            );
            expect(kanbanStore.tasks.t1.columnId).toBe("b");
            expect(kanbanStore.columns.b.taskIds).toEqual(["t3", "t1"]);
        });

        it("sets the priority and ignores unknown priorities", async () => {
            mountWithBoard();

            await act(() =>
                actions.kanban.task.setPriority({
                    taskId: "t1",
                    priority: "high",
                }),
            );
            expect(kanbanStore.tasks.t1.priority).toBe("high");

            await act(() =>
                actions.kanban.task.setPriority({
                    taskId: "t1",
                    priority: "urgent" as never,
                }),
            );
            expect(kanbanStore.tasks.t1.priority).toBe("high");
        });
    });
});
