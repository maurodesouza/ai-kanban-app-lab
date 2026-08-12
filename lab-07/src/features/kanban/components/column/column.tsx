import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "#/components/shared/clickable/button";
import { Input } from "#/components/shared/fields/input";
import { actions } from "#/lib/command";
import { cn } from "#/utils/cn";

function Container({
    children,
    className,
}: Readonly<{ children: ReactNode; className?: string }>) {
    return (
        <div
            className={cn(
                "flex w-72 shrink-0 flex-col gap-3 rounded-lg border bg-card p-3",
                className,
            )}
        >
            {children}
        </div>
    );
}

function Header({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex items-center justify-between gap-2">
            {children}
        </div>
    );
}

function Title({ columnId, title }: { columnId: string; title: string }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);

    if (editing) {
        return (
            <Input
                value={value}
                autoFocus
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        actions.kanban.column.rename({
                            columnId,
                            title: value.trim() || title,
                        });
                        setEditing(false);
                    }
                    if (e.key === "Escape") {
                        setValue(title);
                        setEditing(false);
                    }
                }}
                onBlur={() => {
                    setValue(title);
                    setEditing(false);
                }}
                className="h-7 text-sm"
            />
        );
    }

    return (
        <button
            type="button"
            className="truncate text-sm font-semibold text-foreground"
            onClick={() => {
                setValue(title);
                setEditing(true);
            }}
        >
            {title}
        </button>
    );
}

function Content({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {children}
        </div>
    );
}

function AddTaskAction({ columnId }: { columnId: string }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => actions.modal.open({ mode: "create", columnId })}
        >
            <Plus className="h-4 w-4" />
            Add Task
        </Button>
    );
}

function DeleteAction({ columnId }: { columnId: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() =>
                actions.modal.confirm.open({
                    id: `delete-column-${columnId}`,
                    title: "Delete column?",
                    message:
                        "All tasks in this column will be deleted. This action cannot be undone.",
                    confirmCommand: "kanban.column.delete",
                    confirmPayload: { columnId },
                })
            }
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}

function MoveLeftAction({ columnId }: { columnId: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
                const store = kanbanStore;
                const index = store.getColumnIndex(columnId);
                if (index > 0) {
                    actions.kanban.column.move({
                        columnId,
                        toIndex: index - 1,
                    });
                }
            }}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
    );
}

function MoveRightAction({ columnId }: { columnId: string }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
                const store = kanbanStore;
                const index = store.getColumnIndex(columnId);
                if (index < store.columnCount - 1) {
                    actions.kanban.column.move({
                        columnId,
                        toIndex: index + 1,
                    });
                }
            }}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    );
}

import { kanbanStore } from "#/stores";

export const Column = {
    Container,
    Header,
    Title,
    Content,
    AddTaskAction,
    DeleteAction,
    MoveLeftAction,
    MoveRightAction,
};
