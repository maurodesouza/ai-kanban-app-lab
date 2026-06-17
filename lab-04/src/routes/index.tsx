import { createFileRoute } from '@tanstack/react-router'
import { Kanban } from '@/components/organisms/kanban'
import { ThemeToggle } from '@/components/molecules/theme-toggle'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="h-screen p-lg">
      <div className="flex justify-end mb-md">
        <ThemeToggle />
      </div>
      <Kanban />
    </div>
  )
}
