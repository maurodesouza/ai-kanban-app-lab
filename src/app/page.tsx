'use client';

import { PlusIcon } from 'lucide-react';

import { events } from '@/events';
import { ModalsEnum } from '@/types/events';

import { Text } from '@/components/atoms/text';
import { Kanban } from '@/components/organisms/kanban';
import { Clickable } from '@/components/atoms/clickable';

export default function Home() {
  return (
    <Kanban.Root>
      <Kanban.Header>
        <Text.Heading as="h1">
          Kanban Board
        </Text.Heading>
        <div className="flex gap-4 items-center">
          <Kanban.Filter />
          <Clickable.Button onClick={() => events.modal.open({ modal: ModalsEnum.TASK })}>
            <PlusIcon />
            Adicionar Task
          </Clickable.Button>
        </div>
      </Kanban.Header>
      <Kanban.Columns render={({ column }) => <Kanban.Column column={column} />} />
    </Kanban.Root>
  );
}
