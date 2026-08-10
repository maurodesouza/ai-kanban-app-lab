import { Clickable, ThemeToggle } from "#/components/atoms";
import { ConfirmDialog, Dialog } from "#/components/molecules";
import { Kanban } from "#/components/organisms/kanban";
import { useTransition } from "#/hooks/use-transition";
import { actions } from "#/lib/command";
import type { ConfirmDialog as ConfirmDescriptor } from "#/stores";

function ConfirmCancel() {
    const pending = useTransition(["dialog.close"]);
    return (
        <Clickable.Button
            variant="outline"
            disabled={pending}
            onClick={() => void actions.dialog.close()}
        >
            Cancel
        </Clickable.Button>
    );
}

function ConfirmAction({ descriptor }: { descriptor: ConfirmDescriptor }) {
    const removingColumn = useTransition(["kanban.column.remove"]);
    const removingTask = useTransition(["kanban.task.remove"]);
    return (
        <Clickable.Button
            variant="destructive"
            disabled={removingColumn || removingTask}
            onClick={async () => {
                await descriptor.onConfirm();
                await actions.dialog.close();
            }}
        >
            Delete permanently
        </Clickable.Button>
    );
}

export function Board() {
    return (
        <Kanban.Container>
            <Kanban.Header>
                <Kanban.Title>AI Kanban App</Kanban.Title>
                <Kanban.Filter>Filters coming in #106</Kanban.Filter>
                <div className="flex items-center gap-2">
                    <ThemeToggle.Button />
                    <Kanban.AddTaskAction />
                </div>
            </Kanban.Header>

            <Kanban.Content>
                <div className="flex min-w-max items-start gap-4 pb-4">
                    <Kanban.Columns
                        render={(column, columnIndex) => (
                            <Kanban.Column.Container
                                columnId={column.id}
                                aria-label={column.title}
                            >
                                <Kanban.Column.Header>
                                    <Kanban.Column.Title columnId={column.id}>
                                        {column.title}
                                    </Kanban.Column.Title>
                                    <Kanban.Column.MoveLeft
                                        index={columnIndex}
                                    />
                                    <Kanban.Column.MoveRight
                                        index={columnIndex}
                                    />
                                    <Kanban.Column.Delete
                                        columnId={column.id}
                                        title={column.title}
                                    />
                                </Kanban.Column.Header>

                                <Kanban.Column.Content>
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
                                                    <Kanban.Task.Priority
                                                        taskId={task.id}
                                                        priority={task.priority}
                                                    />
                                                </Kanban.Task.Header>
                                                <Kanban.Task.Description>
                                                    {task.description}
                                                </Kanban.Task.Description>
                                                <Kanban.Task.Dates
                                                    startDate={task.startDate}
                                                    endDate={task.endDate}
                                                />

                                                <Kanban.Task.Footer>
                                                    <Kanban.Task.MovePrev
                                                        taskId={task.id}
                                                        columnId={task.columnId}
                                                    />
                                                    <Kanban.Task.MoveNext
                                                        taskId={task.id}
                                                        columnId={task.columnId}
                                                    />
                                                    <span className="flex-1" />
                                                    <Kanban.Task.EditAction
                                                        taskId={task.id}
                                                    />
                                                    <Kanban.Task.DeleteAction
                                                        taskId={task.id}
                                                        title={task.title}
                                                    />
                                                </Kanban.Task.Footer>
                                            </Kanban.Task.Container>
                                        )}
                                    />
                                    <Kanban.Column.AddTask
                                        columnId={column.id}
                                    />
                                </Kanban.Column.Content>
                            </Kanban.Column.Container>
                        )}
                    />
                    <Kanban.Column.Ghost />
                </div>
            </Kanban.Content>

            <Kanban.DialogHost
                render={(descriptor) => {
                    if (descriptor.type === "taskForm") {
                        return (
                            <Dialog.Root
                                open
                                onOpenChange={(open) => {
                                    if (!open) void actions.dialog.close();
                                }}
                            >
                                <Dialog.Portal>
                                    <Dialog.Overlay />
                                    <Dialog.Content>
                                        <Dialog.Header>
                                            <Dialog.Title>
                                                {descriptor.taskId
                                                    ? "Edit task"
                                                    : "Add task"}
                                            </Dialog.Title>
                                            <Dialog.Description>
                                                {descriptor.taskId
                                                    ? "Update the task details."
                                                    : "Create a task in a board column."}
                                            </Dialog.Description>
                                        </Dialog.Header>
                                        <Dialog.Body>
                                            <Kanban.TaskForm.Provider
                                                taskId={descriptor.taskId}
                                                columnId={descriptor.columnId}
                                            >
                                                <Kanban.TaskForm.Root>
                                                    <Kanban.TaskForm.TitleField />
                                                    <Kanban.TaskForm.DescriptionField />
                                                    <Kanban.TaskForm.PriorityField />
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <Kanban.TaskForm.StartDateField />
                                                        <Kanban.TaskForm.EndDateField />
                                                    </div>
                                                    {!descriptor.taskId ? (
                                                        <Kanban.TaskForm.ColumnField />
                                                    ) : null}
                                                    <Kanban.TaskForm.Actions>
                                                        <Kanban.TaskForm.Cancel />
                                                        <Kanban.TaskForm.Submit>
                                                            {descriptor.taskId
                                                                ? "Save changes"
                                                                : "Add task"}
                                                        </Kanban.TaskForm.Submit>
                                                    </Kanban.TaskForm.Actions>
                                                </Kanban.TaskForm.Root>
                                            </Kanban.TaskForm.Provider>
                                        </Dialog.Body>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
                        );
                    }

                    return (
                        <ConfirmDialog.Root
                            open
                            onOpenChange={(open) => {
                                if (!open) void actions.dialog.close();
                            }}
                        >
                            <ConfirmDialog.Portal>
                                <ConfirmDialog.Overlay />
                                <ConfirmDialog.Content>
                                    <ConfirmDialog.Header>
                                        <ConfirmDialog.Title>
                                            {descriptor.title}
                                        </ConfirmDialog.Title>
                                        <ConfirmDialog.Description>
                                            {descriptor.description}
                                        </ConfirmDialog.Description>
                                    </ConfirmDialog.Header>
                                    <ConfirmDialog.Footer>
                                        <ConfirmCancel />
                                        <ConfirmAction
                                            descriptor={descriptor}
                                        />
                                    </ConfirmDialog.Footer>
                                </ConfirmDialog.Content>
                            </ConfirmDialog.Portal>
                        </ConfirmDialog.Root>
                    );
                }}
            />
        </Kanban.Container>
    );
}
