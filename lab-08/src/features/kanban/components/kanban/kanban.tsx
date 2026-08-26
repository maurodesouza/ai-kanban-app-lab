import {
    closestCorners,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { observer } from "mobx-react-lite";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { FlexibleRender } from "#/components/base/flexible-render";
import { Input } from "#/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import { kanbanStore } from "#/features/kanban/store/kanban-store";
import {
    type ColumnData,
    PRIORITY_LABELS,
    PRIORITY_ORDER,
} from "#/features/kanban/types";
import { actions } from "#/lib/command";
import { cn } from "#/lib/utils";
import { KanbanColumn } from "../column/column";
import { KanbanTaskCard } from "../task/task";
import { useKanbanContext } from "./kanban-context";

// --- Container ---

function Container({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"div">) {
    return (
        <div
            className={cn("flex h-full flex-col gap-4 p-4 sm:p-6", className)}
            {...props}
        >
            {children}
        </div>
    );
}

// --- Header ---

function Header({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between gap-4",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// --- Title ---

function Title({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"h1">) {
    return (
        <h1
            className={cn("text-2xl font-bold tracking-tight", className)}
            {...props}
        >
            {children}
        </h1>
    );
}

// --- Content ---

function Content({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"div">) {
    return (
        <div className={cn("flex-1 overflow-hidden", className)} {...props}>
            {children}
        </div>
    );
}

// --- Columns (render prop, observer) ---

interface ColumnsProps {
    render: (column: ColumnData) => ReactNode;
}

const Columns = observer(function Columns({ render }: ColumnsProps) {
    const { boardId } = useKanbanContext();
    const columns = kanbanStore.getColumns(boardId);

    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragStart(event: DragStartEvent) {
        const id = event.active.id as string;
        if (id.startsWith("task_")) {
            setActiveTaskId(id);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTaskId(null);
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Column reordering
        if (activeId.startsWith("col_") && overId.startsWith("col_")) {
            if (activeId === overId) return;
            const oldIndex = columns.findIndex((c) => c.id === activeId);
            const newIndex = columns.findIndex((c) => c.id === overId);
            if (oldIndex === -1 || newIndex === -1) return;
            actions.kanban.column.move(
                { boardId, columnId: activeId, toIndex: newIndex },
                { instanceId: boardId },
            );
            return;
        }

        // Task moving
        if (!activeId.startsWith("task_")) return;

        const task = kanbanStore.getTask(boardId, activeId);
        if (!task) return;

        let toColumnId: string | null = null;
        let toIndex = 0;

        if (overId.startsWith("col_")) {
            toColumnId = overId;
            const col = kanbanStore.getBoard(boardId)?.columns[overId];
            toIndex = col?.taskIds.length ?? 0;
        } else if (overId.startsWith("task_")) {
            const overTask = kanbanStore.getTask(boardId, overId);
            if (!overTask) return;
            toColumnId = overTask.columnId;
            const col = kanbanStore.getBoard(boardId)?.columns[toColumnId];
            toIndex = col?.taskIds.indexOf(overId) ?? 0;
        }

        if (!toColumnId) return;

        actions.kanban.task.move(
            {
                boardId,
                taskId: activeId,
                toColumnId,
                toIndex,
            },
            { instanceId: boardId },
        );
    }

    const activeTask = activeTaskId
        ? kanbanStore.getTask(boardId, activeTaskId)
        : null;

    if (columns.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                    No columns yet. Click the ghost column to add one.
                </p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={columns.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
            >
                {columns.map((column) => (
                    <FlexibleRender
                        key={column.id}
                        item={column}
                        render={render}
                    />
                ))}
            </SortableContext>
            <DragOverlay>
                {activeTask ? (
                    <KanbanTaskCard
                        task={activeTask}
                        boardId={boardId}
                        dragging
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
});

// --- Filter (observer) ---

const Filter = observer(function Filter() {
    const { boardId } = useKanbanContext();
    const board = kanbanStore.getBoard(boardId);
    if (!board) return null;
    const { filter } = board;

    function updateFilter(patch: Partial<typeof filter>) {
        actions.kanban.task.applyFilter(
            { boardId, filter: patch },
            { instanceId: boardId },
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Input
                placeholder="Search title or description..."
                value={filter.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                className="w-48"
            />
            <Input
                type="date"
                value={filter.dateFrom ?? ""}
                onChange={(e) =>
                    updateFilter({ dateFrom: e.target.value || null })
                }
                className="w-40"
                aria-label="Filter from date"
            />
            <Input
                type="date"
                value={filter.dateTo ?? ""}
                onChange={(e) =>
                    updateFilter({ dateTo: e.target.value || null })
                }
                className="w-40"
                aria-label="Filter to date"
            />
            <Select
                value={filter.priority}
                onValueChange={(v) =>
                    updateFilter({
                        priority: v as typeof filter.priority,
                    })
                }
            >
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    {PRIORITY_ORDER.map((p) => (
                        <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
});

// --- Exported compound component ---

export const Kanban = {
    Container,
    Header,
    Title,
    Content,
    Columns,
    Filter,
};

export { KanbanColumn };
