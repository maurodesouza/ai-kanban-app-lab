export type Priority = "low" | "medium" | "high";

export type Direction = "left" | "right";

export type Task = {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    /** Local date, `YYYY-MM-DD`. */
    startDate: string;
    /** Local date, `YYYY-MM-DD`. */
    endDate: string;
    columnId: string;
    createdAt: string;
    updatedAt: string;
};

export type Column = {
    id: string;
    title: string;
    taskIds: string[];
};

export type Board = {
    columnOrder: string[];
    columns: Record<string, Column>;
    tasks: Record<string, Task>;
};

export type TaskInput = {
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
};

export type TaskErrors = {
    title?: string;
    endDate?: string;
    column?: string;
};

export type TaskMutationResult =
    | { ok: true; taskId: string }
    | { ok: false; errors: TaskErrors };
