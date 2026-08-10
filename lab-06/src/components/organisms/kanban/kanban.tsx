import {
    type CollisionDetection,
    closestCorners,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    GripVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import {
    type CSSProperties,
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
import { Popover } from "#/components/molecules";
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
import {
    type KanbanDragData,
    type KanbanDropData,
    resolveColumnReorder,
    resolveTaskMove,
} from "./dnd";

const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"];
const priorityLabel = (priority: Priority) =>
    priority[0].toUpperCase() + priority.slice(1);

const InlineEditContext = createContext<{
    editingColumnId: string | null;
    setEditingColumnId: (columnId: string | null) => void;
} | null>(null);

type DragHandleContextValue = ReturnType<typeof useSortable>;
const ColumnDragContext = createContext<DragHandleContextValue | null>(null);
const TaskDragContext = createContext<DragHandleContextValue | null>(null);

function isDragData(value: unknown): value is KanbanDragData {
    if (!value || typeof value !== "object" || !("type" in value)) return false;
    const data = value as Partial<KanbanDragData>;
    return (
        (data.type === "task" &&
            typeof data.taskId === "string" &&
            typeof data.columnId === "string") ||
        (data.type === "column" && typeof data.columnId === "string")
    );
}

function isDropData(value: unknown): value is KanbanDropData {
    if (isDragData(value)) return true;
    if (!value || typeof value !== "object") return false;
    const data = value as Partial<KanbanDropData>;
    return data.type === "column-drop" && typeof data.columnId === "string";
}

const kanbanCollisionDetection: CollisionDetection = (args) => {
    const activeData = args.active.data.current;
    if (!isDragData(activeData)) return [];
    const droppableContainers = args.droppableContainers.filter((container) => {
        const data = container.data.current;
        return activeData.type === "column"
            ? isDropData(data) && data.type === "column"
            : isDropData(data) && data.type !== "column";
    });
    const narrowedArgs = { ...args, droppableContainers };
    const pointerCollisions = pointerWithin(narrowedArgs);
    if (pointerCollisions.length > 0) {
        const taskCollisions = pointerCollisions.filter(
            ({ id }) =>
                droppableContainers.find((container) => container.id === id)
                    ?.data.current?.type === "task",
        );
        return taskCollisions.length > 0 ? taskCollisions : pointerCollisions;
    }
    return closestCorners(narrowedArgs);
};

const DndPreview = observer(function DndPreview({
    active,
}: {
    active: KanbanDragData | null;
}) {
    const { board } = getRootStore();
    if (!active) return null;
    if (active.type === "column") {
        const column = board.columns[active.columnId];
        return column ? (
            <div className="w-80 rounded-xl border border-border bg-muted p-3 text-foreground shadow-lg">
                <Text.Heading level={3}>{column.title}</Text.Heading>
            </div>
        ) : null;
    }

    const task = board.tasks[active.taskId];
    return task ? (
        <div className="w-72 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-lg">
            <Text.Heading level={4}>{task.title}</Text.Heading>
            <Text.Paragraph className="mt-2 text-muted-foreground">
                {task.description}
            </Text.Paragraph>
        </div>
    ) : null;
});

const DndProvider = observer(function DndProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { board, filter } = getRootStore();
    const [active, setActive] = useState<KanbanDragData | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragStart(event: DragStartEvent) {
        const data = event.active.data.current;
        setActive(isDragData(data) ? data : null);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActive(null);
        const activeData = event.active.data.current;
        const over = event.over;
        const overData = over?.data.current;
        if (!over || !isDragData(activeData) || !isDropData(overData)) return;

        if (activeData.type === "column" && overData.type === "column") {
            const payload = resolveColumnReorder(
                activeData,
                overData,
                board.columnOrder.slice(),
            );
            if (payload) void actions.kanban.column.reorder(payload);
            return;
        }
        if (activeData.type !== "task" || overData.type === "column") return;

        const translated = event.active.rect.current.translated;
        const afterOverTask =
            overData.type === "task" &&
            Boolean(
                translated &&
                    translated.top > over.rect.top + over.rect.height / 2,
            );
        const payload = resolveTaskMove({
            active: activeData,
            over: overData,
            columns: Object.fromEntries(
                Object.entries(board.columns).map(([columnId, column]) => [
                    columnId,
                    { taskIds: column.taskIds.slice() },
                ]),
            ),
            visibleTaskIds: (columnId) =>
                filter.filteredTaskIds(columnId).slice(),
            afterOverTask,
        });
        if (payload) void actions.kanban.task.move(payload);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={kanbanCollisionDetection}
            onDragStart={handleDragStart}
            onDragCancel={() => setActive(null)}
            onDragEnd={handleDragEnd}
        >
            {children}
            <DragOverlay dropAnimation={null}>
                <DndPreview active={active} />
            </DragOverlay>
        </DndContext>
    );
});

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

function FilterContainer({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <section
            className={cn(
                "flex flex-1 flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground",
                className,
            )}
            aria-label="Task filters"
            {...props}
        />
    );
}

const FilterSearch = observer(function FilterSearch() {
    const { filter } = getRootStore();
    const [value, setValue] = useState(filter.search);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pending = useTransition(["kanban.filter.setSearch"]);

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = null;
        setValue(filter.search);
    }, [filter.search]);

    useEffect(
        () => () => {
            if (timeout.current) clearTimeout(timeout.current);
        },
        [],
    );

    return (
        <Field.Root>
            <Field.Label htmlFor="kanban-filter-search" className="sr-only">
                Search tasks
            </Field.Label>
            <div className="relative w-56">
                <Search
                    className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground"
                    aria-hidden="true"
                />
                <Field.Input
                    id="kanban-filter-search"
                    type="search"
                    className="pl-8"
                    placeholder="Search tasks"
                    value={value}
                    disabled={pending}
                    onChange={(event) => {
                        const nextValue = event.target.value;
                        setValue(nextValue);
                        if (timeout.current) clearTimeout(timeout.current);
                        timeout.current = setTimeout(() => {
                            timeout.current = null;
                            void actions.kanban.filter.setSearch(nextValue);
                        }, 250);
                    }}
                />
            </div>
        </Field.Root>
    );
});

