import { useEffect, useState } from "react";
import { ConfirmModal } from "#/components/base/confirm-modal";
import { TaskModal } from "#/components/base/task-modal";
import { actions, command } from "#/lib/command";
import type { OpenModalPayload } from "./modal-actions";
import { isConfirmModalData, isTaskModalData } from "./modal-actions";

export function ModalHandle() {
    const [openModal, setOpenModal] = useState<OpenModalPayload | null>(null);

    async function handleOpenModal(payload: OpenModalPayload) {
        setOpenModal(payload);
    }

    async function handleCloseModal() {
        setOpenModal(null);
    }

    useEffect(() => {
        const disposes = [
            command.handle("modal.open", handleOpenModal),
            command.handle("modal.close", handleCloseModal),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    function close() {
        actions.modal.close();
    }

    if (!openModal) return null;

    if (openModal.kind === "task" && isTaskModalData(openModal.data)) {
        return <TaskModal data={openModal.data} onClose={close} />;
    }

    if (openModal.kind === "confirm" && isConfirmModalData(openModal.data)) {
        return <ConfirmModal data={openModal.data} onClose={close} />;
    }

    return null;
}
