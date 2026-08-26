import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { ModalHandle } from "#/components/handles/modal/modal-handle";
import { Button } from "#/components/ui/button";
import { BoardSwitcher } from "#/features/kanban/components/board-switcher";
import {
    KanbanColumn,
    KanbanColumnCompound,
} from "#/features/kanban/components/column/column";
import { BoardHandle } from "#/features/kanban/components/handles/board/board-handle";
import { Kanban } from "#/features/kanban/components/kanban/kanban";
import { KanbanProvider } from "#/features/kanban/components/kanban/kanban-provider";
import { KanbanTaskCard } from "#/features/kanban/components/task/task";
import { kanbanStore } from "#/features/kanban/store/kanban-store";
import { ThemeToggle } from "#/features/theme/theme-toggle";
import { actions } from "#/lib/command";

const Home = observer(function Home() {
    const activeBoard = kanbanStore.activeBoard;

    return (
        <>
            <BoardHandle />
            <ModalHandle />

            {activeBoard ? (
                <KanbanProvider boardId={activeBoard.id}>
                    <Kanban.Container className="h-screen">
                        <Kanban.Header>
                            <div className="flex items-center gap-3">
                                <BoardSwitcher />
                                <Kanban.Title>{activeBoard.title}</Kanban.Title>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() =>
                                        actions.modal.open({
                                            kind: "task",
                                            data: {
                                                mode: "create",
                                                boardId: activeBoard.id,
                                            },
                                        })
                                    }
                                >
                                    <Plus className="size-4" />
                                    Add task
                                </Button>
                                <Kanban.Filter />
                                <ThemeToggle />
                            </div>
                        </Kanban.Header>

                        <Kanban.Content>
                            <div className="flex h-full gap-4 overflow-x-auto">
                                <Kanban.Columns
                                    render={(column) => {
                                        return (
                                            <KanbanColumn
                                                column={column}
                                                renderTask={(task) => (
                                                    <KanbanTaskCard
                                                        task={task}
                                                        boardId={column.boardId}
                                                    />
                                                )}
                                            />
                                        );
                                    }}
                                />
                                <KanbanColumnCompound.AddColumnGhost />
                            </div>
                        </Kanban.Content>
                    </Kanban.Container>
                </KanbanProvider>
            ) : (
                <div className="flex h-screen flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">No boards yet.</p>
                    <Button onClick={() => actions.kanban.board.create({})}>
                        <Plus className="size-4" />
                        Create your first board
                    </Button>
                </div>
            )}
        </>
    );
});

export const Route = createFileRoute("/")({ component: Home });
