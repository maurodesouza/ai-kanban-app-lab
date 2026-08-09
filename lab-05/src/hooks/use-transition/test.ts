import { renderHook } from "@testing-library/react";
import { useTransition } from "./index";

describe("useTransition", () => {
    it("returns a boolean for a command key", () => {
        const { result } = renderHook(() => useTransition(["kanban.task.add"]));

        expect(result.current).toBeTypeOf("boolean");
    });
});
