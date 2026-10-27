import type {
    Direction,
    Priority,
    TaskInput,
    TaskMutationResult,
} from "#/features/kanban/types";
import type { Action } from "#/lib/command";

export type TaskCreatePayload = Pick<TaskInput, "title"> &
    Partial<Omit<TaskInput, "title">> & { columnId?: string };

export type TaskUpdatePayload = TaskInput & { taskId: string };

declare module "#/lib/command/global" {
    interface Actions {
        kanban: {
            column: {
                create: Action;
                rename: Action<{ columnId: string; title: string }>;
                move: Action<{ columnId: string; direction: Direction }>;
                delete: Action<{ columnId: string }>;
                deleteRequest: Action<{ columnId: string }>;
                deleteConfirm: Action;
                editStart: Action<{ columnId: string }>;
                editChange: Action<{ value: string }>;
                editCommit: Action;
                editCancel: Action;
            };
            task: {
                create: Action<TaskCreatePayload, TaskMutationResult>;
                update: Action<TaskUpdatePayload, TaskMutationResult>;
                delete: Action<{ taskId: string }>;
                move: Action<{ taskId: string; columnId: string }>;
                moveAdjacent: Action<{ taskId: string; direction: Direction }>;
                setPriority: Action<{ taskId: string; priority: Priority }>;
                priorityMenuChange: Action<{ taskId: string; open: boolean }>;
                dragStart: Action<{ taskId: string }>;
                dragEnter: Action<{ columnId: string }>;
                dragEnd: Action;
                drop: Action<{ columnId: string }>;
            };
        };
    }
}
