import { PlusIcon } from "lucide-react";
import { Clickable } from "#/components/atoms/clickable";
import { actions } from "#/lib/command";

export function GhostColumn() {
    return (
        <Clickable.Button
            variant="ghost"
            className="h-full w-72 shrink-0 rounded-xl border-2 border-palette-line border-dashed text-palette-accent/85"
            onClick={() => actions.kanban.column.add()}
        >
            <PlusIcon />
            Add column
        </Clickable.Button>
    );
}
