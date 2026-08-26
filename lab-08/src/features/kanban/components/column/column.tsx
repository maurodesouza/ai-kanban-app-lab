import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import type { ColumnData, TaskData } from "#/features/kanban/types";
import { actions } from "#/lib/command";
import { cn } from "#/lib/utils";
import { useKanbanContext } from "../kanban/kanban-context";
import { KanbanTaskCard, KanbanTasks } from "../task/task";

// --- Column.Container (sortable wrapper) ---

interface ColumnContainerProps {
    column: ColumnData;
    children: ReactNode;
    className?: string;
}

const ColumnContainer = observer(function ColumnContainer({
    column,
    children,
    className,
}: ColumnContainerProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: { type: "column", columnId: column.id },
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
                "flex w-72 shrink-0 flex-col rounded-lg border bg-card",
                isDragging && "opacity-50",
                className,
            )}
            data-column-id={column.id}
        >
            <ColumnSortableContext.Provider value={{ attributes, listeners }}>
                {children}
            </ColumnSortableContext.Provider>
        </div>
    );
});

// Context to pass drag listeners from Container to Header's grip handle
const ColumnSortableContext = createContext<{
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
} | null>(null);

// --- Column.Header (grip + title + delete row) ---

interface HeaderProps {
    column: ColumnData;
    children: ReactNode;
    className?: string;
}

const Header = observer(function Header({
    column,
    children,
    className,
}: HeaderProps) {
    const { boardId } = useKanbanContext();
    const sortable = useContext(ColumnSortableContext);

    function handleDelete() {
        const taskCount = column.taskIds.length;
        const message =
            taskCount > 0
                ? `Delete "${column.title}"? This will permanently remove ${taskCount} task${taskCount > 1 ? "s" : ""} inside it.`
                : `Delete "${column.title}"?`;

        actions.modal.open({
            kind: "confirm",
            data: {
                title: "Delete column",
                message,
                confirmLabel: "Delete",
                onConfirm: () => {
                    actions.kanban.column.delete(
                        { boardId, columnId: column.id },
                        { instanceId: boardId },
                    );
                },
            },
        });
    }

    return (
        <div
            className={cn(
                "flex items-center gap-1 border-b border-border px-3 py-2",
                className,
            )}
        >
            <button
                type="button"
                className="cursor-grab text-muted-foreground hover:text-foreground"
                {...sortable?.attributes}
                {...sortable?.listeners}
                aria-label="Drag column"
            >
                <GripVertical className="size-4 shrink-0" />
            </button>
            {children}
            <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-7 shrink-0"
                onClick={handleDelete}
                aria-label="Delete column"
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
});

// --- Column.Title (inline editable) ---

interface TitleProps {
    column: ColumnData;
    className?: string;
}

const Title = observer(function Title({ column, className }: TitleProps) {
    const { boardId } = useKanbanContext();
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(column.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    function commit() {
        const trimmed = value.trim();
        if (trimmed && trimmed !== column.title) {
            actions.kanban.column.rename(
                { boardId, columnId: column.id, title: trimmed },
                { instanceId: boardId },
            );
        } else {
            setValue(column.title);
        }
        setEditing(false);
    }

    function cancel() {
        setValue(column.title);
        setEditing(false);
    }

    if (editing) {
        return (
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") cancel();
                }}
                className={cn("h-7 flex-1", className)}
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
                "flex-1 cursor-text text-sm font-semibold text-left",
                className,
            )}
        >
            {column.title}
        </button>
    );
});

// --- Column.Content (sortable task list) ---

interface ContentProps {
    column: ColumnData;
    children: ReactNode;
    className?: string;
}

const Content = observer(function Content({
    column,
    children,
    className,
}: ContentProps) {
    const taskIds = column.taskIds;

    return (
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div
                className={cn(
                    "flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-2",
                    className,
                )}
            >
                {children}
            </div>
        </SortableContext>
    );
});

// --- Column.AddTaskButton ---

interface AddTaskButtonProps {
    column: ColumnData;
}

function AddTaskButton({ column }: AddTaskButtonProps) {
    const { boardId } = useKanbanContext();
    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() =>
                actions.modal.open({
                    kind: "task",
                    data: {
                        mode: "create",
                        boardId,
                        columnId: column.id,
                    },
                })
            }
        >
            <Plus className="size-4" />
            Add task
        </Button>
    );
}

// --- Column.Footer ---

interface FooterProps {
    children: ReactNode;
    className?: string;
}

function Footer({ children, className }: FooterProps) {
    return (
        <div
            className={cn(
                "mt-auto border-t border-border px-3 py-2",
                className,
            )}
        >
            {children}
        </div>
    );
}

// --- Ghost Column ---

function AddColumnGhost() {
    const { boardId } = useKanbanContext();
    return (
        <button
            type="button"
            onClick={() => {
                actions.kanban.column.add({ boardId }, { instanceId: boardId });
            }}
            className="flex w-72 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-3 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground"
        >
            <Plus className="size-5" />
            <span className="text-sm font-medium">Add column</span>
        </button>
    );
}

// --- KanbanColumn (composed default shell) ---

interface KanbanColumnProps {
    column: ColumnData;
    renderTask?: (task: TaskData) => ReactNode;
}

export const KanbanColumn = observer(function KanbanColumn({
    column,
    renderTask,
}: KanbanColumnProps) {
    return (
        <ColumnContainer column={column}>
            <Header column={column}>
                <Title column={column} />
            </Header>
            <Content column={column}>
                <KanbanTasks column={column} render={renderTask} />
            </Content>
            <Footer>
                <AddTaskButton column={column} />
            </Footer>
        </ColumnContainer>
    );
});

// --- Exported compound component ---

export const KanbanColumnCompound = {
    Container: ColumnContainer,
    Header,
    Title,
    Content,
    Footer,
    AddTaskButton,
    AddColumnGhost,
};

export { KanbanTaskCard, KanbanTasks };
