import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";
import { Kanban, KanbanHandle } from "#/features/kanban";

// localStorage is the source of truth, so the board renders on the client only.
export const Route = createFileRoute("/")({ ssr: false, component: Home });

function Home() {
    return (
        <>
            <KanbanHandle />

            <Kanban.Container>
                <Kanban.Header>
                    <Kanban.Title />

                    <Kanban.Toolbar>
                        <ThemeToggle />
                    </Kanban.Toolbar>
                </Kanban.Header>

                <Kanban.Content>
                    <Kanban.Columns
                        render={(column) => (
                            <Kanban.Column.Container columnId={column.id}>
                                <Kanban.Column.Header>
                                    <Kanban.Column.Title columnId={column.id} />
                                    <Kanban.Column.Count columnId={column.id} />

                                    <Kanban.Column.Actions>
                                        <Kanban.Column.MoveLeftAction
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.MoveRightAction
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.DeleteAction
                                            columnId={column.id}
                                        />
                                    </Kanban.Column.Actions>
                                </Kanban.Column.Header>

                                <Kanban.Column.Content columnId={column.id} />
                            </Kanban.Column.Container>
                        )}
                    />

                    <Kanban.GhostColumn />
                </Kanban.Content>

                <Kanban.ColumnDeleteDialog />
            </Kanban.Container>
        </>
    );
}
