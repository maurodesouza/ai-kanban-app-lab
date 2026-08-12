import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export const alias = {
    "#/": `${path.resolve(root, "src")}/`,
};

export default defineConfig({
    resolve: { alias },
    plugins: [tanstackStart(), react(), tailwindcss()],
});
