import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Field } from "./field";

afterEach(cleanup);

describe("Field", () => {
    it("renders only children explicitly supplied to Root", () => {
        const { container, rerender } = render(<Field.Root />);

        expect(container.childElementCount).toBe(0);
        expect(screen.queryByRole("textbox")).toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();

        rerender(
            <Field.Root>
                <Field.Label htmlFor="title">Title</Field.Label>
                <Field.Input id="title" />
            </Field.Root>,
        );

        expect(screen.getByLabelText("Title")).toBeDefined();
        expect(screen.queryByRole("alert")).toBeNull();
    });
});
