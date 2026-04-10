import { Events } from '@/types/events';
import { BaseEventHandle } from './base';
import type { Renderable } from '@/types/helpers';

export type ShowModalPayload = {
  modal: Renderable;
};

class ModalHandleEvents extends BaseEventHandle {
  show(modal: Renderable) {
    this.emit(Events.MODAL_SHOW, { modal });
  }

  hide() {
    this.emit(Events.MODAL_HIDE);
  }
}

export { ModalHandleEvents };