const FilterDateRange = observer(function FilterDateRange() {
    const { filter } = getRootStore();
    const pending = useTransition(["kanban.filter.setDateRange"]);

    function setBound(bound: "start" | "end", value: string) {
        const dateRange = { ...filter.dateRange };
        if (value) dateRange[bound] = value;
        else delete dateRange[bound];
        void actions.kanban.filter.setDateRange(dateRange);
    }

    return (
        <div className="flex items-end gap-2">
            <Field.Root>
                <Field.Label
                    htmlFor="kanban-filter-start-date"
                    className="mb-1 block text-xs"
                >
                    Filter start date
                </Field.Label>
                <Field.Date
                    id="kanban-filter-start-date"
                    className="w-36"
                    value={filter.dateRange.start ?? ""}
                    disabled={pending}
                    onChange={(event) => setBound("start", event.target.value)}
                />
            </Field.Root>
            <Field.Root>
                <Field.Label
                    htmlFor="kanban-filter-end-date"
                    className="mb-1 block text-xs"
                >
                    Filter end date
                </Field.Label>
                <Field.Date
                    id="kanban-filter-end-date"
                    className="w-36"
                    value={filter.dateRange.end ?? ""}
                    disabled={pending}
                    onChange={(event) => setBound("end", event.target.value)}
                />
            </Field.Root>
        </div>
    );
});

const FilterPriority = observer(function FilterPriority() {
    const { filter } = getRootStore();
    const pending = useTransition(["kanban.filter.setPriorities"]);

    function toggle(priority: Priority, selected: boolean) {
        const priorities = selected
            ? [...filter.priorities, priority]
            : filter.priorities.filter((value) => value !== priority);
        void actions.kanban.filter.setPriorities(priorities);
    }

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Clickable.Button
                    variant="outline"
                    aria-label="Filter by priority"
                    disabled={pending}
                >
                    Priority
                    {filter.priorities.length > 0
                        ? ` (${filter.priorities.length})`
                        : " (All)"}
                    <ChevronDown className="size-4" aria-hidden="true" />
                </Clickable.Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content align="start" className="w-52">
                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">
                            Priorities
                        </legend>
                        {PRIORITIES.map((priority) => (
                            <label
                                key={priority}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <input
                                    type="checkbox"
                                    className="size-4 accent-primary"
                                    checked={filter.priorities.includes(
                                        priority,
                                    )}
                                    disabled={pending}
                                    onChange={(event) =>
                                        toggle(priority, event.target.checked)
                                    }
                                />
                                {priorityLabel(priority)}
                            </label>
                        ))}
                        <p className="text-xs text-muted-foreground">
                            No selection includes every priority.
                        </p>
                    </fieldset>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
});

const FilterClear = observer(function FilterClear() {
    const { filter } = getRootStore();
    const pending = useTransition(["kanban.filter.clear"]);
    const active = Boolean(
        filter.search ||
            filter.dateRange.start ||
            filter.dateRange.end ||
            filter.priorities.length,
    );
    if (!active) return null;

    return (
        <Clickable.Button
            variant="ghost"
            disabled={pending}
            onClick={() => void actions.kanban.filter.clear()}
        >
            <X className="size-4" aria-hidden="true" /> Clear filters
        </Clickable.Button>
    );
});

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
    const columnOrder = board.columnOrder.slice();
    return (
        <SortableContext
            items={columnOrder.map((columnId) => `column:${columnId}`)}
            strategy={horizontalListSortingStrategy}
        >
            {columnOrder.map((columnId, index) => {
                const column = board.columns[columnId];
                return column ? (
                    <Fragment key={column.id}>{render(column, index)}</Fragment>
                ) : null;
            })}
        </SortableContext>
    );
});

