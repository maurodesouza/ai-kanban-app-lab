import type { ThemePreference } from "#/features/kanban/types";
import type { Action } from "#/lib/command/types";

declare module "#/lib/command/global" {
    interface Actions {
        theme: {
            toggle: Action;
            systemChanged: Action<{ value: ThemePreference }>;
        };
    }
}
