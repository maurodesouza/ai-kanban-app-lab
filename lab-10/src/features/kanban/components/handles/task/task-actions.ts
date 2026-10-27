import type { Priority, TaskFields, TaskResult } from "#/features/kanban/types";
import type { Action } from "#/lib/command/types";

type TaskPayload = { taskId: string };

declare module "#/features/kanban/components/handles/kanban/kanban-actions" {
    interface KanbanActions {
        task: {
            create: Action<
                Partial<TaskFields> & { columnId: string },
                TaskResult
            >;
            update: Action<TaskPayload & Partial<TaskFields>, TaskResult>;
            delete: Action<TaskPayload>;
            move: Action<TaskPayload & { toColumnId: string; toIndex: number }>;
            moveAdjacent: Action<TaskPayload & { direction: "left" | "right" }>;
            setPriority: Action<TaskPayload & { priority: Priority }>;
        };
    }
}
