import type { Action } from "#/lib/command/types";
import type { Filters } from "../../../types";

declare module "#/lib/command/global" {
    interface Actions {
        filter: {
            setSearch: Action<{ value: string }>;
            setDateFrom: Action<{ value: string }>;
            setDateTo: Action<{ value: string }>;
            setPriority: Action<{ value: Filters["priority"] }>;
            clear: Action;
        };
    }
}
