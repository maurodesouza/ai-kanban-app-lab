import type { Action } from "#/lib/command";

declare module "#/lib/command/global" {
    interface Actions {
        theme: {
            toggle: Action;
        };
    }
}
