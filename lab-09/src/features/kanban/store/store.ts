import { makeAutoObservable, toJS } from "mobx";
import type { Board, Column, Task } from "../types";

type Neighbours = { left?: string; right?: string };

export class KanbanStore {
    // #region Primitives
    columnOrder: string[] = [];
    columns: Record<string, Column> = {};
    tasks: Record<string, Task> = {};
    isHydrated = false;
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
    // #endregion
}

export const kanbanStore = new KanbanStore();
