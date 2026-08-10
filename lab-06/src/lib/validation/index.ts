import type { TaskDraft } from "#/types/kanban";

export type TaskDraftField = keyof TaskDraft;
export type TaskDraftErrors = Partial<Record<TaskDraftField, string>>;

export type TaskDraftValidationResult =
    | { success: true; data: TaskDraft }
    | { success: false; errors: TaskDraftErrors };

export class TaskDraftValidationError extends Error {
    readonly errors: TaskDraftErrors;

    constructor(errors: TaskDraftErrors) {
        super("Task draft is invalid");
        this.name = "TaskDraftValidationError";
        this.errors = errors;
    }
}

export function localDate(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function createTaskDraftDefaults(date = new Date()): TaskDraft {
    const today = localDate(date);
    return {
        title: "",
        description: "",
        priority: "none",
        startDate: today,
        endDate: today,
    };
}

export function validateTaskDraft(draft: TaskDraft): TaskDraftValidationResult {
    const data = { ...draft, title: draft.title.trim() };
    const errors: TaskDraftErrors = {};

    if (!data.title) errors.title = "Title is required";
    if (data.endDate < data.startDate) {
        errors.endDate = "End date must be on or after start date";
    }

    return Object.keys(errors).length > 0
        ? { success: false, errors }
        : { success: true, data };
}
