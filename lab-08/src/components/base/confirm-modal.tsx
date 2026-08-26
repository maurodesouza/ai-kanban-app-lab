import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import type { ConfirmModalData } from "#/components/handles/modal/modal-actions";

interface ConfirmModalProps {
    data: ConfirmModalData;
    onClose: () => void;
}

export function ConfirmModal({ data, onClose }: ConfirmModalProps) {
    function handleConfirm() {
        data.onConfirm();
        onClose();
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{data.title}</DialogTitle>
                    <DialogDescription>{data.message}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        {data.confirmLabel ?? "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
