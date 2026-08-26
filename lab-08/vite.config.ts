import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [
        nitro({ rollupConfig: { external: [/^@sentry\//] } }),

        tanstackStart(),
        viteReact(),
        tailwindcss(),
    ],
});

export default config;
