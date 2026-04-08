import { Events } from '@/types/events';
import { Handles } from './handles';

type Callback = <T>(args: T) => void;
type Event = Events | keyof DocumentEventMap;

class EventsHandle extends Handles {
  on(event: Event, callback: Callback) {
    document.addEventListener(event, callback);
  }

  off(event: Event, callback: Callback) {
    document.removeEventListener(event, callback);
  }
}

const events = new EventsHandle();

export { events };
