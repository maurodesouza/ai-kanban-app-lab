import { describe, expect, it } from "vitest";
import { ModalStore } from "#/stores/modal-store";

describe("ModalStore", () => {
    it("starts closed", () => {
        const store = new ModalStore();
        expect(store.isTaskModalOpen).toBe(false);
        expect(store.isConfirmOpen).toBe(false);
    });

    it("opens in create mode", () => {
        const store = new ModalStore();
        store.openTaskModal({ mode: "create" });
        expect(store.isTaskModalOpen).toBe(true);
        expect(store.mode).toBe("create");
        expect(store.editingTaskId).toBeNull();
    });

    it("opens in edit mode with a taskId", () => {
        const store = new ModalStore();
        store.openTaskModal({ mode: "edit", taskId: "t1" });
        expect(store.mode).toBe("edit");
        expect(store.editingTaskId).toBe("t1");
    });

    it("stores the columnId when opened from a column", () => {
        const store = new ModalStore();
        store.openTaskModal({ mode: "create", columnId: "col-1" });
        expect(store.columnId).toBe("col-1");
    });

    it("closes and resets the task modal", () => {
        const store = new ModalStore();
        store.openTaskModal({ mode: "edit", taskId: "t1", columnId: "c1" });
        store.closeTaskModal();
        expect(store.isTaskModalOpen).toBe(false);
        expect(store.editingTaskId).toBeNull();
        expect(store.columnId).toBeNull();
    });

    it("opens and closes the confirm dialog", () => {
        const store = new ModalStore();
        store.openConfirm({
            id: "confirm-1",
            title: "Delete column?",
            message: "All tasks will be deleted.",
            confirmCommand: "kanban.column.delete",
            confirmPayload: { columnId: "c1" },
        });
        expect(store.isConfirmOpen).toBe(true);
        expect(store.confirm?.confirmCommand).toBe("kanban.column.delete");

        store.closeConfirm();
        expect(store.isConfirmOpen).toBe(false);
        expect(store.confirm).toBeNull();
    });
});
