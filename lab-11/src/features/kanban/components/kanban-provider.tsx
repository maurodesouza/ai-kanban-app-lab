import { type PropsWithChildren, useRef } from "react";
import { KanbanContext } from "../hooks/use-kanban";
import { KanbanStore } from "../store/store";

export function KanbanProvider({ children }: PropsWithChildren) {
    const store = useRef<KanbanStore | null>(null);
    store.current ??= new KanbanStore();
    return <KanbanContext value={store.current}>{children}</KanbanContext>;
}
