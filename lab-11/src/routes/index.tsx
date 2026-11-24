import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { PersistenceHandle } from "#/features/kanban/components/handles/persistence/persistence-handle";
import { useKanban } from "#/features/kanban/hooks/use-kanban";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
    return (
        <>
            <PersistenceHandle />
            <BoardStatus />
        </>
    );
}

const BoardStatus = observer(function BoardStatus() {
    const ui = useKanban().$statusUI;
    return (
        <main>
            <h1>AI Todo App</h1>
            <p role="status">
                {ui.ready ? ui.storageMessage : "Loading board…"}
            </p>
        </main>
    );
});
