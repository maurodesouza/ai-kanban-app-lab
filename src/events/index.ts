import type { AppEvent, EventHandler } from '@/types/events';

type EventMap = {
  [K in AppEvent['type']]: AppEvent & { type: K };
};

class EventBus {
  private listeners: { [K in keyof EventMap]?: EventHandler<EventMap[K]>[] } = {};

  on<K extends keyof EventMap>(eventType: K, handler: EventHandler<EventMap[K]>) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType]!.push(handler as EventHandler);
  }

  off<K extends keyof EventMap>(eventType: K, handler: EventHandler<EventMap[K]>) {
    const handlers = this.listeners[eventType];
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<K extends keyof EventMap>(event: EventMap[K]) {
    const handlers = this.listeners[event.type];
    if (handlers) {
      handlers.forEach(handler => handler(event as AppEvent));
    }
  }

  once<K extends keyof EventMap>(eventType: K, handler: EventHandler<EventMap[K]>) {
    const onceHandler = (event: EventMap[K]) => {
      handler(event);
      this.off(eventType, onceHandler);
    };
    this.on(eventType, onceHandler);
  }

  clear() {
    this.listeners = {};
  }

  getListenerCount<K extends keyof EventMap>(eventType: K): number {
    return this.listeners[eventType]?.length || 0;
  }
}

export const eventBus = new EventBus();
export default eventBus;
