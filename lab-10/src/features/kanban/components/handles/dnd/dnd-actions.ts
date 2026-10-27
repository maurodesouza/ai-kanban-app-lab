import type { Action } from "#/lib/command/types";

export type DragItemType = "column" | "task";

export type DragItem = { id: string; type: DragItemType };

declare module "#/features/kanban/components/handles/kanban/kanban-actions" {
    interface KanbanActions {
        dnd: {
            start: Action<DragItem>;
            end: Action<{ active: DragItem; over: DragItem | null }>;
            cancel: Action;
        };
    }
}
