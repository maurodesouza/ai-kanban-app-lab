import { Events } from '@/types/events';
import { Handles } from './handles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (args: any) => void;
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
