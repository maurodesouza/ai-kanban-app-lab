import { makeAutoObservable, type ObservableMap, observable } from "mobx";
import type {
    Column,
    ColumnWithTasks,
    FilterState,
    Priority,
    Task,
    TaskInput,
} from "#/types/domain";
import { hydrate, persist } from "#/utils/persist";
import { createId } from "#/utils/random/id";

const STORAGE_KEY = "lab-07:kanban:v1";

const DEFAULT_COLUMNS: Column[] = [
    { id: "backlog", title: "Backlog", taskIds: [] },
    { id: "in-progress", title: "In Progress", taskIds: [] },
    { id: "done", title: "Done", taskIds: [] },
];

const DEFAULT_FILTERS: FilterState = {
    search: "",
    dateRange: { start: null, end: null },
    priority: "all",
};

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

function isInRange(
    task: Task,
    start: string | null,
    end: string | null,
): boolean {
    if (!start && !end) return true;
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    if (start && taskEnd < start) return false;
    if (end && taskStart > end) return false;
    return true;
}

function matchesFilters(task: Task, filters: FilterState): boolean {
    if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description
            .toLowerCase()
            .includes(query);
        if (!matchesTitle && !matchesDescription) return false;
    }

    if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
    }

    if (!isInRange(task, filters.dateRange.start, filters.dateRange.end)) {
        return false;
    }

    return true;
}

interface KanbanSnapshot {
    id: string;
    title: string;
    columns: Column[];
    tasks: Record<string, Task>;
    filters: FilterState;
}

function createDefaultSnapshot(): KanbanSnapshot {
    return {
        id: createId(),
        title: "My Kanban Board",
        columns: DEFAULT_COLUMNS.map((c) => ({ ...c, taskIds: [] })),
        tasks: {},
        filters: { ...DEFAULT_FILTERS },
    };
}

export class KanbanStore {
    id: string;
    title: string;
    columns: Column[];
    tasks: ObservableMap<string, Task>;
    filters: FilterState;

    constructor() {
        const snapshot = hydrate<KanbanSnapshot | null>(
            STORAGE_KEY,
            () => null,
        );

        if (snapshot && snapshot.columns && snapshot.tasks) {
            this.id = snapshot.id ?? createId();
            this.title = snapshot.title ?? "My Kanban Board";
            this.columns = observable.array(snapshot.columns);
            this.tasks = observable.map(snapshot.tasks);
            this.filters = snapshot.filters ?? { ...DEFAULT_FILTERS };
        } else {
            const defaults = createDefaultSnapshot();
            this.id = defaults.id;
            this.title = defaults.title;
            this.columns = observable.array(defaults.columns);
            this.tasks = observable.map(defaults.tasks);
            this.filters = defaults.filters;
        }

        makeAutoObservable<KanbanStore, "serialize" | "validateDates">(
            this,
            { serialize: false, validateDates: false },
            { autoBind: true },
        );

        persist(this, STORAGE_KEY, (store) => store.serialize());
    }

