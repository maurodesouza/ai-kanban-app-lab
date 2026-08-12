import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { FlexibleRender } from "#/components/shared/helpers/flexible-render";
import { kanbanStore } from "#/stores";
import type { ColumnWithTasks } from "#/types/domain";

function Container({ children }: Readonly<{ children: ReactNode }>) {
    return <div className="flex h-full flex-col gap-4">{children}</div>;
}

function Header({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            {children}
        </div>
    );
}

function Title({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
    );
}

function Content({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
            {children}
        </div>
    );
}

interface ColumnsProps {
    render: (column: ColumnWithTasks, index: number) => ReactNode;
    fallback?: ReactNode;
}

const Columns = observer(function Columns({ render, fallback }: ColumnsProps) {
    return (
        <FlexibleRender
            items={kanbanStore.columnsWithTasks}
            render={render}
            fallback={fallback}
        />
    );
});

function Filter({ children }: Readonly<{ children?: ReactNode }>) {
    return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function AddTaskAction() {
    return null;
}

export const Kanban = {
    Container,
    Header,
    Title,
    Content,
    Columns,
    Filter,
    AddTaskAction,
};
