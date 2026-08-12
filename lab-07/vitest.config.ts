import { defineConfig } from "vitest/config";
import { alias } from "./vite.config";

export default defineConfig({
    resolve: { alias },
    test: {
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
    },
});
