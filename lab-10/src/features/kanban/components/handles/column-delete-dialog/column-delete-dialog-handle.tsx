import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { actions, command } from "#/lib/command";

export function ColumnDeleteDialogHandle() {
    const store = useKanban();

    async function handleOpen(payload: { columnId: string }) {
        if (!store.columns[payload.columnId]) return;

        store.setColumnDeleteDialog(true, payload.columnId);
    }

    async function handleChange(payload: { open: boolean }) {
        if (payload.open) return;

        store.setColumnDeleteDialog(false, store.columnDeleteDialog.columnId);
    }

    async function handleConfirm() {
        const { columnId } = store.columnDeleteDialog;

        store.setColumnDeleteDialog(false, columnId);

        if (!columnId) return;

        await actions.kanban.column.delete({ columnId });
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("kanban.columnDeleteDialog.open", handleOpen),
            command.handle("kanban.columnDeleteDialog.change", handleChange),
            command.handle("kanban.columnDeleteDialog.confirm", handleConfirm),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
