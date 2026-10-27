import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ColumnHandle } from "#/features/kanban/components/handles/column/column-handle";
import { KanbanPersistenceHandle } from "#/features/kanban/components/handles/persistence/kanban-persistence-handle";
import { TaskHandle } from "#/features/kanban/components/handles/task/task-handle";
import { kanbanStore } from "#/features/kanban/store/store";

export function resetKanbanStore() {
    kanbanStore.hydrate({
        version: 1,
        columnOrder: [],
        columns: {},
        tasks: {},
    });
    kanbanStore.setIsHydrated(false);
    kanbanStore.setEditingColumnId(null);
    kanbanStore.setActiveDrag(null);
    kanbanStore.setColumnDeleteDialog(false, null);
    kanbanStore.setTaskDialog({ open: false, taskId: null, columnId: null });
    kanbanStore.setTaskFormErrors({});
}

/** Mounts every kanban Handle (seeding the board from storage) plus optional UI. */
export function renderKanbanHandles(children?: ReactNode) {
    return render(
        <>
            <KanbanPersistenceHandle />
            <ColumnHandle />
            <TaskHandle />
            {children}
        </>,
    );
}
