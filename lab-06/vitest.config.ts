import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { alias } from "./vite.config.ts";

export default defineConfig({
    plugins: [react()],
    resolve: { alias },
    test: {
        environment: "jsdom",
        globals: true,
    },
});
