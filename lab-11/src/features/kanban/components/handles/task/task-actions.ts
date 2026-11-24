import type { Action } from "#/lib/command/types";
import type { Direction, Priority, TaskFieldChange } from "../../../types";

type TaskIdentity = { taskId: string };

declare module "#/lib/command/global" {
    interface Actions {
        task: {
            openCreate: Action<{ columnId?: string }>;
            openEdit: Action<TaskIdentity>;
            changeField: Action<TaskFieldChange>;
            submit: Action;
            delete: Action<TaskIdentity>;
            setPriority: Action<TaskIdentity & { priority: Priority }>;
            move: Action<
                TaskIdentity & ({ columnId: string } | { direction: Direction })
            >;
            dragStart: Action<TaskIdentity>;
            drop: Action<{ columnId: string }>;
            dragEnd: Action<TaskIdentity>;
        };
    }
}
