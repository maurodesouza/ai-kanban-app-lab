import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";

import { Clickable } from "#/components/atoms/clickable";
import { Dialog } from "#/components/molecules/dialog";
import { Field } from "#/components/molecules/field";
import { Select } from "#/components/molecules/select";
import { actions } from "#/lib/command";
import {
    getColumns,
    getFilteredTasks,
    getTaskById,
    kanbanState,
} from "#/stores/kanban";
import type { Column, Task, TaskStatus } from "#/types/kanban";
import { cn, twx } from "#/utils/tailwind";

const Container = twx.div`base-1 flex flex-col gap-lg bg-background-base min-h-screen p-lg`;

const Header = twx.div`flex flex-col gap-md md:flex-row md:items-end`;

const Title = twx.h1`text-foreground text-2xl font-bold`;

const Content = twx.div`flex gap-md h-full overflow-x-auto pb-md`;

const ColumnContainer = twx.div`base-1 flex flex-col min-w-60 max-w-80 bg-background-base border border-ring-inner rounded-md`;

const ColumnHeader = twx.div`flex items-center gap-xs p-md border-b border-ring-inner`;

const ColumnContent = twx.div`flex flex-col gap-xs p-md h-full`;

const TaskContainer = twx.div`base-1 flex flex-col bg-background-base border border-ring-inner rounded-md`;

const TaskHeader = twx.div`p-xs`;

const TaskTitle = twx.h3`text-foreground text-sm font-semibold`;

const TaskFooter = twx.div`flex justify-end gap-xs p-xs border-t border-ring-inner`;

type ColumnsProps = {
    render: (column: Column) => React.ReactNode;
};

function Columns(props: ColumnsProps) {
    useSnapshot(kanbanState);
    const columns = getColumns(kanbanState);

    return (
        <>
            {columns.map((column) => (
                <ColumnContainer key={column.id}>
                    {props.render(column)}
                </ColumnContainer>
            ))}
        </>
    );
}

type ColumnTitleProps = {
    columnId: string;
    children: React.ReactNode;
};

function ColumnTitle(props: ColumnTitleProps) {
    const { columnId, children } = props;
    const [value, setValue] = useState(String(children));

    useEffect(() => {
        setValue(String(children));
    }, [children]);

    function handleBlur() {
        if (value !== String(children)) {
            actions.kanban.column.rename({ columnId, title: value });
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.currentTarget.blur();
        }
    }

    return (
        <Field.Input
            className="flex-1"
            onBlur={handleBlur}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            value={value}
        />
    );
}

type AddTaskProps = {
    columnId: string;
};

function AddTask(props: AddTaskProps) {
    return (
        <Clickable.Button
            size="icon"
            title="Add task"
            onClick={() =>
                actions.kanban.ui.openTaskAdd({ columnId: props.columnId })
            }
        >
            <Plus className="size-4" />
        </Clickable.Button>
    );
}

type RemoveColumnProps = {
    columnId: string;
};

function RemoveColumn(props: RemoveColumnProps) {
    return (
        <Clickable.Button
            size="icon"
            title="Remove column"
            onClick={() =>
                actions.kanban.column.remove({ columnId: props.columnId })
            }
        >
            <Trash2 className="size-4" />
        </Clickable.Button>
    );
}

type MoveColumnProps = {
    columnId: string;
    direction: "left" | "right";
};

function MoveColumn(props: MoveColumnProps) {
    const snap = useSnapshot(kanbanState);
    const index = snap.columnOrder.indexOf(props.columnId);
    const disabled =
        (props.direction === "left" && index <= 0) ||
        (props.direction === "right" && index >= snap.columnOrder.length - 1);

    function handleClick() {
        const to = props.direction === "left" ? index - 1 : index + 1;
        actions.kanban.column.reorder({ from: index, to });
    }

    return (
        <Clickable.Button
            disabled={disabled}
            size="icon"
            title={props.direction === "left" ? "Move left" : "Move right"}
            onClick={handleClick}
        >
            {props.direction === "left" ? (
                <ChevronLeft className="size-4" />
            ) : (
                <ChevronRight className="size-4" />
            )}
        </Clickable.Button>
    );
}

type TasksProps = {
    columnId: string;
    render: (task: Task) => React.ReactNode;
};

function Tasks(props: TasksProps) {
    useSnapshot(kanbanState);
    const tasks = getFilteredTasks(props.columnId, kanbanState);

    return (
        <ColumnContent>
            {tasks.map((task) => (
                <TaskContainer key={task.id}>
                    {props.render(task)}
                </TaskContainer>
            ))}
        </ColumnContent>
    );
}

type EditActionProps = {
    taskId: string;
};

function EditAction(props: EditActionProps) {
    return (
        <Clickable.Button
            size="icon"
            title="Edit task"
            onClick={() =>
                actions.kanban.ui.openTaskEdit({ taskId: props.taskId })
            }
        >
            <Pencil className="size-4" />
        </Clickable.Button>
    );
}

type DeleteActionProps = {
    taskId: string;
};

function DeleteAction(props: DeleteActionProps) {
    return (
        <Clickable.Button
            size="icon"
            title="Delete task"
            onClick={() => actions.kanban.task.remove({ taskId: props.taskId })}
        >
            <Trash2 className="size-4" />
        </Clickable.Button>
    );
}

