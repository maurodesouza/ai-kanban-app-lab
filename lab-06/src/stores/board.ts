import { makeAutoObservable } from "mobx";
import type {
    BoardState,
    Column,
    Priority,
    Task,
    TaskDraft,
} from "#/types/kanban";

export type BoardStoreOptions = {
    createId?: () => string;
    now?: () => Date;
    initialState?: BoardState;
};

const DEFAULT_COLUMNS: Column[] = [
    { id: "todo", title: "Todo", taskIds: [] },
    { id: "in-progress", title: "In Progress", taskIds: [] },
    { id: "done", title: "Done", taskIds: [] },
];

export function createDefaultBoardState(): BoardState {
    return {
        columns: Object.fromEntries(
            DEFAULT_COLUMNS.map((column) => [
                column.id,
                { ...column, taskIds: [] },
            ]),
        ),
        columnOrder: DEFAULT_COLUMNS.map(({ id }) => id),
        tasks: {},
    };
}

function cloneState(state: BoardState): BoardState {
    return {
        columns: Object.fromEntries(
            Object.entries(state.columns).map(([id, column]) => [
                id,
                { ...column, taskIds: [...column.taskIds] },
            ]),
        ),
        columnOrder: [...state.columnOrder],
        tasks: Object.fromEntries(
            Object.entries(state.tasks).map(([id, task]) => [id, { ...task }]),
        ),
    };
}

export class BoardStore {
    columns: Record<string, Column> = {};
    columnOrder: string[] = [];
    tasks: Record<string, Task> = {};

    private readonly createId: () => string;
    private readonly now: () => Date;

    constructor(options: BoardStoreOptions = {}) {
        this.createId = options.createId ?? (() => crypto.randomUUID());
        this.now = options.now ?? (() => new Date());
        this.replace(options.initialState ?? createDefaultBoardState());
        makeAutoObservable<this, "createId" | "now">(
            this,
            { createId: false, now: false },
            { autoBind: true },
        );
    }

    get snapshot(): BoardState {
        return cloneState(this);
    }

    addTask(
        draft: TaskDraft,
        columnId = this.columnOrder[0],
    ): string | undefined {
        const column = this.columns[columnId];
        if (!column) return;

        const id = this.createId();
        const timestamp = this.now().toISOString();
        this.tasks[id] = {
            id,
            columnId,
            ...draft,
            title: draft.title.trim(),
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        column.taskIds.push(id);
        return id;
    }

    editTask(taskId: string, draft: Partial<TaskDraft>): void {
        const task = this.tasks[taskId];
        if (!task) return;

        Object.assign(task, draft, {
            ...(draft.title === undefined ? {} : { title: draft.title.trim() }),
            updatedAt: this.now().toISOString(),
        });
    }

    removeTask(taskId: string): void {
        const task = this.tasks[taskId];
        if (!task) return;

        const column = this.columns[task.columnId];
        if (column)
            column.taskIds = column.taskIds.filter((id) => id !== taskId);
        delete this.tasks[taskId];
    }

    setPriority(taskId: string, priority: Priority): void {
        const task = this.tasks[taskId];
        if (!task) return;
        task.priority = priority;
        task.updatedAt = this.now().toISOString();
    }

    moveTask(taskId: string, columnId: string, index?: number): void {
        const task = this.tasks[taskId];
        const target = this.columns[columnId];
        if (!task || !target) return;

        const source = this.columns[task.columnId];
        if (source)
            source.taskIds = source.taskIds.filter((id) => id !== taskId);
        target.taskIds = target.taskIds.filter((id) => id !== taskId);
        const targetIndex = Math.max(
            0,
            Math.min(index ?? target.taskIds.length, target.taskIds.length),
        );
        target.taskIds.splice(targetIndex, 0, taskId);
        task.columnId = columnId;
        task.updatedAt = this.now().toISOString();
    }

    moveAdjacent(taskId: string, direction: "prev" | "next"): void {
        const task = this.tasks[taskId];
        if (!task) return;

        const currentIndex = this.columnOrder.indexOf(task.columnId);
        const targetIndex = currentIndex + (direction === "prev" ? -1 : 1);
        const targetId = this.columnOrder[targetIndex];
        if (!targetId) return;
        this.moveTask(taskId, targetId);
    }

    addColumn(title = "New Column"): string {
        const id = this.createId();
        this.columns[id] = {
            id,
            title: title.trim() || "New Column",
            taskIds: [],
        };
        this.columnOrder.push(id);
        return id;
    }

    renameColumn(columnId: string, title: string): void {
        const column = this.columns[columnId];
        const trimmedTitle = title.trim();
        if (!column || !trimmedTitle) return;
        column.title = trimmedTitle;
    }

    removeColumn(columnId: string): void {
        const column = this.columns[columnId];
        if (!column) return;
        for (const taskId of column.taskIds) delete this.tasks[taskId];
        delete this.columns[columnId];
        this.columnOrder = this.columnOrder.filter((id) => id !== columnId);
    }

    reorderColumn(from: number, to: number): void {
        if (
            from < 0 ||
            from >= this.columnOrder.length ||
            this.columnOrder.length < 2
        )
            return;
        const target = Math.max(0, Math.min(to, this.columnOrder.length - 1));
        if (target === from) return;
        const [columnId] = this.columnOrder.splice(from, 1);
        this.columnOrder.splice(target, 0, columnId);
    }

    replace(state: BoardState): void {
        const snapshot = cloneState(state);
        this.columns = snapshot.columns;
        this.columnOrder = snapshot.columnOrder;
        this.tasks = snapshot.tasks;
    }

    reset(): void {
        this.replace(createDefaultBoardState());
    }
}
