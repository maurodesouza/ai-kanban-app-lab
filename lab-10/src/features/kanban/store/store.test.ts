import { describe, expect, it } from "vitest";
import { KanbanStore } from "./store";

function createStore() {
    const store = new KanbanStore();

    store.hydrate({
        version: 1,
        columnOrder: ["todo", "done"],
        columns: {
            todo: { id: "todo", title: "To Do", taskIds: ["t1"] },
            done: { id: "done", title: "Done", taskIds: [] },
        },
        tasks: {
            t1: {
                id: "t1",
                columnId: "todo",
                title: "Plan",
                description: "",
                priority: "high",
                startDate: "2026-10-27",
                endDate: "2026-10-29",
                createdAt: "now",
                updatedAt: "now",
            },
        },
    });

    return store;
}

describe("KanbanStore", () => {
    it("orders columns and groups their tasks", () => {
        const store = createStore();

        expect(store.$orderedColumns.map((column) => column.id)).toEqual([
            "todo",
            "done",
        ]);
        expect(store.$tasksByColumn.todo.map((task) => task.id)).toEqual([
            "t1",
        ]);
        expect(store.$firstColumnId).toBe("todo");
    });

    it("prepares the column and task view models", () => {
        const [todo, done] = createStore().$columnsUI;

        expect(todo).toMatchObject({
            title: "To Do",
            taskCount: 1,
            canMoveLeft: false,
            canMoveRight: true,
        });
        expect(done).toMatchObject({ canMoveLeft: true, canMoveRight: false });
        expect(todo.tasks[0]).toMatchObject({
            title: "Plan",
            hasDescription: false,
            priorityLabel: "High",
            priorityPalette: "palette-rose",
            dateRangeLabel: "Oct 27 – Oct 29",
            canMoveLeft: false,
            canMoveRight: true,
        });
    });

    it("places a task in another column at a given index", () => {
        const store = createStore();

        store.placeTask("t1", "done", 0);

        expect(store.columns.todo.taskIds).toEqual([]);
        expect(store.columns.done.taskIds).toEqual(["t1"]);
        expect(store.tasks.t1.columnId).toBe("done");
    });

    it("produces a detached, serializable snapshot", () => {
        const store = createStore();
        const snapshot = store.$snapshot;

        store.setColumnTitle("todo", "Backlog");

        expect(snapshot.columns.todo.title).toBe("To Do");
        expect(JSON.parse(JSON.stringify(store.$snapshot))).toEqual(
            store.$snapshot,
        );
    });
});
