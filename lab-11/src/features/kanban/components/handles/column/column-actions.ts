import type { Action } from "#/lib/command/types";
import type { Direction } from "../../../types";

declare module "#/lib/command/global" {
    interface Actions {
        column: {
            create: Action;
            openRename: Action<{ columnId: string }>;
            changeTitle: Action<{ title: string }>;
            rename: Action;
            move: Action<{ columnId: string; direction: Direction }>;
            requestDelete: Action<{ columnId: string }>;
            delete: Action<{ columnId: string }>;
        };
    }
}
