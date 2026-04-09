import { Events } from '@/types/events';

import { BaseEventHandle } from './base';
import type { KankanTask } from '@/types/kanban';

export type AddTaskEventPayload = {
  id: string
  data: KankanTask
};

export type EditTaskEventPayload = {
  id: string
  data: KankanTask
};

export type DeleteTaskEventPayload = {
  id: string
  data: string
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
}

export { KanbanHandleEvents };
