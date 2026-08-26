import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { actions } from "#/lib/command";
import { kanbanStore } from "#/features/kanban/store/kanban-store";

export const BoardSwitcher = observer(function BoardSwitcher() {
    const boards = kanbanStore.boardsList;
    const activeBoard = kanbanStore.activeBoard;

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(activeBoard?.title ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(activeBoard?.title ?? "");
    }, [activeBoard?.id]);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    function commitRename() {
        const trimmed = title.trim();
        if (trimmed && activeBoard && trimmed !== activeBoard.title) {
            actions.kanban.board.rename({
                boardId: activeBoard.id,
                title: trimmed,
            });
        } else {
            setTitle(activeBoard?.title ?? "");
        }
        setEditing(false);
    }

    function handleCreate() {
        actions.kanban.board.create({});
    }

    function handleDelete() {
        if (!activeBoard) return;
        const boardCount = boards.length;
        if (boardCount <= 1) return;

        actions.modal.open({
            kind: "confirm",
            data: {
                title: "Delete board",
                message: `Delete "${activeBoard.title}"? All columns and tasks inside it will be permanently removed.`,
                confirmLabel: "Delete",
                onConfirm: () => {
                    actions.kanban.board.delete({ boardId: activeBoard.id });
                },
            },
        });
    }

    if (editing && activeBoard) {
        return (
            <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") {
                        setTitle(activeBoard.title);
                        setEditing(false);
                    }
                }}
                className="h-9 w-48"
            />
        );
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        {activeBoard?.title ?? "Select board"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {boards.map((board) => (
                        <DropdownMenuItem
                            key={board.id}
                            onClick={() =>
                                actions.kanban.board.select({
                                    boardId: board.id,
                                })
                            }
                            className={cn(
                                board.id === activeBoard?.id && "font-semibold",
                            )}
                        >
                            {board.title}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {activeBoard && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                >
                    Rename
                </Button>
            )}

            <Button variant="ghost" size="icon" onClick={handleCreate}>
                <Plus className="size-4" />
            </Button>

            {boards.length > 1 && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </Button>
            )}
        </div>
    );
});
