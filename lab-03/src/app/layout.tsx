import type { Metadata } from 'next';

import '@/styles/global.css';

import { ModalHandler } from '@/components/handlers/modal';
import { KanbanHandler } from '@/components/handlers/kanban';

export const metadata: Metadata = {
  title: 'AI Todo App Lab 03',
  description: 'AI Todo App Lab 03',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen">
      <body className="theme-dark h-screen base-1">
        <ModalHandler />
        <KanbanHandler />
        {children}
      </body>
    </html>
  );
}
