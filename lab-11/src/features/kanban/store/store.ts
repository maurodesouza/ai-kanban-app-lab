import { action, computed, observable } from "mobx";
import type { Board, Filters } from "../types";
import { snapshot } from "../utils/snapshot/snapshot";

export class KanbanStore {
    @observable accessor board = snapshot.initialBoard();
    @observable accessor filters = snapshot.initialFilters();
    @observable accessor hydrated = false;
    @observable accessor storageError = false;

    @action
    setBoard(value: Board) {
        this.board = value;
    }

    @action
    setFilters(value: Filters) {
        this.filters = value;
    }

    @action
    setHydrated(value: boolean) {
        this.hydrated = value;
    }

    @action
    setStorageError(value: boolean) {
        this.storageError = value;
    }

    @computed
    get $statusUI() {
        return {
            ready: this.hydrated,
            storageMessage: this.storageError
                ? "Board changes may not be saved in this browser."
                : "",
        };
    }
}
