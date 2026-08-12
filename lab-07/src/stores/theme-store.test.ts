import { beforeEach, describe, expect, it } from "vitest";
import { ThemeStore } from "#/stores/theme-store";

beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
});

describe("ThemeStore", () => {
    it("defaults to light mode", () => {
        const store = new ThemeStore();
        expect(store.mode).toBe("light");
    });

    it("toggles between light and dark", () => {
        const store = new ThemeStore();
        store.toggle();
        expect(store.mode).toBe("dark");
        store.toggle();
        expect(store.mode).toBe("light");
    });

    it("sets the mode explicitly", () => {
        const store = new ThemeStore();
        store.set("dark");
        expect(store.mode).toBe("dark");
    });

    it("applies the dark class to documentElement", () => {
        const store = new ThemeStore();
        store.set("dark");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        store.set("light");
        expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
});
