import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
