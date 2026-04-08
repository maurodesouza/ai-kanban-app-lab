import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { Renderable } from '@/types/helpers';

type ShowModalArgs = Renderable | null;

class ModalHandleEvents extends BaseEventHandle {
  show(args: ShowModalArgs) {
    this.emit(Events.MODAL_SHOW, args);
  }

  hide() {
    this.emit(Events.MODAL_HIDE);
  }
}

export { ModalHandleEvents };
