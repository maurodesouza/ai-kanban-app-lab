import type { Action } from "#/lib/command/types";
import type { Theme } from "#/store/theme/store";

declare module "#/lib/command/global" {
    interface Actions {
        theme: {
            toggle: Action;
            set: Action<Theme>;
        };
    }
}
