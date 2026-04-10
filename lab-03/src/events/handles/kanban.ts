import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { Task, Column } from '@/types/kanban';

export type CreateTaskPayload = {
  storeId: string;
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
};

export type UpdateTaskPayload = {
  storeId: string;
  taskId: string;
  data: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'columnId'>>;
};

export type DeleteTaskPayload = {
  storeId: string;
  taskId: string;
};

export type MoveTaskPayload = {
  storeId: string;
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newIndex?: number;
};

export type FilterPayload = {
  storeId: string;
  filter: string;
};

export type CreateColumnPayload = {
  storeId: string;
  data: Omit<Column, 'id'>;
};

export type UpdateColumnPayload = {
  storeId: string;
  columnId: string;
  data: Partial<Pick<Column, 'title'>>;
};

class KanbanHandleEvents extends BaseEventHandle {
  filter(args: FilterPayload) {
    this.emit(Events.KANBAN_FILTER, args);
  }

  createTask(args: CreateTaskPayload) {
    this.emit(Events.KANBAN_TASK_CREATE, args);
  }

  updateTask(args: UpdateTaskPayload) {
    this.emit(Events.KANBAN_TASK_UPDATE, args);
  }

  deleteTask(args: DeleteTaskPayload) {
    this.emit(Events.KANBAN_TASK_DELETE, args);
  }

  moveTask(args: MoveTaskPayload) {
    this.emit(Events.KANBAN_TASK_MOVE, args);
  }

  createColumn(args: CreateColumnPayload) {
    this.emit(Events.KANBAN_COLUMN_CREATE, args);
  }

  updateColumn(args: UpdateColumnPayload) {
    this.emit(Events.KANBAN_COLUMN_UPDATE, args);
  }
}

export { KanbanHandleEvents };
