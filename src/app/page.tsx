'use client';

import { PlusIcon } from 'lucide-react';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';
import { KanbanBoard } from '@/components/organisms/Kanban';

export default function Home() {
  return (
    <main className="min-h-screen bg-background-base">
      <div className="container mx-auto max-w-7xl p-4">
        <KanbanBoard.Component>
          <KanbanBoard.Title>Kanban Board</KanbanBoard.Title>
          <Clickable.Button onClick={() => events.modal.open({ modal: ModalsEnum.TASK })}>
            <PlusIcon />
            Adicionar Task
          </Clickable.Button>
        </KanbanBoard.Component>
      </div>
    </main>
  );
}
