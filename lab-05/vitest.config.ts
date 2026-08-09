import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        include: ["**/test.ts", "**/test.tsx"],
    },
    resolve: {
        alias: [
            {
                find: /^#\//,
                replacement: `${path.resolve(__dirname, "./src")}/`,
            },
            {
                find: /^@\//,
                replacement: `${path.resolve(__dirname, "./src")}/`,
            },
        ],
    },
});
