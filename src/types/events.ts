export type BaseEvent = {
  timestamp: string;
};

export type TaskCreateEvent = BaseEvent & {
  type: 'task:create';
  data: {
    title: string;
    description?: string;
    dueDate?: string;
  };
};

export type TaskUpdateEvent = BaseEvent & {
  type: 'task:update';
  taskId: string;
  data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    status: string;
    order: number;
  }>;
};

export type TaskDeleteEvent = BaseEvent & {
  type: 'task:delete';
  taskId: string;
};

export type ModalEvent = BaseEvent & {
  type: 'modal:open' | 'modal:close';
  modalType: 'task' | 'confirm';
  data?: any;
};

export type FilterEvent = BaseEvent & {
  type: 'filter:update';
  query: string;
};

export type DragEvent = BaseEvent & {
  type: 'drag:start' | 'drag:end' | 'drag:drop';
  taskId: string;
  sourceStatus: string;
  targetStatus?: string;
};

export type AppEvent = 
  | TaskCreateEvent
  | TaskUpdateEvent
  | TaskDeleteEvent
  | ModalEvent
  | FilterEvent
  | DragEvent;

export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => void;
