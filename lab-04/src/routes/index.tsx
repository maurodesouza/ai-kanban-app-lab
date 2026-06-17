import { createFileRoute } from '@tanstack/react-router'
import { Kanban } from '@/components/organisms/kanban'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="h-screen">
      <Kanban />
    </div>
  )
}
