import type { Metadata } from 'next'
import { DndContext, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import '@/styles/globals.css'
import '@/styles/theme.css'

function DndProviderWrapper({ children }: { children: React.ReactNode }) {
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

export const metadata: Metadata = {
  title: 'Kanban Todo App',
  description: 'A mobile-first kanban todo application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="theme-dark base-1">
        <DndProviderWrapper>
          {children}
        </DndProviderWrapper>
      </body>
    </html>
  )
}
