import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeHandle } from "#/components/handles/theme/theme-handle";
import { Tooltip } from "#/components/ui/tooltip";
import appCss from "#/styles/app.css?url";
import { theme } from "#/utils/theme/theme";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "Kanban" },
        ],
        links: [{ rel: "stylesheet", href: appCss }],
    }),
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <ThemeHandle />
            <Tooltip.Provider>
                <Outlet />
            </Tooltip.Provider>
        </RootDocument>
    );
}

function RootDocument({ children }: { children: ReactNode }) {
    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <script
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap that must run before hydration to avoid a theme flash
                    dangerouslySetInnerHTML={{ __html: theme.bootstrapScript }}
                />
                <HeadContent />
            </head>
            <body className="palette-surface h-dvh overflow-hidden bg-palette-base text-palette-contrast antialiased">
                {children}
                <Scripts />
            </body>
        </html>
    );
}
