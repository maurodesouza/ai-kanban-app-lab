import { makeAutoObservable, toJS } from "mobx";
import type { Board, Column, Task } from "../types";
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
                    },
                ];
            }),
        ) as Record<string, ColumnUI>;
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
