import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Select } from "./select";

beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("Select", () => {
    it("opens and selects an option using only the keyboard", async () => {
        const onValueChange = vi.fn();
        render(
            <Select.Root onValueChange={onValueChange}>
                <Select.Trigger aria-label="Priority">
                    <Select.Value placeholder="Choose priority" />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content>
                        <Select.Viewport>
                            <Select.Item value="low">
                                <Select.ItemText>Low</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="high">
                                <Select.ItemText>High</Select.ItemText>
                            </Select.Item>
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>,
        );

        const trigger = screen.getByRole("combobox", { name: "Priority" });
        trigger.focus();
        fireEvent.keyDown(trigger, { key: "ArrowDown" });

        await screen.findByRole("listbox");
        fireEvent.keyDown(document.activeElement ?? document, { key: "Enter" });

        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("low"));
        expect(trigger.textContent).toContain("Low");
    });
});
