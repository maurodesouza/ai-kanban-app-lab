import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { Task } from '@/types/kanban';

export type CreateTaskPayload = {
  storeId: string;
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
};

export type UpdateTaskPayload = {
  storeId: string;
  taskId: string;
  updates: Partial<Pick<Task, 'title' | 'description' | 'dueDate'>>;
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
}

export { KanbanHandleEvents };
