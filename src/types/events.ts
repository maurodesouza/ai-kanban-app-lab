export enum Events {
  KAMBAN_CREATE_TASK = 'kamban.task.create',
  KAMBAN_UPDATE_TASK = 'kamban.task.update',
  KAMBAN_DELETE_TASK = 'kamban.task.delete',
  KAMBAN_MOVE_TASK = 'kamban.task.move',
  KAMBAN_REORDER_TASKS = 'kamban.tasks.reorder',
  KAMBAN_DUPLICATE_TASK = 'kamban.task.duplicate',
  KAMBAN_CLEAR_TASKS = 'kamban.tasks.clear',
  KAMBAN_MOVE_TASK_UP = 'kamban.task.move.up',
  KAMBAN_MOVE_TASK_DOWN = 'kamban.task.move.down',

  // Modal
  MODAL_OPEN = 'modal.open',
  MODAL_CLOSE = 'modal.close',
}

export enum ModalsEnum {
  TASK = 'task',
  FILTER = 'filter',
}

