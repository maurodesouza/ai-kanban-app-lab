import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";
import { Kanban, KanbanHandle } from "#/features/kanban";
import { TaskForm, TaskFormHandle } from "#/features/task-form";

// localStorage is the source of truth, so the board renders on the client only.
export const Route = createFileRoute("/")({ ssr: false, component: Home });

function Home() {
    return (
        <>
            <KanbanHandle />
            <TaskFormHandle />

            <Kanban.Container>
                <Kanban.Header>
                    <Kanban.Title />

                    <Kanban.Toolbar>
                        <Kanban.AddTaskAction />
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
                                        <Kanban.Column.AddTaskAction
                                            columnId={column.id}
                                        />
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

                                <Kanban.Column.Content columnId={column.id}>
                                    <Kanban.Column.EmptyState
                                        columnId={column.id}
                                    />

                                    <Kanban.Tasks
                                        columnId={column.id}
                                        render={(task) => (
                                            <Kanban.Task.Container
                                                taskId={task.id}
                                            >
                                                <Kanban.Task.Header>
                                                    <Kanban.Task.Title
                                                        taskId={task.id}
                                                    />
                                                    <Kanban.Task.Priority
                                                        taskId={task.id}
                                                    />
                                                </Kanban.Task.Header>

                                                <Kanban.Task.Description
                                                    taskId={task.id}
                                                />

                                                <Kanban.Task.Footer>
                                                    <Kanban.Task.Dates
                                                        taskId={task.id}
                                                    />

                                                    <Kanban.Task.Actions>
                                                        <Kanban.Task.MoveLeftAction
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.MoveRightAction
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.EditAction
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.DeleteAction
                                                            taskId={task.id}
                                                        />
                                                    </Kanban.Task.Actions>
                                                </Kanban.Task.Footer>
                                            </Kanban.Task.Container>
                                        )}
                                    />
                                </Kanban.Column.Content>
                            </Kanban.Column.Container>
                        )}
                    />

                    <Kanban.GhostColumn />
                </Kanban.Content>

                <Kanban.ColumnDeleteDialog />

                <TaskForm.Dialog>
                    <TaskForm.Header>
                        <TaskForm.Title />
                        <TaskForm.Description />
                    </TaskForm.Header>

                    <TaskForm.Body>
                        <TaskForm.TitleField />
                        <TaskForm.DescriptionField />
                        <TaskForm.PriorityField />

                        <TaskForm.Row>
                            <TaskForm.StartDateField />
                            <TaskForm.EndDateField />
                        </TaskForm.Row>

                        <TaskForm.FormError />
                    </TaskForm.Body>

                    <TaskForm.Footer>
                        <TaskForm.Cancel />
                        <TaskForm.Submit />
                    </TaskForm.Footer>
                </TaskForm.Dialog>
            </Kanban.Container>
        </>
    );
}
