import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    EllipsisIcon,
    GripVerticalIcon,
    PencilIcon,
    PlusIcon,
    Trash2Icon,
} from "lucide-react";
import {
    type ComponentProps,
    createContext,
    type KeyboardEvent,
    type ReactNode,
    useContext,
} from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Input } from "#/components/atoms/fields";
import { Text } from "#/components/atoms/text";
import { DropdownMenu } from "#/components/ui/dropdown-menu";
import { Field } from "#/components/ui/field";
import type { ColumnUI } from "#/features/kanban/store/store";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type ColumnPartProps = { column: ColumnUI };

type SortableHandle = {
    listeners: DraggableSyntheticListeners;
    attributes: ReturnType<typeof useSortable>["attributes"];
    setActivatorNodeRef: (element: HTMLElement | null) => void;
};

const SortableHandleContext = createContext<SortableHandle | null>(null);

/** Hidden until hover/focus on devices with a mouse; always visible on touch screens. */
const revealOnHover =
    "transition-opacity pointer-fine:opacity-0 pointer-fine:focus-visible:opacity-100 pointer-fine:group-hover/column:opacity-100 pointer-fine:group-focus-within/column:opacity-100";

type ContainerProps = ColumnPartProps & {
    children: ReactNode;
    className?: string;
};

export function Container({ column, children, className }: ContainerProps) {
    const {
        attributes,
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id, data: { type: "column" } });

    return (
        <SortableHandleContext.Provider
            value={{ attributes, listeners, setActivatorNodeRef }}
        >
            <section
                ref={setNodeRef}
                aria-label={column.title}
                style={{
                    transform: CSS.Translate.toString(transform),
                    transition,
                }}
                className={cn(
                    "group/column flex h-full w-72 shrink-0 flex-col rounded-xl bg-palette-soft",
                    isDragging && "z-10 opacity-60",
                    className,
                )}
            >
                {children}
            </section>
        </SortableHandleContext.Provider>
    );
}

export function Header({ className, ...props }: ComponentProps<"header">) {
    return (
        <header
            className={cn("flex h-12 items-center gap-1 ps-1 pe-2", className)}
            {...props}
        />
    );
}

export function DragHandle({ column }: ColumnPartProps) {
    const handle = useContext(SortableHandleContext);

    return (
        <Clickable.Button
            variant="icon"
            size="sm"
            ref={handle?.setActivatorNodeRef}
            aria-label={column.labels.reorder}
            className={cn(
                "w-5 cursor-grab px-0 active:cursor-grabbing",
                revealOnHover,
            )}
            {...handle?.attributes}
            {...handle?.listeners}
        >
            <GripVerticalIcon />
        </Clickable.Button>
    );
}

function commitRename(columnId: string, title: string) {
    return actions.kanban.column.rename({ columnId, title });
}

function handleRenameKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    originalTitle: string,
) {
    if (event.key === "Enter") event.currentTarget.blur();

    if (event.key === "Escape") {
        event.currentTarget.value = originalTitle;
        event.currentTarget.blur();
    }
}

export function Title({ column }: ColumnPartProps) {
    if (column.isEditing) {
        return (
            <Field.Root className="palette-surface-blue min-w-0 flex-1">
                <Field.Row className="h-8">
                    <Field.Body>
                        <Input
                            aria-label="Column name"
                            defaultValue={column.title}
                            autoFocus
                            onFocus={(event) => event.currentTarget.select()}
                            onBlur={(event) =>
                                commitRename(
                                    column.id,
                                    event.currentTarget.value,
                                )
                            }
                            onKeyDown={(event) =>
                                handleRenameKeyDown(event, column.title)
                            }
                        />
                    </Field.Body>
                </Field.Row>
            </Field.Root>
        );
    }

    return (
        <Text.Heading
            as="h2"
            className="min-w-0 truncate ps-1 font-semibold text-sm"
            onDoubleClick={() =>
                actions.kanban.column.edit.start({ columnId: column.id })
            }
        >
            {column.title}
        </Text.Heading>
    );
}

export function Count({ column }: ColumnPartProps) {
    if (column.isEditing) return null;

    return (
        <span className="me-auto shrink-0 rounded-full px-1.5 text-palette-accent/85 text-xs tabular-nums">
            {column.countLabel}
        </span>
    );
}

export function Actions({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex shrink-0 items-center", className)}
            {...props}
        />
    );
}

export function MoveLeftAction({ column }: ColumnPartProps) {
    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            className={revealOnHover}
            aria-label={column.labels.moveLeft}
            disabled={!column.canMoveLeft}
            onClick={() =>
                actions.kanban.column.moveBy({
                    columnId: column.id,
                    offset: -1,
                })
            }
        >
            <ArrowLeftIcon />
        </Clickable.Button>
    );
}

export function MoveRightAction({ column }: ColumnPartProps) {
    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            className={revealOnHover}
            aria-label={column.labels.moveRight}
            disabled={!column.canMoveRight}
            onClick={() =>
                actions.kanban.column.moveBy({ columnId: column.id, offset: 1 })
            }
        >
            <ArrowRightIcon />
        </Clickable.Button>
    );
}

export function AddTaskAction({ column }: ColumnPartProps) {
    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            size="sm"
            aria-label={column.labels.addTask}
            onClick={() =>
                actions.kanban.taskDialog.openCreate({ columnId: column.id })
            }
        >
            <PlusIcon />
        </Clickable.Button>
    );
}

export function Menu({ column, children }: ContainerProps) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger
                render={
                    <Clickable.Button
                        variant="icon"
                        shape="square"
                        size="sm"
                        aria-label={column.labels.options}
                    />
                }
            >
                <EllipsisIcon />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">{children}</DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}

export function RenameAction({ column }: ColumnPartProps) {
    return (
        <DropdownMenu.Item
            onClick={() =>
                actions.kanban.column.edit.start({ columnId: column.id })
            }
        >
            <PencilIcon />
            <span>Rename</span>
        </DropdownMenu.Item>
    );
}

export function DeleteAction({ column }: ColumnPartProps) {
    return (
        <DropdownMenu.Item
            className="palette-danger"
            onClick={() =>
                actions.kanban.columnDeleteDialog.open({ columnId: column.id })
            }
        >
            <Trash2Icon />
            <span>Delete column</span>
        </DropdownMenu.Item>
    );
}

export function Content({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2",
                className,
            )}
            {...props}
        />
    );
}

export function Empty({ column }: ColumnPartProps) {
    if (!column.isEmpty) return null;

    return (
        <p className="rounded-lg border border-palette-line border-dashed px-3 py-6 text-center text-palette-accent/85 text-xs">
            {column.emptyLabel}
        </p>
    );
}

export function Footer({ className, ...props }: ComponentProps<"footer">) {
    return <footer className={cn("px-2 pb-2", className)} {...props} />;
}
