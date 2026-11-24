import { useEffect } from "react";
import { actions, command } from "#/lib/command";
import { useKanban } from "../../../hooks/use-kanban";
import type { Direction } from "../../../types";
import {
    ColumnDeleteContent,
    ColumnRenameContent,
} from "../../dialogs/column-dialogs";

export function ColumnHandle() {
    const store = useKanban();

    async function create() {
        const { board } = store;
        store.setBoard({
            ...board,
            columns: [
                ...board.columns,
                { id: crypto.randomUUID(), title: "New column" },
            ],
        });
    }

    async function openRename({ columnId }: { columnId: string }) {
        const column = store.board.columns.find((item) => item.id === columnId);
        if (!column) return;
        store.setColumnRename({ columnId, title: column.title, error: "" });
        await actions.modal.open(ColumnRenameContent);
    }

    async function changeTitle({ title }: { title: string }) {
        if (store.columnRename)
            store.setColumnRename({ ...store.columnRename, title, error: "" });
    }

    async function rename() {
        const { columnRename, board } = store;
        if (!columnRename) return;
        const title = columnRename.title.trim();
        if (!title) {
            store.setColumnRename({
                ...columnRename,
                error: "Enter a column name.",
            });
            return;
        }
        store.setBoard({
            ...board,
            columns: board.columns.map((column) =>
                column.id === columnRename.columnId
                    ? { ...column, title }
                    : column,
            ),
        });
        store.setColumnRename(null);
        await actions.modal.close();
    }

    async function move({
        columnId,
        direction,
    }: {
        columnId: string;
        direction: Direction;
    }) {
        const { board } = store;
        const index = board.columns.findIndex(
            (column) => column.id === columnId,
        );
        if (index < 0) return;
        const adjacent = index + (direction === "previous" ? -1 : 1);
        if (adjacent < 0 || adjacent >= board.columns.length) return;
        const columns = [...board.columns];
        [columns[index], columns[adjacent]] = [
            columns[adjacent],
            columns[index],
        ];
        store.setBoard({ ...board, columns });
    }

    async function requestDelete({ columnId }: { columnId: string }) {
        if (!store.$columnUI.has(columnId)) return;
        await actions.modal.open(<ColumnDeleteContent columnId={columnId} />);
    }

    async function remove({ columnId }: { columnId: string }) {
        const { board } = store;
        if (!board.columns.some((column) => column.id === columnId)) return;
        store.setBoard({
            columns: board.columns.filter((column) => column.id !== columnId),
            tasks: board.tasks.filter((task) => task.columnId !== columnId),
        });
        await actions.modal.close();
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable board store
    useEffect(() => {
        const dispose = [
            command.handle("column.create", create),
            command.handle("column.openRename", openRename),
            command.handle("column.changeTitle", changeTitle),
            command.handle("column.rename", rename),
            command.handle("column.move", move),
            command.handle("column.requestDelete", requestDelete),
            command.handle("column.delete", remove),
        ];
        return () => {
            for (const unregister of dispose) unregister();
        };
    }, [store]);

    return null;
}
