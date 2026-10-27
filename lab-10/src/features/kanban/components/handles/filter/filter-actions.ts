import type { PriorityFilter } from "#/features/kanban/types";
import type { Action } from "#/lib/command/types";

declare module "#/features/kanban/components/handles/kanban/kanban-actions" {
    interface KanbanActions {
        filter: {
            setSearch: Action<{ search: string }>;
            setDateFrom: Action<{ date: string }>;
            setDateTo: Action<{ date: string }>;
            setPriority: Action<{ priority: PriorityFilter }>;
            clear: Action;
        };
    }
}
