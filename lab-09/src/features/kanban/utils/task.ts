import type { TaskErrors, TaskInput } from "../types";
import { isBefore } from "./date";

export const TITLE_REQUIRED_ERROR = "Title is required.";
export const END_DATE_ERROR = "End date cannot be before the start date.";

export function validateTask(
    input: Pick<TaskInput, "title" | "startDate" | "endDate">,
): TaskErrors {
    const errors: TaskErrors = {};

    if (!input.title.trim()) errors.title = TITLE_REQUIRED_ERROR;
    if (isBefore(input.endDate, input.startDate))
        errors.endDate = END_DATE_ERROR;

    return errors;
}

export function hasErrors(errors: TaskErrors) {
    return Object.keys(errors).length > 0;
}
