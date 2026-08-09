import { createFileRoute } from "@tanstack/react-router";

import { Kanban } from "#/components/organisms/kanban";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
    return (
        <Kanban.Container>
            <Kanban.Header>
                <Kanban.Title>Kanban board</Kanban.Title>
                <Kanban.Filter />
            </Kanban.Header>

            <Kanban.Content>
                <Kanban.Columns
                    render={(column) => (
                        <Kanban.Column.Container key={column.id}>
                            <Kanban.Column.Header>
                                <Kanban.Column.Move
                                    columnId={column.id}
                                    direction="left"
                                />
                                <Kanban.Column.Title columnId={column.id}>
                                    {column.title}
                                </Kanban.Column.Title>
                                <Kanban.Column.AddTask columnId={column.id} />
                                <Kanban.Column.Remove columnId={column.id} />
                                <Kanban.Column.Move
                                    columnId={column.id}
                                    direction="right"
                                />
                            </Kanban.Column.Header>

                            <Kanban.Column.Content>
                                <Kanban.Tasks
                                    columnId={column.id}
                                    render={(task) => (
                                        <Kanban.Task.Container key={task.id}>
                                            <Kanban.Task.Header>
                                                <Kanban.Task.Title>
                                                    {task.title}
                                                </Kanban.Task.Title>
                                            </Kanban.Task.Header>

                                            <Kanban.Task.Footer>
                                                <Kanban.Task.EditAction
                                                    taskId={task.id}
                                                />
                                                <Kanban.Task.DeleteAction
                                                    taskId={task.id}
                                                />
                                            </Kanban.Task.Footer>
                                        </Kanban.Task.Container>
                                    )}
                                />
                            </Kanban.Column.Content>
                        </Kanban.Column.Container>
                    )}
                />
            </Kanban.Content>

            <Kanban.AddColumn />
            <Kanban.TaskDialog />
            <Kanban.AddTaskDialog />
        </Kanban.Container>
    );
}
