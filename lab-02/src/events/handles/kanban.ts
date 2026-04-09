import { Events } from '@/types/events';

import { BaseEventHandle } from './base';
import type { KankanTask } from '@/types/kanban';

export type AddTaskEventPayload = {
  storeId: string
  data: KankanTask
};

export type EditTaskEventPayload = {
  storeId: string
  data: KankanTask
};

export type DeleteTaskEventPayload = {
  storeId: string
  data: string
};

export type FilterEventPayload = {
  storeId: string
  filter: string
};

class KanbanHandleEvents extends BaseEventHandle {
  addTask(args: AddTaskEventPayload) {
    this.emit(Events.KANBAN_TASK_ADD, args);
  }

  editTask(args: EditTaskEventPayload) {
    this.emit(Events.KANBAN_TASK_EDIT, args);
  }

  deleteTask(args: DeleteTaskEventPayload) {
    this.emit(Events.KANBAN_TASK_DELETE, args);
  }

  filter(args: FilterEventPayload) {
    this.emit(Events.KANBAN_FILTER, args);
  }
}

export { KanbanHandleEvents };
