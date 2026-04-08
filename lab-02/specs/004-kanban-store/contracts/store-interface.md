# Kanban Store Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for kanban store

## Export Interface

The store package exports a createKanbanStore function:

### createKanbanStore()

**Description**: Creates a new kanban store instance with valtio proxy  
**Returns**: KanbanStoreState proxy object  
**State Structure**:
- id: string
- title: string
- columns: Record<string, KanbanColumn>
- tasks: Record<string, KanbanTask>
- $columnIdsWithTasks: Record<string, Record<string, KanbanTask>> (computed)

## Import Contract

```typescript
import { createKanbanStore } from '@/stores/kanban';
```

## Usage Contract

```typescript
// Create store instance
const kanbanStore = createKanbanStore();

// Access state
console.log(kanbanStore.title);
console.log(kanbanStore.columns);
console.log(kanbanStore.tasks);
console.log(kanbanStore.$columnIdsWithTasks);

// Modify state (through valtio proxy)
kanbanStore.title = "New Board Title";
kanbanStore.tasks["task-1"] = { ...taskData };
```

## Implementation Constraints

- Must use valtio proxy for state management
- Must implement subscribe pattern for computed properties
- Must follow user-provided createKanbanStore function signature
- Must enable unstable_op globally
- Computed properties must update when columns or tasks change
