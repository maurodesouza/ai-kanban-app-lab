import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "#/components/templates/app-shell";

describe("AppShell", () => {
    it("assembles global handles around its explicit children", () => {
        render(
            <AppShell>
                <h1>Board child</h1>
            </AppShell>,
        );

        expect(
            screen.getByRole("heading", { name: "Board child" }),
        ).toBeDefined();
    });
});
