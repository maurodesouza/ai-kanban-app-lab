import { observer } from "mobx-react-lite";
import { Button } from "#/components/shared/clickable/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import { actions, command } from "#/lib/command";
import { modalStore } from "#/stores";

export const ConfirmDialog = observer(function ConfirmDialog() {
    const confirm = modalStore.confirm;

    const handleConfirm = () => {
        if (!confirm) return;
        command.dispatch(
            confirm.confirmCommand as never,
            confirm.confirmPayload as never,
        );
        actions.modal.confirm.close();
    };

    const handleCancel = () => {
        actions.modal.confirm.close();
    };

    return (
        <Dialog
            open={modalStore.isConfirmOpen}
            onOpenChange={(open) => {
                if (!open) handleCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{confirm?.title ?? ""}</DialogTitle>
                    <DialogDescription>
                        {confirm?.message ?? ""}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
