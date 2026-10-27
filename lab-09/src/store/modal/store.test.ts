import { describe, expect, it } from "vitest";
import { ModalStore } from "./store";

describe("ModalStore", () => {
    it("is closed by default", () => {
        const store = new ModalStore();

        expect(store.$isOpen).toBe(false);
        expect(store.$isColumnDeleteConfirmOpen).toBe(false);
        expect(store.$isTaskFormOpen).toBe(false);
    });

    it("exposes which modal is open", () => {
        const store = new ModalStore();

        store.setCurrent("column-delete-confirm");
        expect(store.$isOpen).toBe(true);
        expect(store.$isColumnDeleteConfirmOpen).toBe(true);
        expect(store.$isTaskFormOpen).toBe(false);

        store.setCurrent("task-form");
        expect(store.$isTaskFormOpen).toBe(true);
        expect(store.$isColumnDeleteConfirmOpen).toBe(false);
    });
});
