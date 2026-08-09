import type { TaskStatus } from "#/types/kanban";
import type { Action } from "./types";

export interface Actions {
    kanban: {
        column: {
            add: Action<{ title: string }>;
            remove: Action<{ columnId: string }>;
            rename: Action<{ columnId: string; title: string }>;
            reorder: Action<{ from: number; to: number }>;
        };
        task: {
            add: Action<{
                columnId: string;
                title: string;
                description: string;
            }>;
            edit: Action<{
                taskId: string;
                title: string;
                description: string;
            }>;
            remove: Action<{ taskId: string }>;
        };
        filter: {
            setText: Action<string>;
            setDateRange: Action<{ start?: string; end?: string }>;
            setStatus: Action<TaskStatus[]>;
            clear: Action;
        };
    };
    theme: {
        toggle: Action;
    };
    toast: {
        show: Action<{ message: string; type?: "success" | "error" | "info" }>;
    };
    navigation: {
        navigate: Action<{ to: string }>;
    };
}
