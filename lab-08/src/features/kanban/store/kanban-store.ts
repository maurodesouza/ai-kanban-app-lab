import { autorun, computed, makeAutoObservable, observable } from "mobx";
import { createId } from "#/utils/random/id";
import { createBoardData } from "../factories";
import type {
    BoardData,
    ColumnData,
    FilterData,
    KanbanStoreData,
    Priority,
    TaskData,
} from "../types";

const STORAGE_KEY = "kanban:store:v1";
const STORE_VERSION = 1;

function createDefaultStoreData(): KanbanStoreData {
    const boardId = createId("board");
    return {
        version: STORE_VERSION,
        boards: {
            [boardId]: createBoardData(boardId, "My Board"),
        },
        boardOrder: [boardId],
        activeBoardId: boardId,
    };
}

export class KanbanStore {
    version = STORE_VERSION;
    boards = observable.map<string, BoardData>();
    boardOrder: string[] = [];
    activeBoardId: string | null = null;

    constructor() {
        makeAutoObservable(this, {
            activeBoard: computed,
            boardsList: computed,
        });
    }

    // --- Computed ---

    get activeBoard(): BoardData | null {
        if (!this.activeBoardId) return null;
        return this.boards.get(this.activeBoardId) ?? null;
    }

    get boardsList(): BoardData[] {
        return this.boardOrder
            .map((id) => this.boards.get(id))
            .filter((b): b is BoardData => b !== undefined);
    }

    // --- Read accessors ---

    getBoard(boardId: string): BoardData | undefined {
        return this.boards.get(boardId);
    }

    getColumns(boardId: string): ColumnData[] {
        const board = this.boards.get(boardId);
        if (!board) return [];
        return board.columnOrder
            .map((id) => board.columns[id])
            .filter((c): c is ColumnData => c !== undefined);
    }

    getColumnTasks(boardId: string, columnId: string): TaskData[] {
        const board = this.boards.get(boardId);
        if (!board) return [];
        const column = board.columns[columnId];
        if (!column) return [];
        return column.taskIds
            .map((id) => board.tasks[id])
            .filter((t): t is TaskData => t !== undefined);
    }

    getTask(boardId: string, taskId: string): TaskData | undefined {
        const board = this.boards.get(boardId);
        return board?.tasks[taskId];
    }

    // --- Hydration / serialization ---

    hydrate(data: KanbanStoreData): void {
        this.version = data.version;
        this.boards.clear();
        for (const [id, board] of Object.entries(data.boards)) {
            this.boards.set(id, observable(board));
        }
        this.boardOrder = data.boardOrder;
        this.activeBoardId = data.activeBoardId;
    }

    serialize(): KanbanStoreData {
        const boards: Record<string, BoardData> = {};
        for (const [id, board] of this.boards) {
            boards[id] = board;
        }
        return {
            version: this.version,
            boards,
            boardOrder: this.boardOrder,
            activeBoardId: this.activeBoardId,
        };
    }

    // --- Board setters ---

    setBoard(board: BoardData): void {
        this.boards.set(board.id, observable(board));
        this.boardOrder.push(board.id);
    }

    setActiveBoard(boardId: string): void {
        this.activeBoardId = boardId;
    }

    removeBoard(boardId: string): void {
        this.boards.delete(boardId);
        this.boardOrder = this.boardOrder.filter((id) => id !== boardId);
    }

    setBoardTitle(boardId: string, title: string): void {
        const board = this.boards.get(boardId);
        if (board) board.title = title;
    }

    // --- Column setters ---

    addColumnToBoard(boardId: string, column: ColumnData): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        board.columns[column.id] = column;
        board.columnOrder.push(column.id);
    }

    setColumnTitle(boardId: string, columnId: string, title: string): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        const column = board.columns[columnId];
        if (column) column.title = title;
    }

    setColumnOrder(boardId: string, columnOrder: string[]): void {
        const board = this.boards.get(boardId);
        if (board) board.columnOrder = columnOrder;
    }

    removeColumn(boardId: string, columnId: string): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        delete board.columns[columnId];
        board.columnOrder = board.columnOrder.filter((id) => id !== columnId);
    }

    // --- Task setters ---

    addTaskToBoard(boardId: string, task: TaskData): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        const column = board.columns[task.columnId];
        if (!column) return;
        board.tasks[task.id] = task;
        column.taskIds.push(task.id);
    }

    updateTask(
        boardId: string,
        taskId: string,
        patch: Partial<Omit<TaskData, "id" | "boardId" | "createdAt">>,
    ): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        const task = board.tasks[taskId];
        if (!task) return;
        Object.assign(task, patch);
    }

    removeTask(boardId: string, taskId: string): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        const task = board.tasks[taskId];
        if (!task) return;
        const column = board.columns[task.columnId];
        if (column) {
            column.taskIds = column.taskIds.filter((id) => id !== taskId);
        }
        delete board.tasks[taskId];
    }

    setTaskColumn(
        boardId: string,
        taskId: string,
        toColumnId: string,
        toIndex: number,
    ): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        const task = board.tasks[taskId];
        if (!task) return;
        const fromColumn = board.columns[task.columnId];
        const toColumn = board.columns[toColumnId];
        if (!fromColumn || !toColumn) return;

        fromColumn.taskIds = fromColumn.taskIds.filter((id) => id !== taskId);
        const clampedIndex = Math.max(
            0,
            Math.min(toIndex, toColumn.taskIds.length),
        );
        toColumn.taskIds.splice(clampedIndex, 0, taskId);
        task.columnId = toColumnId;
    }

    setTaskPriority(boardId: string, taskId: string, priority: Priority): void {
        const board = this.boards.get(boardId);
        if (!board) return;
        const task = board.tasks[taskId];
        if (!task) return;
        task.priority = priority;
    }

    // --- Filter setters ---

    setFilter(boardId: string, filter: FilterData): void {
        const board = this.boards.get(boardId);
        if (board) board.filter = filter;
    }

    setFilterField<K extends keyof FilterData>(
        boardId: string,
        key: K,
        value: FilterData[K],
    ): void {
        const board = this.boards.get(boardId);
        if (board) board.filter[key] = value;
    }
}

// --- Singleton store + persistence ---

function loadFromStorage(): KanbanStoreData | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as KanbanStoreData;
        if (parsed.version !== STORE_VERSION) return null;
        return parsed;
    } catch {
        return null;
    }
}

function saveToStorage(data: KanbanStoreData): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ignore quota / serialization errors
    }
}

export function createKanbanStore(): KanbanStore {
    const store = new KanbanStore();
    const stored = loadFromStorage();
    store.hydrate(stored ?? createDefaultStoreData());

    if (typeof window !== "undefined") {
        autorun(() => {
            saveToStorage(store.serialize());
        });
    }

    return store;
}

export const kanbanStore = createKanbanStore();
