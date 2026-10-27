import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilIcon,
    Trash2Icon,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { Fragment, type ReactNode } from "react";
import { badge } from "#/components/atoms/badge";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { DropdownMenu } from "#/components/ui/dropdown-menu";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { Priority as PriorityValue } from "#/features/kanban/types";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type PartProps = { children?: ReactNode; className?: string };
type TaskPartProps = { taskId: string };

export type TaskView = { id: string };

export const Tasks = observer(function Tasks({
    columnId,
    render,
}: {
    columnId: string;
    render: (task: TaskView) => ReactNode;
}) {
    const store = useKanban();

    return store.$columnTaskIds[columnId].map((id) => (
        <Fragment key={id}>{render({ id })}</Fragment>
    ));
});

export const Container = observer(function Container({
    taskId,
    children,
    className,
}: PartProps & TaskPartProps) {
    const store = useKanban();
    const { isDragging } = store.$tasksUI[taskId];

    return (
        <article
            draggable
            data-dragging={isDragging || undefined}
            onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", taskId);
                actions.kanban.task.dragStart({ taskId });
            }}
            onDragEnd={() => actions.kanban.task.dragEnd()}
            className={cn(
                "palette-surface flex cursor-grab flex-col gap-2 rounded-md border border-palette-line bg-palette-base p-3 shadow-sm transition-opacity active:cursor-grabbing data-dragging:opacity-50",
                className,
            )}
        >
            {children}
        </article>
    );
});

export function Header({ children, className }: PartProps) {
    return (
        <header className={cn("flex items-start gap-2", className)}>
            {children}
        </header>
    );
}

export const Title = observer(function Title({ taskId }: TaskPartProps) {
    const store = useKanban();
    const { title } = store.$tasksUI[taskId];

    return (
        <Text.Strong className="min-w-0 flex-1 break-words">
            {title}
        </Text.Strong>
    );
});

export const Description = observer(function Description({
    taskId,
}: TaskPartProps) {
    const store = useKanban();
    const { description, hasDescription } = store.$tasksUI[taskId];

    if (!hasDescription) return null;

    return (
        <Text.Paragraph className="line-clamp-3 whitespace-pre-line break-words text-xs text-palette-accent/85">
            {description}
        </Text.Paragraph>
    );
});

export const Priority = observer(function Priority({ taskId }: TaskPartProps) {
    const store = useKanban();
    const {
        priority,
        priorityLabel,
        priorityPalette,
        priorityMenuLabel,
        isPriorityMenuOpen,
    } = store.$tasksUI[taskId];

    return (
        <DropdownMenu.Root
            open={isPriorityMenuOpen}
            onOpenChange={(open) =>
                actions.kanban.task.priorityMenuChange({ taskId, open })
            }
        >
            <DropdownMenu.Trigger
                aria-label={priorityMenuLabel}
                title={priorityMenuLabel}
                className={cn(
                    badge({ variant: "solid" }),
                    priorityPalette,
                    "shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-palette-ring",
                )}
            >
                {priorityLabel}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Group>
                    <DropdownMenu.Label>Priority</DropdownMenu.Label>
                    <DropdownMenu.RadioGroup
                        value={priority}
                        onValueChange={(value) =>
                            actions.kanban.task.setPriority({
                                taskId,
                                priority: value as PriorityValue,
                            })
                        }
                    >
                        {store.$priorityOptions.map((option) => (
                            <DropdownMenu.RadioItem
                                key={option.value}
                                value={option.value}
                                closeOnClick
                            >
                                {option.label}
                            </DropdownMenu.RadioItem>
                        ))}
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
});

export const Dates = observer(function Dates({ taskId }: TaskPartProps) {
    const store = useKanban();
    const { datesLabel, datesTitle } = store.$tasksUI[taskId];

    return (
        <span
            title={datesTitle}
            className="inline-flex items-center gap-1 text-xs text-palette-accent/85"
        >
            <CalendarIcon className="size-3" />
            {datesLabel}
        </span>
    );
});

export function Footer({ children, className }: PartProps) {
    return (
        <footer
            className={cn("flex items-center justify-between gap-1", className)}
        >
            {children}
        </footer>
    );
}

export function Actions({ children, className }: PartProps) {
    return <div className={cn("flex items-center", className)}>{children}</div>;
}

export const MoveLeftAction = observer(function MoveLeftAction({
    taskId,
}: TaskPartProps) {
    const store = useKanban();
    const { canMoveLeft, moveLeftLabel } = store.$tasksUI[taskId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            disabled={!canMoveLeft}
            aria-label={moveLeftLabel}
            title={moveLeftLabel}
            onClick={() =>
                actions.kanban.task.moveAdjacent({ taskId, direction: "left" })
            }
        >
            <ChevronLeftIcon />
        </Clickable.Button>
    );
});

export const MoveRightAction = observer(function MoveRightAction({
    taskId,
}: TaskPartProps) {
    const store = useKanban();
    const { canMoveRight, moveRightLabel } = store.$tasksUI[taskId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            disabled={!canMoveRight}
            aria-label={moveRightLabel}
            title={moveRightLabel}
            onClick={() =>
                actions.kanban.task.moveAdjacent({ taskId, direction: "right" })
            }
        >
            <ChevronRightIcon />
        </Clickable.Button>
    );
});

export const EditAction = observer(function EditAction({
    taskId,
}: TaskPartProps) {
    const store = useKanban();
    const { editLabel } = store.$tasksUI[taskId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            aria-label={editLabel}
            title={editLabel}
            onClick={() => actions.taskForm.open({ mode: "edit", taskId })}
        >
            <PencilIcon />
        </Clickable.Button>
    );
});

export const DeleteAction = observer(function DeleteAction({
    taskId,
}: TaskPartProps) {
    const store = useKanban();
    const { deleteLabel } = store.$tasksUI[taskId];

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            className="palette-danger"
            aria-label={deleteLabel}
            title={deleteLabel}
            onClick={() => actions.kanban.task.delete({ taskId })}
        >
            <Trash2Icon />
        </Clickable.Button>
    );
});
