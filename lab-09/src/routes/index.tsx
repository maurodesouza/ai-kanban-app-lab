import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";
import { KanbanHandle } from "#/features/kanban/components/handles/kanban/kanban-handle";

// localStorage is the source of truth, so the board renders on the client only.
export const Route = createFileRoute("/")({ ssr: false, component: Home });

function Home() {
    return (
        <main className="p-6">
            <KanbanHandle />
            <ThemeToggle />
        </main>
    );
}
