import type { ReactNode } from "react";
import { KanbanContext } from "./kanban-context";
import { KanbanHandle } from "#/features/kanban/components/handles/kanban/kanban-handle";

interface KanbanProviderProps {
    boardId: string;
    children: ReactNode;
}

/**
 * Provides the board instance context to all Kanban compound components
 * and mounts the scoped KanbanHandle that registers kanban.* commands
 * for this board instance.
 */
export function KanbanProvider({ boardId, children }: KanbanProviderProps) {
    return (
        <KanbanContext.Provider value={{ boardId }}>
            <KanbanHandle boardId={boardId} />
            {children}
        </KanbanContext.Provider>
    );
}
