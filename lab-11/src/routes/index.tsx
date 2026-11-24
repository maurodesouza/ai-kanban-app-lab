import { createFileRoute } from "@tanstack/react-router";
import { ColumnHandle } from "#/features/kanban/components/handles/column/column-handle";
import { PersistenceHandle } from "#/features/kanban/components/handles/persistence/persistence-handle";
import { Kanban } from "#/features/kanban/components/kanban/kanban";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
    return (
        <>
            <PersistenceHandle />
            <ColumnHandle />
            <Kanban.Container>
                <Kanban.Header>
                    <Kanban.Title>AI Todo App</Kanban.Title>
                </Kanban.Header>
                <Kanban.Status>
                    <Kanban.Content>
                        <Kanban.Columns
                            render={(column) => (
                                <Kanban.Column.Container
                                    aria-labelledby={column.titleId}
                                >
                                    <Kanban.Column.Header>
                                        <Kanban.Column.Title
                                            id={column.titleId}
                                        >
                                            {column.title}
                                        </Kanban.Column.Title>
                                        <Kanban.Column.Count
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.MoveAction
                                            columnId={column.id}
                                            direction="previous"
                                        />
                                        <Kanban.Column.MoveAction
                                            columnId={column.id}
                                            direction="next"
                                        />
                                        <Kanban.Column.RenameAction
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.DeleteAction
                                            columnId={column.id}
                                        />
                                    </Kanban.Column.Header>
                                    <Kanban.Column.Content columnId={column.id}>
                                        <Kanban.Column.Empty
                                            columnId={column.id}
                                        />
                                        <Kanban.Tasks
                                            columnId={column.id}
                                            render={(task) => (
                                                <Kanban.Task.Container>
                                                    <Kanban.Task.Header>
                                                        <Kanban.Task.Title>
                                                            {task.title}
                                                        </Kanban.Task.Title>
                                                    </Kanban.Task.Header>
                                                </Kanban.Task.Container>
                                            )}
                                        />
                                    </Kanban.Column.Content>
                                </Kanban.Column.Container>
                            )}
                        />
                        <Kanban.GhostColumn>
                            <Kanban.AddColumnAction />
                        </Kanban.GhostColumn>
                    </Kanban.Content>
                </Kanban.Status>
            </Kanban.Container>
        </>
    );
}
