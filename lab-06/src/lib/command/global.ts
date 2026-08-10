import type { Priority, TaskDraft } from "#/types/kanban";
import type { Action } from "./types";

export interface Actions {
    kanban: {
        task: {
            add: Action<TaskDraft & { columnId?: string }, string | undefined>;
            edit: Action<{ taskId: string } & Partial<TaskDraft>>;
            remove: Action<{ taskId: string }>;
            setPriority: Action<{ taskId: string; priority: Priority }>;
            move: Action<{
                taskId: string;
                columnId: string;
                index?: number;
            }>;
            moveAdjacent: Action<{
                taskId: string;
                direction: "prev" | "next";
            }>;
        };
        column: {
            add: Action<{ title?: string }, string>;
            rename: Action<{ columnId: string; title: string }>;
            remove: Action<{ columnId: string }>;
            reorder: Action<{ from: number; to: number }>;
        };
        filter: {
            setSearch: Action<string>;
            setDateRange: Action<{ start?: string; end?: string }>;
            setPriorities: Action<Priority[]>;
            clear: Action;
        };
    };
    dialog: {
        openTaskForm: Action<{ taskId?: string; columnId?: string }>;
        openConfirm: Action<{
            title: string;
            description: string;
            onConfirm: () => void | Promise<void>;
        }>;
        close: Action;
    };
    theme: {
        toggle: Action;
        set: Action<"light" | "dark">;
    };
}
