import { useEffect } from "react";
import { command } from "#/lib/command";
import { themeStore } from "#/stores";

export function ThemeHandle() {
    async function handleThemeToggle() {
        themeStore.toggle();
    }

    async function handleThemeSet(payload: { mode: "light" | "dark" }) {
        themeStore.set(payload.mode);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers register once on mount
    useEffect(() => {
        const disposes = [
            command.handle("theme.toggle", handleThemeToggle),
            command.handle("theme.set", handleThemeSet),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
