import { ColumnHandle } from "./column/column-handle";
import { ColumnDeleteDialogHandle } from "./column-delete-dialog/column-delete-dialog-handle";
import { DndHandle } from "./dnd/dnd-handle";
import { KanbanPersistenceHandle } from "./persistence/kanban-persistence-handle";
import { TaskHandle } from "./task/task-handle";

/** Mounts every kanban Handle once, at the feature root. */
export function KanbanHandles() {
    return (
        <>
            <KanbanPersistenceHandle />
            <ColumnHandle />
            <TaskHandle />
            <ColumnDeleteDialogHandle />
            <DndHandle />
        </>
    );
}
