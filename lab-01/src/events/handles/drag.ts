import { BaseEventHandle } from './base';
import { Events } from '@/types/events';

export interface DragStartEvent {
  taskId: string;
  sourceStatus: string;
}

export interface DragEndEvent {
  taskId: string;
  sourceStatus: string;
  targetStatus: string;
}

export interface DragDropEvent {
  taskId: string;
  sourceStatus: string;
  targetStatus: string;
}

export class DragHandleEvents extends BaseEventHandle {
  start(data: DragStartEvent) {
    this.emit(Events.DRAG_START, data);
  }

  end(data: DragEndEvent) {
    this.emit(Events.DRAG_END, data);
  }

  drop(data: DragDropEvent) {
    this.emit(Events.DRAG_DROP, data);
  }
}
