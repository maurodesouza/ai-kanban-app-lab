import { useEffect } from "react";
import { command } from "#/lib/command";

export function ThemeHandle() {
    async function handleThemeToggle() {}
    async function handleThemeSet() {}

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
