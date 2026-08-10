import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import globalCss from "#/styles/global.css?url";

const INITIAL_THEME_SCRIPT = `(function(){try{var value=localStorage.getItem("ai-kanban:v1");if(!value)return;var snapshot=JSON.parse(value);if(snapshot&&snapshot.version===1&&(snapshot.theme==="light"||snapshot.theme==="dark")){document.documentElement.classList.toggle("dark",snapshot.theme==="dark");document.documentElement.style.colorScheme=snapshot.theme;}}catch(error){}})();`;

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
                <script
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: This immutable script contains no interpolated or user-controlled content.
                    dangerouslySetInnerHTML={{ __html: INITIAL_THEME_SCRIPT }}
                />
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}
