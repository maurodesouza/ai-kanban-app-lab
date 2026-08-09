import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { registered } from "#/lib/command/handlers/index";
import appCss from "../styles/global.css?url";

void registered;

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "AI Kanban Lab 05",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
    useEffect(() => {
        const saved = localStorage.getItem("theme");

        if (saved === "dark") {
            document.body.classList.remove("theme-light");
            document.body.classList.add("theme-dark");
        } else if (saved === "light") {
            document.body.classList.remove("theme-dark");
            document.body.classList.add("theme-light");
        }
    }, []);

    return (
        <html lang="en" className="h-screen">
            <head>
                <HeadContent />
            </head>
            <body className="h-screen theme-light base-1">
                {children}
                <Toaster position="bottom-right" richColors />
                <Scripts />
            </body>
        </html>
    );
}
