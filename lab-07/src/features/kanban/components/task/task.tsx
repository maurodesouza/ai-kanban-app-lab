import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "#/components/shared/clickable/button";
import { actions } from "#/lib/command";
import { kanbanStore } from "#/stores";
import type { Priority } from "#/types/domain";
import { cn } from "#/utils/cn";

const PRIORITY_COLORS: Record<Priority, string> = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
};

function Container({
    children,
    className,
}: Readonly<{ children: ReactNode; className?: string }>) {
    return (
        <div
            className={cn(
                "rounded-md border bg-background p-3 shadow-sm",
                className,
            )}
        >
            {children}
        </div>
    );
}

function Header({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex items-start justify-between gap-2">{children}</div>
    );
}

function Title({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <span className="text-sm font-medium leading-tight text-foreground">
            {children}
        </span>
    );
}

function Footer({ children }: Readonly<{ children: ReactNode }>) {
    return <div className="mt-2 flex items-center gap-1">{children}</div>;
}

function DeleteAction({ taskId }: { taskId: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => actions.kanban.task.delete({ taskId })}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}

function EditAction({ taskId }: { taskId: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => actions.modal.open({ mode: "edit", taskId })}
        >
            <Pencil className="h-4 w-4" />
        </Button>
    );
}

function PriorityAction({
    taskId,
    priority,
}: {
    taskId: string;
    priority: Priority;
}) {
    const next: Priority =
        priority === "low" ? "medium" : priority === "medium" ? "high" : "low";

    return (
        <button
            type="button"
            className={cn(
                "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-white",
                PRIORITY_COLORS[priority],
            )}
            onClick={() =>
                actions.kanban.task.priority.set({ taskId, priority: next })
            }
        >
            {priority}
        </button>
    );
}

function MoveLeftAction({ taskId }: { taskId: string }) {
    const task = kanbanStore.tasks.get(taskId);
    const disabled =
        !task ||
        kanbanStore.getAdjacentColumnId(task.columnId, "left") === null;

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={disabled}
            onClick={() => {
                if (!task) return;
                const target = kanbanStore.getAdjacentColumnId(
                    task.columnId,
                    "left",
                );
                if (target) {
                    actions.kanban.task.move({ taskId, toColumnId: target });
                }
            }}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
    );
}

function MoveRightAction({ taskId }: { taskId: string }) {
    const task = kanbanStore.tasks.get(taskId);
    const disabled =
        !task ||
        kanbanStore.getAdjacentColumnId(task.columnId, "right") === null;

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={disabled}
            onClick={() => {
                if (!task) return;
                const target = kanbanStore.getAdjacentColumnId(
                    task.columnId,
                    "right",
                );
                if (target) {
                    actions.kanban.task.move({ taskId, toColumnId: target });
                }
            }}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    );
}

export const Task = {
    Container,
    Header,
    Title,
    Footer,
    DeleteAction,
    EditAction,
    PriorityAction,
    MoveLeftAction,
    MoveRightAction,
};
