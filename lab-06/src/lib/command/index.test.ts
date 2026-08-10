import { describe, expect, it, vi } from "vitest";
import { actions, command } from "#/lib/command";
import { TransitionStore } from "#/lib/command/transitions-store";

describe("command system", () => {
    it("dispatches through actions and tracks the transition lifecycle", async () => {
        let resolveHandler: ((value: string) => void) | undefined;
        const handler = vi.fn(
            () =>
                new Promise<string>((resolve) => {
                    resolveHandler = resolve;
                }),
        );
        const dispose = command.handle("kanban.column.add", handler);
        const transitions = TransitionStore.getInstance();

        const result = actions.kanban.column.add({ title: "Backlog" });

        expect(handler).toHaveBeenCalledWith({ title: "Backlog" });
        expect(transitions.isExecuting(["kanban.column.add"])).toBe(true);

        resolveHandler?.("column-1");

        await expect(result).resolves.toBe("column-1");
        expect(transitions.isExecuting(["kanban.column.add"])).toBe(false);

        dispose();
        await expect(
            actions.kanban.column.add({ title: "Later" }),
        ).resolves.toBeUndefined();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("rejects duplicate registration without replacing the first handler", async () => {
        const firstHandler = vi.fn(async () => "first");
        const duplicateHandler = vi.fn(async () => "duplicate");
        const disposeFirst = command.handle("kanban.column.add", firstHandler);
        const disposeDuplicate = command.handle(
            "kanban.column.add",
            duplicateHandler,
        );

        await expect(actions.kanban.column.add({})).resolves.toBe("first");
        expect(firstHandler).toHaveBeenCalledOnce();
        expect(duplicateHandler).not.toHaveBeenCalled();

        disposeDuplicate();
        await expect(actions.kanban.column.add({})).resolves.toBe("first");
        expect(firstHandler).toHaveBeenCalledTimes(2);

        disposeFirst();
    });
});
