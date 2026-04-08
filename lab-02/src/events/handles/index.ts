import { ModalHandleEvents } from './modal';
import { KanbanHandleEvents } from './kanban';

class Handles {
  modal = new ModalHandleEvents();
  kanban = new KanbanHandleEvents();
}

export { Handles };
