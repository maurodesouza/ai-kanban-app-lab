import { reaction, toJS } from "mobx";
import type { RootStore, Theme } from "#/stores";
import type { BoardState, Priority } from "#/types/kanban";

export const PERSISTENCE_VERSION = 1;
export const PERSISTENCE_KEY = `ai-kanban:v${PERSISTENCE_VERSION}`;

export type PersistenceSnapshot = {
    version: typeof PERSISTENCE_VERSION;
    board: BoardState;
    theme: Theme;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"];

export function createPersistenceSnapshot(
    stores: RootStore,
): PersistenceSnapshot {
    return {
        version: PERSISTENCE_VERSION,
        board: toJS(stores.board.snapshot),
        theme: stores.theme.value,
    };
}

export function serializeSnapshot(snapshot: PersistenceSnapshot): string {
    return JSON.stringify(snapshot);
}

export function deserializeSnapshot(value: string): PersistenceSnapshot | null {
    try {
        const snapshot: unknown = JSON.parse(value);
        return isPersistenceSnapshot(snapshot) ? snapshot : null;
    } catch {
        return null;
    }
}

export function hydrateStores(
    stores: RootStore,
    storage?: StorageLike,
): boolean {
    const target = storage ?? getClientStorage();
    if (!target) return false;

    try {
        const value = target.getItem(PERSISTENCE_KEY);
        if (!value) {
            stores.board.reset();
            stores.theme.reset();
            return false;
        }
        const snapshot = deserializeSnapshot(value);
        if (!snapshot) {
            stores.board.reset();
            stores.theme.reset();
            return false;
        }
        stores.board.replace(snapshot.board);
        stores.theme.set(snapshot.theme);
        return true;
    } catch {
        stores.board.reset();
        stores.theme.reset();
        return false;
    }
}

export function persistStores(
    stores: RootStore,
    storage?: StorageLike,
): () => void {
    const target = storage ?? getClientStorage();
    if (!target) return () => undefined;

    return reaction(
        () => createPersistenceSnapshot(stores),
        (snapshot) => {
            try {
                target.setItem(PERSISTENCE_KEY, serializeSnapshot(snapshot));
            } catch {}
        },
        { fireImmediately: true },
    );
}

export function initializePersistence(
    stores: RootStore,
    storage?: StorageLike,
): () => void {
    hydrateStores(stores, storage);
    return persistStores(stores, storage);
}

function getClientStorage(): StorageLike | undefined {
    if (typeof window === "undefined") return;
    try {
        return window.localStorage;
    } catch {
        return;
    }
}

function isPersistenceSnapshot(value: unknown): value is PersistenceSnapshot {
    if (!isRecord(value) || value.version !== PERSISTENCE_VERSION) return false;
    if (value.theme !== "light" && value.theme !== "dark") return false;
    return isBoardState(value.board);
}

function isBoardState(value: unknown): value is BoardState {
    if (!isRecord(value) || !isRecord(value.columns) || !isRecord(value.tasks))
        return false;
    if (!Array.isArray(value.columnOrder) || !value.columnOrder.every(isString))
        return false;

    const columnIds = new Set(value.columnOrder);
    if (columnIds.size !== value.columnOrder.length) return false;
    if (Object.keys(value.columns).some((id) => !columnIds.has(id)))
        return false;

    const taskColumns = new Map<string, string>();
    for (const columnId of value.columnOrder) {
        const column = value.columns[columnId];
        if (
            !isRecord(column) ||
            column.id !== columnId ||
            !isString(column.title)
        )
            return false;
        if (!Array.isArray(column.taskIds) || !column.taskIds.every(isString))
            return false;
        for (const taskId of column.taskIds) {
            if (taskColumns.has(taskId)) return false;
            taskColumns.set(taskId, columnId);
        }
    }

    const taskIds = Object.keys(value.tasks);
    if (
        taskIds.length !== taskColumns.size ||
        taskIds.some((id) => !taskColumns.has(id))
    ) {
        return false;
    }
    const tasks = value.tasks;
    return taskIds.every((id) => isTask(tasks[id], id, taskColumns.get(id)));
}

function isTask(
    value: unknown,
    id: string,
    columnId: string | undefined,
): boolean {
    return (
        isRecord(value) &&
        value.id === id &&
        value.columnId === columnId &&
        isString(value.title) &&
        isString(value.description) &&
        isString(value.priority) &&
        PRIORITIES.includes(value.priority as Priority) &&
        isString(value.startDate) &&
        isString(value.endDate) &&
        isString(value.createdAt) &&
        isString(value.updatedAt)
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}
