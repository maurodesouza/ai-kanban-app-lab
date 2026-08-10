export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export type Task = {
    id: string;
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
};

export type Column = {
    id: string;
    title: string;
    taskIds: string[];
};

export type TaskDraft = {
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
};

export type BoardState = {
    columns: Record<string, Column>;
    columnOrder: string[];
    tasks: Record<string, Task>;
};

export type DateRangeFilter = {
    start?: string;
    end?: string;
};

export type Filters = {
    search: string;
    dateRange: DateRangeFilter;
    priorities: Priority[];
};

export type DateRange = DateRangeFilter;
export type FilterState = Filters;
