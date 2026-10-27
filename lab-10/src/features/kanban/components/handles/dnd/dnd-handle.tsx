import { useEffect } from "react";
import type { DragItem } from "#/features/kanban/components/handles/dnd/dnd-actions";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { actions, command } from "#/lib/command";

export function DndHandle() {
    const store = useKanban();

    function columnIdOf(item: DragItem): string | undefined {
        if (item.type === "column") return item.id;

        return store.tasks[item.id]?.columnId;
    }

    async function dropColumn(columnId: string, over: DragItem) {
        const overColumnId = columnIdOf(over);

        if (!overColumnId) return;

        await actions.kanban.column.move({
            columnId,
            toIndex: store.columnOrder.indexOf(overColumnId),
        });
    }

    async function dropTask(taskId: string, over: DragItem) {
        const toColumnId = columnIdOf(over);

        if (!toColumnId || over.id === taskId) return;

        const taskIds = store.columns[toColumnId].taskIds;
        const toIndex =
            over.type === "task" ? taskIds.indexOf(over.id) : taskIds.length;

        await actions.kanban.task.move({ taskId, toColumnId, toIndex });
    }

    async function handleStart(payload: DragItem) {
        store.setActiveDrag(payload);
    }

    async function handleEnd(payload: {
        active: DragItem;
        over: DragItem | null;
    }) {
        store.setActiveDrag(null);

        const { active, over } = payload;

        if (!over) return;
        if (active.type === "column") return dropColumn(active.id, over);

        return dropTask(active.id, over);
    }

    async function handleCancel() {
        store.setActiveDrag(null);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("kanban.dnd.start", handleStart),
            command.handle("kanban.dnd.end", handleEnd),
            command.handle("kanban.dnd.cancel", handleCancel),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
