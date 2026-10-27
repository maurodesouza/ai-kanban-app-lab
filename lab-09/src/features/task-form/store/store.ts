import { makeAutoObservable } from "mobx";
import type { Priority, TaskErrors, TaskInput } from "#/features/kanban/types";
import {
    DEFAULT_PRIORITY,
    PRIORITIES,
    PRIORITY_META,
} from "#/features/kanban/utils/priority";

export type TaskFormMode = "create" | "edit";

export type TaskFormField = keyof TaskInput;

export type TaskFormValues = TaskInput & {
    mode: TaskFormMode;
    taskId: string | null;
    columnId: string | null;
};

export class TaskFormStore {
    // #region Primitives
    mode: TaskFormMode = "create";
    taskId: string | null = null;
    columnId: string | null = null;
    title = "";
    description = "";
    priority: Priority = DEFAULT_PRIORITY;
    startDate = "";
    endDate = "";
    errors: TaskErrors = {};
    // #endregion

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // #region Actions
    setForm(values: TaskFormValues) {
        this.mode = values.mode;
        this.taskId = values.taskId;
        this.columnId = values.columnId;
        this.title = values.title;
        this.description = values.description;
        this.priority = values.priority;
        this.startDate = values.startDate;
        this.endDate = values.endDate;
        this.errors = {};
    }

    setField<TField extends TaskFormField>(
        field: TField,
        value: TaskInput[TField],
    ) {
        (this as TaskInput)[field] = value;
    }

    setErrors(errors: TaskErrors) {
        this.errors = errors;
    }
    // #endregion

    // #region Derived primitives
    get $isEdit() {
        return this.mode === "edit";
    }

    get $hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    get $values(): TaskInput {
        return {
            title: this.title,
            description: this.description,
            priority: this.priority,
            startDate: this.startDate,
            endDate: this.endDate,
        };
    }
    // #endregion

    // #region UI
    get $dialogUI() {
        const isEdit = this.$isEdit;

        return {
            title: isEdit ? "Edit task" : "New task",
            description: isEdit
                ? "Update the details of this task."
                : "Fill in the details of the new task.",
        };
    }

    get $titleFieldUI() {
        return {
            label: "Title",
            placeholder: "What needs to be done?",
            value: this.title,
            error: this.errors.title,
            isInvalid: Boolean(this.errors.title),
        };
    }

    get $descriptionFieldUI() {
        return {
            label: "Description",
            placeholder: "Add more details (optional)",
            value: this.description,
        };
    }

    get $priorityFieldUI() {
        return {
            label: "Priority",
            value: this.priority,
            options: PRIORITIES.map((priority) => ({
                value: priority,
                label: PRIORITY_META[priority].label,
            })),
        };
    }

    get $startDateFieldUI() {
        return { label: "Start date", value: this.startDate };
    }

    get $endDateFieldUI() {
        return {
            label: "End date",
            value: this.endDate,
            min: this.startDate,
            error: this.errors.endDate,
            isInvalid: Boolean(this.errors.endDate),
        };
    }

    get $formErrorUI() {
        return {
            hasError: Boolean(this.errors.column),
            message: this.errors.column ?? "",
        };
    }

    get $submitUI() {
        return {
            label: this.$isEdit ? "Save changes" : "Create task",
            disabled: this.$hasErrors,
        };
    }

    get $cancelUI() {
        return { label: "Cancel" };
    }
    // #endregion
}

export const taskFormStore = new TaskFormStore();
