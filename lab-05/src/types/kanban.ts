export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
    id: string;
    columnId: string;
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
    createdAt: string;
};

export type Column = {
    id: string;
    title: string;
};

export type DateRange = {
    start?: string;
    end?: string;
};

export type KanbanFilter = {
    text: string;
    dateRange: DateRange;
    statuses: TaskStatus[];
};

export type KanbanState = {
    columns: Column[];
    columnOrder: string[];
    tasks: Task[];
    filter: KanbanFilter;
};
