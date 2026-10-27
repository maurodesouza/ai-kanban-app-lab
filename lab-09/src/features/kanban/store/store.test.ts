import { describe, expect, it } from "vitest";
import { makeBoard } from "../test/fixtures";
import { KanbanStore } from "./store";

function createStore() {
    const store = new KanbanStore();
    store.setBoard(makeBoard());
    return store;
}

describe("KanbanStore", () => {
    it("orders columns and groups tasks by column", () => {
        const store = createStore();

        expect(store.$orderedColumns.map((column) => column.id)).toEqual([
            "a",
            "b",
            "c",
        ]);
        expect(
            Object.fromEntries(
                Object.entries(store.$tasksByColumn).map(([id, tasks]) => [
                    id,
                    tasks.map((task) => task.id),
                ]),
            ),
        ).toEqual({ a: ["t1", "t2"], b: ["t3"], c: [] });
    });

    it("exposes the first column and whether columns exist", () => {
        const store = createStore();

        expect(store.$firstColumnId).toBe("a");
        expect(store.$hasColumns).toBe(true);

        store.setColumnOrder([]);

        expect(store.$firstColumnId).toBeUndefined();
        expect(store.$hasColumns).toBe(false);
    });

    it("exposes column neighbours with empty edges", () => {
        const store = createStore();

        expect(store.$columnNeighbours).toEqual({
            a: { left: undefined, right: "b" },
            b: { left: "a", right: "c" },
            c: { left: "b", right: undefined },
        });
    });

    it("moves a task between columns", () => {
        const store = createStore();

        store.setTaskColumn("t1", "c", "2026-02-01T00:00:00.000Z");

        expect(store.columns.a.taskIds).toEqual(["t2"]);
        expect(store.columns.c.taskIds).toEqual(["t1"]);
        expect(store.tasks.t1.columnId).toBe("c");
    });

    it("produces a plain snapshot of the board", () => {
        const store = createStore();

        expect(store.$snapshot).toEqual(makeBoard());
    });
});
