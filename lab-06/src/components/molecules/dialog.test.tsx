import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Dialog } from "./dialog";

afterEach(cleanup);

function TestDialog() {
    return (
        <Dialog.Root>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay data-testid="overlay" />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Edit task</Dialog.Title>
                        <Dialog.Description>
                            Update the task details.
                        </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Body>
                        <label htmlFor="dialog-title">Title</label>
                        <input id="dialog-title" />
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close>Done</Dialog.Close>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

describe("Dialog", () => {
    it("opens, redirects focus inside, traps focus, and closes on Escape", async () => {
        render(<TestDialog />);
        const trigger = screen.getByRole("button", { name: "Open dialog" });

        fireEvent.click(trigger);
        const dialog = await screen.findByRole("dialog", { name: "Edit task" });
        await waitFor(() =>
            expect(dialog.contains(document.activeElement)).toBe(true),
        );

        trigger.focus();
        fireEvent.keyDown(document, { key: "Tab" });
        await waitFor(() =>
            expect(dialog.contains(document.activeElement)).toBe(true),
        );

        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(document.activeElement).toBe(trigger);
    });

    it("does not add a close control or other child markup to Content", async () => {
        render(
            <Dialog.Root defaultOpen>
                <Dialog.Portal>
                    <Dialog.Content aria-label="Empty dialog" />
                </Dialog.Portal>
            </Dialog.Root>,
        );

        const dialog = await screen.findByRole("dialog", {
            name: "Empty dialog",
        });
        expect(dialog.childElementCount).toBe(0);
        expect(screen.queryByRole("button")).toBeNull();
    });
});
