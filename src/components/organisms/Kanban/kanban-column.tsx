import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";
import { TaskStatus } from "@/types/task";

const kanbanColumnVariants = tv({
  base: "flex flex-col min-w-[300px] max-w-[300px] bg-background-support rounded-lg border border-tone-contrast-300",
  variants: {
    status: {
      [TaskStatus.TODO]: "palette-brand",
      [TaskStatus.IN_PROGRESS]: "palette-warning", 
      [TaskStatus.DONE]: "palette-success",
    },
  },
});

type KanbanColumnProps = React.ComponentProps<"div"> &
  VariantProps<typeof kanbanColumnVariants> & {
    title: string;
    status: TaskStatus;
    taskCount?: number;
  };

const Root = twx.div`
  flex flex-col h-full
`;

const Header = twx.div`
  flex items-center justify-between p-4 border-b border-tone-contrast-300
`;

const Title = twx.h3`
  text-lg font-semibold text-foreground
`;

const TaskCount = twx.span`
  text-sm text-foreground-min bg-background-support px-2 py-1 rounded-full
`;

const Content = twx.div`
  flex-1 p-4 space-y-2 overflow-y-auto min-h-[200px]
`;

const EmptyState = twx.div`
  flex flex-col items-center justify-center h-32 text-foreground-min
`;

function KanbanColumnComponent({ 
  title, 
  status, 
  taskCount = 0, 
  children, 
  className,
  ...props 
}: KanbanColumnProps) {
  return (
    <Root className={className}>
      <Header>
        <Title>{title}</Title>
        <TaskCount>{taskCount}</TaskCount>
      </Header>
      <Content>
        {taskCount === 0 ? (
          <EmptyState>
            <div className="text-4xl mb-2">+</div>
            <div className="text-sm">No tasks yet</div>
          </EmptyState>
        ) : (
          children
        )}
      </Content>
    </Root>
  );
}

export const KanbanColumn = {
  Root,
  Header,
  Title,
  TaskCount,
  Content,
  EmptyState,
  Component: KanbanColumnComponent,
};
