import type { Board, Column, Task } from "../types";
import { isDateString } from "./date";
import { createId } from "./id";
import { isPriority } from "./priority";

export const BOARD_STORAGE_KEY = "lab-09:kanban";
export const BOARD_STORAGE_VERSION = 1;

export const DEFAULT_COLUMN_TITLE = "New column";

const SEED_COLUMN_TITLES = ["To Do", "In Progress", "Done"];

export function createColumn(title = DEFAULT_COLUMN_TITLE): Column {
    return { id: createId(), title, taskIds: [] };
}

export function createEmptyBoard(): Board {
    return { columnOrder: [], columns: {}, tasks: {} };
}

export function createSeedBoard(): Board {
    const columns = SEED_COLUMN_TITLES.map((title) => createColumn(title));

    return {
        columnOrder: columns.map((column) => column.id),
        columns: Object.fromEntries(
            columns.map((column) => [column.id, column]),
        ),
        tasks: {},
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTask(value: unknown, id: string): value is Task {
    if (!isRecord(value)) return false;

    return (
        value.id === id &&
        typeof value.title === "string" &&
        typeof value.description === "string" &&
        isPriority(value.priority) &&
        isDateString(value.startDate) &&
        isDateString(value.endDate) &&
        typeof value.columnId === "string" &&
        typeof value.createdAt === "string" &&
        typeof value.updatedAt === "string"
    );
}

function isColumn(value: unknown, id: string): value is Column {
    return (
        isRecord(value) &&
        value.id === id &&
        typeof value.title === "string" &&
        value.title.trim() !== "" &&
        Array.isArray(value.taskIds)
    );
}

/** Accepts only a stored board whose records and references are all valid. */
export function parseStoredBoard(value: unknown): Board | null {
    if (!isRecord(value) || value.version !== BOARD_STORAGE_VERSION)
        return null;

    const board = value.board;

    if (
        !isRecord(board) ||
        !Array.isArray(board.columnOrder) ||
        !isRecord(board.columns) ||
        !isRecord(board.tasks)
    )
        return null;

    const { columnOrder, columns, tasks } = board as Board;

    if (new Set(columnOrder).size !== columnOrder.length) return null;
    if (Object.keys(columns).length !== columnOrder.length) return null;

    const listedTaskIds = new Set<string>();

    for (const columnId of columnOrder) {
        const column = columns[columnId];

        if (!isColumn(column, columnId)) return null;

        for (const taskId of column.taskIds) {
            if (listedTaskIds.has(taskId)) return null;
            if (!isTask(tasks[taskId], taskId)) return null;
            if (tasks[taskId].columnId !== columnId) return null;

            listedTaskIds.add(taskId);
        }
    }

    if (Object.keys(tasks).length !== listedTaskIds.size) return null;

    return { columnOrder, columns, tasks };
}
