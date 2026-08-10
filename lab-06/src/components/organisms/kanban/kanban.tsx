import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import {
    createContext,
    type FormEvent,
    Fragment,
    forwardRef,
    type HTMLAttributes,
    type ReactNode,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import { Badge, Clickable, Field, Text } from "#/components/atoms";
import { useTransition } from "#/hooks/use-transition";
import { actions } from "#/lib/command";
import {
    createTaskDraftDefaults,
    type TaskDraftErrors,
    TaskDraftValidationError,
} from "#/lib/validation";
import { getRootStore } from "#/stores";
import type {
    Column as ColumnModel,
    Priority,
    TaskDraft,
    Task as TaskModel,
} from "#/types/kanban";
import { cn } from "#/utils/tailwind";

const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"];
const priorityLabel = (priority: Priority) =>
    priority[0].toUpperCase() + priority.slice(1);

const InlineEditContext = createContext<{
    editingColumnId: string | null;
    setEditingColumnId: (columnId: string | null) => void;
} | null>(null);

function Container({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLElement>) {
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    return (
        <InlineEditContext.Provider
            value={{ editingColumnId, setEditingColumnId }}
        >
            <main
                className={cn(
                    "min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8",
                    className,
                )}
                {...props}
            >
                {children}
            </main>
        </InlineEditContext.Provider>
    );
}

const Header = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => (
        <header
            ref={ref}
            className={cn(
                "mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4",
                className,
            )}
            {...props}
        />
    ),
);
Header.displayName = "Kanban.Header";

function Title({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return <Text.Heading level={1} className={className} {...props} />;
}

function Filter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <section
            className={cn(
                "rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground",
                className,
            )}
            aria-label="Task filters"
            {...props}
        />
    );
}

const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "mx-auto mt-6 max-w-screen-2xl overflow-x-auto",
                className,
            )}
            {...props}
        />
    ),
);
Content.displayName = "Kanban.Content";

type ColumnsProps = {
    render: (column: ColumnModel, index: number) => ReactNode;
};

const Columns = observer(function Columns({ render }: ColumnsProps) {
    const { board } = getRootStore();
    return board.columnOrder.map((columnId, index) => {
        const column = board.columns[columnId];
        return column ? (
            <Fragment key={column.id}>{render(column, index)}</Fragment>
        ) : null;
    });
});

const ColumnContainer = forwardRef<
    HTMLElement,
    HTMLAttributes<HTMLElement> & { columnId?: string }
>(({ className, columnId, ...props }, ref) => (
    <section
        ref={ref}
        data-column-id={columnId}
        className={cn(
            "flex w-80 shrink-0 flex-col rounded-xl border border-border bg-muted/40 p-3",
            className,
        )}
        {...props}
    />
));
ColumnContainer.displayName = "Kanban.Column.Container";

const ColumnHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("mb-3 flex items-center gap-1", className)}
            {...props}
        />
    ),
);
ColumnHeader.displayName = "Kanban.Column.Header";

type ColumnTitleProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
    columnId: string;
    children: ReactNode;
};

const ColumnTitle = observer(function ColumnTitle({
    columnId,
    children,
    className,
    ...props
}: ColumnTitleProps) {
    const editing = useContext(InlineEditContext);
    const [value, setValue] = useState(String(children));
    const inputRef = useRef<HTMLInputElement>(null);
    const pending = useTransition(["kanban.column.rename"]);
    const isEditing = editing?.editingColumnId === columnId;

    useEffect(() => setValue(String(children)), [children]);
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    async function commit() {
        const title = value.trim();
        if (title && title !== String(children)) {
            await actions.kanban.column.rename({ columnId, title });
        } else {
            setValue(String(children));
        }
        editing?.setEditingColumnId(null);
    }

    if (isEditing) {
        return (
            <Field.Input
                ref={inputRef}
                aria-label={`Rename ${String(children)} column`}
                value={value}
                disabled={pending}
                className={cn("mr-auto font-semibold", className)}
                onChange={(event) => setValue(event.target.value)}
                onBlur={() => void commit()}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        void commit();
                    }
                    if (event.key === "Escape") {
                        setValue(String(children));
                        editing?.setEditingColumnId(null);
                    }
                }}
            />
        );
    }

    return (
        <button
            type="button"
            className={cn("mr-auto text-left", className)}
            onClick={() => editing?.setEditingColumnId(columnId)}
            aria-label={`Rename ${String(children)} column`}
        >
            <Text.Heading level={3} {...props}>
                {children}
            </Text.Heading>
        </button>
    );
});

const ColumnContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex min-h-24 flex-1 flex-col gap-3", className)}
        {...props}
    />
));
ColumnContent.displayName = "Kanban.Column.Content";

function ColumnAddTask({ columnId }: { columnId: string }) {
    const pending = useTransition(["dialog.openTaskForm"]);
    return (
        <Clickable.Button
            variant="ghost"
            size="sm"
            aria-label="Add task to column"
            disabled={pending}
            onClick={() => void actions.dialog.openTaskForm({ columnId })}
        >
            <Plus className="size-4" aria-hidden="true" /> Add task
        </Clickable.Button>
    );
}

function ColumnDelete({
    columnId,
    title,
}: {
    columnId: string;
    title: string;
}) {
    const pending = useTransition(["dialog.openConfirm"]);
    return (
        <Clickable.Icon
            variant="ghost"
            aria-label={`Delete ${title} column`}
            disabled={pending}
            onClick={() =>
                void actions.dialog.openConfirm({
                    title: `Delete “${title}” column?`,
                    description:
                        "This will permanently delete the column and all tasks in it. This action cannot be undone.",
                    onConfirm: () => actions.kanban.column.remove({ columnId }),
                })
            }
        >
            <Trash2 className="size-4" aria-hidden="true" />
        </Clickable.Icon>
    );
}

const ColumnMove = observer(function ColumnMove({
    index,
    direction,
}: {
    index: number;
    direction: "left" | "right";
}) {
    const { board } = getRootStore();
    const pending = useTransition(["kanban.column.reorder"]);
    const edge =
        direction === "left"
            ? index === 0
            : index === board.columnOrder.length - 1;
    const label =
        direction === "left" ? "Move column left" : "Move column right";
    return (
        <Clickable.Icon
            variant="ghost"
            aria-label={label}
            disabled={pending || edge}
            onClick={() =>
                void actions.kanban.column.reorder({
                    from: index,
                    to: index + (direction === "left" ? -1 : 1),
                })
            }
        >
            {direction === "left" ? (
                <ArrowLeft className="size-4" aria-hidden="true" />
            ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
            )}
        </Clickable.Icon>
    );
});

function ColumnGhost() {
    const editing = useContext(InlineEditContext);
    const pending = useTransition(["kanban.column.add"]);
    return (
        <button
            type="button"
            className="flex min-h-40 w-80 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50"
            disabled={pending}
            onClick={async () => {
                const columnId = await actions.kanban.column.add({});
                if (columnId) editing?.setEditingColumnId(columnId);
            }}
        >
            <CirclePlus className="mr-2 size-5" aria-hidden="true" /> Add column
        </button>
    );
}

type TasksProps = {
    columnId: string;
    render: (task: TaskModel, index: number) => ReactNode;
};

const Tasks = observer(function Tasks({ columnId, render }: TasksProps) {
    const { board, filter } = getRootStore();
    return filter.filteredTaskIds(columnId).map((taskId, index) => {
        const task = board.tasks[taskId];
        return task ? (
            <Fragment key={task.id}>{render(task, index)}</Fragment>
        ) : null;
    });
});

const TaskContainer = forwardRef<
    HTMLElement,
    HTMLAttributes<HTMLElement> & { taskId?: string }
>(({ className, taskId, ...props }, ref) => (
    <article
        ref={ref}
        data-task-id={taskId}
        className={cn(
            "rounded-lg border border-border bg-card p-3 shadow-sm",
            className,
        )}
        {...props}
    />
));
TaskContainer.displayName = "Kanban.Task.Container";

const TaskHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-start gap-2", className)}
            {...props}
        />
    ),
);
TaskHeader.displayName = "Kanban.Task.Header";

