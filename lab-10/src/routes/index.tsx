import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle/theme-toggle";
import { KanbanHandles } from "#/features/kanban/components/handles/kanban-handles";
import { Kanban } from "#/features/kanban/components/kanban/kanban";
import type { ColumnUI, TaskUI } from "#/features/kanban/store/store";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <>
            <KanbanHandles />

            <Kanban.Container>
                <Kanban.Header>
                    <Kanban.Title />

                    <Kanban.Toolbar>
                        <Kanban.NewTaskAction />
                        <ThemeToggle />
                    </Kanban.Toolbar>
                </Kanban.Header>

                <Kanban.Content>
                    <Kanban.DndProvider>
                        <Kanban.Columns render={renderColumn} />
                        <Kanban.GhostColumn />

                        <Kanban.DragOverlay render={renderTaskPreview} />
                    </Kanban.DndProvider>
                </Kanban.Content>
            </Kanban.Container>

            <Kanban.TaskDialog.Root>
                <Kanban.TaskDialog.Header>
                    <Kanban.TaskDialog.Title />
                    <Kanban.TaskDialog.Description />
                </Kanban.TaskDialog.Header>

                <Kanban.TaskDialog.Body>
                    <Kanban.TaskDialog.TitleField />
                    <Kanban.TaskDialog.DescriptionField />

                    <Kanban.TaskDialog.Row>
                        <Kanban.TaskDialog.ColumnField />
                        <Kanban.TaskDialog.PriorityField />
                    </Kanban.TaskDialog.Row>

                    <Kanban.TaskDialog.Row>
                        <Kanban.TaskDialog.DateField
                            field="startDate"
                            label="Start date"
                        />
                        <Kanban.TaskDialog.DateField
                            field="endDate"
                            label="End date"
                        />
                    </Kanban.TaskDialog.Row>
                </Kanban.TaskDialog.Body>

                <Kanban.TaskDialog.Footer>
                    <Kanban.TaskDialog.Cancel />
                    <Kanban.TaskDialog.Submit />
                </Kanban.TaskDialog.Footer>
            </Kanban.TaskDialog.Root>

            <Kanban.ColumnDeleteDialog.Root>
                <Kanban.ColumnDeleteDialog.Header>
                    <Kanban.ColumnDeleteDialog.Title />
                    <Kanban.ColumnDeleteDialog.Description />
                </Kanban.ColumnDeleteDialog.Header>

                <Kanban.ColumnDeleteDialog.Footer>
                    <Kanban.ColumnDeleteDialog.Cancel />
                    <Kanban.ColumnDeleteDialog.Confirm />
                </Kanban.ColumnDeleteDialog.Footer>
            </Kanban.ColumnDeleteDialog.Root>
        </>
    );
}

function renderColumn(column: ColumnUI) {
    return (
        <Kanban.Column.Container column={column}>
            <Kanban.Column.Header>
                <Kanban.Column.DragHandle column={column} />
                <Kanban.Column.Title column={column} />
                <Kanban.Column.Count column={column} />

                <Kanban.Column.Actions>
                    <Kanban.Column.MoveLeftAction column={column} />
                    <Kanban.Column.MoveRightAction column={column} />
                    <Kanban.Column.AddTaskAction column={column} />

                    <Kanban.Column.Menu column={column}>
                        <Kanban.Column.RenameAction column={column} />
                        <Kanban.Column.DeleteAction column={column} />
                    </Kanban.Column.Menu>
                </Kanban.Column.Actions>
            </Kanban.Column.Header>

            <Kanban.Column.Content>
                <Kanban.Tasks column={column} render={renderTask} />
                <Kanban.Column.Empty column={column} />
            </Kanban.Column.Content>
        </Kanban.Column.Container>
    );
}

function renderTask(task: TaskUI) {
    return (
        <Kanban.Task.Container task={task}>
            <Kanban.Task.Header>
                <Kanban.Task.Title task={task} />
            </Kanban.Task.Header>

            <Kanban.Task.Description task={task} />

            <Kanban.Task.Footer>
                <Kanban.Task.Priority task={task} />
                <Kanban.Task.Dates task={task} />

                <Kanban.Task.Actions>
                    <Kanban.Task.MoveLeftAction task={task} />
                    <Kanban.Task.MoveRightAction task={task} />
                    <Kanban.Task.EditAction task={task} />
                    <Kanban.Task.DeleteAction task={task} />
                </Kanban.Task.Actions>
            </Kanban.Task.Footer>
        </Kanban.Task.Container>
    );
}

function renderTaskPreview(task: TaskUI) {
    return (
        <Kanban.Task.Preview>
            <Kanban.Task.Header>
                <Kanban.Task.Title task={task} />
            </Kanban.Task.Header>

            <Kanban.Task.Description task={task} />

            <Kanban.Task.Footer>
                <Kanban.Task.Dates task={task} />
            </Kanban.Task.Footer>
        </Kanban.Task.Preview>
    );
}
