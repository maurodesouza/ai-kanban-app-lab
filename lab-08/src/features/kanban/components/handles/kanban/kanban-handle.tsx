import { useEffect } from "react";
import { kanbanStore } from "#/features/kanban/store/kanban-store";
import { command } from "#/lib/command";
import "#/features/kanban/kanban-actions";
import type {
    AddColumnPayload,
    AddTaskPayload,
    ApplyFilterPayload,
    DeleteColumnPayload,
    EditTaskPayload,
    MoveColumnPayload,
    MoveTaskPayload,
    RenameColumnPayload,
    SetPriorityPayload,
} from "#/features/kanban/types";
import { createId } from "#/utils/random/id";

interface KanbanHandleProps {
    boardId: string;
}

export function KanbanHandle({ boardId }: KanbanHandleProps) {
    async function handleAddTask(payload: AddTaskPayload) {
        const id = createId("task");
        const now = new Date().toISOString();
        kanbanStore.addTaskToBoard(payload.boardId, {
            id,
            boardId: payload.boardId,
            columnId: payload.columnId,
            title: payload.title,
            description: payload.description,
            priority: payload.priority,
            startDate: payload.startDate,
            endDate: payload.endDate,
            createdAt: now,
            updatedAt: now,
        });
    }

    async function handleEditTask(payload: EditTaskPayload) {
        const task = kanbanStore.getTask(payload.boardId, payload.taskId);
        if (!task) return;

        const patch = { ...payload.patch };

        if (patch.columnId !== undefined && patch.columnId !== task.columnId) {
            const board = kanbanStore.getBoard(payload.boardId);
            const toColumn = board?.columns[patch.columnId];
            const toIndex = toColumn?.taskIds.length ?? 0;
            kanbanStore.setTaskColumn(
                payload.boardId,
                payload.taskId,
                patch.columnId,
                toIndex,
            );
            delete patch.columnId;
        }

        kanbanStore.updateTask(payload.boardId, payload.taskId, {
            ...patch,
            updatedAt: new Date().toISOString(),
        });
    }

    async function handleDeleteTask(payload: {
        boardId: string;
        taskId: string;
    }) {
        kanbanStore.removeTask(payload.boardId, payload.taskId);
    }

    async function handleMoveTask(payload: MoveTaskPayload) {
        kanbanStore.setTaskColumn(
            payload.boardId,
            payload.taskId,
            payload.toColumnId,
            payload.toIndex,
        );
        kanbanStore.updateTask(payload.boardId, payload.taskId, {
            updatedAt: new Date().toISOString(),
        });
    }

    async function handleSetPriority(payload: SetPriorityPayload) {
        kanbanStore.setTaskPriority(
            payload.boardId,
            payload.taskId,
            payload.priority,
        );
        kanbanStore.updateTask(payload.boardId, payload.taskId, {
            updatedAt: new Date().toISOString(),
        });
    }

    async function handleApplyFilter(payload: ApplyFilterPayload) {
        const { filter } = payload;
        if (filter.search !== undefined) {
            kanbanStore.setFilterField(
                payload.boardId,
                "search",
                filter.search,
            );
        }
        if (filter.dateFrom !== undefined) {
            kanbanStore.setFilterField(
                payload.boardId,
                "dateFrom",
                filter.dateFrom,
            );
        }
        if (filter.dateTo !== undefined) {
            kanbanStore.setFilterField(
                payload.boardId,
                "dateTo",
                filter.dateTo,
            );
        }
        if (filter.priority !== undefined) {
            kanbanStore.setFilterField(
                payload.boardId,
                "priority",
                filter.priority,
            );
        }
    }

    async function handleAddColumn(payload: AddColumnPayload) {
        const id = createId("col");
        kanbanStore.addColumnToBoard(payload.boardId, {
            id,
            boardId: payload.boardId,
            title: "New column",
            taskIds: [],
        });
    }

    async function handleRenameColumn(payload: RenameColumnPayload) {
        kanbanStore.setColumnTitle(
            payload.boardId,
            payload.columnId,
            payload.title,
        );
    }

    async function handleMoveColumn(payload: MoveColumnPayload) {
        const board = kanbanStore.getBoard(payload.boardId);
        if (!board) return;
        const fromIndex = board.columnOrder.indexOf(payload.columnId);
        if (fromIndex === -1) return;
        const toIndex = Math.max(
            0,
            Math.min(payload.toIndex, board.columnOrder.length - 1),
        );
        if (fromIndex === toIndex) return;
        const newOrder = [...board.columnOrder];
        newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, payload.columnId);
        kanbanStore.setColumnOrder(payload.boardId, newOrder);
    }

    async function handleDeleteColumn(payload: DeleteColumnPayload) {
        const board = kanbanStore.getBoard(payload.boardId);
        if (!board) return;
        const column = board.columns[payload.columnId];
        if (!column) return;

        // Delete all tasks belonging to this column
        for (const taskId of column.taskIds) {
            kanbanStore.removeTask(payload.boardId, taskId);
        }
        kanbanStore.removeColumn(payload.boardId, payload.columnId);
    }

    useEffect(() => {
        const config = { instanceId: boardId };
        const disposes = [
            command.handle("kanban.task.add", handleAddTask, config),
            command.handle("kanban.task.edit", handleEditTask, config),
            command.handle("kanban.task.delete", handleDeleteTask, config),
            command.handle("kanban.task.move", handleMoveTask, config),
            command.handle(
                "kanban.task.setPriority",
                handleSetPriority,
                config,
            ),
            command.handle(
                "kanban.task.applyFilter",
                handleApplyFilter,
                config,
            ),
            command.handle("kanban.column.add", handleAddColumn, config),
            command.handle("kanban.column.rename", handleRenameColumn, config),
            command.handle("kanban.column.move", handleMoveColumn, config),
            command.handle("kanban.column.delete", handleDeleteColumn, config),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
        // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference; boardId is the only real dependency
    }, [boardId]);

    return null;
}
