import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { board } from "#/features/kanban/utils/board/board";
import { command } from "#/lib/command";
import { array } from "#/utils/array/array";
import { random } from "#/utils/random/random";

export function ColumnHandle() {
    const store = useKanban();

    async function handleAdd() {
        const column = board.columns.create(random.id(), board.newColumnTitle);

        store.addColumn(column);

        return column.id;
    }

    async function handleRename(payload: { columnId: string; title: string }) {
        const title = payload.title.trim();

        if (!store.columns[payload.columnId] || !title) return;

        store.setColumnTitle(payload.columnId, title);
    }

    async function handleMove(payload: { columnId: string; toIndex: number }) {
        const from = store.columnOrder.indexOf(payload.columnId);

        if (from === -1) return;

        const to = array.math.clamp(
            payload.toIndex,
            0,
            store.columnOrder.length - 1,
        );

        if (from === to) return;

        store.setColumnOrder(array.move(store.columnOrder, from, to));
    }

    async function handleMoveBy(payload: { columnId: string; offset: -1 | 1 }) {
        const from = store.columnOrder.indexOf(payload.columnId);

        if (from === -1) return;

        await handleMove({
            columnId: payload.columnId,
            toIndex: from + payload.offset,
        });
    }

    async function handleDelete(payload: { columnId: string }) {
        const column = store.columns[payload.columnId];

        if (!column) return;

        for (const taskId of [...column.taskIds]) store.removeTask(taskId);

        store.removeColumn(payload.columnId);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("kanban.column.add", handleAdd),
            command.handle("kanban.column.rename", handleRename),
            command.handle("kanban.column.move", handleMove),
            command.handle("kanban.column.moveBy", handleMoveBy),
            command.handle("kanban.column.delete", handleDelete),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
