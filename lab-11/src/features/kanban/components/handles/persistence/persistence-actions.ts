import type { Action } from "#/lib/command/types";

declare module "#/lib/command/global" {
    interface Actions {
        persistence: {
            hydrate: Action;
        };
    }
}
