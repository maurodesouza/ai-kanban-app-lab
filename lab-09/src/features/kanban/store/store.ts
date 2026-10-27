import { makeAutoObservable, toJS } from "mobx";
import type { Board, Column, Priority, Task } from "../types";
import { formatDate, formatDateRange } from "../utils/date";
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
    pendingDeleteColumnId: string | null = null;
    editingColumnId: string | null = null;
    columnTitleDraft = "";
    draggingTaskId: string | null = null;
    dropTargetColumnId: string | null = null;
    priorityMenuTaskId: string | null = null;
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

    setPendingDeleteColumnId(columnId: string | null) {
        this.pendingDeleteColumnId = columnId;
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
    // #endregion

    // #region Derived primitives
    get $hasColumns() {
        return this.columnOrder.length > 0;
    }

    get $firstColumnId(): string | undefined {
        return this.columnOrder[0];
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

    get $columnTaskIds() {
        return Object.fromEntries(
            this.$orderedColumns.map((column) => [column.id, column.taskIds]),
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
                        count: String(column.taskIds.length),
                        countLabel: pluralize(column.taskIds.length, "task"),
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
                        emptyLabel: "No tasks yet",
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

    get $ghostColumnUI() {
        return { label: "Add column" };
    }

    get $columnDeleteDialogUI() {
        const column = this.pendingDeleteColumnId
            ? this.columns[this.pendingDeleteColumnId]
            : undefined;
        const taskCount = column?.taskIds.length ?? 0;

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
