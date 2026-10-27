import { Container, Content, Header, Title, Toolbar } from "./board";
import * as Column from "./column";
import * as ColumnDeleteDialog from "./column-delete-dialog";
import { Columns } from "./columns";
import { DndProvider } from "./dnd-provider";
import { GhostColumn } from "./ghost-column";

/** Headless Kanban parts. The route assembles them explicitly. */
export const Kanban = {
    Container,
    Header,
    Title,
    Toolbar,
    Content,
    DndProvider,
    Columns,
    Column,
    GhostColumn,
    ColumnDeleteDialog,
};
