import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/components/templates/app-shell";
import { Board } from "#/components/templates/board";

function IndexPage() {
    return (
        <AppShell>
            <Board />
        </AppShell>
    );
}

export const Route = createFileRoute("/")({
    component: IndexPage,
});
