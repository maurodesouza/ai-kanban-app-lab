"use client";

import { useEffect } from "react";
import { registerKanbanHandlers } from "#/lib/command/handlers";

export function KanbanHandle() {
    useEffect(() => registerKanbanHandlers(), []);
    return null;
}
