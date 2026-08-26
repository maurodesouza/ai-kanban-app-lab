import type { Action, ScopedAction } from "#/lib/command";
import type {
    AddColumnPayload,
    AddTaskPayload,
    ApplyFilterPayload,
    CreateBoardPayload,
    DeleteBoardPayload,
    DeleteColumnPayload,
    EditTaskPayload,
    MoveColumnPayload,
    MoveTaskPayload,
    RenameBoardPayload,
    RenameColumnPayload,
    SelectBoardPayload,
    SetPriorityPayload,
} from "./types";

declare module "#/lib/command/global" {
    interface Actions {
        kanban: {
            task: {
                add: ScopedAction<AddTaskPayload>;
                edit: ScopedAction<EditTaskPayload>;
                delete: ScopedAction<{ boardId: string; taskId: string }>;
                move: ScopedAction<MoveTaskPayload>;
                setPriority: ScopedAction<SetPriorityPayload>;
                applyFilter: ScopedAction<ApplyFilterPayload>;
            };
            column: {
                add: ScopedAction<AddColumnPayload>;
                rename: ScopedAction<RenameColumnPayload>;
                move: ScopedAction<MoveColumnPayload>;
                delete: ScopedAction<DeleteColumnPayload>;
            };
            board: {
                create: Action<CreateBoardPayload>;
                delete: Action<DeleteBoardPayload>;
                select: Action<SelectBoardPayload>;
                rename: Action<RenameBoardPayload>;
            };
        };
    }
}
