import { useEffect } from "react";
import { command } from "#/lib/command";
import { kanbanStore } from "#/stores";
import type { FilterState, Priority, TaskInput } from "#/types/domain";

export function KanbanHandle() {
    async function handleTaskAdd(payload: {
        input: TaskInput;
        columnId?: string;
    }) {
        kanbanStore.addTask(payload.input, payload.columnId);
    }

    async function handleTaskEdit(payload: {
        taskId: string;
        input: TaskInput;
    }) {
        kanbanStore.editTask(payload.taskId, payload.input);
    }

    async function handleTaskDelete(payload: { taskId: string }) {
        kanbanStore.deleteTask(payload.taskId);
    }

    async function handleTaskMove(payload: {
        taskId: string;
        toColumnId: string;
        toIndex?: number;
    }) {
        kanbanStore.moveTask(
            payload.taskId,
            payload.toColumnId,
            payload.toIndex,
        );
    }

    async function handleTaskPrioritySet(payload: {
        taskId: string;
        priority: Priority;
    }) {
        kanbanStore.setTaskPriority(payload.taskId, payload.priority);
    }

    async function handleTaskFilter(payload: { filter: Partial<FilterState> }) {
        kanbanStore.setFilter(payload.filter);
    }

    async function handleColumnAdd() {
        kanbanStore.addColumn();
    }

    async function handleColumnCreate(payload: { title: string }) {
        kanbanStore.addColumn(payload.title);
    }

    async function handleColumnRename(payload: {
        columnId: string;
        title: string;
    }) {
        kanbanStore.renameColumn(payload.columnId, payload.title);
    }

    async function handleColumnMove(payload: {
        columnId: string;
        toIndex: number;
    }) {
        kanbanStore.moveColumn(payload.columnId, payload.toIndex);
    }

    async function handleColumnDelete(payload: { columnId: string }) {
        kanbanStore.deleteColumn(payload.columnId);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers register once on mount
    useEffect(() => {
        const disposes = [
            command.handle("kanban.task.add", handleTaskAdd),
            command.handle("kanban.task.edit", handleTaskEdit),
            command.handle("kanban.task.delete", handleTaskDelete),
            command.handle("kanban.task.move", handleTaskMove),
            command.handle("kanban.task.priority.set", handleTaskPrioritySet),
            command.handle("kanban.task.filter", handleTaskFilter),
            command.handle("kanban.column.add", handleColumnAdd),
            command.handle("kanban.column.create", handleColumnCreate),
            command.handle("kanban.column.rename", handleColumnRename),
            command.handle("kanban.column.move", handleColumnMove),
            command.handle("kanban.column.delete", handleColumnDelete),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
