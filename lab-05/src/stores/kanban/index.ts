import { proxy } from "valtio";

import type {
    Column,
    KanbanFilter,
    KanbanState,
    Task,
    TaskStatus,
} from "#/types/kanban";
import { random } from "#/utils/random";

function seedDate(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
}

const initialColumns: Column[] = [
    { id: "col-1", title: "To Do" },
    { id: "col-2", title: "In Progress" },
    { id: "col-3", title: "Done" },
];

const initialTasks: Task[] = [
    {
        id: random.id(),
        columnId: "col-1",
        title: "Welcome task",
        description: "A sample task for the To Do column",
        status: "todo",
        dueDate: seedDate(2),
        createdAt: new Date().toISOString(),
    },
    {
        id: random.id(),
        columnId: "col-2",
        title: "In progress task",
        description: "A sample task for the In Progress column",
        status: "in-progress",
        dueDate: seedDate(5),
        createdAt: new Date().toISOString(),
    },
    {
        id: random.id(),
        columnId: "col-3",
        title: "Completed task",
        description: "A sample task for the Done column",
        status: "done",
        dueDate: seedDate(-1),
        createdAt: new Date().toISOString(),
    },
];

const initialFilter: KanbanFilter = {
    text: "",
    dateRange: {},
    statuses: [],
};

const initialState: KanbanState = {
    columns: initialColumns,
    columnOrder: ["col-1", "col-2", "col-3"],
    tasks: initialTasks,
    filter: initialFilter,
};

export const kanbanState = proxy<KanbanState>({ ...initialState });

export function resetKanbanState() {
    kanbanState.columns = [...initialState.columns];
    kanbanState.columnOrder = [...initialState.columnOrder];
    kanbanState.tasks = [...initialState.tasks];
    kanbanState.filter = { ...initialState.filter };
}

export function getTaskById(
    taskId: string,
    state: KanbanState = kanbanState,
): Task | undefined {
    return state.tasks.find((task) => task.id === taskId);
}

export function getColumns(
    state: KanbanState = kanbanState,
): readonly Column[] {
    return state.columnOrder
        .map((id) => state.columns.find((column) => column.id === id))
        .filter((column): column is Column => Boolean(column));
}

export function getFilteredTasks(
    columnId: string,
    state: KanbanState = kanbanState,
): readonly Task[] {
    const { text, dateRange, statuses } = state.filter;
    const lower = text.toLowerCase();

    return state.tasks.filter((task) => {
        if (task.columnId !== columnId) return false;

        if (text) {
            const titleMatch = task.title.toLowerCase().includes(lower);
            const descriptionMatch = task.description
                .toLowerCase()
                .includes(lower);

            if (!titleMatch && !descriptionMatch) return false;
        }

        if (statuses.length && !statuses.includes(task.status)) return false;

        if (dateRange.start && task.dueDate && task.dueDate < dateRange.start)
            return false;

        if (dateRange.end && task.dueDate && task.dueDate > dateRange.end)
            return false;

        return true;
    });
}

export function createTask(
    columnId: string,
    title: string,
    description: string,
    status: TaskStatus = "todo",
    dueDate = new Date().toISOString().split("T")[0],
): Task {
    return {
        id: random.id(),
        columnId,
        title,
        description,
        status,
        dueDate,
        createdAt: new Date().toISOString(),
    };
}
