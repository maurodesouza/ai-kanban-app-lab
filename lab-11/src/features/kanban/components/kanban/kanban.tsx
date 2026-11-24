import { observer } from "mobx-react-lite";
import { Fragment, type PropsWithChildren, type ReactNode } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { actions } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";
import type { KanbanStore } from "../../store/store";
import type { Task } from "../../types";
import { KanbanProvider } from "../kanban-provider";
import { ColumnParts } from "./column";
import { TaskParts } from "./task";

function Container({ children }: PropsWithChildren) {
    return (
        <main className="palette-surface min-h-dvh bg-palette-base text-palette-contrast">
            {children}
        </main>
    );
}

function Header({ children }: PropsWithChildren) {
    return (
        <header className="border-b border-palette-line px-4 py-5 sm:px-8">
            {children}
        </header>
    );
}

function Title({ children }: PropsWithChildren) {
    return (
        <Text.Heading
            as="h1"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
            {children}
        </Text.Heading>
    );
}

function Content({ children }: PropsWithChildren) {
    return (
        <div className="flex items-start gap-4 overflow-x-auto px-4 py-5 sm:px-8">
            {children}
        </div>
    );
}

function GhostColumn({ children }: PropsWithChildren) {
    return (
        <div className="w-72 max-w-[calc(100vw-3rem)] shrink-0 sm:w-80">
            {children}
        </div>
    );
}

function AddColumnAction() {
    return (
        <Clickable.Button
            data-board-focus
            type="button"
            variant="outline"
            className="min-h-28 w-full rounded-2xl border-dashed"
            onClick={() => void actions.column.create()}
        >
            <span aria-hidden="true">+</span> Add column
        </Clickable.Button>
    );
}

const Status = observer(function Status({ children }: PropsWithChildren) {
    const ui = useKanban().$statusUI;
    if (!ui.ready)
        return (
            <p className="px-4 py-5" role="status">
                Loading board…
            </p>
        );
    return (
        <>
            {ui.storageMessage && (
                <p
                    className="px-4 pt-3 text-sm text-palette-accent/85"
                    role="status"
                >
                    {ui.storageMessage}
                </p>
            )}
            {children}
        </>
    );
});

type ColumnUI = KanbanStore["$columnsUI"][number];

const Columns = observer(function Columns({
    render,
}: {
    render: (column: ColumnUI) => ReactNode;
}) {
    return useKanban().$columnsUI.map((column) => (
        <Fragment key={column.id}>{render(column)}</Fragment>
    ));
});

const Tasks = observer(function Tasks({
    columnId,
    render,
}: {
    columnId: string;
    render: (task: Task) => ReactNode;
}) {
    const tasks = useKanban().$tasksByColumnUI.get(columnId) ?? [];
    return tasks.map((task) => (
        <Fragment key={task.id}>{render(task)}</Fragment>
    ));
});

export const Kanban = {
    Provider: KanbanProvider,
    Container,
    Header,
    Title,
    Content,
    Status,
    Columns,
    Column: ColumnParts,
    Tasks,
    Task: TaskParts,
    GhostColumn,
    AddColumnAction,
};
