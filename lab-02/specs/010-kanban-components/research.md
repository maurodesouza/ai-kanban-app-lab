# Research Findings: Kanban Components

**Date**: 2025-06-17  
**Purpose**: Resolve technical unknowns for kanban components implementation

## Valtio + React Context Pattern

**Decision**: Use Valtio proxy with useRef and React Context for state management  
**Rationale**: This pattern isolates state to React lifecycle while providing reactive updates through useSnapshot

**Implementation Pattern**:
```tsx
import { createContext, useContext, useRef } from 'react'
import { proxy, useSnapshot } from 'valtio'

const KanbanContext = createContext()

const KanbanProvider = ({ children }) => {
  const state = useRef(proxy(kanbanInitialState)).current
  return <KanbanContext.Provider value={state}>{children}</KanbanContext.Provider>
}

const useKanbanState = () => {
  const state = useContext(KanbanContext)
  return useSnapshot(state)
}
```

**Alternatives considered**: 
- Direct Valtio store without Context (global state)
- Zustand with React Context (more complex setup)

## Component Architecture

**Decision**: Atomic Design structure with strict composition pattern  
**Rationale**: Matches existing project structure and user requirements

**Structure**:
- `organisms/kanban/` - Main kanban board composition
- `molecules/kanban-column/` - Column with tasks  
- `atoms/kanban-task/` - Individual task card
- `atoms/text/` - Reuse existing text components

## Styling Strategy

**Decision**: tailwind-variants (tv) for components with variants, twx for static components  
**Rationale**: Follows existing project patterns and component styling strategy

**Implementation**:
- Use `tv` for Kanban.Task (variants for priority/status)
- Use `twx` for structural components (Container, Header, Content)
- Reuse existing `Text` components for all text elements

## Data Structure

**Decision**: Proxy state with columns and tasks arrays  
**Rationale**: Simple, direct structure matching specification requirements

**Initial State Shape**:
```tsx
{
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ],
  tasks: [
    { id: '1', title: 'Task 1', columnId: 'todo', priority: 'medium' }
  ]
}
```

## Drag and Drop Implementation

**Decision**: HTML5 Drag and Drop API  
**Rationale**: Native browser support, matches specification assumptions  
**Constraints**: Touch device support out of scope (per specification)

## Integration Points

**Existing Components**: Reuse `Text` atom from `@/components/atoms/text`  
**Styling System**: Use existing token-based styling with `base-*`, `tone`, `palette-*`  
**State Management**: Valtio with React Context pattern
