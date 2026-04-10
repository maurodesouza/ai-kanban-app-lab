import { KanbanHandleEvents } from './kanban';
import { ModalHandleEvents } from './modal';
import { NotificationHandleEvents } from './notification';
import { ThemeHandleEvents } from './theme';

class Handles {
  kanban = new KanbanHandleEvents();
  modal = new ModalHandleEvents();
  notification = new NotificationHandleEvents();
  theme = new ThemeHandleEvents();
}

export { Handles };
