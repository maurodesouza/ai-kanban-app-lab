import type { TaskInput } from "#/features/kanban/types";
import type { Action } from "#/lib/command";

export type TaskFormOpenPayload =
    | { mode: "create"; columnId?: string }
    | { mode: "edit"; taskId: string };

export type TaskFormChangePayload = {
    [TField in keyof TaskInput]: { field: TField; value: TaskInput[TField] };
}[keyof TaskInput];

declare module "#/lib/command/global" {
    interface Actions {
        taskForm: {
            open: Action<TaskFormOpenPayload>;
            change: Action<TaskFormChangePayload>;
            submit: Action;
            cancel: Action;
        };
    }
}
