import { makeAutoObservable, toJS } from "mobx";
import type { Board, Column, Priority, Task } from "../types";
import { formatDate, formatDateRange } from "../utils/date";
import {
    type Filters,
    matchesFilters,
    type PriorityFilter,
} from "../utils/filter";
import { PRIORITIES, PRIORITY_META } from "../utils/priority";
import { pluralize } from "../utils/text";

type Neighbours = { left?: string; right?: string };

export type ColumnUI = {
    title: string;
    count: string;
    countLabel: string;
    isEditing: boolean;
    draft: string;
    editLabel: string;
    inputLabel: string;
    canMoveLeft: boolean;
    canMoveRight: boolean;
    moveLeftLabel: string;
    moveRightLabel: string;
    deleteLabel: string;
    addTaskLabel: string;
    isEmpty: boolean;
    emptyLabel: string;
    isDropTarget: boolean;
    contentLabel: string;
};

export type TaskUI = {
    title: string;
    description: string;
    hasDescription: boolean;
    priority: Priority;
    priorityLabel: string;
    priorityPalette: string;
    priorityMenuLabel: string;
    isPriorityMenuOpen: boolean;
    datesLabel: string;
    datesTitle: string;
    canMoveLeft: boolean;
    canMoveRight: boolean;
    moveLeftLabel: string;
    moveRightLabel: string;
    editLabel: string;
    deleteLabel: string;
    isDragging: boolean;
};

