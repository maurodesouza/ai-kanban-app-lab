import type { AppEvent, EventHandler } from '@/types/events';
import { eventBus } from '../index';

export abstract class BaseEventHandle {
  protected eventBus = eventBus;

  protected on<K extends AppEvent['type']>(
    eventType: K,
    handler: EventHandler<AppEvent & { type: K }>
  ) {
    this.eventBus.on(eventType, handler);
  }

  protected off<K extends AppEvent['type']>(
    eventType: K,
    handler: EventHandler<AppEvent & { type: K }>
  ) {
    this.eventBus.off(eventType, handler);
  }

  protected emit(event: AppEvent) {
    this.eventBus.emit(event);
  }

  protected once<K extends AppEvent['type']>(
    eventType: K,
    handler: EventHandler<AppEvent & { type: K }>
  ) {
    this.eventBus.once(eventType, handler);
  }

  abstract initialize(): void;
  abstract destroy(): void;
}
