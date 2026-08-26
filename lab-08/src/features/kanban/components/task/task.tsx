import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ComponentProps, ReactNode } from "react";
import { FlexibleRender } from "#/components/base/flexible-render";
import { Button } from "#/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { matchesFilter } from "#/features/kanban/filter";
import { kanbanStore } from "#/features/kanban/store/kanban-store";
import {
    type ColumnData,
    PRIORITY_COLORS,
    PRIORITY_LABELS,
    PRIORITY_ORDER,
    type Priority,
    type TaskData,
} from "#/features/kanban/types";
import { actions } from "#/lib/command";
import { cn } from "#/lib/utils";
import { useKanbanContext } from "../kanban/kanban-context";

// --- Tasks (render prop, observer) ---

interface TasksProps {
    column: ColumnData;
    render?: (task: TaskData) => ReactNode;
}

const Tasks = observer(function Tasks({ column, render }: TasksProps) {
    const { boardId } = useKanbanContext();
    const board = kanbanStore.getBoard(boardId);
    const allTasks = kanbanStore.getColumnTasks(boardId, column.id);
    const tasks = board
        ? allTasks.filter((t) => matchesFilter(t, board.filter))
        : allTasks;

    if (tasks.length === 0) {
        return (
            <p className="py-4 text-center text-xs text-muted-foreground">
                No tasks
            </p>
        );
    }

    return (
        <>
            {tasks.map((task) => (
                <FlexibleRender key={task.id} item={task} render={render} />
            ))}
        </>
    );
});

// --- Task.Container (sortable item) ---

interface TaskContainerProps {
    task: TaskData;
    children: ReactNode;
    className?: string;
    dragging?: boolean;
}

const TaskContainer = observer(function TaskContainer({
    task,
    children,
    className,
    dragging,
}: TaskContainerProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: "task", taskId: task.id, columnId: task.columnId },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex flex-col gap-2 rounded-md border bg-background p-3 shadow-sm",
                (isDragging || dragging) && "opacity-50",
                className,
            )}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
});

// --- Task.Header ---

function TaskHeader({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"div">) {
    return (
        <div
            className={cn("flex items-start justify-between gap-2", className)}
            {...props}
        >
            {children}
        </div>
    );
}

// --- Task.Title ---

function TaskTitle({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"span">) {
    return (
        <span
            className={cn("text-sm font-medium leading-tight", className)}
            {...props}
        >
            {children}
        </span>
    );
}

// --- Task.Footer ---

function TaskFooter({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"div">) {
    return (
        <div
            className={cn("flex items-center justify-between gap-1", className)}
            {...props}
        >
            {children}
        </div>
    );
}

// --- Task.PriorityIndicator (quick change dropdown) ---

interface PriorityIndicatorProps {
    task: TaskData;
}

const PriorityIndicator = observer(function PriorityIndicator({
    task,
}: PriorityIndicatorProps) {
    const { boardId } = useKanbanContext();

    function setPriority(priority: Priority) {
        actions.kanban.task.setPriority(
            { boardId, taskId: task.id, priority },
            { instanceId: boardId },
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs hover:bg-accent"
                >
                    <span
                        className={cn(
                            "size-2 rounded-full",
                            PRIORITY_COLORS[task.priority],
                        )}
                    />
                    {PRIORITY_LABELS[task.priority]}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {PRIORITY_ORDER.map((p) => (
                    <DropdownMenuItem key={p} onClick={() => setPriority(p)}>
                        <span
                            className={cn(
                                "size-2 rounded-full",
                                PRIORITY_COLORS[p],
                            )}
                        />
                        {PRIORITY_LABELS[p]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

// --- Task.MoveArrows (adjacent column move) ---

interface MoveArrowsProps {
    task: TaskData;
}

const MoveArrows = observer(function MoveArrows({ task }: MoveArrowsProps) {
    const { boardId } = useKanbanContext();
    const columns = kanbanStore.getColumns(boardId);
    const currentIndex = columns.findIndex((c) => c.id === task.columnId);
    const prevColumn = currentIndex > 0 ? columns[currentIndex - 1] : null;
    const nextColumn =
        currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null;

    function moveTo(columnId: string) {
        const col = kanbanStore.getBoard(boardId)?.columns[columnId];
        const toIndex = col?.taskIds.length ?? 0;
        actions.kanban.task.move(
            { boardId, taskId: task.id, toColumnId: columnId, toIndex },
            { instanceId: boardId },
        );
    }

    return (
        <div className="flex items-center">
            <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={!prevColumn}
                onClick={() => prevColumn && moveTo(prevColumn.id)}
                aria-label="Move to previous column"
            >
                <ChevronLeft className="size-3.5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={!nextColumn}
                onClick={() => nextColumn && moveTo(nextColumn.id)}
                aria-label="Move to next column"
            >
                <ChevronRight className="size-3.5" />
            </Button>
        </div>
    );
});

// --- Task.EditAction ---

interface EditActionProps {
    task: TaskData;
}

function EditAction({ task }: EditActionProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() =>
                actions.modal.open({
                    kind: "task",
                    data: {
                        mode: "edit",
                        boardId: task.boardId,
                        taskId: task.id,
                    },
                })
            }
            aria-label="Edit task"
        >
            <Pencil className="size-3.5" />
        </Button>
    );
}

// --- Task.DeleteAction ---

interface DeleteActionProps {
    task: TaskData;
}

function DeleteAction({ task }: DeleteActionProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-6 text-destructive hover:text-destructive"
            onClick={() =>
                actions.modal.open({
                    kind: "confirm",
                    data: {
                        title: "Delete task",
                        message: `Delete "${task.title}"? This cannot be undone.`,
                        confirmLabel: "Delete",
                        onConfirm: () => {
                            actions.kanban.task.delete(
                                { boardId: task.boardId, taskId: task.id },
                                { instanceId: task.boardId },
                            );
                        },
                    },
                })
            }
            aria-label="Delete task"
        >
            <Trash2 className="size-3.5" />
        </Button>
    );
}

// --- KanbanTaskCard (default composed card) ---

interface KanbanTaskCardProps {
    task: TaskData;
    boardId: string;
    dragging?: boolean;
}

export const KanbanTaskCard = observer(function KanbanTaskCard({
    task,
    dragging,
}: KanbanTaskCardProps) {
    return (
        <TaskContainer task={task} dragging={dragging}>
            <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
            </TaskHeader>
            {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                </p>
            )}
            <TaskFooter>
                <PriorityIndicator task={task} />
                <div className="flex items-center gap-0.5">
                    <MoveArrows task={task} />
                    <EditAction task={task} />
                    <DeleteAction task={task} />
                </div>
            </TaskFooter>
        </TaskContainer>
    );
});

// --- Exported compound component ---

export const KanbanTask = {
    Container: TaskContainer,
    Header: TaskHeader,
    Title: TaskTitle,
    Footer: TaskFooter,
    PriorityIndicator,
    MoveArrows,
    EditAction,
    DeleteAction,
};

export { Tasks as KanbanTasks };
