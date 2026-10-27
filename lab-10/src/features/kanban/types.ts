export type Priority = "low" | "medium" | "high";

export type Column = {
    id: string;
    title: string;
    taskIds: string[];
};

export type Task = {
    id: string;
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    /** Local calendar date, `YYYY-MM-DD`. */
    startDate: string;
    /** Local calendar date, `YYYY-MM-DD`. */
    endDate: string;
    createdAt: string;
    updatedAt: string;
};

export type TaskFields = Pick<
    Task,
    "title" | "description" | "priority" | "startDate" | "endDate"
>;

export type TaskField = keyof TaskFields;

export type TaskErrors = Partial<Record<TaskField, string>>;

export type TaskResult =
    | { ok: true; taskId: string }
    | { ok: false; errors: TaskErrors };

export type BoardSnapshot = {
    version: 1;
    columnOrder: string[];
    columns: Record<string, Column>;
    tasks: Record<string, Task>;
};

export type TaskFieldChange = {
    [TField in TaskField]: { field: TField; value: TaskFields[TField] };
}[TaskField];

export type PriorityFilter = Priority | "all";

export type TaskFilters = {
    search: string;
    dateFrom: string;
    dateTo: string;
    priority: PriorityFilter;
};
