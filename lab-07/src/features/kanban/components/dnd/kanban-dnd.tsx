import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode, useCallback, useState } from "react";
import { actions } from "#/lib/command";
import { kanbanStore } from "#/stores";
import type { Task } from "#/types/domain";

interface KanbanDndProps {
    columnIds: string[];
    children: ReactNode;
}

export function KanbanDnd({ columnIds, children }: KanbanDndProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeColumnTitle, setActiveColumnTitle] = useState<string | null>(
        null,
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const type = event.active.data.current?.type;
        const id = event.active.id as string;

        if (type === "task") {
            const task = kanbanStore.tasks.get(id);
            if (task) setActiveTask(task);
        } else if (type === "column") {
            const column = kanbanStore.getColumn(id);
            if (column) setActiveColumnTitle(column.title);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        setActiveColumnTitle(null);

        if (!over) return;

        const type = active.data.current?.type;
        const activeId = active.id as string;
        const overId = over.id as string;

        if (type === "column") {
            const fromIndex = kanbanStore.getColumnIndex(activeId);
            const toIndex = kanbanStore.getColumnIndex(overId);
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                actions.kanban.column.move({
                    columnId: activeId,
                    toIndex,
                });
            }
            return;
        }

        // Task drag
        const task = kanbanStore.tasks.get(activeId);
        if (!task) return;

        const overColumn = kanbanStore.columns.find(
            (c) => c.id === overId || c.taskIds.includes(overId),
        );
        if (!overColumn) return;

        const toColumnId = overColumn.id;
        let toIndex: number | undefined;

        if (overId === overColumn.id) {
            toIndex = undefined;
        } else {
            toIndex = overColumn.taskIds.indexOf(overId);
        }

        if (task.columnId === toColumnId) {
            const currentIndex = overColumn.taskIds.indexOf(activeId);
            if (toIndex === undefined) {
                toIndex = overColumn.taskIds.length - 1;
            }
            if (currentIndex === toIndex) return;
        }

        actions.kanban.task.move({ taskId: activeId, toColumnId, toIndex });
    }, []);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
                setActiveTask(null);
                setActiveColumnTitle(null);
            }}
        >
            <SortableContext
                items={columnIds}
                strategy={horizontalListSortingStrategy}
            >
                {children}
            </SortableContext>
            <DragOverlay>
                {activeTask ? (
                    <div className="rounded-md border bg-card p-3 shadow-lg">
                        <span className="text-sm font-medium">
                            {activeTask.title}
                        </span>
                    </div>
                ) : activeColumnTitle ? (
                    <div className="w-72 rounded-lg border bg-card p-3 shadow-lg">
                        <span className="text-sm font-semibold">
                            {activeColumnTitle}
                        </span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export function SortableColumn({
    columnId,
    children,
}: {
    columnId: string;
    children: ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: columnId,
        data: { type: "column" },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export function DroppableColumn({
    columnId,
    children,
}: {
    columnId: string;
    children: ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: columnId,
        data: { type: "column" },
    });

    return (
        <div
            ref={setNodeRef}
            className={isOver ? "ring-2 ring-primary ring-offset-2" : ""}
        >
            {children}
        </div>
    );
}

export function DraggableTask({
    taskId,
    children,
}: {
    taskId: string;
    children: ReactNode;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: taskId,
        data: { type: "task" },
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={
                isDragging ? "opacity-30" : "cursor-grab active:cursor-grabbing"
            }
        >
            {children}
        </div>
    );
}
