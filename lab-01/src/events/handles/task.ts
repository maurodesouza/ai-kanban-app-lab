import { BaseEventHandle } from './base';
import { Events, ModalsEnum } from '@/types/events';
import { Task, TaskStatus } from '@/types/task';

export interface TaskCreateEvent {
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
}

export interface TaskUpdateEvent {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}

export interface TaskDeleteEvent {
  id: string;
}

export class TaskHandleEvents extends BaseEventHandle {
  // Task creation events
  static create(data: TaskCreateEvent) {
    const instance = new TaskHandleEvents();
    instance.emit(Events.KAMBAN_CREATE_TASK, data);
  }

  static onTaskCreate(callback: (data: TaskCreateEvent) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<TaskCreateEvent>;
      callback(customEvent.detail);
    };
    document.addEventListener(Events.KAMBAN_CREATE_TASK, handler as EventListener);
    return handler;
  }

  static offTaskCreate(handler: EventListener) {
    document.removeEventListener(Events.KAMBAN_CREATE_TASK, handler);
  }

  // Task update events
  static update(data: TaskUpdateEvent) {
    const instance = new TaskHandleEvents();
    instance.emit(Events.KAMBAN_UPDATE_TASK, data);
  }

  static onTaskUpdate(callback: (data: TaskUpdateEvent) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<TaskUpdateEvent>;
      callback(customEvent.detail);
    };
    document.addEventListener(Events.KAMBAN_UPDATE_TASK, handler as EventListener);
    return handler;
  }

  static offTaskUpdate(handler: EventListener) {
    document.removeEventListener(Events.KAMBAN_UPDATE_TASK, handler);
  }

  // Task delete events
  static delete(data: TaskDeleteEvent) {
    const instance = new TaskHandleEvents();
    instance.emit(Events.KAMBAN_DELETE_TASK, data);
  }

  static onTaskDelete(callback: (data: TaskDeleteEvent) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<TaskDeleteEvent>;
      callback(customEvent.detail);
    };
    document.addEventListener(Events.KAMBAN_DELETE_TASK, handler as EventListener);
    return handler;
  }

  static offTaskDelete(handler: EventListener) {
    document.removeEventListener(Events.KAMBAN_DELETE_TASK, handler);
  }

  // Task move events (for drag and drop)
  static move(data: { id: string; newStatus: TaskStatus; oldStatus: TaskStatus }) {
    const instance = new TaskHandleEvents();
    instance.emit(Events.KAMBAN_MOVE_TASK, data);
  }

  static onTaskMove(callback: (data: { id: string; newStatus: TaskStatus; oldStatus: TaskStatus }) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; newStatus: TaskStatus; oldStatus: TaskStatus }>;
      callback(customEvent.detail);
    };
    document.addEventListener(Events.KAMBAN_MOVE_TASK, handler as EventListener);
    return handler;
  }

  static offTaskMove(handler: EventListener) {
    document.removeEventListener(Events.KAMBAN_MOVE_TASK, handler);
  }
}
