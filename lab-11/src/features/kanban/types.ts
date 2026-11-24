export const priorities = ["low", "medium", "high"] as const;

export type Priority = (typeof priorities)[number];
export type ThemePreference = "light" | "dark";

export interface Column {
    id: string;
    title: string;
}

export interface Task {
    id: string;
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
}

export interface Board {
    columns: Column[];
    tasks: Task[];
}

export interface Filters {
    search: string;
    dateFrom: string;
    dateTo: string;
    priority: Priority | "";
}

export interface Snapshot {
    version: 1;
    board: Board;
    filters: Filters;
    theme: ThemePreference | null;
}

export type Direction = "previous" | "next";

export interface ColumnRenameDraft {
    columnId: string;
    title: string;
    error: string;
}
