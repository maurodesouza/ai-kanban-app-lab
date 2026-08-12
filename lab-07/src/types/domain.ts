export type Priority = "low" | "medium" | "high";

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
    columnId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Column {
    id: string;
    title: string;
    taskIds: string[];
}

export interface TaskInput {
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
}

export interface DateRange {
    start: string | null;
    end: string | null;
}

export interface FilterState {
    search: string;
    dateRange: DateRange;
    priority: Priority | "all";
}

export interface MoveTarget {
    toColumnId: string;
    toIndex?: number;
}

export interface ColumnWithTasks {
    id: string;
    title: string;
    tasks: Task[];
}
