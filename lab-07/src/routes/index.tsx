import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    return (
        <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 p-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">
                    AI Todo App
                </h1>
            </header>
            {/* Kanban mount point — assembled in issue 5 */}
            <section
                className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-muted-foreground"
                data-placeholder="kanban"
            >
                Kanban will be mounted here
            </section>
        </main>
    );
}
