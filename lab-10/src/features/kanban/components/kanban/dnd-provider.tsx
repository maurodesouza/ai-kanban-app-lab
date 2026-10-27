import {
    type CollisionDetection,
    closestCenter,
    closestCorners,
    DndContext,
    type DragEndEvent,
    type DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import type {
    DragItem,
    DragItemType,
} from "#/features/kanban/components/handles/dnd/dnd-actions";
import { actions } from "#/lib/command";

type DndData = { current?: { type?: DragItemType } };

function toDragItem(
    entry: { id: string | number; data: DndData } | null,
): DragItem | null {
    const type = entry?.data.current?.type;

    if (!entry || !type) return null;

    return { id: String(entry.id), type };
}

/**
 * Columns collide only with columns. Tasks prefer the task under the pointer,
 * then the column under the pointer, so empty columns are valid drop targets.
 */
const collisionDetection: CollisionDetection = (args) => {
    const typeOf = (id: string | number) =>
        args.droppableContainers.find((container) => container.id === id)?.data
            .current?.type;

    if (args.active.data.current?.type === "column") {
        return closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
                (container) => container.data.current?.type === "column",
            ),
        });
    }

    const within = pointerWithin(args);
    const tasks = within.filter((collision) => typeOf(collision.id) === "task");

    if (tasks.length > 0) return tasks;
    if (within.length > 0) return within;

    return closestCorners(args);
};

function handleDragStart(event: DragStartEvent) {
    const active = toDragItem(event.active);

    if (active) actions.kanban.dnd.start(active);
}

function handleDragEnd(event: DragEndEvent) {
    const active = toDragItem(event.active);

    if (!active) return;

    actions.kanban.dnd.end({ active, over: toDragItem(event.over) });
}

export function DndProvider({ children }: { children: ReactNode }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <DndContext
            id="kanban-dnd"
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => actions.kanban.dnd.cancel()}
        >
            {children}
        </DndContext>
    );
}
