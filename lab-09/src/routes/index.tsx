import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";

// localStorage is the source of truth, so the board renders on the client only.
export const Route = createFileRoute("/")({ ssr: false, component: Home });

function Home() {
    return (
        <main className="p-6">
            <ThemeToggle />
        </main>
    );
}
