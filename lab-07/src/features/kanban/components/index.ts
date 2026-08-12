import { Column } from "./column/column";
import { AddColumn } from "./kanban/add-column";
import { Kanban as KanbanBase } from "./kanban/kanban";
import { Tasks } from "./kanban/tasks";
import { Task } from "./task/task";

const Kanban = {
    ...KanbanBase,
    Tasks,
    AddColumn,
    Column,
    Task,
};

export { AddColumn, Column, Kanban, Task, Tasks };
