import { command } from "#/lib/command";
import { getRouter } from "#/router";

command.handle("navigation.navigate", async (payload) => {
    const router = getRouter();

    if (!router) return;

    await router.navigate({ to: payload.to });
});