    private serialize(): string {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            columns: this.columns.map((c) => ({
                id: c.id,
                title: c.title,
                taskIds: [...c.taskIds],
            })),
            tasks: Object.fromEntries(this.tasks.entries()),
            filters: { ...this.filters },
        } satisfies KanbanSnapshot);
    }

    private validateDates(input: TaskInput): TaskInput {
        const startDate = input.startDate || today();
        let endDate = input.endDate || today();

        if (endDate < startDate) {
            endDate = startDate;
        }

        return { ...input, startDate, endDate };
    }

    get columnsWithTasks(): ColumnWithTasks[] {
        return this.columns.map((column) => ({
            id: column.id,
            title: column.title,
            tasks: column.taskIds
                .map((taskId) => this.tasks.get(taskId))
                .filter((task): task is Task => task !== undefined)
                .filter((task) => matchesFilters(task, this.filters)),
        }));
    }

    get columnOrder(): string[] {
        return this.columns.map((c) => c.id);
    }

    get columnCount(): number {
        return this.columns.length;
    }

    getColumnIndex(columnId: string): number {
        return this.columns.findIndex((c) => c.id === columnId);
    }

    getColumn(columnId: string): Column | undefined {
        return this.columns.find((c) => c.id === columnId);
    }

    getAdjacentColumnId(
        columnId: string,
        direction: "left" | "right",
    ): string | null {
        const index = this.getColumnIndex(columnId);
        if (index === -1) return null;

        const targetIndex = direction === "left" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= this.columns.length) return null;

        return this.columns[targetIndex].id;
    }

    addTask(input: TaskInput, columnId?: string): string | undefined {
        const targetColumnId = columnId ?? this.columns[0]?.id;
        const column = this.getColumn(targetColumnId);
        if (!column) return;

        const validated = this.validateDates(input);
        const now = new Date().toISOString();
        const id = createId();

        const task: Task = {
            id,
            title: validated.title,
            description: validated.description,
            priority: validated.priority,
            startDate: validated.startDate,
            endDate: validated.endDate,
            columnId: column.id,
            createdAt: now,
            updatedAt: now,
        };

        this.tasks.set(id, task);
        column.taskIds.push(id);
        return id;
    }

    editTask(taskId: string, input: TaskInput): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const validated = this.validateDates(input);
        Object.assign(task, {
            title: validated.title,
            description: validated.description,
            priority: validated.priority,
            startDate: validated.startDate,
            endDate: validated.endDate,
            updatedAt: new Date().toISOString(),
        });
    }

    deleteTask(taskId: string): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const column = this.getColumn(task.columnId);
        if (column) {
            column.taskIds = column.taskIds.filter((id) => id !== taskId);
        }

        this.tasks.delete(taskId);
    }

    moveTask(taskId: string, toColumnId: string, toIndex?: number): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const fromColumn = this.getColumn(task.columnId);
        const toColumn = this.getColumn(toColumnId);
        if (!fromColumn || !toColumn) return;

        const fromIndex = fromColumn.taskIds.indexOf(taskId);
        if (fromIndex === -1) return;

        fromColumn.taskIds.splice(fromIndex, 1);

        const insertIndex =
            toIndex === undefined
                ? toColumn.taskIds.length
                : Math.min(toIndex, toColumn.taskIds.length);

        toColumn.taskIds.splice(insertIndex, 0, taskId);
        task.columnId = toColumnId;
        task.updatedAt = new Date().toISOString();
    }

    setTaskPriority(taskId: string, priority: Priority): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        task.priority = priority;
        task.updatedAt = new Date().toISOString();
    }

    setFilter(partial: Partial<FilterState>): void {
        this.filters = {
            ...this.filters,
            ...partial,
            dateRange: {
                ...this.filters.dateRange,
                ...partial.dateRange,
            },
        };
    }

    addColumn(title?: string): string | undefined {
        const id = createId();
        const newColumn: Column = {
            id,
            title: title ?? "New Column",
            taskIds: [],
        };
        this.columns.push(newColumn);
        return id;
    }

    renameColumn(columnId: string, title: string): void {
        const column = this.getColumn(columnId);
        if (!column) return;
        column.title = title;
    }

    moveColumn(columnId: string, toIndex: number): void {
        const fromIndex = this.getColumnIndex(columnId);
        if (fromIndex === -1) return;

        const clampedIndex = Math.max(
            0,
            Math.min(toIndex, this.columns.length - 1),
        );

        if (fromIndex === clampedIndex) return;

        const [moved] = this.columns.splice(fromIndex, 1);
        this.columns.splice(clampedIndex, 0, moved);
    }

    deleteColumn(columnId: string): void {
        const index = this.getColumnIndex(columnId);
        if (index === -1) return;

        const column = this.columns[index];
        for (const taskId of column.taskIds) {
            this.tasks.delete(taskId);
        }

        this.columns.splice(index, 1);
    }
}
