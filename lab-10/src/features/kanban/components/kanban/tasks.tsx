import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { observer } from "mobx-react-lite";
import { Fragment, type ReactNode } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { ColumnUI, TaskUI } from "#/features/kanban/store/store";

type TasksProps = {
    column: ColumnUI;
    render: (task: TaskUI) => ReactNode;
};

export const Tasks = observer(({ column, render }: TasksProps) => {
    const store = useKanban();
    const { taskIdsByColumn } = store.$dndUI;

    return (
        <SortableContext
            items={taskIdsByColumn[column.id] ?? []}
            strategy={verticalListSortingStrategy}
        >
            {column.tasks.map((task) => (
                <Fragment key={task.id}>{render(task)}</Fragment>
            ))}
        </SortableContext>
    );
});
