import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { KankanTask } from '@/types/kanban';

type AddTaskArgs = KankanTask;
type EditTaskArgs = KankanTask;
type DeleteTaskArgs = string;

class KanbanHandleEvents extends BaseEventHandle {
  addTask(args: AddTaskArgs) {
    this.emit(Events.KANBAN_TASK_ADD, args);
  }

  editTask(args: EditTaskArgs) {
    this.emit(Events.KANBAN_TASK_EDIT, args);
  }

  deleteTask(args: DeleteTaskArgs) {
    this.emit(Events.KANBAN_TASK_DELETE, args);
  }
}

export { KanbanHandleEvents };
