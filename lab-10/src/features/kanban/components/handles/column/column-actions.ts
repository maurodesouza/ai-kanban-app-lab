import type { Action } from "#/lib/command/types";

type ColumnPayload = { columnId: string };

declare module "#/features/kanban/components/handles/kanban/kanban-actions" {
    interface KanbanActions {
        column: {
            add: Action<undefined, string>;
            rename: Action<ColumnPayload & { title: string }>;
            move: Action<ColumnPayload & { toIndex: number }>;
            moveBy: Action<ColumnPayload & { offset: -1 | 1 }>;
            delete: Action<ColumnPayload>;
            edit: {
                start: Action<ColumnPayload>;
            };
        };
        columnDeleteDialog: {
            open: Action<ColumnPayload>;
            change: Action<{ open: boolean }>;
            confirm: Action;
        };
    }
}
