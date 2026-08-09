import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
    return (
        <div className="h-screen base-1 flex items-center justify-center">
            <p className="text-foreground">Lab 05</p>
        </div>
    );
}
