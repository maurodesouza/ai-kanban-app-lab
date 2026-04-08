import { Events } from '@/types/events';
import { BaseEventHandle } from './base';

type OpenModalArgs = {
  modal: string;
};

class ModalHandleEvents extends BaseEventHandle {
  open(args: OpenModalArgs) {
    this.emit(Events.MODAL_OPEN, args);
  }

  close() {
    this.emit(Events.MODAL_CLOSE);
  }
}

export { ModalHandleEvents };
