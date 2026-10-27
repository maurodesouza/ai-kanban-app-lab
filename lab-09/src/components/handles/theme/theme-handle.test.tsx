import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actions } from "#/lib/command";
import { THEME_STORAGE_KEY, themeStore } from "#/store/theme/store";
import { ThemeHandle } from "./theme-handle";

function mockPrefersDark(matches: boolean) {
    vi.stubGlobal(
        "matchMedia",
        vi.fn().mockReturnValue({ matches } as MediaQueryList),
    );
}

describe("ThemeHandle", () => {
    beforeEach(() => {
        themeStore.setTheme("light");
        mockPrefersDark(false);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("restores the stored theme on mount", () => {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify("dark"));

        render(<ThemeHandle />);

        expect(themeStore.theme).toBe("dark");
        expect(document.documentElement.dataset.theme).toBe("dark");
    });

    it("falls back to the system preference without a stored theme", () => {
        mockPrefersDark(true);

        render(<ThemeHandle />);

        expect(themeStore.theme).toBe("dark");
    });

    it("ignores an invalid stored theme", () => {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify("purple"));

        render(<ThemeHandle />);

        expect(themeStore.theme).toBe("light");
    });

    it("toggles, applies and persists the theme", async () => {
        render(<ThemeHandle />);

        await act(() => actions.theme.toggle());

        expect(themeStore.theme).toBe("dark");
        expect(document.documentElement.dataset.theme).toBe("dark");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"dark"');

        await act(() => actions.theme.toggle());

        expect(themeStore.theme).toBe("light");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"light"');
    });

    it("disposes the handler on unmount", async () => {
        const { unmount } = render(<ThemeHandle />);
        unmount();

        await actions.theme.toggle();

        expect(themeStore.theme).toBe("light");
    });
});
