import { describe, expect, it } from "vitest";
import { ThemeStore } from "./store";

describe("ThemeStore", () => {
    it("presents the dark-mode toggle in light theme", () => {
        const store = new ThemeStore();

        expect(store.$isDark).toBe(false);
        expect(store.$nextTheme).toBe("dark");
        expect(store.$themeToggleUI).toEqual({
            pressed: false,
            icon: "moon",
            label: "Switch to dark mode",
        });
    });

    it("presents the light-mode toggle in dark theme", () => {
        const store = new ThemeStore();
        store.setTheme("dark");

        expect(store.$isDark).toBe(true);
        expect(store.$nextTheme).toBe("light");
        expect(store.$themeToggleUI).toEqual({
            pressed: true,
            icon: "sun",
            label: "Switch to light mode",
        });
    });
});
