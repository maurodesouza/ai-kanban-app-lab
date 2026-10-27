import type { Action } from "#/lib/command";
import type { ModalType } from "#/store/modal/store";

declare module "#/lib/command/global" {
    interface Actions {
        modal: {
            open: Action<ModalType>;
            close: Action;
        };
    }
}
