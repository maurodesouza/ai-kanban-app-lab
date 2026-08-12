import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { type ReactNode, useCallback, useState } from "react";
import { actions } from "#/lib/command";
import { kanbanStore } from "#/stores";
import type { Task } from "#/types/domain";

interface KanbanDndProps {
    children: ReactNode;
}

export function KanbanDnd({ children }: KanbanDndProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const taskId = event.active.id as string;
        const task = kanbanStore.tasks.get(taskId);
        if (task) setActiveTask(task);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const task = kanbanStore.tasks.get(taskId);
        if (!task) return;

        const overId = over.id as string;

        // over.id can be a column id or a task id
        // If it's a task id, find which column it belongs to
        const overColumn = kanbanStore.columns.find(
            (c) => c.id === overId || c.taskIds.includes(overId),
        );
        if (!overColumn) return;

        const toColumnId = overColumn.id;

        // Calculate the target index within the column
        let toIndex: number | undefined;
        if (overId === overColumn.id) {
            // Dropped on the column itself — append to end
            toIndex = undefined;
        } else {
            // Dropped on a task — insert at that task's position
            toIndex = overColumn.taskIds.indexOf(overId);
        }

        if (task.columnId === toColumnId) {
            const currentIndex = overColumn.taskIds.indexOf(taskId);
            if (toIndex === undefined) {
                toIndex = overColumn.taskIds.length - 1;
            }
            if (currentIndex === toIndex) return;
        }

        actions.kanban.task.move({ taskId, toColumnId, toIndex });
    }, []);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTask(null)}
        >
            {children}
            <DragOverlay>
                {activeTask ? (
                    <div className="rounded-md border bg-card p-3 shadow-lg">
                        <span className="text-sm font-medium">
                            {activeTask.title}
                        </span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Droppable column wrapper
export function DroppableColumn({
    columnId,
    children,
}: {
    columnId: string;
    children: ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: columnId });

    return (
        <div
            ref={setNodeRef}
            className={isOver ? "ring-2 ring-primary ring-offset-2" : ""}
        >
            {children}
        </div>
    );
}

// Draggable task wrapper
export { DraggableTask } from "./draggable-task";
