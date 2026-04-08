# Data Model: Kanban Store

**Created**: 2025-04-08  
**Purpose**: Define data structures and entities for kanban store

## Key Entities

### KanbanTask

**Description**: Individual task items that move between columns  
**Attributes**:
- id: string (unique identifier)
- title: string (task title)
- description: string (task description)
- dueDate: string (task due date)
- kanbanId: string (reference to parent kanban)
- columnId: string (reference to current column)
- createdAt: string (creation timestamp)
- updatedAt: string (last update timestamp)

### KanbanColumn

**Description**: Vertical sections within boards that hold cards  
**Attributes**:
- id: string (unique identifier)
- kanbanId: string (reference to parent kanban)
- title: string (column title)
- tasksId: string[] (array of task IDs)

### Kanban

**Description**: Container for columns and cards with title and metadata  
**Attributes**:
- id: string (unique identifier)
- title: string (board title)
- columns: Record<string, KanbanColumn> (map of column ID to column)
- tasks: Record<string, KanbanTask> (map of task ID to task)

### KanbanStoreState

**Description**: Enhanced kanban with computed properties  
**Attributes**:
- All Kanban attributes
- $columnIdsWithTasks: Record<string, Record<string, KanbanTask>> (computed property mapping columns to tasks)

## Data Relationships

- Kanban has many KanbanColumns (1:N)
- Kanban has many KanbanTasks (1:N)
- KanbanColumn belongs to Kanban (N:1)
- KanbanTask belongs to Kanban (N:1)
- KanbanTask belongs to KanbanColumn (N:1)

## Validation Rules

- All entities must have valid string IDs
- KanbanColumn.tasksId must reference existing KanbanTask IDs
- KanbanTask.kanbanId and columnId must reference existing entities
- Computed properties must be updated when columns or tasks change

## State Management

- Uses valtio proxy for reactive state management
- Computed properties updated via subscription pattern
- Subscribe to changes in columns and tasks to trigger updates
