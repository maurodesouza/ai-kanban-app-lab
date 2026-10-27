import {
    Container,
    Content,
    Header,
    NewTaskAction,
    Title,
    Toolbar,
} from "./board";
import * as Column from "./column";
import * as ColumnDeleteDialog from "./column-delete-dialog";
import { Columns } from "./columns";
import { DndProvider } from "./dnd-provider";
import { DragOverlay } from "./drag-overlay";
import { GhostColumn } from "./ghost-column";
import * as Task from "./task";
import * as TaskDialog from "./task-dialog";
import { Tasks } from "./tasks";

/** Headless Kanban parts. The route assembles them explicitly. */
export const Kanban = {
    Container,
    Header,
    Title,
    Toolbar,
    NewTaskAction,
    Content,
    DndProvider,
    DragOverlay,
    Columns,
    Column,
    GhostColumn,
    Tasks,
    Task,
    TaskDialog,
    ColumnDeleteDialog,
};
