'use client';

import { PlusIcon } from 'lucide-react';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { Kanban } from '@/components/organisms/kanban';
import { TaskModal } from '@/components/organisms/Task/TaskModal';

export default function Home() {
  return (
    <>
      <Kanban.Root>
        <Kanban.Header>
          <Text.Heading as="h1" className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Kanban Board
          </Text.Heading>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Kanban.Filter />
            <Clickable.Button 
              onClick={() => events.modal.open({ modal: ModalsEnum.TASK })}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-sm sm:text-base"
              aria-label="Adicionar nova tarefa"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Adicionar Task</span>
              <span className="sm:hidden">Adicionar</span>
            </Clickable.Button>
          </div>
        </Kanban.Header>
        <Kanban.Columns render={({ column }) => <Kanban.Column column={column} />} />
      </Kanban.Root>
      <TaskModal.Component />
    </>
  );
}
