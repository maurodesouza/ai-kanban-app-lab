import { makeAutoObservable } from "mobx";

export type ModalMode = "create" | "edit";

export interface ConfirmState {
    id: string;
    title: string;
    message: string;
    confirmCommand: string;
    confirmPayload: unknown;
}

export class ModalStore {
    openModalId: "task" | null = null;
    mode: ModalMode = "create";
    editingTaskId: string | null = null;
    columnId: string | null = null;

    confirm: ConfirmState | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get isTaskModalOpen(): boolean {
        return this.openModalId === "task";
    }

    get isConfirmOpen(): boolean {
        return this.confirm !== null;
    }

    openTaskModal(payload: {
        mode: ModalMode;
        columnId?: string;
        taskId?: string;
    }): void {
        this.mode = payload.mode;
        this.editingTaskId = payload.taskId ?? null;
        this.columnId = payload.columnId ?? null;
        this.openModalId = "task";
    }

    closeTaskModal(): void {
        this.openModalId = null;
        this.editingTaskId = null;
        this.columnId = null;
    }

    openConfirm(state: ConfirmState): void {
        this.confirm = state;
    }

    closeConfirm(): void {
        this.confirm = null;
    }
}
