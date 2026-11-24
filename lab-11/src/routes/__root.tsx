import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { Kanban } from "#/features/kanban/components/kanban/kanban";
import { ModalHandle } from "#/features/modal/components/handles/modal/modal-handle";
import styles from "../styles.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "AI Todo App" },
        ],
        links: [{ rel: "stylesheet", href: styles }],
    }),
    component: Root,
    shellComponent: Shell,
});

function Root() {
    return (
        <Kanban.Provider>
            <Outlet />
            <ModalHandle />
        </Kanban.Provider>
    );
}

function Shell({ children }: PropsWithChildren) {
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
