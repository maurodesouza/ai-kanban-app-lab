import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ModalHandle } from "#/components/handles/modal/modal-handle";
import { ThemeHandle } from "#/components/handles/theme/theme-handle";
import { THEME_STORAGE_KEY } from "#/store/theme/store";
import appCss from "../styles.css?url";

// Applies the stored theme before the first paint to avoid a light flash.
// ThemeHandle stays the single owner of theme behavior after hydration.
const themeBootstrap = `try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}));if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}`;

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "Lab 09 — Kanban" },
        ],
        links: [{ rel: "stylesheet", href: appCss }],
        scripts: [{ children: themeBootstrap }],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="palette-surface">
                <ThemeHandle />
                <ModalHandle />
                {children}
                <Scripts />
            </body>
        </html>
    );
}
