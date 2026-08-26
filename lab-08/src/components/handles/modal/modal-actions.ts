import type { ReactNode } from "react";
import type { Action } from "#/lib/command";

export type ModalKind = "task" | "confirm";

export interface TaskModalData {
    mode: "create" | "edit";
    boardId: string;
    taskId?: string;
    columnId?: string;
}

export interface ConfirmModalData {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
}

export type ModalData = TaskModalData | ConfirmModalData;

export function isTaskModalData(data: ModalData): data is TaskModalData {
    return (data as TaskModalData).mode !== undefined;
}

export function isConfirmModalData(data: ModalData): data is ConfirmModalData {
    return (data as ConfirmModalData).message !== undefined;
}

export interface OpenModalPayload {
    kind: ModalKind;
    data: ModalData;
}

declare module "#/lib/command/global" {
    interface Actions {
        modal: {
            open: Action<OpenModalPayload>;
            close: Action;
        };
    }
}

export type { ReactNode };
