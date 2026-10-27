import {
    horizontalListSortingStrategy,
    SortableContext,
} from "@dnd-kit/sortable";
import { observer } from "mobx-react-lite";
import { Fragment, type ReactNode } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { ColumnUI } from "#/features/kanban/store/store";

type ColumnsProps = {
    render: (column: ColumnUI) => ReactNode;
};

export const Columns = observer(({ render }: ColumnsProps) => {
    const store = useKanban();
    const columns = store.$columnsUI;
    const { columnIds } = store.$dndUI;

    return (
        <SortableContext
            items={columnIds}
            strategy={horizontalListSortingStrategy}
        >
            {columns.map((column) => (
                <Fragment key={column.id}>{render(column)}</Fragment>
            ))}
        </SortableContext>
    );
});
