import type { TaskFieldChange } from "#/features/kanban/types";
import type { Action } from "#/lib/command/types";

declare module "#/features/kanban/components/handles/kanban/kanban-actions" {
    interface KanbanActions {
        taskDialog: {
            openCreate: Action<{ columnId?: string }>;
            openEdit: Action<{ taskId: string }>;
            change: Action<{ open: boolean }>;
            setField: Action<TaskFieldChange>;
            setColumn: Action<{ columnId: string }>;
            submit: Action;
        };
    }
}
