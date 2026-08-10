import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import globalCss from "#/styles/global.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "AI Kanban Lab 06" },
        ],
        links: [{ rel: "stylesheet", href: globalCss }],
    }),
    component: RootComponent,
    shellComponent: RootDocument,
});

function RootComponent() {
    return <Outlet />;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}