function AddColumn() {
    return (
        <Clickable.Button
            className="self-start"
            onClick={() => actions.kanban.column.add({ title: "New Column" })}
        >
            <Plus className="size-4" />
            Add column
        </Clickable.Button>
    );
}

type FilterInputProps = {
    className?: string;
};

function Filter(props: FilterInputProps) {
    const snap = useSnapshot(kanbanState);

    function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
        actions.kanban.filter.setText(event.target.value);
    }

    function handleStartDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        actions.kanban.filter.setDateRange({
            ...snap.filter.dateRange,
            start: event.target.value || undefined,
        });
    }

    function handleEndDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        actions.kanban.filter.setDateRange({
            ...snap.filter.dateRange,
            end: event.target.value || undefined,
        });
    }

    function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const selected = Array.from(event.target.selectedOptions).map(
            (option) => option.value as TaskStatus,
        );
        actions.kanban.filter.setStatus(selected);
    }

    function handleClear() {
        actions.kanban.filter.clear();
    }

    return (
        <div className={cn("flex flex-wrap items-end gap-md", props.className)}>
            <Field.Container className="min-w-48">
                <Field.Label>Search</Field.Label>
                <Field.Input
                    onChange={handleTextChange}
                    value={snap.filter.text}
                />
            </Field.Container>

            <Field.Container className="min-w-40">
                <Field.Label>Start date</Field.Label>
                <Field.Input
                    onChange={handleStartDateChange}
                    type="date"
                    value={snap.filter.dateRange.start ?? ""}
                />
            </Field.Container>

            <Field.Container className="min-w-40">
                <Field.Label>End date</Field.Label>
                <Field.Input
                    onChange={handleEndDateChange}
                    type="date"
                    value={snap.filter.dateRange.end ?? ""}
                />
            </Field.Container>

            <Field.Container className="min-w-40">
                <Field.Label>Status</Field.Label>
                <Select.Root
                    multiple
                    onChange={handleStatusChange}
                    value={snap.filter.statuses}
                >
                    <Select.Item value="todo">To Do</Select.Item>
                    <Select.Item value="in-progress">In Progress</Select.Item>
                    <Select.Item value="done">Done</Select.Item>
                </Select.Root>
            </Field.Container>

            <Clickable.Button onClick={handleClear}>Clear</Clickable.Button>
        </div>
    );
}

function TaskDialog() {
    const snap = useSnapshot(kanbanState);
    const taskId = snap.ui.editingTaskId;
    const task = taskId ? getTaskById(taskId) : undefined;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        setTitle(task?.title ?? "");
        setDescription(task?.description ?? "");
    }, [task]);

    if (!taskId || !task) {
        return null;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!title.trim()) return;

        actions.kanban.task.edit({
            taskId: taskId as string,
            title,
            description,
        });
    }

    function handleOpenChange(open: boolean) {
        if (!open) actions.kanban.ui.close();
    }

    return (
        <Dialog.Root onOpenChange={handleOpenChange} open>
            <Dialog.Content>
                <form onSubmit={handleSubmit}>
                    <div className="p-md">
                        <Dialog.Title>Edit task</Dialog.Title>

                        <div className="mt-md flex flex-col gap-md">
                            <Field.Container>
                                <Field.Label>Title</Field.Label>
                                <Field.Input
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    value={title}
                                />
                            </Field.Container>

                            <Field.Container>
                                <Field.Label>Description</Field.Label>
                                <Field.TextArea
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    value={description}
                                />
                            </Field.Container>
                        </div>
                    </div>

                    <Dialog.Footer>
                        <Dialog.Close>Cancel</Dialog.Close>
                        <Clickable.Button type="submit">Save</Clickable.Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

function AddTaskDialog() {
    const snap = useSnapshot(kanbanState);
    const columnId = snap.ui.addingTaskColumnId;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (columnId) {
            setTitle("");
            setDescription("");
        }
    }, [columnId]);

    if (!columnId) {
        return null;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!title.trim()) return;

        actions.kanban.task.add({
            columnId: columnId as string,
            title,
            description,
        });
    }

    function handleOpenChange(open: boolean) {
        if (!open) actions.kanban.ui.close();
    }

    return (
        <Dialog.Root onOpenChange={handleOpenChange} open>
            <Dialog.Content>
                <form onSubmit={handleSubmit}>
                    <div className="p-md">
                        <Dialog.Title>Add task</Dialog.Title>

                        <div className="mt-md flex flex-col gap-md">
                            <Field.Container>
                                <Field.Label>Title</Field.Label>
                                <Field.Input
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    value={title}
                                />
                            </Field.Container>

                            <Field.Container>
                                <Field.Label>Description</Field.Label>
                                <Field.TextArea
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    value={description}
                                />
                            </Field.Container>
                        </div>
                    </div>

                    <Dialog.Footer>
                        <Dialog.Close>Cancel</Dialog.Close>
                        <Clickable.Button type="submit">Add</Clickable.Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export const Kanban = {
    Container,
    Header,
    Title,
    Filter,
    Content,
    Columns,
    Column: {
        Container: ColumnContainer,
        Header: ColumnHeader,
        Title: ColumnTitle,
        AddTask,
        Remove: RemoveColumn,
        Move: MoveColumn,
        Content: ColumnContent,
    },
    Tasks,
    Task: {
        Container: TaskContainer,
        Header: TaskHeader,
        Title: TaskTitle,
        Footer: TaskFooter,
        EditAction,
        DeleteAction,
    },
    AddColumn,
    TaskDialog,
    AddTaskDialog,
};
