import { DragOverlay as DndDragOverlay } from "@dnd-kit/core";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { TaskUI } from "#/features/kanban/store/store";

type DragOverlayProps = {
    render: (task: TaskUI) => ReactNode;
};

/** Follows the pointer while a task is dragged; the route decides what it shows. */
export const DragOverlay = observer(({ render }: DragOverlayProps) => {
    const store = useKanban();
    const { task } = store.$dragOverlayUI;

    return <DndDragOverlay>{task ? render(task) : null}</DndDragOverlay>;
});
