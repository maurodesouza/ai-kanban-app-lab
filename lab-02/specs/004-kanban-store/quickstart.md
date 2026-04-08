# Quickstart: Kanban Store

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the Kanban Store

## Usage

### Import the Types

```typescript
import type { KanbanTask, KanbanColumn, Kanban } from '@/types/kanban';
```

### Import the Store

```typescript
import { createKanbanStore } from '@/stores/kanban';
```

### Create Store Instance

```typescript
// Create a new kanban store
const kanbanStore = createKanbanStore();

// Initialize with data
kanbanStore.id = "kanban-1";
kanbanStore.title = "My Kanban Board";
```

### Add Tasks and Columns

```typescript
// Add a column
kanbanStore.columns["column-1"] = {
  id: "column-1",
  kanbanId: "kanban-1",
  title: "To Do",
  tasksId: []
};

// Add a task
kanbanStore.tasks["task-1"] = {
  id: "task-1",
  title: "Sample Task",
  description: "Task description",
  dueDate: "2025-04-15",
  kanbanId: "kanban-1",
  columnId: "column-1",
  createdAt: "2025-04-08T10:00:00Z",
  updatedAt: "2025-04-08T10:00:00Z"
};

// Update column to include task
kanbanStore.columns["column-1"].tasksId.push("task-1");
```

### Access Computed Properties

```typescript
// Access computed column-task relationships
const columnTasks = kanbanStore.$columnIdsWithTasks;
console.log(columnTasks["column-1"]["task-1"]); // Task object
```

## File Structure

```
src/
|-- types/
|   `-- kanban.ts          # KanbanTask, KanbanColumn, Kanban types
|-- stores/
|   `-- kanban/
|       `-- index.ts       # createKanbanStore function
```

## Implementation Notes

- Uses valtio proxy for reactive state management
- Computed properties automatically update when columns or tasks change
- Store is initialized empty and populated programmatically
- All state modifications are reactive and trigger updates

## Best Practices

- Use type imports for type-only imports
- Modify state directly through the proxy object
- Access computed properties for derived data
- Store follows immutable update patterns through valtio
