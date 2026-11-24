import { useEffect, useRef, useState } from "react";
import {
    FlexibleRender,
    type Renderable,
} from "#/components/helpers/flexible-render/flexible-render";
import { Dialog } from "#/components/ui/dialog";
import { actions, command } from "#/lib/command";

export function ModalHandle() {
    const [content, setContent] = useState<Renderable | null>(null);

    const opener = useRef<HTMLElement | null>(null);

    async function open(next: Renderable) {
        const active = document.activeElement;
        opener.current = active instanceof HTMLElement ? active : null;
        setContent(() => next);
    }

    async function close() {
        const previous = opener.current;
        opener.current = null;
        setContent(null);
        requestAnimationFrame(() => {
            if (opener.current) return;
            if (previous?.isConnected) previous.focus();
            else
                document
                    .querySelector<HTMLElement>("[data-board-focus]")
                    ?.focus();
        });
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: the handlers close over stable state and refs
    useEffect(() => {
        const dispose = [
            command.handle("modal.open", open),
            command.handle("modal.close", close),
        ];
        return () => {
            for (const unregister of dispose) unregister();
        };
    }, []);

    return (
        <Dialog.Root
            open={content !== null}
            onOpenChange={(open) => {
                if (!open) void actions.modal.close();
            }}
        >
            {content && (
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <FlexibleRender content={content} />
                </Dialog.Portal>
            )}
        </Dialog.Root>
    );
}
