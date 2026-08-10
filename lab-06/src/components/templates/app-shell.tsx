import { KanbanHandle } from "#/components/handles/kanban-handle/kanban-handle";

export function AppShell() {
    return (
        <>
            <KanbanHandle />
            <main className="grid min-h-screen place-items-center bg-background text-foreground">
                <h1 className="text-3xl font-semibold">AI Kanban</h1>
            </main>
        </>
    );
}
