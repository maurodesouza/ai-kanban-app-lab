import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "#/components/shared/clickable/button";
import { ConfirmDialog } from "#/components/shared/modal/confirm-dialog";
import { AddColumn, Kanban } from "#/features/kanban/components";
import { actions } from "#/lib/command";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    return (
        <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-4 p-6">
            <Kanban.Container>
                <Kanban.Header>
                    <Kanban.Title>AI Todo App</Kanban.Title>
                    <div className="flex items-center gap-2">
                        <Kanban.Filter />
                        <Button
                            size="sm"
                            onClick={() =>
                                actions.modal.open({ mode: "create" })
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </Kanban.Header>
                <Kanban.Content>
                    <Kanban.Columns
                        render={(column) => (
                            <Kanban.Column.Container key={column.id}>
                                <Kanban.Column.Header>
                                    <Kanban.Column.Title
                                        columnId={column.id}
                                        title={column.title}
                                    />
                                    <div className="flex items-center gap-0.5">
                                        <Kanban.Column.MoveLeftAction
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.MoveRightAction
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.DeleteAction
                                            columnId={column.id}
                                        />
                                    </div>
                                </Kanban.Column.Header>
                                <Kanban.Column.Content>
                                    <Kanban.Tasks
                                        columnId={column.id}
                                        fallback={
                                            <p className="py-4 text-center text-xs text-muted-foreground">
                                                No tasks
                                            </p>
                                        }
                                        render={(task) => (
                                            <Kanban.Task.Container
                                                key={task.id}
                                                className="flex flex-col gap-2"
                                            >
                                                <Kanban.Task.Header>
                                                    <Kanban.Task.Title>
                                                        {task.title}
                                                    </Kanban.Task.Title>
                                                    <Kanban.Task.PriorityAction
                                                        taskId={task.id}
                                                        priority={task.priority}
                                                    />
                                                </Kanban.Task.Header>
                                                {task.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                        {task.startDate}
                                                        {" → "}
                                                        {task.endDate}
                                                    </span>
                                                </div>
                                                <Kanban.Task.Footer>
                                                    <Kanban.Task.MoveLeftAction
                                                        taskId={task.id}
                                                    />
                                                    <Kanban.Task.MoveRightAction
                                                        taskId={task.id}
                                                    />
                                                    <div className="ml-auto flex items-center gap-0.5">
                                                        <Kanban.Task.EditAction
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.DeleteAction
                                                            taskId={task.id}
                                                        />
                                                    </div>
                                                </Kanban.Task.Footer>
                                            </Kanban.Task.Container>
                                        )}
                                    />
                                    <Kanban.Column.AddTaskAction
                                        columnId={column.id}
                                    />
                                </Kanban.Column.Content>
                            </Kanban.Column.Container>
                        )}
                    />
                    <AddColumn />
                </Kanban.Content>
            </Kanban.Container>
            <ConfirmDialog />
        </main>
    );
}
