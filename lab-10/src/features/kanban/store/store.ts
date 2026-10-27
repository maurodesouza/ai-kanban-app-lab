import { makeAutoObservable } from "mobx";
import type { DragItem } from "#/features/kanban/components/handles/dnd/dnd-actions";
import type {
    BoardSnapshot,
    Column,
    Task,
    TaskErrors,
    TaskField,
    TaskFields,
    TaskFilters,
} from "#/features/kanban/types";
import { date } from "#/features/kanban/utils/date/date";
import { priority } from "#/features/kanban/utils/priority/priority";
import { task as taskUtils } from "#/features/kanban/utils/task/task";
import { array } from "#/utils/array/array";

const EMPTY_FILTERS: TaskFilters = {
    search: "",
    dateFrom: "",
    dateTo: "",
    priority: "all",
};

export class KanbanStore {
    // #region Primitives
    isHydrated = false;
    columnOrder: string[] = [];
    columns: Record<string, Column> = {};
    tasks: Record<string, Task> = {};
    editingColumnId: string | null = null;
    activeDrag: DragItem | null = null;
    taskDialog: TaskDialogState = {
        open: false,
        mode: "create",
        origin: "global",
        taskId: null,
        columnId: null,
    };
    taskForm: TaskFields = taskUtils.defaults();
    taskFormErrors: TaskErrors = {};
    filters: TaskFilters = { ...EMPTY_FILTERS };
    columnDeleteDialog: { open: boolean; columnId: string | null } = {
        open: false,
        columnId: null,
    };
    // #endregion

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // #region Actions
    hydrate(snapshot: BoardSnapshot) {
        this.columnOrder = snapshot.columnOrder;
        this.columns = snapshot.columns;
        this.tasks = snapshot.tasks;
    }

    setIsHydrated(value: boolean) {
        this.isHydrated = value;
    }

    addColumn(column: Column) {
        this.columns[column.id] = column;
        this.columnOrder.push(column.id);
    }

    setColumnTitle(columnId: string, title: string) {
        this.columns[columnId].title = title;
    }

    setEditingColumnId(columnId: string | null) {
        this.editingColumnId = columnId;
    }

    setActiveDrag(item: DragItem | null) {
        this.activeDrag = item;
    }

    setTaskDialog(state: Partial<TaskDialogState>) {
        Object.assign(this.taskDialog, state);
    }

    setTaskForm(fields: TaskFields) {
        this.taskForm = fields;
    }

    setTaskFormField<TField extends TaskField>(
        field: TField,
        value: TaskFields[TField],
    ) {
        this.taskForm[field] = value;
    }

    setTaskFormErrors(errors: TaskErrors) {
        this.taskFormErrors = errors;
    }

    setFilters(filters: Partial<TaskFilters>) {
        Object.assign(this.filters, filters);
    }

    resetFilters() {
        this.filters = { ...EMPTY_FILTERS };
    }

    setColumnDeleteDialog(open: boolean, columnId: string | null) {
        this.columnDeleteDialog = { open, columnId };
    }

    setColumnOrder(columnOrder: string[]) {
        this.columnOrder = columnOrder;
    }

    removeColumn(columnId: string) {
        delete this.columns[columnId];
        this.columnOrder = array.without(this.columnOrder, columnId);
    }

    addTask(task: Task) {
        this.tasks[task.id] = task;
        this.columns[task.columnId].taskIds.push(task.id);
    }

    updateTask(taskId: string, fields: Partial<TaskFields>, updatedAt: string) {
        Object.assign(this.tasks[taskId], fields, { updatedAt });
    }

    removeTask(taskId: string) {
        const task = this.tasks[taskId];

        this.columns[task.columnId].taskIds = array.without(
            this.columns[task.columnId].taskIds,
            taskId,
        );
        delete this.tasks[taskId];
    }

    placeTask(taskId: string, columnId: string, index: number) {
        const task = this.tasks[taskId];
        const from = this.columns[task.columnId];

        from.taskIds = array.without(from.taskIds, taskId);
        this.columns[columnId].taskIds = array.insert(
            this.columns[columnId].taskIds,
            index,
            taskId,
        );
        task.columnId = columnId;
    }
    // #endregion

    // #region Derived primitives
    get $isHydrated() {
        return this.isHydrated;
    }

    get $firstColumnId(): string | undefined {
        return this.columnOrder[0];
    }

    get $hasActiveFilters() {
        const { search, dateFrom, dateTo, priority } = this.filters;

        return Boolean(
            search.trim() || dateFrom || dateTo || priority !== "all",
        );
    }
    // #endregion

    // #region Data
    get $orderedColumns(): Column[] {
        return this.columnOrder.map((columnId) => this.columns[columnId]);
    }

    get $tasksByColumn(): Record<string, Task[]> {
        return Object.fromEntries(
            this.$orderedColumns.map((column) => [
                column.id,
                column.taskIds.map((taskId) => this.tasks[taskId]),
            ]),
        );
    }

    /** Single filtering point: every task the board presents passes through here. */
    get $visibleTasksByColumn(): Record<string, Task[]> {
        if (!this.$hasActiveFilters) return this.$tasksByColumn;

        const matches = taskUtils.filter.byFilters(this.filters);

        return Object.fromEntries(
            Object.entries(this.$tasksByColumn).map(([columnId, tasks]) => [
                columnId,
                tasks.filter(matches),
            ]),
        );
    }

    get $snapshot(): BoardSnapshot {
        return {
            version: 1,
            columnOrder: [...this.columnOrder],
            columns: Object.fromEntries(
                this.$orderedColumns.map((column) => [
                    column.id,
                    { ...column, taskIds: [...column.taskIds] },
                ]),
            ),
            tasks: Object.fromEntries(
                Object.values(this.tasks).map((task) => [task.id, { ...task }]),
            ),
        };
    }
    // #endregion

