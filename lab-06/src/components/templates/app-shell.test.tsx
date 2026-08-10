import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "#/components/templates/app-shell";

describe("AppShell", () => {
    it("renders the application heading", () => {
        render(<AppShell />);

        expect(
            screen.getByRole("heading", { name: "AI Kanban" }),
        ).toBeDefined();
    });
});
