import { useEffect } from "react";
import { kanbanStore } from "#/features/kanban/store/kanban-store";
import { command } from "#/lib/command";
import "#/features/kanban/kanban-actions";
import { createBoardData } from "#/features/kanban/factories";
import type {
    CreateBoardPayload,
    DeleteBoardPayload,
    RenameBoardPayload,
    SelectBoardPayload,
} from "#/features/kanban/types";
import { createId } from "#/utils/random/id";

export function BoardHandle() {
    async function handleCreateBoard(payload: CreateBoardPayload) {
        const id = createId("board");
        const board = createBoardData(id, payload.title ?? "New Board");
        kanbanStore.setBoard(board);
        kanbanStore.setActiveBoard(id);
    }

    async function handleDeleteBoard(payload: DeleteBoardPayload) {
        kanbanStore.removeBoard(payload.boardId);
        // Decide which board to activate next
        if (kanbanStore.activeBoardId === null) {
            const remaining = kanbanStore.boardsList;
            if (remaining.length > 0) {
                kanbanStore.setActiveBoard(remaining[0].id);
            }
        }
    }

    async function handleSelectBoard(payload: SelectBoardPayload) {
        const board = kanbanStore.getBoard(payload.boardId);
        if (board) {
            kanbanStore.setActiveBoard(payload.boardId);
        }
    }

    async function handleRenameBoard(payload: RenameBoardPayload) {
        kanbanStore.setBoardTitle(payload.boardId, payload.title);
    }

    useEffect(() => {
        const disposes = [
            command.handle("kanban.board.create", handleCreateBoard),
            command.handle("kanban.board.delete", handleDeleteBoard),
            command.handle("kanban.board.select", handleSelectBoard),
            command.handle("kanban.board.rename", handleRenameBoard),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
