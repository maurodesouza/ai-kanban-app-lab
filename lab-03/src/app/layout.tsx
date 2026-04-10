import type { Metadata } from 'next';

import '@/styles/global.css';

import { ModalHandler } from '@/components/handlers/modal';
import { KanbanHandler } from '@/components/handlers/kanban';
import { NotificationHandler } from '@/components/handlers/notification';
import { ThemeHandler } from '@/components/handlers/theme';
import { getThemeClassName } from '@/utils/get-server-theme';

export const metadata: Metadata = {
  title: 'AI Todo App Lab 03',
  description: 'AI Todo App Lab 03',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeClassName = await getThemeClassName();

  return (
    <html lang="en" className="h-screen">
      <body className={`h-screen base-1 ${themeClassName}`}>
        <ThemeHandler />
        <ModalHandler />
        <KanbanHandler />
        <NotificationHandler />
        {children}
      </body>
    </html>
  );
}
