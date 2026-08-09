import { toast as sonner } from "sonner";

import { command } from "#/lib/command";
import type { ActionPayload } from "#/lib/command/types";

type ToastPayload = ActionPayload<"toast.show">;

command.handle("toast.show", async (payload: ToastPayload) => {
    if (payload.type === "success") {
        sonner.success(payload.message);
    } else if (payload.type === "error") {
        sonner.error(payload.message);
    } else {
        sonner(payload.message);
    }
});
