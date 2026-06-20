import {
  HeadContent,
  Scripts,
  createRootRoute,
  useLoaderData,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import appCss from '@/styles/global.css?url';

import { ModalHandler } from '@/components/handlers/modal';
import { KanbanHandler } from '@/components/handlers/kanban';
import { NotificationHandler } from '@/components/handlers/notification';
import { ThemeHandler } from '@/components/handlers/theme';
import { getThemeClassName } from '@/utils/get-server-theme';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Todo App Lab 05',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  loader: async () => {
    const themeClassName = await getThemeClassName();
    return { themeClassName };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { themeClassName } = useLoaderData({ from: '__root__' });

  return (
    <html lang="en" className="h-screen">
      <head>
        <HeadContent />
      </head>
      <body className={`h-screen base-1 ${themeClassName}`}>
        <ThemeHandler />
        <ModalHandler />
        <KanbanHandler />
        <NotificationHandler />
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
