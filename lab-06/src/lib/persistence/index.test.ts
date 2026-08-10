import { afterEach, describe, expect, it, vi } from "vitest";
import { createRootStore } from "#/stores";
import type { TaskDraft } from "#/types/kanban";
import {
    createPersistenceSnapshot,
    deserializeSnapshot,
    hydrateStores,
    initializePersistence,
    PERSISTENCE_KEY,
    persistStores,
    type StorageLike,
    serializeSnapshot,
} from "./index";

const draft: TaskDraft = {
    title: "Persisted",
    description: "Task",
    priority: "high",
    startDate: "2025-03-01",
    endDate: "2025-03-02",
};

function createStorage(
    initial?: string,
): StorageLike & { value: string | null } {
    return {
        value: initial ?? null,
        getItem() {
            return this.value;
        },
        setItem(_key, value) {
            this.value = value;
        },
    };
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("persistence", () => {
    it("serializes and deserializes a versioned snapshot", () => {
        const stores = createRootStore();
        const serialized = serializeSnapshot(createPersistenceSnapshot(stores));

        expect(deserializeSnapshot(serialized)).toEqual(
            createPersistenceSnapshot(stores),
        );
        expect(JSON.parse(serialized).version).toBe(1);
    });

    it("round-trips board normalization, task ordering, and theme", () => {
        let id = 0;
        const source = createRootStore({ createId: () => `id-${++id}` });
        const first = source.board.addTask(draft, "todo");
        const second = source.board.addTask(
            { ...draft, title: "Second" },
            "todo",
        );
        if (!first || !second) throw new Error("Tasks were not created");
        source.board.moveTask(second, "todo", 0);
        source.board.addColumn("Later");
        source.theme.set("dark");
        const storage = createStorage(
            serializeSnapshot(createPersistenceSnapshot(source)),
        );
        const reloaded = createRootStore();

        expect(hydrateStores(reloaded, storage)).toBe(true);
        expect(reloaded.board.snapshot).toEqual(source.board.snapshot);
        expect(reloaded.board.columns.todo.taskIds).toEqual([second, first]);
        expect(reloaded.theme.value).toBe("dark");
    });

    it("falls back to the default seed for a version mismatch", () => {
        const stores = createRootStore();
        stores.board.removeColumn("todo");
        stores.theme.set("dark");
        const storage = createStorage(
            JSON.stringify({
                ...createPersistenceSnapshot(createRootStore()),
                version: 999,
            }),
        );

        expect(hydrateStores(stores, storage)).toBe(false);
        expect(stores.board.columnOrder).toEqual([
            "todo",
            "in-progress",
            "done",
        ]);
        expect(stores.theme.value).toBe("light");
    });

    it("falls back without throwing for corrupt data", () => {
        const stores = createRootStore();
        stores.board.removeColumn("done");

        expect(hydrateStores(stores, createStorage("not-json"))).toBe(false);
        expect(stores.board.columnOrder).toEqual([
            "todo",
            "in-progress",
            "done",
        ]);
        expect(deserializeSnapshot("{")).toBeNull();
    });

    it("reacts to board and theme changes but not filter or dialog changes", () => {
        const stores = createRootStore({ createId: () => "task-1" });
        const storage = createStorage();
        const setItem = vi.spyOn(storage, "setItem");
        const dispose = persistStores(stores, storage);
        expect(setItem).toHaveBeenCalledTimes(1);

        stores.filter.setSearch("ignored");
        stores.dialog.openTaskForm({});
        expect(setItem).toHaveBeenCalledTimes(1);

        stores.board.addTask(draft, "todo");
        stores.theme.toggle();
        expect(setItem).toHaveBeenCalledTimes(3);

        dispose();
        stores.theme.toggle();
        expect(setItem).toHaveBeenCalledTimes(3);
        expect(setItem.mock.calls[0][0]).toBe(PERSISTENCE_KEY);
    });

    it("hydrates then persists changes across a simulated reload", () => {
        const storage = createStorage();
        const first = createRootStore({ createId: () => "task-1" });
        const disposeFirst = initializePersistence(first, storage);
        first.board.addTask(draft, "in-progress");
        first.theme.set("dark");
        disposeFirst();

        const second = createRootStore();
        const disposeSecond = initializePersistence(second, storage);

        expect(second.board.tasks["task-1"].title).toBe("Persisted");
        expect(second.board.columns["in-progress"].taskIds).toEqual(["task-1"]);
        expect(second.theme.value).toBe("dark");
        disposeSecond();
    });

    it("does not access localStorage during SSR", () => {
        const getItem = vi.fn();
        vi.stubGlobal("window", undefined);
        vi.stubGlobal("localStorage", { getItem });
        const stores = createRootStore();

        expect(hydrateStores(stores)).toBe(false);
        const dispose = persistStores(stores);

        expect(getItem).not.toHaveBeenCalled();
        expect(() => dispose()).not.toThrow();
    });
});
