import { render } from "@testing-library/react";
import { Tooltip } from "#/components/ui/tooltip";
import { Route } from "#/routes/index";

/** Renders the real board route, exactly as the app assembles it. */
export function renderBoard() {
    const Board = Route.options.component;

    if (!Board) throw new Error("board route has no component");

    return render(
        <Tooltip.Provider>
            <Board />
        </Tooltip.Provider>,
    );
}
