import type { BoardSnapshot, Column, Task } from "#/features/kanban/types";
import { date } from "#/features/kanban/utils/date/date";
import { priority } from "#/features/kanban/utils/priority/priority";

const STORAGE_KEY = "kanban-lab-10:board";

const DEFAULT_COLUMN_TITLES = ["To Do", "In Progress", "Done"];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringList(value: unknown): value is string[] {
    return (
        Array.isArray(value) && value.every((item) => typeof item === "string")
    );
}

function isColumn(value: unknown): value is Column {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        isStringList(value.taskIds)
    );
}

function isTask(value: unknown): value is Task {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.columnId === "string" &&
        typeof value.title === "string" &&
        typeof value.description === "string" &&
        priority.is(value.priority) &&
        date.is.isoDate(value.startDate) &&
        date.is.isoDate(value.endDate)
    );
}

function parseSnapshot(value: unknown): BoardSnapshot | null {
    if (!isRecord(value) || value.version !== 1) return null;
    if (!isStringList(value.columnOrder)) return null;
    if (!isRecord(value.columns) || !isRecord(value.tasks)) return null;

    const columns = Object.values(value.columns);
    const tasks = Object.values(value.tasks);

    if (!columns.every(isColumn) || !tasks.every(isTask)) return null;

    const snapshot = value as BoardSnapshot;
    const isConsistent = snapshot.columnOrder.every(
        (columnId) =>
            snapshot.columns[columnId]?.taskIds.every(
                (taskId) => snapshot.tasks[taskId]?.columnId === columnId,
            ) ?? false,
    );

    return isConsistent ? snapshot : null;
}

function seedSnapshot(createId: () => string): BoardSnapshot {
    const columns = DEFAULT_COLUMN_TITLES.map((title) =>
        board.columns.create(createId(), title),
    );

    return {
        version: 1,
        columnOrder: columns.map((column) => column.id),
        columns: Object.fromEntries(
            columns.map((column) => [column.id, column]),
        ),
        tasks: {},
    };
}

export const board = {
    storageKey: STORAGE_KEY,

    newColumnTitle: "New column",

    seed: seedSnapshot,

    columns: {
        create: (id: string, title: string): Column => ({
            id,
            title,
            taskIds: [],
        }),
    },

    snapshot: {
        parse: parseSnapshot,
    },
};
