import { createId } from "#/utils/random/id";
import type { BoardData, ColumnData, FilterData } from "./types";

const DEFAULT_COLUMN_TITLES = ["Backlog", "In Progress", "Done"];

export function emptyFilter(): FilterData {
    return {
        search: "",
        dateFrom: null,
        dateTo: null,
        priority: "all",
    };
}

export function createDefaultColumns(boardId: string): {
    columns: Record<string, ColumnData>;
    columnOrder: string[];
} {
    const columns: Record<string, ColumnData> = {};
    const columnOrder: string[] = [];

    for (const title of DEFAULT_COLUMN_TITLES) {
        const id = createId("col");
        columns[id] = { id, boardId, title, taskIds: [] };
        columnOrder.push(id);
    }

    return { columns, columnOrder };
}

export function createBoardData(id: string, title: string): BoardData {
    const { columns, columnOrder } = createDefaultColumns(id);
    return {
        id,
        title,
        columns,
        columnOrder,
        tasks: {},
        filter: emptyFilter(),
    };
}
