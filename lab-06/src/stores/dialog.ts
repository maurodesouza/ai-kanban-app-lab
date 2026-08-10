import { makeAutoObservable } from "mobx";

export type TaskFormDialog = {
    type: "taskForm";
    taskId?: string;
    columnId?: string;
};

export type ConfirmDialog = {
    type: "confirm";
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
};

export type DialogDescriptor = TaskFormDialog | ConfirmDialog | null;

export class DialogStore {
    current: DialogDescriptor = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    openTaskForm(options: Omit<TaskFormDialog, "type">): void {
        this.current = { type: "taskForm", ...options };
    }

    openConfirm(options: Omit<ConfirmDialog, "type">): void {
        this.current = { type: "confirm", ...options };
    }

    close(): void {
        this.current = null;
    }
}
