import type { BoardStoreOptions } from "./board";
import { BoardStore } from "./board";
import { DialogStore } from "./dialog";
import { FilterStore } from "./filter";
import { ThemeStore } from "./theme";

export type RootStoreOptions = BoardStoreOptions;

export class RootStore {
    readonly board: BoardStore;
    readonly filter: FilterStore;
    readonly dialog: DialogStore;
    readonly theme: ThemeStore;

    constructor(options: RootStoreOptions = {}) {
        this.board = new BoardStore(options);
        this.filter = new FilterStore(this.board);
        this.dialog = new DialogStore();
        this.theme = new ThemeStore();
    }

    reset(): void {
        this.board.reset();
        this.filter.clear();
        this.dialog.close();
        this.theme.reset();
    }
}

export function createRootStore(options: RootStoreOptions = {}): RootStore {
    return new RootStore(options);
}

let applicationStore: RootStore | undefined;

export function getRootStore(): RootStore {
    applicationStore ??= createRootStore();
    return applicationStore;
}

export function resetRootStore(options: RootStoreOptions = {}): RootStore {
    applicationStore = createRootStore(options);
    return applicationStore;
}
