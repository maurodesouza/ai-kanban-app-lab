import type { Board, Column } from "../types";
import { createId } from "./id";

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

/** Accepts only a stored board whose references are consistent. */
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

    const columnsAreValid = columnOrder.every(
        (columnId) =>
            isRecord(columns[columnId]) &&
            Array.isArray(columns[columnId].taskIds) &&
            columns[columnId].taskIds.every(
                (taskId) => tasks[taskId]?.columnId === columnId,
            ),
    );

    return columnsAreValid ? { columnOrder, columns, tasks } : null;
}
