import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { command } from "#/lib/command";
import { ThemeToggle } from "./theme-toggle";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
    it("dispatches theme.toggle through the command system", async () => {
        const handler = vi.fn();
        const dispose = command.handle("theme.toggle", handler);

        try {
            render(<ThemeToggle.Button />);
            fireEvent.click(
                screen.getByRole("button", { name: "Toggle theme" }),
            );

            await waitFor(() => expect(handler).toHaveBeenCalledOnce());
        } finally {
            dispose();
        }
    });

    it("is disabled while the toggle command is pending", async () => {
        let resolve: (() => void) | undefined;
        const dispose = command.handle(
            "theme.toggle",
            () => new Promise<void>((done) => (resolve = done)),
        );

        try {
            render(<ThemeToggle.Button />);
            const button = screen.getByRole("button", { name: "Toggle theme" });
            fireEvent.click(button);

            await waitFor(() =>
                expect(button.hasAttribute("disabled")).toBe(true),
            );
            expect(button.getAttribute("aria-busy")).toBe("true");

            resolve?.();
            await waitFor(() =>
                expect(button.hasAttribute("disabled")).toBe(false),
            );
        } finally {
            resolve?.();
            dispose();
        }
    });
});
