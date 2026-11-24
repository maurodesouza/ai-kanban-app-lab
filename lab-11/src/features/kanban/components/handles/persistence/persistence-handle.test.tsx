// @vitest-environment jsdom

import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actions } from "#/lib/command";
import { themeStore } from "#/store/theme/store";
import { useKanban } from "../../../hooks/use-kanban";
import type { KanbanStore } from "../../../store/store";
import type { Snapshot } from "../../../types";
import { snapshot } from "../../../utils/snapshot/snapshot";
import { KanbanProvider } from "../../kanban-provider";
import { PersistenceHandle } from "./persistence-handle";

let root: Root;
let store: KanbanStore;

function ReadStore() {
    store = useKanban();
    return null;
}

beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    window.localStorage.clear();
    themeStore.setPreference(null);
    root = createRoot(document.createElement("div"));
});

afterEach(async () => {
    await act(() => root.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

async function mount() {
    await act(() =>
        root.render(
            <StrictMode>
                <KanbanProvider>
                    <PersistenceHandle />
                    <ReadStore />
                </KanbanProvider>
            </StrictMode>,
        ),
    );
}

describe("board persistence", () => {
    it("hydrates a saved empty board once through Strict Mode and writes only after a change", async () => {
        const saved = {
            version: 1,
            board: { columns: [], tasks: [] },
            filters: { ...snapshot.initialFilters(), search: "saved" },
            theme: "dark",
        } satisfies Snapshot;
        window.localStorage.setItem(snapshot.key, JSON.stringify(saved));
        const read = vi.spyOn(Storage.prototype, "getItem");
        const write = vi.spyOn(Storage.prototype, "setItem");

        await mount();
        await actions.persistence.hydrate();

        expect(store.board).toEqual(saved.board);
        expect(store.filters).toEqual(saved.filters);
        expect(themeStore.preference).toBe("dark");
        expect(store.hydrated).toBe(true);
        expect(read).toHaveBeenCalledTimes(1);
        expect(write).not.toHaveBeenCalled();

        store.setFilters(snapshot.initialFilters());
        expect(write).toHaveBeenCalledTimes(1);
        expect(
            snapshot.parse(window.localStorage.getItem(snapshot.key) ?? ""),
        ).toEqual({
            ...saved,
            filters: snapshot.initialFilters(),
        });
    });

    it("preserves malformed storage on startup and recovers on the next valid write", async () => {
        window.localStorage.setItem(snapshot.key, "{broken");
        await mount();

        expect(store.board).toEqual(snapshot.initialBoard());
        expect(store.$statusUI.storageMessage).toContain("may not be saved");
        expect(window.localStorage.getItem(snapshot.key)).toBe("{broken");

        store.setFilters({ ...snapshot.initialFilters(), search: "new" });
        expect(store.$statusUI.storageMessage).toBe("");
        expect(
            snapshot.parse(window.localStorage.getItem(snapshot.key) ?? "")
                ?.filters.search,
        ).toBe("new");
    });

    it("keeps in-memory changes when storage is unavailable", async () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("blocked");
        });

        await mount();
        store.setBoard({ columns: [], tasks: [] });

        expect(store.board.columns).toEqual([]);
        expect(store.$statusUI.ready).toBe(true);
        expect(store.$statusUI.storageMessage).toContain("may not be saved");
    });
});
