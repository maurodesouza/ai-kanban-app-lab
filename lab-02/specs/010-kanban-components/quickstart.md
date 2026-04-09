# Quickstart: Kanban Components

**Date**: 2025-06-17  
**Purpose**: Implementation guide for kanban components

## Component Structure

```
src/components/
 organisms/
   kanban/
     index.tsx              # Main composition file
     types.ts               # Type definitions
     store.ts               # Valtio store creation
 molecules/
   kanban-column/
     index.tsx              # Column component
 atoms/
   kanban-task/
     index.tsx              # Task card component
```

## Implementation Steps

### 1. Create Store and Context
- Define KanbanState interface
- Create createKanbanStore function
- Set up React Context provider

### 2. Create Atomic Components
- Kanban.Task card with drag functionality
- Reuse Text components for all text elements

### 3. Create Molecular Components  
- Kanban.Column with header and content
- Task rendering within columns

### 4. Create Organism Composition
- Main Kanban component with all sub-components
- Provider wrapper for state management

## Usage Example

```tsx
import { Kanban } from '@/components/organisms/kanban'

function App() {
  return (
    <Kanban.Provider>
      <Kanban.Container>
        <Kanban.Header>
          <Kanban.Title>AI Todo App</Kanban.Title>
          <Kanban.Filter />
        </Kanban.Header>
        <Kanban.Content>
          <Kanban.Columns 
            render={(column) => (
              <Kanban.Column.Container>
                <Kanban.Column.Header>
                  <Kanban.Column.Title>{column.title}</Kanban.Column.Title>
                </Kanban.Column.Header>
                <Kanban.Column.Content>
                  <Kanban.Tasks 
                    columnId={column.id}
                    render={(task) => (
                      <Kanban.Task.Container>
                        <Kanban.Task.Title>{task.title}</Kanban.Task.Title>
                      </Kanban.Task.Container>
                    )}
                  />
                </Kanban.Column.Content>
              </Kanban.Column.Container>
            )}
          />
        </Kanban.Content>
      </Kanban.Container>
    </Kanban.Provider>
  )
}
```

## Key Implementation Notes

### State Access Pattern
```tsx
// Only Columns and Tasks components access context
const useKanbanState = () => {
  const state = useContext(KanbanContext)
  return useSnapshot(state)
}
```

### Text Component Reuse
```tsx
// All text elements use existing Text atom
<Kanban.Column.Title>
  <Text.Heading>{column.title}</Text.Heading>
</Kanban.Column.Title>

<Kanban.Task.Title>
  <Text.Paragraph>{task.title}</Text.Paragraph>
</Kanban.Task.Title>
```

### Styling Strategy
- Use `tv` for Kanban.Task variants (priority-based styling)
- Use `twx` for structural components
- Follow token-based styling system

### Drag and Drop
- HTML5 Drag and Drop API
- Update task columnId on drop
- Visual feedback during drag operations