export class KanbanStore {
    // #region Primitives
    columnOrder: string[] = [];
    columns: Record<string, Column> = {};
    tasks: Record<string, Task> = {};
    isHydrated = false;
    pendingDeleteColumn: {
        id: string;
        title: string;
        taskCount: number;
    } | null = null;
    editingColumnId: string | null = null;
    columnTitleDraft = "";
    draggingTaskId: string | null = null;
    dropTargetColumnId: string | null = null;
    priorityMenuTaskId: string | null = null;
    search = "";
    dateFrom = "";
    dateTo = "";
    priorityFilter: PriorityFilter = "all";
    dateRangeError: string | null = null;
    // #endregion

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // #region Actions
    setBoard(board: Board) {
        this.columnOrder = board.columnOrder;
        this.columns = board.columns;
        this.tasks = board.tasks;
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

    setColumnOrder(columnOrder: string[]) {
        this.columnOrder = columnOrder;
    }

    removeColumn(columnId: string) {
        delete this.columns[columnId];
        this.columnOrder = this.columnOrder.filter((id) => id !== columnId);
    }

    addTask(task: Task) {
        this.tasks[task.id] = task;
        this.columns[task.columnId].taskIds.push(task.id);
    }

    updateTask(taskId: string, patch: Partial<Omit<Task, "id" | "columnId">>) {
        Object.assign(this.tasks[taskId], patch);
    }

    removeTask(taskId: string) {
        const column = this.columns[this.tasks[taskId].columnId];

        column.taskIds = column.taskIds.filter((id) => id !== taskId);
        delete this.tasks[taskId];
    }

    setTaskColumn(taskId: string, columnId: string, updatedAt: string) {
        const task = this.tasks[taskId];
        const from = this.columns[task.columnId];

        from.taskIds = from.taskIds.filter((id) => id !== taskId);
        this.columns[columnId].taskIds.push(taskId);
        task.columnId = columnId;
        task.updatedAt = updatedAt;
    }

    setPendingDeleteColumn(
        column: { id: string; title: string; taskCount: number } | null,
    ) {
        this.pendingDeleteColumn = column;
    }

    startColumnEdit(columnId: string, draft: string) {
        this.editingColumnId = columnId;
        this.columnTitleDraft = draft;
    }

    setColumnTitleDraft(draft: string) {
        this.columnTitleDraft = draft;
    }

    clearColumnEdit() {
        this.editingColumnId = null;
        this.columnTitleDraft = "";
    }

    setDraggingTaskId(taskId: string | null) {
        this.draggingTaskId = taskId;
    }

    setDropTargetColumnId(columnId: string | null) {
        this.dropTargetColumnId = columnId;
    }

    setPriorityMenuTaskId(taskId: string | null) {
        this.priorityMenuTaskId = taskId;
    }

    setFilters(filters: Filters) {
        this.search = filters.search;
        this.dateFrom = filters.dateFrom;
        this.dateTo = filters.dateTo;
        this.priorityFilter = filters.priority;
    }

    setSearch(search: string) {
        this.search = search;
    }

    setDateRange(dateFrom: string, dateTo: string) {
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
    }

    setDateRangeError(error: string | null) {
        this.dateRangeError = error;
    }

    setPriorityFilter(priority: PriorityFilter) {
        this.priorityFilter = priority;
    }
    // #endregion

    // #region Derived primitives
    get $hasColumns() {
        return this.columnOrder.length > 0;
    }

    get $firstColumnId(): string | undefined {
        return this.columnOrder[0];
    }

    get $filters(): Filters {
        return {
            search: this.search,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            priority: this.priorityFilter,
        };
    }

    get $hasActiveFilters() {
        return (
            this.search.trim() !== "" ||
            this.dateFrom !== "" ||
            this.dateTo !== "" ||
            this.priorityFilter !== "all"
        );
    }
    // #endregion

    // #region Data
    get $orderedColumns() {
        return this.columnOrder.map((id) => this.columns[id]);
    }

    get $tasksByColumn() {
        return Object.fromEntries(
            this.$orderedColumns.map((column) => [
                column.id,
                column.taskIds.map((taskId) => this.tasks[taskId]),
            ]),
        ) as Record<string, Task[]>;
    }

    get $columnNeighbours() {
        return Object.fromEntries(
            this.columnOrder.map((id, index) => [
                id,
                {
                    left: this.columnOrder[index - 1],
                    right: this.columnOrder[index + 1],
                },
            ]),
        ) as Record<string, Neighbours>;
    }

    get $snapshot(): Board {
        return {
            columnOrder: toJS(this.columnOrder),
            columns: toJS(this.columns),
            tasks: toJS(this.tasks),
        };
    }

    get $taskCount() {
        return Object.keys(this.tasks).length;
    }

    /** Visible task ids per column, after filters. */
    get $columnTaskIds() {
        const filters = this.$filters;
        const applyDateRange = this.dateRangeError === null;

        return Object.fromEntries(
            this.$orderedColumns.map((column) => [
                column.id,
                column.taskIds.filter((taskId) =>
                    matchesFilters(this.tasks[taskId], filters, applyDateRange),
                ),
            ]),
        ) as Record<string, string[]>;
    }

    get $priorityOptions() {
        return PRIORITIES.map((priority) => ({
            value: priority,
            label: PRIORITY_META[priority].label,
        }));
    }
    // #endregion

    // #region UI
    get $boardHeaderUI() {
        return {
            title: "Kanban",
            summary: `${pluralize(this.columnOrder.length, "column")} · ${pluralize(this.$taskCount, "task")}`,
        };
    }

    get $columnListUI() {
        return this.columnOrder.map((id) => ({ id }));
    }

    get $columnsUI() {
        return Object.fromEntries(
            this.$orderedColumns.map((column) => {
                const neighbours = this.$columnNeighbours[column.id];
                const isEditing = this.editingColumnId === column.id;
                const visibleTaskIds = this.$columnTaskIds[column.id];

                return [
                    column.id,
                    {
                        title: column.title,
                        count: this.$hasActiveFilters
                            ? `${visibleTaskIds.length}/${column.taskIds.length}`
                            : String(column.taskIds.length),
                        countLabel: this.$hasActiveFilters
                            ? `${visibleTaskIds.length} of ${pluralize(column.taskIds.length, "task")}`
                            : pluralize(column.taskIds.length, "task"),
                        isEditing,
                        draft: isEditing ? this.columnTitleDraft : column.title,
                        editLabel: `Rename column ${column.title}`,
                        inputLabel: "Column name",
                        canMoveLeft: Boolean(neighbours.left),
                        canMoveRight: Boolean(neighbours.right),
                        moveLeftLabel: `Move column ${column.title} left`,
                        moveRightLabel: `Move column ${column.title} right`,
                        deleteLabel: `Delete column ${column.title}`,
                        addTaskLabel: `Add task to ${column.title}`,
                        isEmpty: visibleTaskIds.length === 0,
                        emptyLabel:
                            column.taskIds.length > 0
                                ? "No matching tasks"
                                : "No tasks yet",
                        isDropTarget: this.dropTargetColumnId === column.id,
                        contentLabel: `${column.title} tasks`,
                    },
                ];
            }),
        ) as Record<string, ColumnUI>;
    }

    get $tasksUI() {
        return Object.fromEntries(
            Object.values(this.tasks).map((task) => {
                const neighbours = this.$columnNeighbours[task.columnId] ?? {};
                const priority = PRIORITY_META[task.priority];

                return [
                    task.id,
                    {
                        title: task.title,
                        description: task.description,
                        hasDescription: task.description.length > 0,
                        priority: task.priority,
                        priorityLabel: priority.label,
                        priorityPalette: priority.palette,
                        priorityMenuLabel: `Change priority of ${task.title} (${priority.label})`,
                        isPriorityMenuOpen: this.priorityMenuTaskId === task.id,
                        datesLabel: formatDateRange(
                            task.startDate,
                            task.endDate,
                        ),
                        datesTitle: `Start ${formatDate(task.startDate)} · End ${formatDate(task.endDate)}`,
                        canMoveLeft: Boolean(neighbours.left),
                        canMoveRight: Boolean(neighbours.right),
                        moveLeftLabel: `Move ${task.title} to the previous column`,
                        moveRightLabel: `Move ${task.title} to the next column`,
                        editLabel: `Edit ${task.title}`,
                        deleteLabel: `Delete ${task.title}`,
                        isDragging: this.draggingTaskId === task.id,
                    },
                ];
            }),
        ) as Record<string, TaskUI>;
    }

    get $addTaskUI() {
        const disabled = !this.$hasColumns;

        return {
            label: "Add task",
            disabled,
            hint: disabled
                ? "Create a column before adding tasks"
                : "Add a task",
        };
    }

    get $searchFilterUI() {
        return {
            label: "Search tasks",
            placeholder: "Search title or description",
            value: this.search,
        };
    }

    get $dateRangeFilterUI() {
        return {
            fromLabel: "From",
            toLabel: "To",
            from: this.dateFrom,
            to: this.dateTo,
            error: this.dateRangeError ?? "",
            isInvalid: this.dateRangeError !== null,
        };
    }

    get $priorityFilterUI() {
        return {
            label: "Priority",
            value: this.priorityFilter,
            options: [
                { value: "all" as const, label: "All priorities" },
                ...this.$priorityOptions,
            ],
        };
    }

    get $clearFiltersUI() {
        return { label: "Clear filters", disabled: !this.$hasActiveFilters };
    }

    get $boardContentUI() {
        return { isReady: this.isHydrated };
    }

    get $ghostColumnUI() {
        return { label: "Add column" };
    }

    get $columnDeleteDialogUI() {
        const column = this.pendingDeleteColumn;
        const taskCount = column?.taskCount ?? 0;

        return {
            title: `Delete "${column?.title ?? "column"}"?`,
            description:
                taskCount > 0
                    ? `This will also delete its ${pluralize(taskCount, "task")}. This action cannot be undone.`
                    : "This column has no tasks. This action cannot be undone.",
            cancelLabel: "Cancel",
            confirmLabel: "Delete column",
        };
    }
    // #endregion
}

export const kanbanStore = new KanbanStore();
