import { useEffect } from "react";
import { command } from "#/lib/command";

export function ModalHandle() {
    async function handleModalOpen() {}
    async function handleModalClose() {}
    async function handleConfirmOpen() {}
    async function handleConfirmClose() {}

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
