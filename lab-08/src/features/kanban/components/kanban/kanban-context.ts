import { createContext, useContext } from "react";

export interface KanbanContextValue {
    boardId: string;
}

export const KanbanContext = createContext<KanbanContextValue | null>(null);

export function useKanbanContext(): KanbanContextValue {
    const ctx = useContext(KanbanContext);
    if (!ctx) {
        throw new Error(
            "Kanban compound components must be rendered inside <KanbanProvider>",
        );
    }
    return ctx;
}
