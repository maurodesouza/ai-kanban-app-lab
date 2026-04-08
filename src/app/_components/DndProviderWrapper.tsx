"use client"

import { DndContext, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'


export function DndProviderWrapper({ children }: { children: React.ReactNode }) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )

  return (
    <DndContext sensors={sensors}>
      {children}
    </DndContext>
  )
}
