import * as Board from "./components/board";
import * as Column from "./components/column";
import * as Task from "./components/task";

export const Kanban = {
    Container: Board.Container,
    Header: Board.Header,
    Title: Board.Title,
    Toolbar: Board.Toolbar,
    Content: Board.Content,
    Columns: Board.Columns,
    GhostColumn: Board.GhostColumn,
    AddTaskAction: Board.AddTaskAction,
    Tasks: Task.Tasks,
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
        AddTaskAction: Column.AddTaskAction,
        Content: Column.Content,
        EmptyState: Column.EmptyState,
    },
    Task: {
        Container: Task.Container,
        Header: Task.Header,
        Title: Task.Title,
        Description: Task.Description,
        Priority: Task.Priority,
        Dates: Task.Dates,
        Footer: Task.Footer,
        Actions: Task.Actions,
        MoveLeftAction: Task.MoveLeftAction,
        MoveRightAction: Task.MoveRightAction,
        EditAction: Task.EditAction,
        DeleteAction: Task.DeleteAction,
    },
};

export { KanbanHandle } from "./components/handles/kanban/kanban-handle";
