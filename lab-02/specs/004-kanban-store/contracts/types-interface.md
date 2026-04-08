# Kanban Types Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for kanban types

## Export Interface

The types package exports TypeScript interfaces for kanban entities:

### KanbanTask

**Description**: Individual task items that move between columns  
**Properties**:
- id: string
- title: string
- description: string
- dueDate: string
- kanbanId: string
- columnId: string
- createdAt: string
- updatedAt: string

### KanbanColumn

**Description**: Vertical sections within boards that hold cards  
**Properties**:
- id: string
- kanbanId: string
- title: string
- tasksId: string[]

### Kanban

**Description**: Container for columns and cards with title and metadata  
**Properties**:
- id: string
- title: string
- columns: Record<string, KanbanColumn>
- tasks: Record<string, KanbanTask>

## Import Contract

```typescript
import type { KanbanTask, KanbanColumn, Kanban } from '@/types/kanban';
```

## Usage Contract

```typescript
// Type definitions for kanban entities
const task: KanbanTask = {
  id: "task-1",
  title: "Sample Task",
  description: "Task description",
  dueDate: "2025-04-15",
  kanbanId: "kanban-1",
  columnId: "column-1",
  createdAt: "2025-04-08T10:00:00Z",
  updatedAt: "2025-04-08T10:00:00Z"
};
```

## Implementation Constraints

- Types must be exported from src/types/kanban.ts
- Must follow user-provided exact type definitions
- No additional properties or methods allowed
- Must use Record<string, T> for collections
