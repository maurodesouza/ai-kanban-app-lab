import { reaction, runInAction } from "mobx";
import { useEffect } from "react";
import { actions, command } from "#/lib/command";
import { themeStore } from "#/store/theme/store";
import { useKanban } from "../../../hooks/use-kanban";
import type { Snapshot } from "../../../types";
import { snapshot } from "../../../utils/snapshot/snapshot";

export function PersistenceHandle() {
    const store = useKanban();

    async function hydrate() {
        if (store.hydrated) return;
        try {
            const raw = window.localStorage.getItem(snapshot.key);
            const saved = raw === null ? null : snapshot.parse(raw);
            if (saved) {
                runInAction(() => {
                    store.setBoard(saved.board);
                    store.setFilters(saved.filters);
                    themeStore.setPreference(saved.theme);
                });
            } else {
                themeStore.setPreference(null);
                store.setStorageError(raw !== null);
            }
        } catch {
            store.setStorageError(true);
        } finally {
            store.setHydrated(true);
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: hydrate closes over the stable board store
    useEffect(() => {
        const unregister = command.handle("persistence.hydrate", hydrate);
        void actions.persistence.hydrate();
        const stopSaving = reaction(
            () =>
                JSON.stringify({
                    version: 1,
                    board: store.board,
                    filters: store.filters,
                    theme: themeStore.preference,
                } satisfies Snapshot),
            (serialized) => {
                if (!store.hydrated) return;
                try {
                    window.localStorage.setItem(snapshot.key, serialized);
                    store.setStorageError(false);
                } catch {
                    store.setStorageError(true);
                }
            },
        );
        return () => {
            unregister();
            stopSaving();
        };
    }, [store]);

    return null;
}
