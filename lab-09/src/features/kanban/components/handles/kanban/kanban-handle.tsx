import { reaction } from "mobx";
import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type {
    Direction,
    Priority,
    TaskMutationResult,
} from "#/features/kanban/types";
import {
    BOARD_STORAGE_KEY,
    BOARD_STORAGE_VERSION,
    createColumn,
    createSeedBoard,
    parseStoredBoard,
} from "#/features/kanban/utils/board";
import { today } from "#/features/kanban/utils/date";
import { createId } from "#/features/kanban/utils/id";
import { DEFAULT_PRIORITY, isPriority } from "#/features/kanban/utils/priority";
import { hasErrors, validateTask } from "#/features/kanban/utils/task";
import { command } from "#/lib/command";
import { readJSON, writeJSON } from "#/utils/storage";
import type { TaskCreatePayload, TaskUpdatePayload } from "./kanban-actions";

export const NO_COLUMN_ERROR = "Create a column before adding tasks.";

export function KanbanHandle() {
    const store = useKanban();

    // #region Persistence
    function hydrate() {
        const stored = parseStoredBoard(
            readJSON<unknown>(BOARD_STORAGE_KEY, null),
        );

        store.setBoard(stored ?? createSeedBoard());
        store.setIsHydrated(true);
    }

    function persist() {
        return reaction(
            () => store.$snapshot,
            (board) =>
                writeJSON(BOARD_STORAGE_KEY, {
                    version: BOARD_STORAGE_VERSION,
                    board,
                }),
        );
    }
    // #endregion

    // #region Columns
    async function handleColumnCreate() {
        store.addColumn(createColumn());
    }

    async function handleColumnRename(payload: {
        columnId: string;
        title: string;
    }) {
        const title = payload.title.trim();

        if (!store.columns[payload.columnId] || !title) return;

        store.setColumnTitle(payload.columnId, title);
    }

    async function handleColumnMove(payload: {
        columnId: string;
        direction: Direction;
    }) {
        const neighbour =
            store.$columnNeighbours[payload.columnId]?.[payload.direction];

        if (!neighbour) return;

        const order = [...store.columnOrder];
        const from = order.indexOf(payload.columnId);
        const to = order.indexOf(neighbour);

        [order[from], order[to]] = [order[to], order[from]];
        store.setColumnOrder(order);
    }

    async function handleColumnDelete(payload: { columnId: string }) {
        const column = store.columns[payload.columnId];

        if (!column) return;

        for (const taskId of [...column.taskIds]) store.removeTask(taskId);
        store.removeColumn(payload.columnId);
    }
    // #endregion

    // #region Tasks
    async function handleTaskCreate(
        payload: TaskCreatePayload,
    ): Promise<TaskMutationResult> {
        const columnId = payload.columnId ?? store.$firstColumnId;

        if (!columnId || !store.columns[columnId])
            return { ok: false, errors: { column: NO_COLUMN_ERROR } };

        const date = today();
        const input = {
            title: payload.title.trim(),
            description: payload.description?.trim() ?? "",
            priority: isPriority(payload.priority)
                ? payload.priority
                : DEFAULT_PRIORITY,
            startDate: payload.startDate || date,
            endDate: payload.endDate || date,
        };
        const errors = validateTask(input);

        if (hasErrors(errors)) return { ok: false, errors };

        const now = new Date().toISOString();
        const id = createId();

        store.addTask({
            id,
            ...input,
            columnId,
            createdAt: now,
            updatedAt: now,
        });

        return { ok: true, taskId: id };
    }

    async function handleTaskUpdate(
        payload: TaskUpdatePayload,
    ): Promise<TaskMutationResult> {
        const { taskId, ...fields } = payload;

        if (!store.tasks[taskId])
            return { ok: false, errors: { title: "Task not found." } };

        const input = {
            ...fields,
            title: fields.title.trim(),
            description: fields.description.trim(),
        };
        const errors = validateTask(input);

        if (hasErrors(errors)) return { ok: false, errors };

        store.updateTask(taskId, {
            ...input,
            updatedAt: new Date().toISOString(),
        });

        return { ok: true, taskId };
    }

    async function handleTaskDelete(payload: { taskId: string }) {
        if (!store.tasks[payload.taskId]) return;

        store.removeTask(payload.taskId);
    }

    async function handleTaskMove(payload: {
        taskId: string;
        columnId: string;
    }) {
        const task = store.tasks[payload.taskId];

        if (!task || !store.columns[payload.columnId]) return;
        if (task.columnId === payload.columnId) return;

        store.setTaskColumn(
            payload.taskId,
            payload.columnId,
            new Date().toISOString(),
        );
    }

    async function handleTaskMoveAdjacent(payload: {
        taskId: string;
        direction: Direction;
    }) {
        const task = store.tasks[payload.taskId];

        if (!task) return;

        const target =
            store.$columnNeighbours[task.columnId]?.[payload.direction];

        if (!target) return;

        store.setTaskColumn(payload.taskId, target, new Date().toISOString());
    }

    async function handleTaskSetPriority(payload: {
        taskId: string;
        priority: Priority;
    }) {
        if (!store.tasks[payload.taskId] || !isPriority(payload.priority))
            return;

        store.updateTask(payload.taskId, {
            priority: payload.priority,
            updatedAt: new Date().toISOString(),
        });
    }
    // #endregion

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        hydrate();

        const disposes = [
            persist(),
            command.handle("kanban.column.create", handleColumnCreate),
            command.handle("kanban.column.rename", handleColumnRename),
            command.handle("kanban.column.move", handleColumnMove),
            command.handle("kanban.column.delete", handleColumnDelete),
            command.handle("kanban.task.create", handleTaskCreate),
            command.handle("kanban.task.update", handleTaskUpdate),
            command.handle("kanban.task.delete", handleTaskDelete),
            command.handle("kanban.task.move", handleTaskMove),
            command.handle("kanban.task.moveAdjacent", handleTaskMoveAdjacent),
            command.handle("kanban.task.setPriority", handleTaskSetPriority),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
