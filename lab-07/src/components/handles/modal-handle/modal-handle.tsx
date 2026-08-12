import { useEffect } from "react";
import { command } from "#/lib/command";
import { modalStore } from "#/stores";
import type { ConfirmState } from "#/stores/modal-store";

export function ModalHandle() {
    async function handleModalOpen(payload: {
        mode: "create" | "edit";
        columnId?: string;
        taskId?: string;
    }) {
        modalStore.openTaskModal(payload);
    }

    async function handleModalClose() {
        modalStore.closeTaskModal();
    }

    async function handleConfirmOpen(payload: ConfirmState) {
        modalStore.openConfirm(payload);
    }

    async function handleConfirmClose() {
        modalStore.closeConfirm();
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers register once on mount
    useEffect(() => {
        const disposes = [
            command.handle("modal.open", handleModalOpen),
            command.handle("modal.close", handleModalClose),
            command.handle("modal.confirm.open", handleConfirmOpen),
            command.handle("modal.confirm.close", handleConfirmClose),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
