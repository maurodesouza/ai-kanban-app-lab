import * as Board from "./components/board";
import * as Column from "./components/column";

export const Kanban = {
    Container: Board.Container,
    Header: Board.Header,
    Title: Board.Title,
    Toolbar: Board.Toolbar,
    Content: Board.Content,
    Columns: Board.Columns,
    GhostColumn: Board.GhostColumn,
    ColumnDeleteDialog: Board.ColumnDeleteDialog,
    Column: {
        Container: Column.Container,
        Header: Column.Header,
        Title: Column.Title,
        Count: Column.Count,
        Actions: Column.Actions,
        MoveLeftAction: Column.MoveLeftAction,
        MoveRightAction: Column.MoveRightAction,
        DeleteAction: Column.DeleteAction,
        Content: Column.Content,
    },
};

export { KanbanHandle } from "./components/handles/kanban/kanban-handle";
