import { PlusIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Fragment, type ReactNode } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { AlertDialog } from "#/components/ui/alert-dialog";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { useModal } from "#/hooks/use-modal";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type PartProps = { children?: ReactNode; className?: string };

export function Container({ children, className }: PartProps) {
    return (
        <div
            className={cn(
                "flex h-dvh flex-col bg-palette-base text-palette-contrast",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function Header({ children, className }: PartProps) {
    return (
        <header
            className={cn(
                "flex flex-wrap items-center justify-between gap-4 border-b border-palette-line px-4 py-3 sm:px-6",
                className,
            )}
        >
            {children}
        </header>
    );
}

export const Title = observer(function Title() {
    const store = useKanban();
    const { title, summary } = store.$boardHeaderUI;

    return (
        <div className="flex flex-col">
            <Text.Heading as="h1">{title}</Text.Heading>
            <Text.Paragraph className="text-xs text-palette-accent/85">
                {summary}
            </Text.Paragraph>
        </div>
    );
});

export function Toolbar({ children, className }: PartProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {children}
        </div>
    );
}

export function Content({ children, className }: PartProps) {
    return (
        <main
            className={cn(
                "flex flex-1 items-start gap-4 overflow-x-auto p-4 sm:p-6",
                className,
            )}
        >
            {children}
        </main>
    );
}

export type ColumnView = { id: string };

export const Columns = observer(function Columns({
    render,
}: {
    render: (column: ColumnView) => ReactNode;
}) {
    const store = useKanban();

    return store.$columnListUI.map((column) => (
        <Fragment key={column.id}>{render(column)}</Fragment>
    ));
});

export const GhostColumn = observer(function GhostColumn() {
    const store = useKanban();
    const { label } = store.$ghostColumnUI;

    return (
        <Clickable.Button
            variant="outline"
            className="min-h-28 w-80 shrink-0 flex-col border-dashed"
            onClick={() => actions.kanban.column.create()}
        >
            <PlusIcon />
            {label}
        </Clickable.Button>
    );
});

export const AddTaskAction = observer(function AddTaskAction() {
    const store = useKanban();
    const { label, disabled, hint } = store.$addTaskUI;

    return (
        <Clickable.Button
            className="palette-blue"
            disabled={disabled}
            title={hint}
            onClick={() => actions.taskForm.open({ mode: "create" })}
        >
            <PlusIcon />
            {label}
        </Clickable.Button>
    );
});

export const ColumnDeleteDialog = observer(function ColumnDeleteDialog() {
    const store = useKanban();
    const modal = useModal();
    const { title, description, cancelLabel, confirmLabel } =
        store.$columnDeleteDialogUI;

    return (
        <AlertDialog.Root
            open={modal.$isColumnDeleteConfirmOpen}
            onOpenChange={(open) => {
                if (!open) actions.modal.close();
            }}
        >
            <AlertDialog.Portal>
                <AlertDialog.Backdrop />
                <AlertDialog.Content>
                    <AlertDialog.Header>
                        <AlertDialog.Title>{title}</AlertDialog.Title>
                        <AlertDialog.Description>
                            {description}
                        </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                        <AlertDialog.Close
                            render={<Clickable.Button variant="outline" />}
                        >
                            {cancelLabel}
                        </AlertDialog.Close>
                        <Clickable.Button
                            className="palette-danger"
                            onClick={() =>
                                actions.kanban.column.deleteConfirm()
                            }
                        >
                            {confirmLabel}
                        </Clickable.Button>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
});
