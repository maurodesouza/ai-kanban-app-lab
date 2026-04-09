# Research: Task Creation Modal

**Date**: 2026-04-09  
**Purpose**: Research technical decisions for task creation modal implementation

## React Hook Form + Zod Integration

**Decision**: Use react-hook-form with Zod resolver for form validation
**Rationale**: 
- React Hook Form provides optimal performance with minimal re-renders
- Zod provides TypeScript-first schema validation
- Excellent TypeScript inference and type safety
- Well-established pattern in React ecosystem

**Alternatives considered**: 
- Formik + Yup (more verbose, less performant)
- Manual form state management (more boilerplate, error-prone)

## Event-Driven Modal Integration

**Decision**: Use existing event system (events.modal.show/hide, events.kanban.addTask/editTask)
**Rationale**: 
- Maintains consistency with existing architecture
- Modal already integrated in layout with event handlers
- Kanban handlers already implement store updates
- No additional state management needed

**Alternatives considered**: 
- Direct store manipulation (breaks event-driven pattern)
- Context API (adds unnecessary complexity)

## Component Composition Strategy

**Decision**: Use existing atomic components (Dialog, Clickable, Field)
**Rationale**: 
- Maintains design system consistency
- Leverages existing component library
- Follows atomic design principles already established
- Reduces development time and maintains UX consistency

**Alternatives considered**: 
- Custom modal implementation (duplicates existing functionality)
- Third-party modal library (adds dependency, inconsistent styling)

## Form Field Implementation

**Decision**: Use Field component for all form inputs
**Rationale**: 
- Existing component handles styling and validation states
- Consistent with other forms in application
- Built-in error display and accessibility features

**Alternatives considered**: 
- Native HTML inputs (inconsistent styling, more boilerplate)
- Third-party form libraries (unnecessary dependency)

## Column Selection Logic

**Decision**: Fetch columns from kanban store using kanban ID
**Rationale**: 
- Kanban stores contain column data with IDs
- Event system already supports store lookup by ID
- Default to first column as specified in requirements

**Alternatives considered**: 
- Hardcoded column list (not dynamic, breaks with different kanban boards)
- Separate column API call (unnecessary complexity)

## Task ID Generation

**Decision**: Use existing random.id() utility from utils/random
**Rationale**: 
- Already used in kanban store creation
- Consistent ID generation across application
- No additional dependencies needed

**Alternatives considered**: 
- UUID library (unnecessary dependency)
- Timestamp-based IDs (potential collisions)

## Modal Mode Detection

**Decision**: Use task parameter presence to determine edit vs create mode
**Rationale**: 
- Simple boolean logic based on parameter existence
- Clear separation of concerns
- Easy to test and maintain

**Alternatives considered**: 
- Separate modal components (code duplication)
- Mode enum (over-engineering for simple boolean)

## Dependencies Summary

**Required packages**:
- react-hook-form (form management)
- @hookform/resolvers (validation resolver integration)
- zod (schema validation)

**Existing dependencies to leverage**:
- Valtio (state management)
- Event system (modal.show/hide, kanban events)
- Atomic components (Dialog, Clickable, Field)
- Random utility (ID generation)

**No additional architectural patterns needed** - implementation follows existing single-layer approach.