    // #region UI
    get $boardUI() {
        return {
            title: "Kanban",
            newTaskLabel: "New task",
            isLoading: !this.isHydrated,
        };
    }

    get $dndUI() {
        return {
            columnIds: [...this.columnOrder],
            taskIdsByColumn: Object.fromEntries(
                this.$orderedColumns.map((column) => [
                    column.id,
                    this.$visibleTasksByColumn[column.id].map(
                        (task) => task.id,
                    ),
                ]),
            ),
        };
    }

    get $columnDeleteDialogUI() {
        const { open, columnId } = this.columnDeleteDialog;
        const column = columnId ? this.columns[columnId] : undefined;
        const title = column?.title ?? "";
        const taskCount = column?.taskIds.length ?? 0;
        const tasksLabel = taskCount === 1 ? "1 task" : `${taskCount} tasks`;

        return {
            open: open && Boolean(column),
            title: `Delete "${title}"?`,
            description:
                taskCount > 0
                    ? `This column and its ${tasksLabel} will be permanently deleted.`
                    : "This column will be permanently deleted.",
            cancelLabel: "Cancel",
            confirmLabel: "Delete column",
        };
    }

    get $taskDialogUI() {
        const { open, mode, origin, columnId } = this.taskDialog;
        const isEdit = mode === "edit";
        const field = <TField extends TaskField>(name: TField) => ({
            value: this.taskForm[name],
            error: this.taskFormErrors[name] ?? "",
            invalid: Boolean(this.taskFormErrors[name]),
        });

        return {
            open,
            title: isEdit ? "Edit task" : "New task",
            description: isEdit
                ? "Update the details of this task."
                : "Add a task to your board.",
            submitLabel: isEdit ? "Save changes" : "Create task",
            cancelLabel: "Cancel",
            showColumnSelect: !isEdit && origin === "global",
            column: {
                value: columnId ?? "",
                options: this.$orderedColumns.map((column) => ({
                    value: column.id,
                    label: column.title,
                })),
            },
            priorityOptions: this.$priorityOptions,
            fields: {
                title: field("title"),
                description: field("description"),
                priority: field("priority"),
                startDate: field("startDate"),
                endDate: field("endDate"),
            },
        };
    }

    get $dragOverlayUI() {
        const active = this.activeDrag;
        const tasks = this.$columnsUI.flatMap((column) => column.tasks);
        const task =
            active?.type === "task"
                ? tasks.find((item) => item.id === active.id)
                : undefined;

        return { task: task ?? null };
    }

    get $filterUI() {
        return {
            search: {
                value: this.filters.search,
                placeholder: "Search tasks",
                label: "Search tasks by title or description",
            },
            dateFrom: { value: this.filters.dateFrom, label: "From date" },
            dateTo: { value: this.filters.dateTo, label: "To date" },
            priority: {
                value: this.filters.priority,
                label: "Filter by priority",
                options: [
                    { value: "all", label: "All priorities" },
                    ...this.$priorityOptions,
                ],
            },
            showClear: this.$hasActiveFilters,
            clearLabel: "Clear filters",
        };
    }

    get $priorityOptions() {
        return priority.list.map(priority.map.toOption());
    }

    get $columnsUI() {
        const lastIndex = this.columnOrder.length - 1;

        return this.$orderedColumns.map((column, index) => {
            const isFirst = index === 0;
            const isLast = index === lastIndex;

            return {
                id: column.id,
                title: column.title,
                taskCount: column.taskIds.length,
                countLabel: this.$hasActiveFilters
                    ? `${this.$visibleTasksByColumn[column.id].length} / ${column.taskIds.length}`
                    : String(column.taskIds.length),
                isEditing: this.editingColumnId === column.id,
                isEmpty: this.$visibleTasksByColumn[column.id].length === 0,
                emptyLabel: this.$hasActiveFilters
                    ? "No matching tasks"
                    : "No tasks yet",
                labels: {
                    reorder: `Reorder column ${column.title}`,
                    moveLeft: `Move column ${column.title} left`,
                    moveRight: `Move column ${column.title} right`,
                    options: `Column ${column.title} options`,
                    addTask: `Add task to ${column.title}`,
                },
                canMoveLeft: !isFirst,
                canMoveRight: !isLast,
                tasks: this.$visibleTasksByColumn[column.id].map((task) => ({
                    id: task.id,
                    columnId: task.columnId,
                    title: task.title,
                    description: task.description,
                    hasDescription: task.description.length > 0,
                    priority: task.priority,
                    priorityLabel: priority.format.label(task.priority),
                    priorityPalette: priority.format.palette(task.priority),
                    dateRangeLabel: date.format.range(
                        task.startDate,
                        task.endDate,
                    ),
                    canMoveLeft: !isFirst,
                    canMoveRight: !isLast,
                    labels: {
                        moveLeft: `Move ${task.title} to the previous column`,
                        moveRight: `Move ${task.title} to the next column`,
                        edit: `Edit ${task.title}`,
                        delete: `Delete ${task.title}`,
                        priority: `Priority: ${priority.format.label(task.priority)}. Change priority of ${task.title}`,
                    },
                })),
            };
        });
    }
    // #endregion
}

type TaskDialogState = {
    open: boolean;
    mode: "create" | "edit";
    origin: "global" | "column";
    taskId: string | null;
    columnId: string | null;
};

export const kanbanStore = new KanbanStore();

export type ColumnUI = KanbanStore["$columnsUI"][number];

export type TaskUI = ColumnUI["tasks"][number];
