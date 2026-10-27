import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalHandle } from "#/components/handles/modal/modal-handle";
import { kanbanStore } from "#/features/kanban/store/store";
import type { Board } from "#/features/kanban/types";
import { BOARD_STORAGE_KEY } from "#/features/kanban/utils/board";
import { Route } from "#/routes/index";
import { modalStore } from "#/store/modal/store";

const Home = Route.options.component as () => React.ReactNode;

/** Renders the index route (the real composition) with the shared Handles. */
export function renderApp(board?: Board) {
    if (board)
        localStorage.setItem(
            BOARD_STORAGE_KEY,
            JSON.stringify({ version: 1, board }),
        );

    const user = userEvent.setup();
    const result = render(
        <>
            <ModalHandle />
            <Home />
        </>,
    );

    return { user, ...result };
}

export function resetStores() {
    kanbanStore.setBoard({ columnOrder: [], columns: {}, tasks: {} });
    kanbanStore.setIsHydrated(false);
    kanbanStore.clearColumnEdit();
    kanbanStore.setPendingDeleteColumnId(null);
    modalStore.setCurrent(null);
}
