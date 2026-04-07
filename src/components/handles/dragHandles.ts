import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { events } from '@/events'

export interface DragData {
  taskId: string
  sourceStatus: string
}

export function useDragHandle(taskId: string, status: string) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: taskId,
    data: {
      taskId,
      sourceStatus: status,
    } as DragData,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  }
}

export function useDropHandle(status: string) {
  return {
    onDragStart: (data: DragData) => {
      events.drag.start({
        taskId: data.taskId,
        sourceStatus: data.sourceStatus,
      })
    },
    onDragEnd: (data: DragData, targetStatus: string) => {
      events.drag.end({
        taskId: data.taskId,
        sourceStatus: data.sourceStatus,
        targetStatus,
      })
      
      if (data.sourceStatus !== targetStatus) {
        events.drag.drop({
          taskId: data.taskId,
          sourceStatus: data.sourceStatus,
          targetStatus,
        })
      }
    },
  }
}
