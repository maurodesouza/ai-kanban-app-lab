import { makeAutoObservable } from "mobx";
import type {
    BoardSnapshot,
    Column,
    Task,
    TaskFields,
} from "#/features/kanban/types";
import { date } from "#/features/kanban/utils/date/date";
import { priority } from "#/features/kanban/utils/priority/priority";
import { array } from "#/utils/array/array";

export class KanbanStore {
    // #region Primitives
    isHydrated = false;
    columnOrder: string[] = [];
    columns: Record<string, Column> = {};
    tasks: Record<string, Task> = {};
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
        return this.$tasksByColumn;
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
    get $columnsUI() {
        const lastIndex = this.columnOrder.length - 1;

        return this.$orderedColumns.map((column, index) => {
            const isFirst = index === 0;
            const isLast = index === lastIndex;

            return {
                id: column.id,
                title: column.title,
                taskCount: column.taskIds.length,
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
                })),
            };
        });
    }
    // #endregion
}

export const kanbanStore = new KanbanStore();

export type ColumnUI = KanbanStore["$columnsUI"][number];

export type TaskUI = ColumnUI["tasks"][number];
