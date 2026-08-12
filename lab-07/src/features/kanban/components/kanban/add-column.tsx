import { Plus } from "lucide-react";
import { actions } from "#/lib/command";
import { cn } from "#/utils/cn";

export function AddColumn({ className }: { className?: string }) {
    return (
        <button
            type="button"
            className={cn(
                "flex w-72 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:bg-accent",
                className,
            )}
            onClick={() => actions.kanban.column.add()}
        >
            <Plus className="h-4 w-4" />
            Add Column
        </button>
    );
}
