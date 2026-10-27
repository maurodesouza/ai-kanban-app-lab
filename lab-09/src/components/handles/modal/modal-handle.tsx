import { useEffect } from "react";
import { useModal } from "#/hooks/use-modal";
import { command } from "#/lib/command";
import type { ModalType } from "#/store/modal/store";

export function ModalHandle() {
    const store = useModal();

    async function handleOpen(modal: ModalType) {
        store.setCurrent(modal);
    }

    async function handleClose() {
        store.setCurrent(null);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("modal.open", handleOpen),
            command.handle("modal.close", handleClose),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
