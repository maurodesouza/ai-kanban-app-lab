import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CalendarIcon,
    PencilIcon,
    Trash2Icon,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ComponentProps, ReactNode } from "react";
import { badge } from "#/components/atoms/badge";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { DropdownMenu } from "#/components/ui/dropdown-menu";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { TaskUI } from "#/features/kanban/store/store";
import type { Priority as PriorityValue } from "#/features/kanban/types";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type TaskPartProps = { task: TaskUI };

const cardClassName =
    "group/task palette-raised flex flex-col gap-2 rounded-lg border border-palette-line bg-palette-base p-3 text-start shadow-xs";

/** Hidden until hover/focus on devices with a mouse; always visible on touch screens. */
const revealOnHover =
    "transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/task:opacity-100 pointer-fine:group-focus-within/task:opacity-100";

type ContainerProps = TaskPartProps & { children: ReactNode };

/** Draggable card. The whole card is the drag handle; inner buttons still click. */
export function Container({ task, children }: ContainerProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: "task" },
        attributes: { role: "article", roleDescription: "Draggable task" },
    });

    return (
        <article
            ref={setNodeRef}
            aria-label={task.title}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(
                cardClassName,
                "cursor-grab focus-visible:outline-2 focus-visible:outline-palette-ring active:cursor-grabbing",
                isDragging && "opacity-40",
            )}
            {...attributes}
            {...listeners}
        >
            {children}
        </article>
    );
}

/** Static copy of a card, used inside the drag overlay. */
export function Preview({ children }: { children: ReactNode }) {
    return (
        <div
            className={cn(
                cardClassName,
                "w-68 rotate-2 cursor-grabbing shadow-lg",
            )}
        >
            {children}
        </div>
    );
}

export function Header({ className, ...props }: ComponentProps<"div">) {
    return (
        <div className={cn("flex items-start gap-2", className)} {...props} />
    );
}

export function Title({ task }: TaskPartProps) {
    return (
        <Text.Heading
            as="h3"
            className="min-w-0 flex-1 break-words font-medium text-sm leading-snug"
        >
            {task.title}
        </Text.Heading>
    );
}

export function Description({ task }: TaskPartProps) {
    if (!task.hasDescription) return null;

    return (
        <p className="line-clamp-2 text-palette-accent/85 text-xs leading-relaxed">
            {task.description}
        </p>
    );
}

export function Footer({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex min-h-7 items-center gap-2", className)}
            {...props}
        />
    );
}

export const Priority = observer(({ task }: TaskPartProps) => {
    const store = useKanban();
    const options = store.$priorityOptions;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger
                aria-label={task.labels.priority}
                className={cn(
                    badge(),
                    task.priorityPalette,
                    "cursor-pointer focus-visible:outline-2 focus-visible:outline-palette-ring",
                )}
            >
                {task.priorityLabel}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
                <DropdownMenu.RadioGroup
                    value={task.priority}
                    onValueChange={(value) =>
                        actions.kanban.task.setPriority({
                            taskId: task.id,
                            priority: value as PriorityValue,
                        })
                    }
                >
                    {options.map((option) => (
                        <DropdownMenu.RadioItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </DropdownMenu.RadioItem>
                    ))}
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
});

export function Dates({ task }: TaskPartProps) {
    return (
        <span className="inline-flex items-center gap-1 text-palette-accent/85 text-xs">
            <CalendarIcon className="size-3" />
            {task.dateRangeLabel}
        </span>
    );
}

export function Actions({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "ms-auto flex items-center",
                revealOnHover,
                className,
            )}
            {...props}
        />
    );
}

type ActionButtonProps = {
    label: string;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
    className?: string;
};

function ActionButton({
    label,
    disabled,
    onClick,
    children,
    className,
}: ActionButtonProps) {
    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            className={cn("size-7", className)}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </Clickable.Button>
    );
}

export function MoveLeftAction({ task }: TaskPartProps) {
    return (
        <ActionButton
            label={task.labels.moveLeft}
            disabled={!task.canMoveLeft}
            onClick={() =>
                actions.kanban.task.moveAdjacent({
                    taskId: task.id,
                    direction: "left",
                })
            }
        >
            <ArrowLeftIcon />
        </ActionButton>
    );
}

export function MoveRightAction({ task }: TaskPartProps) {
    return (
        <ActionButton
            label={task.labels.moveRight}
            disabled={!task.canMoveRight}
            onClick={() =>
                actions.kanban.task.moveAdjacent({
                    taskId: task.id,
                    direction: "right",
                })
            }
        >
            <ArrowRightIcon />
        </ActionButton>
    );
}

export function EditAction({ task }: TaskPartProps) {
    return (
        <ActionButton
            label={task.labels.edit}
            onClick={() =>
                actions.kanban.taskDialog.openEdit({ taskId: task.id })
            }
        >
            <PencilIcon />
        </ActionButton>
    );
}

export function DeleteAction({ task }: TaskPartProps) {
    return (
        <ActionButton
            label={task.labels.delete}
            className="palette-danger"
            onClick={() => actions.kanban.task.delete({ taskId: task.id })}
        >
            <Trash2Icon />
        </ActionButton>
    );
}
