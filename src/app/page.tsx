'use client';

import React from 'react';
import { KanbanBoard } from '@/components/organisms/Kanban';
import { FilterInput } from '@/components/molecules/Filter';
import { AddTaskButton } from '@/components/atoms/Button';

export default function Home() {
  const [filterValue, setFilterValue] = React.useState('');

  return (
    <main className="min-h-screen bg-background-base">
      <div className="container mx-auto max-w-7xl p-4">
        <KanbanBoard.Component>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <FilterInput.Component
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
              placeholder="Filter tasks..."
              size="default"
            />
            <AddTaskButton.Component />
          </div>
        </KanbanBoard.Component>
      </div>
    </main>
  );
}
