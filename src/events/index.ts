import { Events } from '@/types/events';
import { ModalHandleEvents, TaskHandleEvents } from './handles';

type Callback = (args: any) => void;
type Event = Events | keyof DocumentEventMap;

class EventsHandle {
  modal = new ModalHandleEvents();
  task = new TaskHandleEvents();

  on(event: Event, callback: Callback) {
    document.addEventListener(event, callback);
  }

  off(event: Event, callback: Callback) {
    document.removeEventListener(event, callback);
  }
}

const events = new EventsHandle();

export { events };
