import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";

export function DraggableTask({
    taskId,
    children,
}: {
    taskId: string;
    children: ReactNode;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: taskId,
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={
                isDragging ? "opacity-30" : "cursor-grab active:cursor-grabbing"
            }
        >
            {children}
        </div>
    );
}
