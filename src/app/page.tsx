'use client';

import React from 'react';
import { KanbanBoard } from '@/components/organisms/Kanban';
import { events } from '@/events/modal';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';

const Icon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background-base">
      <div className="container mx-auto max-w-7xl p-4">
        <KanbanBoard.Component>
          <KanbanBoard.Title>Kanban Board</KanbanBoard.Title>
          <Clickable.Button onClick={() => events.modal.open(ModalsEnum.TASK)}>
            <Icon />
            Adicionar Task
          </Clickable.Button>
        </KanbanBoard.Component>
      </div>
    </main>
  );
}