function TaskTitle(props: HTMLAttributes<HTMLHeadingElement>) {
    return <Text.Heading level={4} className="flex-1" {...props} />;
}

function TaskDescription({
    className,
    ...props
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <Text.Paragraph
            className={cn("mt-2 text-muted-foreground", className)}
            {...props}
        />
    );
}

function TaskDates({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}) {
    return (
        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span>{startDate}</span>
            <span aria-hidden="true">–</span>
            <span>{endDate}</span>
        </p>
    );
}

function TaskPriority({
    taskId,
    priority,
}: {
    taskId: string;
    priority: Priority;
}) {
    const pending = useTransition(["kanban.task.setPriority"]);
    return (
        <label className="relative inline-flex" aria-label="Task priority">
            <Badge.Root priority={priority}>
                {priorityLabel(priority)}
            </Badge.Root>
            <select
                aria-label="Task priority"
                value={priority}
                disabled={pending}
                className="absolute inset-0 cursor-pointer opacity-0"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) =>
                    void actions.kanban.task.setPriority({
                        taskId,
                        priority: event.target.value as Priority,
                    })
                }
            >
                {PRIORITIES.map((value) => (
                    <option key={value} value={value}>
                        {priorityLabel(value)}
                    </option>
                ))}
            </select>
        </label>
    );
}

const TaskFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "mt-3 flex items-center gap-1 border-t border-border pt-2",
                className,
            )}
            {...props}
        />
    ),
);
TaskFooter.displayName = "Kanban.Task.Footer";

function TaskEditAction({ taskId }: { taskId: string }) {
    const pending = useTransition(["dialog.openTaskForm"]);
    return (
        <Clickable.Icon
            variant="ghost"
            aria-label="Edit task"
            disabled={pending}
            onClick={() => void actions.dialog.openTaskForm({ taskId })}
        >
            <Pencil className="size-4" aria-hidden="true" />
        </Clickable.Icon>
    );
}

function TaskDeleteAction({
    taskId,
    title,
}: {
    taskId: string;
    title: string;
}) {
    const pending = useTransition(["dialog.openConfirm"]);
    return (
        <Clickable.Icon
            variant="ghost"
            aria-label="Delete task"
            disabled={pending}
            onClick={() =>
                void actions.dialog.openConfirm({
                    title: `Delete “${title}” task?`,
                    description:
                        "This task will be permanently deleted. This action cannot be undone.",
                    onConfirm: () => actions.kanban.task.remove({ taskId }),
                })
            }
        >
            <Trash2 className="size-4" aria-hidden="true" />
        </Clickable.Icon>
    );
}

function TaskMove({
    taskId,
    columnId,
    direction,
}: {
    taskId: string;
    columnId: string;
    direction: "prev" | "next";
}) {
    const { board } = getRootStore();
    const pending = useTransition(["kanban.task.moveAdjacent"]);
    const index = board.columnOrder.indexOf(columnId);
    const edge =
        direction === "prev"
            ? index <= 0
            : index === board.columnOrder.length - 1;
    const label =
        direction === "prev"
            ? "Move task to previous column"
            : "Move task to next column";
    return (
        <Clickable.Icon
            variant="ghost"
            aria-label={label}
            disabled={pending || edge}
            onClick={() =>
                void actions.kanban.task.moveAdjacent({ taskId, direction })
            }
        >
            {direction === "prev" ? (
                <ChevronLeft className="size-4" aria-hidden="true" />
            ) : (
                <ChevronRight className="size-4" aria-hidden="true" />
            )}
        </Clickable.Icon>
    );
}

function AddTaskAction() {
    const pending = useTransition(["dialog.openTaskForm"]);
    return (
        <Clickable.Button
            disabled={pending}
            onClick={() => void actions.dialog.openTaskForm({})}
        >
            <Plus className="size-4" aria-hidden="true" /> Add task
        </Clickable.Button>
    );
}

type TaskFormState = {
    draft: TaskDraft;
    setField: <K extends keyof TaskDraft>(
        field: K,
        value: TaskDraft[K],
    ) => void;
    columnId: string;
    setColumnId: (columnId: string) => void;
    errors: TaskDraftErrors;
    taskId?: string;
};

