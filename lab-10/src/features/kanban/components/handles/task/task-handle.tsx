import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { Priority, TaskFields, TaskResult } from "#/features/kanban/types";
import { task } from "#/features/kanban/utils/task/task";
import { command } from "#/lib/command";
import { random } from "#/utils/random/random";

type CreatePayload = Partial<TaskFields> & { columnId: string };

type UpdatePayload = Partial<TaskFields> & { taskId: string };

export function TaskHandle() {
    const store = useKanban();

    async function handleCreate(payload: CreatePayload): Promise<TaskResult> {
        const { columnId, ...input } = payload;
        const fields = { ...task.defaults(), ...input };
        const errors = task.validate(fields);

        if (!store.columns[columnId]) {
            return { ok: false, errors: { title: "Pick a column" } };
        }

        if (task.has.errors(errors)) return { ok: false, errors };

        const created = task.create(
            random.id(),
            columnId,
            fields,
            new Date().toISOString(),
        );

        store.addTask(created);

        return { ok: true, taskId: created.id };
    }

    async function handleUpdate(payload: UpdatePayload): Promise<TaskResult> {
        const { taskId, ...input } = payload;
        const current = store.tasks[taskId];

        if (!current) {
            return { ok: false, errors: { title: "Task not found" } };
        }

        const fields = task.normalize({ ...current, ...input });
        const errors = task.validate(fields);

        if (task.has.errors(errors)) return { ok: false, errors };

        store.updateTask(taskId, fields, new Date().toISOString());

        return { ok: true, taskId };
    }

    async function handleDelete(payload: { taskId: string }) {
        if (!store.tasks[payload.taskId]) return;

        store.removeTask(payload.taskId);
    }

    async function handleMove(payload: {
        taskId: string;
        toColumnId: string;
        toIndex: number;
    }) {
        if (!store.tasks[payload.taskId]) return;
        if (!store.columns[payload.toColumnId]) return;

        store.placeTask(payload.taskId, payload.toColumnId, payload.toIndex);
    }

    async function handleMoveAdjacent(payload: {
        taskId: string;
        direction: "left" | "right";
    }) {
        const current = store.tasks[payload.taskId];

        if (!current) return;

        const offset = payload.direction === "left" ? -1 : 1;
        const index = store.columnOrder.indexOf(current.columnId) + offset;
        const toColumnId = store.columnOrder[index];

        if (!toColumnId) return;

        store.placeTask(
            payload.taskId,
            toColumnId,
            store.columns[toColumnId].taskIds.length,
        );
    }

    async function handleSetPriority(payload: {
        taskId: string;
        priority: Priority;
    }) {
        if (!store.tasks[payload.taskId]) return;

        store.updateTask(
            payload.taskId,
            { priority: payload.priority },
            new Date().toISOString(),
        );
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("kanban.task.create", handleCreate),
            command.handle("kanban.task.update", handleUpdate),
            command.handle("kanban.task.delete", handleDelete),
            command.handle("kanban.task.move", handleMove),
            command.handle("kanban.task.moveAdjacent", handleMoveAdjacent),
            command.handle("kanban.task.setPriority", handleSetPriority),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
