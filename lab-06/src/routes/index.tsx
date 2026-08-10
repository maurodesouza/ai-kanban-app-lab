import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/components/templates/app-shell";

export const Route = createFileRoute("/")({
    component: AppShell,
});
