import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { AlertDialog } from "#/components/ui/alert-dialog";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { actions } from "#/lib/command";

export const Root = observer(({ children }: { children: ReactNode }) => {
    const store = useKanban();
    const { open } = store.$columnDeleteDialogUI;

    return (
        <AlertDialog.Root
            open={open}
            onOpenChange={(next) =>
                actions.kanban.columnDeleteDialog.change({ open: next })
            }
        >
            <AlertDialog.Portal>
                <AlertDialog.Backdrop />
                <AlertDialog.Content>{children}</AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
});

export const Header = AlertDialog.Header;

export const Footer = AlertDialog.Footer;

export const Title = observer(() => {
    const store = useKanban();
    const { title } = store.$columnDeleteDialogUI;

    return <AlertDialog.Title>{title}</AlertDialog.Title>;
});

export const Description = observer(() => {
    const store = useKanban();
    const { description } = store.$columnDeleteDialogUI;

    return <AlertDialog.Description>{description}</AlertDialog.Description>;
});

export const Cancel = observer(() => {
    const store = useKanban();
    const { cancelLabel } = store.$columnDeleteDialogUI;

    return (
        <AlertDialog.Close render={<Clickable.Button variant="outline" />}>
            {cancelLabel}
        </AlertDialog.Close>
    );
});

export const Confirm = observer(() => {
    const store = useKanban();
    const { confirmLabel } = store.$columnDeleteDialogUI;

    return (
        <Clickable.Button
            className="palette-danger"
            onClick={() => actions.kanban.columnDeleteDialog.confirm()}
        >
            {confirmLabel}
        </Clickable.Button>
    );
});
