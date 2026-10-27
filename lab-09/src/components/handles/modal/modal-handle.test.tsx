import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { actions } from "#/lib/command";
import { modalStore } from "#/store/modal/store";
import { ModalHandle } from "./modal-handle";

describe("ModalHandle", () => {
    beforeEach(() => {
        modalStore.setCurrent(null);
    });

    it("opens and closes modals", async () => {
        render(<ModalHandle />);

        await act(() => actions.modal.open("task-form"));
        expect(modalStore.current).toBe("task-form");

        await act(() => actions.modal.close());
        expect(modalStore.current).toBeNull();
    });
});
