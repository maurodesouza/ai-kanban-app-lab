import { actions, command } from "./index";

describe("command bus", () => {
    it("round-trips a command through a handler", async () => {
        let received: unknown;

        const dispose = command.handle("toast.show", async (payload) => {
            received = payload;
        });

        await actions.toast.show({ message: "hello" });

        expect(received).toEqual({ message: "hello" });

        dispose();
    });
});
