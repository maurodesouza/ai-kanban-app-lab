import { ModalHandleEvents } from './modal';
import { NotificationHandleEvents } from './notification';

class Handles {
  modal = new ModalHandleEvents();
  notification = new NotificationHandleEvents();
}

export { Handles };
