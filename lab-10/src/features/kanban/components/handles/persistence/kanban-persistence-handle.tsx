import { reaction } from "mobx";
import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { board } from "#/features/kanban/utils/board/board";
import { random } from "#/utils/random/random";
import { storage } from "#/utils/storage/storage";

export function KanbanPersistenceHandle() {
    const store = useKanban();

    function hydrateFromStorage() {
        const stored = board.snapshot.parse(storage.read(board.storageKey));

        store.hydrate(stored ?? board.seed(random.id));
        store.setIsHydrated(true);
    }

    function persist() {
        storage.write(board.storageKey, store.$snapshot);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        hydrateFromStorage();
        persist();

        const dispose = reaction(() => store.$snapshot, persist);

        return () => {
            dispose();
            store.setIsHydrated(false);
        };
    }, []);

    return null;
}
