export enum Events {
  // Modal Events
  MODAL_SHOW = 'modal.show',
  MODAL_HIDE = 'modal.hide',

  // Kanban Events
  KANBAN_FILTER = 'kanban.filter',
  KANBAN_TASK_CREATE = 'kanban.task.create',
  KANBAN_TASK_UPDATE = 'kanban.task.update',
  KANBAN_TASK_DELETE = 'kanban.task.delete',
  KANBAN_TASK_MOVE = 'kanban.task.move',
  KANBAN_COLUMN_CREATE = 'kanban.column.create',
  KANBAN_COLUMN_UPDATE = 'kanban.column.update',
  KANBAN_COLUMN_DELETE = 'kanban.column.delete',
  KANBAN_COLUMN_MOVE = 'kanban.column.move',
  KANBAN_COLUMN_MOVE_LEFT = 'kanban.column.move.left',
  KANBAN_COLUMN_MOVE_RIGHT = 'kanban.column.move.right',

  // Notification Events
  NOTIFICATION_SUCCESS = 'notification.success',
  NOTIFICATION_ERROR = 'notification.error',
  NOTIFICATION_INFO = 'notification.info',
  NOTIFICATION_WARNING = 'notification.warning',

  // Theme Events
  THEME_TOGGLE = 'theme.toggle',
  THEME_SET = 'theme.set',
  THEME_NEXT = 'theme.next',
}
