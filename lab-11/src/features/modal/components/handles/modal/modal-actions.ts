import type { Renderable } from "#/components/helpers/flexible-render/flexible-render";
import type { Action } from "#/lib/command/types";

declare module "#/lib/command/global" {
    interface Actions {
        modal: {
            open: Action<Renderable>;
            close: Action;
        };
    }
}