const TaskFormContext = createContext<TaskFormState | null>(null);

function useTaskForm() {
    const value = useContext(TaskFormContext);
    if (!value)
        throw new Error(
            "Task form pieces must be inside Kanban.TaskForm.Provider",
        );
    return value;
}

const TaskFormProvider = observer(function TaskFormProvider({
    taskId,
    columnId,
    children,
}: {
    taskId?: string;
    columnId?: string;
    children: ReactNode;
}) {
    const { board } = getRootStore();
    const task = taskId ? board.tasks[taskId] : undefined;
    const initialDraft = task
        ? {
              title: task.title,
              description: task.description,
              priority: task.priority,
              startDate: task.startDate,
              endDate: task.endDate,
          }
        : createTaskDraftDefaults();
    const [draft, setDraft] = useState<TaskDraft>(initialDraft);
    const [selectedColumnId, setColumnId] = useState(
        columnId ?? task?.columnId ?? board.columnOrder[0] ?? "",
    );
    const [errors, setErrors] = useState<TaskDraftErrors>({});

    return (
        <TaskFormContext.Provider
            value={{
                draft,
                setField: (field, value) => {
                    setDraft((current) => ({ ...current, [field]: value }));
                    setErrors((current) => ({
                        ...current,
                        [field]: undefined,
                    }));
                },
                columnId: selectedColumnId,
                setColumnId,
                errors,
                taskId,
            }}
        >
            <TaskFormErrorsContext.Provider value={setErrors}>
                {children}
            </TaskFormErrorsContext.Provider>
        </TaskFormContext.Provider>
    );
});

const TaskFormErrorsContext = createContext<React.Dispatch<
    React.SetStateAction<TaskDraftErrors>
> | null>(null);

function TaskFormRoot({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const form = useTaskForm();
    const setErrors = useContext(TaskFormErrorsContext);
    const pendingAdd = useTransition(["kanban.task.add"]);
    const pendingEdit = useTransition(["kanban.task.edit"]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            if (form.taskId) {
                await actions.kanban.task.edit({
                    taskId: form.taskId,
                    ...form.draft,
                });
            } else {
                await actions.kanban.task.add({
                    ...form.draft,
                    columnId: form.columnId,
                });
            }
            await actions.dialog.close();
        } catch (error) {
            if (error instanceof TaskDraftValidationError) {
                setErrors?.(error.errors);
                return;
            }
            throw error;
        }
    }

    return (
        <form
            className={cn("grid gap-4", className)}
            aria-busy={pendingAdd || pendingEdit}
            onSubmit={(event) => void submit(event)}
        >
            {children}
        </form>
    );
}

function TaskFormField({
    field,
    label,
    children,
}: {
    field: keyof TaskDraft | "columnId";
    label: string;
    children: (id: string, invalid: boolean) => ReactNode;
}) {
    const form = useTaskForm();
    const id = useId();
    const error = field === "columnId" ? undefined : form.errors[field];
    return (
        <Field.Root>
            <div className="grid gap-1.5">
                <Field.Label htmlFor={id}>{label}</Field.Label>
                {children(id, Boolean(error))}
                {error ? <Field.Error>{error}</Field.Error> : null}
            </div>
        </Field.Root>
    );
}

function TaskFormTitleField() {
    const form = useTaskForm();
    return (
        <TaskFormField field="title" label="Title">
            {(id, invalid) => (
                <Field.Input
                    id={id}
                    name="title"
                    value={form.draft.title}
                    aria-invalid={invalid}
                    onChange={(event) =>
                        form.setField("title", event.target.value)
                    }
                />
            )}
        </TaskFormField>
    );
}

function TaskFormDescriptionField() {
    const form = useTaskForm();
    return (
        <TaskFormField field="description" label="Description">
            {(id, invalid) => (
                <Field.Textarea
                    id={id}
                    name="description"
                    value={form.draft.description}
                    aria-invalid={invalid}
                    onChange={(event) =>
                        form.setField("description", event.target.value)
                    }
                />
            )}
        </TaskFormField>
    );
}

