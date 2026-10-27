import { describe, expect, it } from "vitest";
import { board } from "./board";

function createIds() {
    let next = 0;

    return () => `id-${++next}`;
}

describe("board", () => {
    it("seeds the default columns", () => {
        const snapshot = board.seed(createIds());

        expect(
            snapshot.columnOrder.map((id) => snapshot.columns[id].title),
        ).toEqual(["To Do", "In Progress", "Done"]);
        expect(snapshot.tasks).toEqual({});
    });

    it("parses a valid snapshot", () => {
        const snapshot = board.seed(createIds());

        expect(board.snapshot.parse(snapshot)).toEqual(snapshot);
    });

    it("rejects corrupt or inconsistent data", () => {
        const snapshot = board.seed(createIds());
        const [firstColumnId] = snapshot.columnOrder;

        expect(board.snapshot.parse(null)).toBeNull();
        expect(board.snapshot.parse("oops")).toBeNull();
        expect(board.snapshot.parse({ ...snapshot, version: 2 })).toBeNull();
        expect(
            board.snapshot.parse({
                ...snapshot,
                columns: {
                    ...snapshot.columns,
                    [firstColumnId]: {
                        ...snapshot.columns[firstColumnId],
                        taskIds: ["missing"],
                    },
                },
            }),
        ).toBeNull();
    });
});
