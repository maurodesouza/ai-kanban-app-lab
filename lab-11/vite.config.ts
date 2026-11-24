import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { decorators } from "./decorators.ts";

const source = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
    resolve: { alias: { "#": source, "@": source } },
    plugins: [
        decorators(),
        tailwindcss(),
        tanstackStart({ spa: { enabled: true } }),
        react(),
    ],
});
