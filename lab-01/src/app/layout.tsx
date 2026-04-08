import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/theme.css'
import { DndProviderWrapper } from './_components/DndProviderWrapper'

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
