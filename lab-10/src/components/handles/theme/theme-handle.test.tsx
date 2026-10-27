import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "#/components/theme-toggle/theme-toggle";
import { Tooltip } from "#/components/ui/tooltip";
import { actions } from "#/lib/command";
import { themeStore } from "#/store/theme/store";
import { theme } from "#/utils/theme/theme";
import { ThemeHandle } from "./theme-handle";

function mockPrefersDark(matches: boolean) {
    vi.stubGlobal(
        "matchMedia",
        vi.fn().mockReturnValue({ matches } as MediaQueryList),
    );
}

function renderTheme() {
    return render(
        <Tooltip.Provider>
            <ThemeHandle />
            <ThemeToggle />
        </Tooltip.Provider>,
    );
}

describe("ThemeHandle", () => {
    beforeEach(() => {
        themeStore.setTheme("light");
        delete document.documentElement.dataset.theme;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("follows the OS preference on the first visit without persisting it", () => {
        mockPrefersDark(true);

        renderTheme();

        expect(themeStore.theme).toBe("dark");
        expect(document.documentElement.dataset.theme).toBe("dark");
        expect(localStorage.getItem(theme.storageKey)).toBeNull();
    });

    it("restores the stored theme over the OS preference", () => {
        mockPrefersDark(true);
        localStorage.setItem(theme.storageKey, JSON.stringify("light"));

        renderTheme();

        expect(themeStore.theme).toBe("light");
        expect(document.documentElement.dataset.theme).toBe("light");
    });

    it("toggles, applies and persists the theme from the toggle button", async () => {
        mockPrefersDark(false);
        renderTheme();

        await userEvent.click(
            screen.getByRole("button", { name: "Switch to dark mode" }),
        );

        expect(themeStore.theme).toBe("dark");
        expect(document.documentElement.dataset.theme).toBe("dark");
        expect(JSON.parse(localStorage.getItem(theme.storageKey) ?? "")).toBe(
            "dark",
        );
        expect(
            screen.getByRole("button", { name: "Switch to light mode" }),
        ).toBeInTheDocument();
    });

    it("sets an explicit theme through theme.set", async () => {
        mockPrefersDark(false);
        renderTheme();

        await actions.theme.set("dark");

        expect(themeStore.theme).toBe("dark");
        expect(document.documentElement.dataset.theme).toBe("dark");
    });
});
