import type { ReactNode } from "react";
import { KanbanHandle } from "#/components/handles/kanban-handle/kanban-handle";
import { ThemeHandle } from "#/components/handles/theme-handle/theme-handle";

export function AppShell({ children }: Readonly<{ children?: ReactNode }>) {
    return (
        <>
            <KanbanHandle />
            <ThemeHandle />
            {children}
        </>
    );
}
