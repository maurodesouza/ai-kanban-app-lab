import { observer } from "mobx-react-lite";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { actions } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";
import type { Direction } from "../../types";

type ColumnProps = { columnId: string };

function Container({
    children,
    ...props
}: ComponentPropsWithoutRef<"section">) {
    return (
        <section
            className="palette-surface flex w-72 max-w-[calc(100vw-3rem)] shrink-0 flex-col rounded-2xl border border-palette-line bg-palette-soft text-palette-contrast sm:w-80"
            {...props}
        >
            {children}
        </section>
    );
}

function Header({ children }: PropsWithChildren) {
    return (
        <header className="flex flex-wrap items-center gap-1 px-3 pt-3">
            {children}
        </header>
    );
}

function Title({ children, id }: PropsWithChildren<{ id: string }>) {
    return (
        <Text.Heading
            as="h2"
            id={id}
            className="min-w-0 flex-1 break-words text-base font-semibold"
        >
            {children}
        </Text.Heading>
    );
}

function Content({ children }: PropsWithChildren<ColumnProps>) {
    return (
        <div className="flex min-h-44 flex-1 flex-col gap-3 p-3">
            {children}
        </div>
    );
}

const Count = observer(function Count({ columnId }: ColumnProps) {
    const ui = useKanban().$columnUI.get(columnId);
    if (!ui) return null;
    return (
        <span className="rounded-full border border-palette-line bg-palette-base px-2 text-xs tabular-nums">
            {ui.count}
        </span>
    );
});

const Empty = observer(function Empty({ columnId }: ColumnProps) {
    const ui = useKanban().$columnUI.get(columnId);
    if (!ui?.emptyMessage) return null;
    return (
        <p className="rounded-lg border border-dashed border-palette-line px-3 py-5 text-center text-sm text-palette-accent/85">
            {ui.emptyMessage}
        </p>
    );
});

const RenameAction = observer(function RenameAction({ columnId }: ColumnProps) {
    const ui = useKanban().$columnUI.get(columnId);
    if (!ui) return null;
    return (
        <Clickable.Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={ui.renameLabel}
            title={ui.renameLabel}
            onClick={() => void actions.column.openRename({ columnId })}
        >
            <span aria-hidden="true">✎</span>
        </Clickable.Button>
    );
});

const MoveAction = observer(function MoveAction({
    columnId,
    direction,
}: ColumnProps & { direction: Direction }) {
    const ui = useKanban().$columnUI.get(columnId)?.[direction];
    if (!ui) return null;
    return (
        <Clickable.Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={ui.label}
            title={ui.label}
            disabled={ui.disabled}
            onClick={() => void actions.column.move({ columnId, direction })}
        >
            <span aria-hidden="true">{ui.icon}</span>
        </Clickable.Button>
    );
});

const DeleteAction = observer(function DeleteAction({ columnId }: ColumnProps) {
    const ui = useKanban().$columnUI.get(columnId);
    if (!ui) return null;
    return (
        <Clickable.Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={ui.deleteLabel}
            title={ui.deleteLabel}
            onClick={() => void actions.column.requestDelete({ columnId })}
        >
            <span aria-hidden="true">×</span>
        </Clickable.Button>
    );
});

export const ColumnParts = {
    Container,
    Header,
    Title,
    Content,
    Count,
    Empty,
    RenameAction,
    MoveAction,
    DeleteAction,
};
