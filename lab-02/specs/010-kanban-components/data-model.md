# Data Model: Kanban Components

**Date**: 2025-06-17  
**Purpose**: Define data structures for kanban board implementation

## Core Entities

### Column
```tsx
interface Column {
  id: string
  title: string
}
```

### Task
```tsx
interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  columnId: string
}
```

### Kanban State
```tsx
interface KanbanState {
  columns: Column[]
  tasks: Task[]
}
```

## State Operations

### Task Movement
- Update task `columnId` when moved between columns
- Maintain task order within columns (implicit by array position)

### Task Updates
- Inline editing of title and description
- Priority updates through task card interface

## Validation Rules

### Column Validation
- Column ID must be unique
- Column title must be non-empty string

### Task Validation  
- Task ID must be unique
- Task title must be non-empty string
- Task columnId must reference existing column
- Task priority must be one of: 'low', 'medium', 'high'

## Initial State

```tsx
const initialKanbanState: KanbanState = {
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'progress', title: 'In Progress' }, 
    { id: 'done', title: 'Done' }
  ],
  tasks: []
}
```

## State Transitions

### Task Movement
```
Task.columnId: 'todo' -> 'progress' -> 'done'
```

### Task Updates
```
Task.title: string -> string (inline edit)
Task.description: string | undefined -> string | undefined (inline edit)
Task.priority: 'low' | 'medium' | 'high' -> 'low' | 'medium' | 'high'
```

## Component Data Flow

### Kanban.Provider
- Creates and provides Valtio proxy state
- Wraps entire kanban board

### Kanban.Columns  
- Consumes context to get columns array
- Renders column containers

### Kanban.Tasks
- Consumes context to get tasks filtered by columnId
- Renders task cards for specific column

### Task Components
- Consume context for state updates
- Handle drag events and inline editing
