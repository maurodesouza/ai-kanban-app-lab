import { KanbanHandleEvents } from './kanban';
import { ModalHandleEvents } from './modal';
import { NotificationHandleEvents } from './notification';

class Handles {
  kanban = new KanbanHandleEvents();
  modal = new ModalHandleEvents();
  notification = new NotificationHandleEvents();
}

export { Handles };
