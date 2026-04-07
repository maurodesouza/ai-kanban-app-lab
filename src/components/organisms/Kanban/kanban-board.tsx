import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";
import { KanbanColumn } from "./kanban-column";
import { TaskStatus } from "@/types/task";

const kanbanBoardVariants = tv({
  base: "flex gap-4 p-4 overflow-x-auto min-h-[600px]",
  variants: {
    responsive: {
      true: "flex-col lg:flex-row",
      false: "flex-row",
    },
  },
  defaultVariants: {
    responsive: true,
  },
});

type KanbanBoardProps = React.ComponentProps<"div"> &
  VariantProps<typeof kanbanBoardVariants>;

const Root = twx.div`
  flex flex-col h-full
`;

const Title = twx.h1`
  text-2xl font-bold text-foreground
`;

const Columns = twx.div`
  flex gap-4 p-4 overflow-x-auto min-h-[500px] flex-1
`;

const columns = [
  { id: TaskStatus.TODO, title: "TODO", status: TaskStatus.TODO },
  { id: TaskStatus.IN_PROGRESS, title: "IN PROGRESS", status: TaskStatus.IN_PROGRESS },
  { id: TaskStatus.DONE, title: "DONE", status: TaskStatus.DONE },
];

function KanbanBoardComponent({ 
  children, 
  className,
  responsive = true,
  ...props 
}: KanbanBoardProps) {
  return (
    <Root className={className} {...props}>
      {children}
      <Columns className={kanbanBoardVariants({ responsive })}>
        {columns.map((column) => (
          <KanbanColumn.Component
            key={column.id}
            title={column.title}
            status={column.status}
            taskCount={0}
            className="flex-shrink-0"
          />
        ))}
      </Columns>
    </Root>
  );
}

export const KanbanBoard = {
  Root,
  Title,
  Columns,
  Component: KanbanBoardComponent,
};
