import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { decorators } from "./decorators.ts";

const source = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
    resolve: { alias: { "#": source, "@": source } },
    plugins: [decorators()],
});
