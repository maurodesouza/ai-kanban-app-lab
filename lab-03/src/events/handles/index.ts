import { KanbanHandleEvents } from './kanban';
import { ModalHandleEvents } from './modal';

class Handles {
  kanban = new KanbanHandleEvents();
  modal = new ModalHandleEvents();
}

export { Handles };
