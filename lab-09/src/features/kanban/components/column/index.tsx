import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    Trash2Icon,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { Badge } from "#/components/atoms/badge";
import { Clickable } from "#/components/atoms/clickable";
import { Input } from "#/components/atoms/fields";
import { Text } from "#/components/atoms/text";
import { Field } from "#/components/ui/field";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type PartProps = { children?: ReactNode; className?: string };
type ColumnPartProps = { columnId: string };

export function Container({
    children,
    className,
}: PartProps & ColumnPartProps) {
    return (
        <section
            className={cn(
                "palette-raised flex max-h-full w-72 shrink-0 flex-col rounded-lg border border-palette-line bg-palette-base",
                className,
            )}
        >
            {children}
        </section>
    );
}

export function Header({ children, className }: PartProps) {
    return (
        <header
            className={cn(
                "flex items-center gap-2 border-b border-palette-line px-3 py-2",
                className,
            )}
        >
            {children}
        </header>
    );
}

export const Title = observer(function Title({ columnId }: ColumnPartProps) {
    const store = useKanban();
    const { title, isEditing, draft, editLabel, inputLabel } =
        store.$columnsUI[columnId];

    if (isEditing)
        return (
            <Field.Root className="palette-surface-blue min-w-0 flex-1">
                <Field.Row>
                    <Field.Body>
                        <Input
                            autoFocus
                            aria-label={inputLabel}
                            value={draft}
                            onChange={(event) =>
                                actions.kanban.column.editChange({
                                    value: event.target.value,
                                })
                            }
                            onBlur={() => actions.kanban.column.editCommit()}
                            onKeyDown={(event) => {
                                if (event.key === "Enter")
                                    actions.kanban.column.editCommit();
                                if (event.key === "Escape")
                                    actions.kanban.column.editCancel();
                            }}
                        />
                    </Field.Body>
                </Field.Row>
            </Field.Root>
        );

    return (
        <Clickable.Button
            variant="ghost"
            size="sm"
            title={editLabel}
            aria-label={editLabel}
            className="min-w-0 flex-1 justify-start px-2 font-semibold text-palette-contrast"
            onClick={() => actions.kanban.column.editStart({ columnId })}
        >
            <span className="truncate">{title}</span>
        </Clickable.Button>
    );
});

export const Count = observer(function Count({ columnId }: ColumnPartProps) {
    const store = useKanban();
    const { count, countLabel } = store.$columnsUI[columnId];

    return (
        <Badge aria-label={countLabel} title={countLabel}>
            {count}
        </Badge>
    );
});

export function Actions({ children, className }: PartProps) {
    return (
        <div className={cn("flex shrink-0 items-center", className)}>
            {children}
        </div>
    );
}

export const MoveLeftAction = observer(function MoveLeftAction({
    columnId,
}: ColumnPartProps) {
    const store = useKanban();
    const { canMoveLeft, moveLeftLabel } = store.$columnsUI[columnId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            disabled={!canMoveLeft}
            aria-label={moveLeftLabel}
            title={moveLeftLabel}
            onClick={() =>
                actions.kanban.column.move({ columnId, direction: "left" })
            }
        >
            <ChevronLeftIcon />
        </Clickable.Button>
    );
});

export const MoveRightAction = observer(function MoveRightAction({
    columnId,
}: ColumnPartProps) {
    const store = useKanban();
    const { canMoveRight, moveRightLabel } = store.$columnsUI[columnId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            disabled={!canMoveRight}
            aria-label={moveRightLabel}
            title={moveRightLabel}
            onClick={() =>
                actions.kanban.column.move({ columnId, direction: "right" })
            }
        >
            <ChevronRightIcon />
        </Clickable.Button>
    );
});

export const DeleteAction = observer(function DeleteAction({
    columnId,
}: ColumnPartProps) {
    const store = useKanban();
    const { deleteLabel } = store.$columnsUI[columnId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            className="palette-danger"
            aria-label={deleteLabel}
            title={deleteLabel}
            onClick={() => actions.kanban.column.deleteRequest({ columnId })}
        >
            <Trash2Icon />
        </Clickable.Button>
    );
});

export const AddTaskAction = observer(function AddTaskAction({
    columnId,
}: ColumnPartProps) {
    const store = useKanban();
    const { addTaskLabel } = store.$columnsUI[columnId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            aria-label={addTaskLabel}
            title={addTaskLabel}
            onClick={() => actions.taskForm.open({ mode: "create", columnId })}
        >
            <PlusIcon />
        </Clickable.Button>
    );
});

export const Content = observer(function Content({
    columnId,
    children,
    className,
}: PartProps & ColumnPartProps) {
    const store = useKanban();
    const { isDropTarget, contentLabel } = store.$columnsUI[columnId];

    return (
        <section
            aria-label={contentLabel}
            data-drop-target={isDropTarget || undefined}
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => actions.kanban.task.dragEnter({ columnId })}
            onDrop={(event) => {
                event.preventDefault();
                actions.kanban.task.drop({ columnId });
            }}
            className={cn(
                "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-b-lg p-3 transition-colors data-drop-target:bg-palette-soft",
                className,
            )}
        >
            {children}
        </section>
    );
});

export const EmptyState = observer(function EmptyState({
    columnId,
}: ColumnPartProps) {
    const store = useKanban();
    const { isEmpty, emptyLabel } = store.$columnsUI[columnId];

    if (!isEmpty) return null;

    return (
        <Text.Paragraph className="rounded-md border border-dashed border-palette-line p-4 text-center text-xs text-palette-accent/85">
            {emptyLabel}
        </Text.Paragraph>
    );
});