function TaskFormPriorityField() {
    const form = useTaskForm();
    return (
        <TaskFormField field="priority" label="Priority">
            {(id, invalid) => (
                <select
                    id={id}
                    name="priority"
                    value={form.draft.priority}
                    aria-invalid={invalid}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    onChange={(event) =>
                        form.setField(
                            "priority",
                            event.target.value as Priority,
                        )
                    }
                >
                    {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                            {priorityLabel(priority)}
                        </option>
                    ))}
                </select>
            )}
        </TaskFormField>
    );
}

function TaskFormDateField({
    field,
    label,
}: {
    field: "startDate" | "endDate";
    label: string;
}) {
    const form = useTaskForm();
    return (
        <TaskFormField field={field} label={label}>
            {(id, invalid) => (
                <Field.Date
                    id={id}
                    name={field}
                    value={form.draft[field]}
                    aria-invalid={invalid}
                    onChange={(event) =>
                        form.setField(field, event.target.value)
                    }
                />
            )}
        </TaskFormField>
    );
}

function TaskFormColumnField() {
    const form = useTaskForm();
    const { board } = getRootStore();
    return (
        <TaskFormField field="columnId" label="Column">
            {(id) => (
                <select
                    id={id}
                    name="columnId"
                    value={form.columnId}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    onChange={(event) => form.setColumnId(event.target.value)}
                >
                    {board.columnOrder.map((columnId) => (
                        <option key={columnId} value={columnId}>
                            {board.columns[columnId]?.title}
                        </option>
                    ))}
                </select>
            )}
        </TaskFormField>
    );
}

const TaskFormActions = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex justify-end gap-2", className)}
        {...props}
    />
));
TaskFormActions.displayName = "Kanban.TaskForm.Actions";

function TaskFormCancel() {
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

function TaskFormSubmit({ children = "Save task" }: { children?: ReactNode }) {
    const pendingAdd = useTransition(["kanban.task.add"]);
    const pendingEdit = useTransition(["kanban.task.edit"]);
    return (
        <Clickable.Button type="submit" disabled={pendingAdd || pendingEdit}>
            {children}
        </Clickable.Button>
    );
}

type DialogHostProps = {
    render: (
        descriptor: NonNullable<
            ReturnType<typeof getRootStore>["dialog"]["current"]
        >,
    ) => ReactNode;
};

const DialogHost = observer(function DialogHost({ render }: DialogHostProps) {
    const descriptor = getRootStore().dialog.current;
    return descriptor ? render(descriptor) : null;
});

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
        Content: ColumnContent,
        AddTask: ColumnAddTask,
        Delete: ColumnDelete,
        MoveLeft: (props: { index: number }) => (
            <ColumnMove {...props} direction="left" />
        ),
        MoveRight: (props: { index: number }) => (
            <ColumnMove {...props} direction="right" />
        ),
        Ghost: ColumnGhost,
    },
    Tasks,
    Task: {
        Container: TaskContainer,
        Header: TaskHeader,
        Title: TaskTitle,
        Description: TaskDescription,
        Dates: TaskDates,
        Priority: TaskPriority,
        Footer: TaskFooter,
        EditAction: TaskEditAction,
        DeleteAction: TaskDeleteAction,
        MovePrev: (props: { taskId: string; columnId: string }) => (
            <TaskMove {...props} direction="prev" />
        ),
        MoveNext: (props: { taskId: string; columnId: string }) => (
            <TaskMove {...props} direction="next" />
        ),
    },
    AddTaskAction,
    TaskForm: {
        Provider: TaskFormProvider,
        Root: TaskFormRoot,
        TitleField: TaskFormTitleField,
        DescriptionField: TaskFormDescriptionField,
        PriorityField: TaskFormPriorityField,
        StartDateField: () => (
            <TaskFormDateField field="startDate" label="Start date" />
        ),
        EndDateField: () => (
            <TaskFormDateField field="endDate" label="End date" />
        ),
        ColumnField: TaskFormColumnField,
        Actions: TaskFormActions,
        Cancel: TaskFormCancel,
        Submit: TaskFormSubmit,
    },
    DialogHost,
};
