import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { Select } from "#/components/ui/select";
import { actions } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";
import { type Direction, taskDragMime } from "../../types";

type TaskProps = { taskId: string };

function Container({ children }: PropsWithChildren<TaskProps>) {
    return (
        <article className="palette-raised rounded-lg border border-palette-line bg-palette-base p-3 text-palette-contrast shadow-xs">
            {children}
        </article>
    );
}

function Header({ children }: PropsWithChildren) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-2">
            {children}
        </header>
    );
}

function Title({ children }: PropsWithChildren) {
    return (
        <Text.Heading
            as="h3"
            className="min-w-0 flex-1 break-words text-sm font-semibold"
        >
            {children}
        </Text.Heading>
    );
}

function Content({ children }: PropsWithChildren) {
    return <div className="mt-2 space-y-2 break-words">{children}</div>;
}

function Description({ children }: PropsWithChildren) {
    return (
        <Text.Paragraph className="whitespace-pre-wrap text-sm text-palette-accent/85 empty:hidden">
            {children}
        </Text.Paragraph>
    );
}

function DateRange({ children }: PropsWithChildren) {
    return (
        <p className="text-xs tabular-nums text-palette-accent/85">
            {children}
        </p>
    );
}

function Footer({ children }: PropsWithChildren) {
    return (
        <footer className="mt-3 flex flex-wrap items-center gap-1 border-t border-palette-line pt-2">
            {children}
        </footer>
    );
}

const PriorityControl = observer(function PriorityControl({
    taskId,
}: TaskProps) {
    const ui = useKanban().$taskUI.get(taskId);
    if (!ui) return null;
    return (
        <Select.Root
            value={ui.priority}
            items={ui.priorityOptions}
            onValueChange={(value) => {
                if (value !== null)
                    void actions.task.setPriority({ taskId, priority: value });
            }}
        >
            <Select.Trigger
                aria-label={ui.priorityLabel}
                className={ui.priorityPalette}
            >
                <Select.Value />
            </Select.Trigger>
            <Select.Content>
                {ui.priorityOptions.map(({ value, label }) => (
                    <Select.Item key={value} value={value}>
                        {label}
                    </Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    );
});

const DragHandle = observer(function DragHandle({ taskId }: TaskProps) {
    const ui = useKanban().$taskUI.get(taskId);
    if (!ui) return null;
    return (
        <span
            role="img"
            aria-label={ui.dragLabel}
            title={ui.dragLabel}
            draggable
            className="cursor-grab select-none rounded px-1.5 text-lg leading-none text-palette-accent/85 active:cursor-grabbing"
            onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData(taskDragMime, "move");
                void actions.task.dragStart({ taskId });
            }}
            onDragEnd={() => void actions.task.dragEnd({ taskId })}
        >
            ⠿
        </span>
    );
});

const EditAction = observer(function EditAction({ taskId }: TaskProps) {
    const ui = useKanban().$taskUI.get(taskId);
    if (!ui) return null;
    return (
        <Clickable.Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={ui.editLabel}
            onClick={() => void actions.task.openEdit({ taskId })}
        >
            Edit
        </Clickable.Button>
    );
});

const DeleteAction = observer(function DeleteAction({ taskId }: TaskProps) {
    const ui = useKanban().$taskUI.get(taskId);
    if (!ui) return null;
    return (
        <Clickable.Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={ui.deleteLabel}
            onClick={() => void actions.task.delete({ taskId })}
        >
            Delete
        </Clickable.Button>
    );
});

const MoveAction = observer(function MoveAction({
    taskId,
    direction,
}: TaskProps & { direction: Direction }) {
    const ui = useKanban().$taskUI.get(taskId)?.[direction];
    if (!ui) return null;
    return (
        <Clickable.Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={ui.label}
            title={ui.label}
            disabled={ui.disabled}
            onClick={() => void actions.task.move({ taskId, direction })}
        >
            <span aria-hidden="true">{ui.icon}</span>
        </Clickable.Button>
    );
});

export const TaskParts = {
    Container,
    Header,
    Title,
    Content,
    Description,
    DateRange,
    Footer,
    PriorityControl,
    DragHandle,
    EditAction,
    DeleteAction,
    MoveAction,
};
