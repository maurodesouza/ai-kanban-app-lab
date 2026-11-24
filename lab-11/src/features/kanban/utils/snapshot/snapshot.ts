import {
    type Board,
    type Column,
    type Filters,
    priorities,
    type Snapshot,
    type Task,
} from "../../types";
import { date } from "../date/date";

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isColumn(value: unknown): value is Column {
    return (
        record(value) &&
        typeof value.id === "string" &&
        value.id !== "" &&
        typeof value.title === "string" &&
        value.title.trim() !== ""
    );
}

function isTask(value: unknown): value is Task {
    return (
        isColumn(value) &&
        "columnId" in value &&
        typeof value.columnId === "string" &&
        "description" in value &&
        typeof value.description === "string" &&
        "priority" in value &&
        priorities.some((priority) => priority === value.priority) &&
        "startDate" in value &&
        date.isDay(value.startDate) &&
        "endDate" in value &&
        date.isDay(value.endDate) &&
        value.startDate <= value.endDate
    );
}

function isBoard(value: unknown): value is Board {
    if (
        !record(value) ||
        !Array.isArray(value.columns) ||
        !value.columns.every(isColumn) ||
        !Array.isArray(value.tasks) ||
        !value.tasks.every(isTask)
    ) {
        return false;
    }
    const columns = new Set(value.columns.map((column) => column.id));
    const tasks = new Set(value.tasks.map((task) => task.id));
    return (
        columns.size === value.columns.length &&
        tasks.size === value.tasks.length &&
        value.tasks.every((task) => columns.has(task.columnId))
    );
}

function isFilters(value: unknown): value is Filters {
    return (
        record(value) &&
        typeof value.search === "string" &&
        (value.priority === "" ||
            priorities.some((priority) => priority === value.priority)) &&
        (value.dateFrom === "" || date.isDay(value.dateFrom)) &&
        (value.dateTo === "" || date.isDay(value.dateTo)) &&
        (!value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo)
    );
}

export const snapshot = {
    key: "ai-kanban:lab-11:v1",
    initialBoard: (): Board => ({
        columns: [
            { id: "todo", title: "To Do" },
            { id: "in-progress", title: "In Progress" },
            { id: "done", title: "Done" },
        ],
        tasks: [],
    }),
    initialFilters: (): Filters => ({
        search: "",
        dateFrom: "",
        dateTo: "",
        priority: "",
    }),
    parse(raw: string): Snapshot | null {
        try {
            const value: unknown = JSON.parse(raw);
            if (
                record(value) &&
                value.version === 1 &&
                isBoard(value.board) &&
                isFilters(value.filters) &&
                (value.theme === null ||
                    value.theme === "light" ||
                    value.theme === "dark")
            ) {
                return {
                    version: 1,
                    board: value.board,
                    filters: value.filters,
                    theme: value.theme,
                };
            }
        } catch {
            return null;
        }
        return null;
    },
};