function SortableColumn({
    columnId,
    children,
}: {
    columnId: string;
    children: ReactNode;
}) {
    const sortable = useSortable({
        id: `column:${columnId}`,
        data: { type: "column", columnId } satisfies KanbanDragData,
    });
    const style: CSSProperties = {
        transform: sortable.transform
            ? `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0) scaleX(${sortable.transform.scaleX}) scaleY(${sortable.transform.scaleY})`
            : undefined,
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.45 : undefined,
    };
    return (
        <ColumnDragContext.Provider value={sortable}>
            <div ref={sortable.setNodeRef} style={style}>
                {children}
            </div>
        </ColumnDragContext.Provider>
    );
}

function ColumnDragHandle({ title }: { title: string }) {
    const sortable = useContext(ColumnDragContext);
    if (!sortable) return null;
    return (
        <Clickable.Icon
            ref={sortable.setActivatorNodeRef}
            variant="ghost"
            className="cursor-grab touch-none active:cursor-grabbing"
            aria-label={`Drag ${title} column`}
            {...sortable.attributes}
            {...sortable.listeners}
        >
            <GripVertical className="size-4" aria-hidden="true" />
        </Clickable.Icon>
    );
}

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

type ColumnContentProps = HTMLAttributes<HTMLDivElement> & {
    columnId: string;
};

function ColumnContent({ columnId, className, ...props }: ColumnContentProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-drop:${columnId}`,
        data: { type: "column-drop", columnId } satisfies KanbanDropData,
    });
    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex min-h-24 flex-1 flex-col gap-3 rounded-md transition-colors",
                isOver && "bg-accent/50",
                className,
            )}
            {...props}
        />
    );
}

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
    const taskIds = filter.filteredTaskIds(columnId).slice();
    return (
        <SortableContext
            items={taskIds.map((taskId) => `task:${taskId}`)}
            strategy={verticalListSortingStrategy}
        >
            {taskIds.map((taskId, index) => {
                const task = board.tasks[taskId];
                return task ? (
                    <Fragment key={task.id}>{render(task, index)}</Fragment>
                ) : null;
            })}
        </SortableContext>
    );
});

const TasksEmptyState = observer(function TasksEmptyState({
    columnId,
}: {
    columnId: string;
}) {
    const { filter } = getRootStore();
    if (filter.filteredTaskIds(columnId).length > 0) return null;
    return (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            No tasks to display.
        </p>
    );
});

function SortableTask({
    taskId,
    columnId,
    children,
}: {
    taskId: string;
    columnId: string;
    children: ReactNode;
}) {
    const sortable = useSortable({
        id: `task:${taskId}`,
        data: { type: "task", taskId, columnId } satisfies KanbanDragData,
    });
    const style: CSSProperties = {
        transform: sortable.transform
            ? `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0) scaleX(${sortable.transform.scaleX}) scaleY(${sortable.transform.scaleY})`
            : undefined,
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.45 : undefined,
    };
    return (
        <TaskDragContext.Provider value={sortable}>
            <div ref={sortable.setNodeRef} style={style}>
                {children}
            </div>
        </TaskDragContext.Provider>
    );
}

function TaskDragHandle({ title }: { title: string }) {
    const sortable = useContext(TaskDragContext);
    if (!sortable) return null;
    return (
        <Clickable.Icon
            ref={sortable.setActivatorNodeRef}
            variant="ghost"
            className="size-7 cursor-grab touch-none active:cursor-grabbing"
            aria-label={`Drag ${title} task`}
            {...sortable.attributes}
            {...sortable.listeners}
        >
            <GripVertical className="size-4" aria-hidden="true" />
        </Clickable.Icon>
    );
}

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
    DndProvider,
    Header,
    Title,
    Filter: {
        Container: FilterContainer,
        Search: FilterSearch,
        DateRange: FilterDateRange,
        Priority: FilterPriority,
        Clear: FilterClear,
    },
    Content,
    Columns,
    Column: {
        Sortable: SortableColumn,
        Container: ColumnContainer,
        DragHandle: ColumnDragHandle,
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
    Tasks: Object.assign(Tasks, { EmptyState: TasksEmptyState }),
    Task: {
        Sortable: SortableTask,
        Container: TaskContainer,
        DragHandle: TaskDragHandle,
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
