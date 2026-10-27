import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle/theme-toggle";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <main className="flex h-full flex-col">
            <header className="flex items-center justify-between px-6 py-4">
                <h1 className="font-semibold text-lg">Kanban</h1>
                <ThemeToggle />
            </header>
        </main>
    );
}
