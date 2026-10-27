import { makeAutoObservable } from "mobx";

export type ModalType = "column-delete-confirm" | "task-form";

export class ModalStore {
    // #region Primitives
    current: ModalType | null = null;
    // #endregion

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // #region Actions
    setCurrent(current: ModalType | null) {
        this.current = current;
    }
    // #endregion

    // #region Derived primitives
    get $isOpen() {
        return this.current !== null;
    }

    get $isColumnDeleteConfirmOpen() {
        return this.current === "column-delete-confirm";
    }

    get $isTaskFormOpen() {
        return this.current === "task-form";
    }
    // #endregion
}

export const modalStore = new ModalStore();
