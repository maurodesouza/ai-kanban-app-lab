import { Events } from '@/types/events';

class BaseEventHandle {
  protected emit(event: Events, payload?: unknown) {  
    console.info(`events[emit]: ${event}`, payload);

    const customEvent = new CustomEvent(event, { detail: payload });
    document.dispatchEvent(customEvent);
  }
}

export { BaseEventHandle };
