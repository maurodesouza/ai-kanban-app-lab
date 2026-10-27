import { describe, expect, it } from "vitest";
import { ThemeStore } from "./store";

describe("ThemeStore", () => {
    it("starts in light mode and offers dark as the next theme", () => {
        const store = new ThemeStore();

        expect(store.$isDark).toBe(false);
        expect(store.$nextTheme).toBe("dark");
        expect(store.$themeToggleUI).toEqual({
            icon: "moon",
            label: "Switch to dark mode",
        });
    });

    it("presents the light switch when dark mode is active", () => {
        const store = new ThemeStore();

        store.setTheme("dark");

        expect(store.$isDark).toBe(true);
        expect(store.$nextTheme).toBe("light");
        expect(store.$themeToggleUI).toEqual({
            icon: "sun",
            label: "Switch to light mode",
        });
    });
});
