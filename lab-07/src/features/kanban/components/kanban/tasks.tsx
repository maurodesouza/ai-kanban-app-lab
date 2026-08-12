import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { FlexibleRender } from "#/components/shared/helpers/flexible-render";
import { kanbanStore } from "#/stores";
import type { Task } from "#/types/domain";

interface TasksProps {
    columnId: string;
    render: (task: Task, index: number) => ReactNode;
    fallback?: ReactNode;
}

export const Tasks = observer(function Tasks({
    columnId,
    render,
    fallback,
}: TasksProps) {
    const column = kanbanStore.columnsWithTasks.find((c) => c.id === columnId);
    const tasks = column?.tasks ?? [];

    return <FlexibleRender items={tasks} render={render} fallback={fallback} />;
});
