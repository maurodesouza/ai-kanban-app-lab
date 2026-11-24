import { createContext, useContext } from "react";
import type { KanbanStore } from "../store/store";

export const KanbanContext = createContext<KanbanStore | null>(null);

export function useKanban() {
    const store = useContext(KanbanContext);
    if (!store) throw new Error("Kanban parts require Kanban.Provider.");
    return store;
}
