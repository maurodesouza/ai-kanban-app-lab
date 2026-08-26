export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export const PRIORITY_ORDER: Priority[] = [
    "none",
    "low",
    "medium",
    "high",
    "urgent",
];

export const PRIORITY_LABELS: Record<Priority, string> = {
    none: "None",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
    none: "bg-muted-foreground",
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
};

export interface TaskData {
    id: string;
    boardId: string;
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    startDate: string; // ISO date (yyyy-mm-dd)
    endDate: string; // ISO date (yyyy-mm-dd)
    createdAt: string;
    updatedAt: string;
}

export interface ColumnData {
    id: string;
    boardId: string;
    title: string;
    taskIds: string[];
}

export interface FilterData {
    search: string;
    dateFrom: string | null;
    dateTo: string | null;
    priority: Priority | "all";
}

export interface BoardData {
    id: string;
    title: string;
    columns: Record<string, ColumnData>;
    columnOrder: string[];
    tasks: Record<string, TaskData>;
    filter: FilterData;
}

export interface KanbanStoreData {
    version: number;
    boards: Record<string, BoardData>;
    boardOrder: string[];
    activeBoardId: string | null;
}

export interface AddTaskPayload {
    boardId: string;
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
}

export interface EditTaskPayload {
    boardId: string;
    taskId: string;
    patch: Partial<
        Pick<
            TaskData,
            | "title"
            | "description"
            | "priority"
            | "startDate"
            | "endDate"
            | "columnId"
        >
    >;
}

export interface MoveTaskPayload {
    boardId: string;
    taskId: string;
    toColumnId: string;
    toIndex: number;
}

export interface SetPriorityPayload {
    boardId: string;
    taskId: string;
    priority: Priority;
}

export interface ApplyFilterPayload {
    boardId: string;
    filter: Partial<FilterData>;
}

export interface AddColumnPayload {
    boardId: string;
}

export interface RenameColumnPayload {
    boardId: string;
    columnId: string;
    title: string;
}

export interface MoveColumnPayload {
    boardId: string;
    columnId: string;
    toIndex: number;
}

export interface DeleteColumnPayload {
    boardId: string;
    columnId: string;
}

export interface CreateBoardPayload {
    title?: string;
}

export interface DeleteBoardPayload {
    boardId: string;
}

export interface SelectBoardPayload {
    boardId: string;
}

export interface RenameBoardPayload {
    boardId: string;
    title: string;
}
