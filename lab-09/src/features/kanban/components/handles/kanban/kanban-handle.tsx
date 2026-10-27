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
import { isBefore, today } from "#/features/kanban/utils/date";
import {
    createEmptyFilters,
    DATE_RANGE_ERROR,
    FILTERS_STORAGE_KEY,
    isPriorityFilter,
    type PriorityFilter,
    parseStoredFilters,
} from "#/features/kanban/utils/filter";
import { createId } from "#/features/kanban/utils/id";
import { DEFAULT_PRIORITY, isPriority } from "#/features/kanban/utils/priority";
import { hasErrors, validateTask } from "#/features/kanban/utils/task";
import { actions, command } from "#/lib/command";
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
        store.setFilters(
            parseStoredFilters(readJSON<unknown>(FILTERS_STORAGE_KEY, null)) ??
                createEmptyFilters(),
        );
        validateDateRange();
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

    function persistFilters() {
        return reaction(
            () => store.$filters,
            (filters) => writeJSON(FILTERS_STORAGE_KEY, filters),
        );
    }
    // #endregion

    // #region Columns
    async function handleColumnCreate() {
        const column = createColumn();

        store.addColumn(column);
        store.startColumnEdit(column.id, column.title);
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

    async function handleColumnDeleteRequest(payload: { columnId: string }) {
        if (!store.columns[payload.columnId]) return;

        const column = store.columns[payload.columnId];

        // A snapshot keeps the dialog text stable while it animates out.
        store.setPendingDeleteColumn({
            id: column.id,
            title: column.title,
            taskCount: column.taskIds.length,
        });
        await actions.modal.open("column-delete-confirm");
    }

    async function handleColumnDeleteConfirm() {
        const column = store.pendingDeleteColumn;

        await actions.modal.close();

        if (column) await actions.kanban.column.delete({ columnId: column.id });
    }

    async function handleColumnEditStart(payload: { columnId: string }) {
        const column = store.columns[payload.columnId];

        if (!column) return;

        store.startColumnEdit(column.id, column.title);
    }

    async function handleColumnEditChange(payload: { value: string }) {
        if (!store.editingColumnId) return;

        store.setColumnTitleDraft(payload.value);
    }

    async function handleColumnEditCommit() {
        const columnId = store.editingColumnId;

        if (!columnId) return;

        const title = store.columnTitleDraft;

        store.clearColumnEdit();
        await actions.kanban.column.rename({ columnId, title });
    }

    async function handleColumnEditCancel() {
        store.clearColumnEdit();
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

    async function handleTaskPriorityMenuChange(payload: {
        taskId: string;
        open: boolean;
    }) {
        if (payload.open) return store.setPriorityMenuTaskId(payload.taskId);
        if (store.priorityMenuTaskId === payload.taskId)
            store.setPriorityMenuTaskId(null);
    }
    // #endregion

    // #region Filters
    function validateDateRange() {
        const { dateFrom, dateTo } = store;
        const isInverted = dateFrom && dateTo && isBefore(dateTo, dateFrom);

        store.setDateRangeError(isInverted ? DATE_RANGE_ERROR : null);
    }

    async function handleFilterSearch(payload: { value: string }) {
        store.setSearch(payload.value);
    }

    async function handleFilterDateRange(payload: {
        from: string;
        to: string;
    }) {
        store.setDateRange(payload.from, payload.to);
        validateDateRange();
    }

    async function handleFilterPriority(payload: { priority: PriorityFilter }) {
        if (!isPriorityFilter(payload.priority)) return;

        store.setPriorityFilter(payload.priority);
    }

    async function handleFilterClear() {
        store.setFilters(createEmptyFilters());
        store.setDateRangeError(null);
    }
    // #endregion

    // #region Drag and drop
    async function handleTaskDragStart(payload: { taskId: string }) {
        if (!store.tasks[payload.taskId]) return;

        store.setDraggingTaskId(payload.taskId);
    }

    async function handleTaskDragEnter(payload: { columnId: string }) {
        if (!store.draggingTaskId) return;

        store.setDropTargetColumnId(payload.columnId);
    }

    async function handleTaskDragLeave(payload: { columnId: string }) {
        if (store.dropTargetColumnId === payload.columnId)
            store.setDropTargetColumnId(null);
    }

    function clearDrag() {
        store.setDraggingTaskId(null);
        store.setDropTargetColumnId(null);
    }

    async function handleTaskDragEnd() {
        clearDrag();
    }

    async function handleTaskDrop(payload: { columnId: string }) {
        const taskId = store.draggingTaskId;

        clearDrag();

        if (taskId)
            await actions.kanban.task.move({
                taskId,
                columnId: payload.columnId,
            });
    }
    // #endregion

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        hydrate();

        const disposes = [
            persist(),
            persistFilters(),
            command.handle("kanban.column.create", handleColumnCreate),
            command.handle("kanban.column.rename", handleColumnRename),
            command.handle("kanban.column.move", handleColumnMove),
            command.handle("kanban.column.delete", handleColumnDelete),
            command.handle(
                "kanban.column.deleteRequest",
                handleColumnDeleteRequest,
            ),
            command.handle(
                "kanban.column.deleteConfirm",
                handleColumnDeleteConfirm,
            ),
            command.handle("kanban.column.editStart", handleColumnEditStart),
            command.handle("kanban.column.editChange", handleColumnEditChange),
            command.handle("kanban.column.editCommit", handleColumnEditCommit),
            command.handle("kanban.column.editCancel", handleColumnEditCancel),
            command.handle("kanban.task.create", handleTaskCreate),
            command.handle("kanban.task.update", handleTaskUpdate),
            command.handle("kanban.task.delete", handleTaskDelete),
            command.handle("kanban.task.move", handleTaskMove),
            command.handle("kanban.task.moveAdjacent", handleTaskMoveAdjacent),
            command.handle("kanban.task.setPriority", handleTaskSetPriority),
            command.handle(
                "kanban.task.priorityMenuChange",
                handleTaskPriorityMenuChange,
            ),
            command.handle("kanban.task.dragStart", handleTaskDragStart),
            command.handle("kanban.task.dragEnter", handleTaskDragEnter),
            command.handle("kanban.task.dragLeave", handleTaskDragLeave),
            command.handle("kanban.task.dragEnd", handleTaskDragEnd),
            command.handle("kanban.task.drop", handleTaskDrop),
            command.handle("kanban.filter.search", handleFilterSearch),
            command.handle("kanban.filter.dateRange", handleFilterDateRange),
            command.handle("kanban.filter.priority", handleFilterPriority),
            command.handle("kanban.filter.clear", handleFilterClear),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
