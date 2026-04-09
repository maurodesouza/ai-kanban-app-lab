import { Events } from '@/types/events';

import { BaseEventHandle } from './base';
import type { KankanTask } from '@/types/kanban';

export type AddTaskEventPayload = {
  storeId: string;
  data: KankanTask;
};

export type EditTaskEventPayload = {
  storeId: string;
  data: KankanTask;
};

export type DeleteTaskEventPayload = {
  storeId: string;
  data: string;
};

export type FilterEventPayload = {
  storeId: string;
  filter: string;
};

class KanbanHandleEvents extends BaseEventHandle {
  addTask(payload: AddTaskEventPayload) {
    this.emit(Events.KANBAN_TASK_ADD, payload);
  }

  editTask(payload: EditTaskEventPayload) {
    this.emit(Events.KANBAN_TASK_EDIT, payload);
  }

  deleteTask(payload: DeleteTaskEventPayload) {
    this.emit(Events.KANBAN_TASK_DELETE, payload);
  }

  filter(payload: FilterEventPayload) {
    this.emit(Events.KANBAN_FILTER, payload);
  }
}

export { KanbanHandleEvents };
