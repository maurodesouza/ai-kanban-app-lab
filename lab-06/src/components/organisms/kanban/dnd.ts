export type KanbanDragData =
    | { type: "task"; taskId: string; columnId: string }
    | { type: "column"; columnId: string };

export type KanbanDropData =
    | KanbanDragData
    | { type: "column-drop"; columnId: string };

export type TaskMovePayload = {
    taskId: string;
    columnId: string;
    index: number;
};

export type ColumnReorderPayload = { from: number; to: number };

type TaskDropInput = {
    active: Extract<KanbanDragData, { type: "task" }>;
    over: Exclude<KanbanDropData, { type: "column" }>;
    columns: Record<string, { taskIds: string[] }>;
    visibleTaskIds: (columnId: string) => string[];
    afterOverTask?: boolean;
};

function fullIndexForVisibleInsertion(
    fullTaskIds: string[],
    visibleTaskIds: string[],
    visibleIndex: number,
): number {
    const nextVisibleId = visibleTaskIds[visibleIndex];
    if (nextVisibleId) {
        const index = fullTaskIds.indexOf(nextVisibleId);
        return index < 0 ? fullTaskIds.length : index;
    }

    const previousVisibleId = visibleTaskIds[visibleIndex - 1];
    if (previousVisibleId) {
        const index = fullTaskIds.indexOf(previousVisibleId);
        return index < 0 ? fullTaskIds.length : index + 1;
    }

    return fullTaskIds.length;
}

export function resolveTaskMove({
    active,
    over,
    columns,
    visibleTaskIds,
    afterOverTask = false,
}: TaskDropInput): TaskMovePayload | null {
    const targetColumnId = over.columnId;
    const targetColumn = columns[targetColumnId];
    if (!targetColumn) return null;

    const targetFullIds = targetColumn.taskIds.filter(
        (taskId) => taskId !== active.taskId,
    );
    const targetVisibleIds = visibleTaskIds(targetColumnId).filter(
        (taskId) => taskId !== active.taskId,
    );

    if (over.type === "column-drop") {
        return {
            taskId: active.taskId,
            columnId: targetColumnId,
            index: targetFullIds.length,
        };
    }

    if (over.taskId === active.taskId) return null;
    const visibleWithActive = visibleTaskIds(targetColumnId);
    const overIndex = visibleWithActive.indexOf(over.taskId);
    if (overIndex < 0) return null;

    let visibleInsertionIndex = overIndex + (afterOverTask ? 1 : 0);
    const activeIndex = visibleWithActive.indexOf(active.taskId);
    if (
        active.columnId === targetColumnId &&
        activeIndex < visibleInsertionIndex
    ) {
        visibleInsertionIndex -= 1;
    }

    const index = fullIndexForVisibleInsertion(
        targetFullIds,
        targetVisibleIds,
        visibleInsertionIndex,
    );
    return { taskId: active.taskId, columnId: targetColumnId, index };
}

export function resolveColumnReorder(
    active: Extract<KanbanDragData, { type: "column" }>,
    over: Extract<KanbanDropData, { type: "column" }>,
    columnOrder: string[],
): ColumnReorderPayload | null {
    const from = columnOrder.indexOf(active.columnId);
    const to = columnOrder.indexOf(over.columnId);
    return from < 0 || to < 0 || from === to ? null : { from, to };
}
