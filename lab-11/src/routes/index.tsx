import { createFileRoute } from "@tanstack/react-router";
import { ThemeAction } from "#/components/theme-action";
import { ColumnHandle } from "#/features/kanban/components/handles/column/column-handle";
import { FilterHandle } from "#/features/kanban/components/handles/filter/filter-handle";
import { PersistenceHandle } from "#/features/kanban/components/handles/persistence/persistence-handle";
import { TaskHandle } from "#/features/kanban/components/handles/task/task-handle";
import { Kanban } from "#/features/kanban/components/kanban/kanban";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
    return (
        <>
            <PersistenceHandle />
            <ColumnHandle />
            <TaskHandle />
            <FilterHandle />
            <Kanban.Container>
                <Kanban.Status>
                    <Kanban.Header>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Kanban.Title>AI Todo App</Kanban.Title>
                            <div className="flex flex-wrap gap-2">
                                <ThemeAction />
                                <Kanban.AddTaskAction />
                            </div>
                        </div>
                        <Kanban.Filter>
                            <Kanban.SearchFilter />
                            <Kanban.DateFromFilter />
                            <Kanban.DateToFilter />
                            <Kanban.PriorityFilter />
                            <Kanban.ClearFiltersAction />
                        </Kanban.Filter>
                        <Kanban.DateFilterMessage />
                    </Kanban.Header>
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
                                        <Kanban.Column.AddTaskAction
                                            columnId={column.id}
                                        />
                                        <Kanban.Column.Empty
                                            columnId={column.id}
                                        />
                                        <Kanban.Tasks
                                            columnId={column.id}
                                            render={(task) => (
                                                <Kanban.Task.Container
                                                    taskId={task.id}
                                                >
                                                    <Kanban.Task.Header>
                                                        <Kanban.Task.Title>
                                                            {task.title}
                                                        </Kanban.Task.Title>
                                                        <Kanban.Task.DragHandle
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.PriorityControl
                                                            taskId={task.id}
                                                        />
                                                    </Kanban.Task.Header>
                                                    <Kanban.Task.Content>
                                                        <Kanban.Task.Description>
                                                            {task.description}
                                                        </Kanban.Task.Description>
                                                        <Kanban.Task.DateRange>
                                                            {
                                                                task.dateRangeLabel
                                                            }
                                                        </Kanban.Task.DateRange>
                                                    </Kanban.Task.Content>
                                                    <Kanban.Task.Footer>
                                                        <Kanban.Task.EditAction
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.DeleteAction
                                                            taskId={task.id}
                                                        />
                                                        <Kanban.Task.MoveAction
                                                            taskId={task.id}
                                                            direction="previous"
                                                        />
                                                        <Kanban.Task.MoveAction
                                                            taskId={task.id}
                                                            direction="next"
                                                        />
                                                    </Kanban.Task.Footer>
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
