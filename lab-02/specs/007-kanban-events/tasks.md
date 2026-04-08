---

description: "Task list template for feature implementation"
---

# Tasks: Kanban Events

**Input**: Design documents from `/specs/007-kanban-events/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. When included, tests must focus only on core functionality validation. No performance testing, benchmarking, or extensive edge case testing is permitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify src/events/handles directory structure exists per implementation plan
- [x] T002 [P] Verify existing BaseEventHandle class exists and is accessible
- [x] T003 [P] Verify CustomEvent API is available in target environment
- [x] T004 [P] Verify TypeScript configuration supports event types
- [x] T005 [P] Verify existing kanban types are available for integration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Verify src/events/handles/ directory exists and is accessible
- [x] T007 Verify existing event architecture components are working
- [x] T008 [P] Verify BaseEventHandle import works correctly
- [x] T009 [P] Verify existing kanban types import works correctly

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Kanban Task Events (Priority: P1) MVP

**Goal**: Create an event bus system to emit and listen to kanban task events (add, edit, delete) across the application to enable decoupled kanban state management and allow components to react to task changes.

**Independent Test**: Can be fully tested by creating the kanban event bus and verifying it can emit task events and listeners can receive them correctly.

### Implementation for User Story 1

- [x] T010 [US1] Add kanban task events to Events enum in src/types/events.ts
- [x] T011 [US1] Create AddTaskArgs type in src/events/handles/kanban.ts
- [x] T012 [US1] Create EditTaskArgs type in src/events/handles/kanban.ts
- [x] T013 [US1] Create DeleteTaskArgs type in src/events/handles/kanban.ts
- [x] T014 [US1] Create KanbanHandleEvents class extending BaseEventHandle in src/events/handles/kanban.ts
- [x] T015 [US1] Implement addTask method in KanbanHandleEvents class
- [x] T016 [US1] Implement editTask method in KanbanHandleEvents class
- [x] T017 [US1] Implement deleteTask method in KanbanHandleEvents class
- [x] T018 [US1] Export KanbanHandleEvents from src/events/handles/kanban.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle Kanban Filter Events (Priority: P2)

**Goal**: User needs to interact with kanban filter events through the event bus interface, including emitting filter changes and subscribing to filter state updates.

**Independent Test**: Can be fully tested by implementing filter event subscriptions and verifying components receive filter events correctly.

### Implementation for User Story 2

- [ ] T019 [US2] Add kanban filter event to Events enum in src/types/events.ts
- [ ] T020 [US2] Create FilterArgs type in src/events/handles/kanban.ts
- [ ] T021 [US2] Implement filter method in KanbanHandleEvents class

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Handle Kanban Reorder Events (Priority: P3)

**Goal**: User needs to interact with kanban reorder events through the event bus interface, including emitting task/column reordering and subscribing to reorder state updates.

**Independent Test**: Can be fully tested by implementing reorder event subscriptions and verifying components receive reorder events correctly.

### Implementation for User Story 3

- [ ] T022 [US3] Add kanban reorder event to Events enum in src/types/events.ts
- [ ] T023 [US3] Create ReorderArgs type in src/events/handles/kanban.ts
- [ ] T024 [US3] Implement reorder method in KanbanHandleEvents class

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T025 Verify KanbanHandleEvents can be imported successfully
- [x] T026 Test basic kanban event functionality with sample operations
- [x] T027 Verify kanban.task.add event emission works correctly
- [x] T028 Verify kanban.task.edit event emission works correctly
- [x] T029 Verify kanban.task.delete event emission works correctly
- [ ] T030 Verify kanban.filter event emission works correctly
- [ ] T031 Verify kanban.reorder event emission works correctly
- [x] T032 Ensure compliance with user requirements (BaseEventHandle pattern, CustomEvent API)
- [x] T033 Clean up any temporary test files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1, P2, P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on User Story 1 completion
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on User Story 1 completion

### Within Each User Story

- Event enum updates must be done before class implementation
- Type definitions must be created before class implementation
- Class implementation before method implementation
- Method implementation before export
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Type creation tasks within User Story 1 can run in parallel
- Method implementation tasks within User Story 1 have dependencies

---

## Parallel Example: User Story 1

```bash
# Launch all type creation tasks together:
Task: "Create AddTaskArgs type in src/events/handles/kanban.ts"
Task: "Create EditTaskArgs type in src/events/handles/kanban.ts"
Task: "Create DeleteTaskArgs type in src/events/handles/kanban.ts"

# Then run class implementation tasks:
Task: "Create KanbanHandleEvents class extending BaseEventHandle in src/events/handles/kanban.ts"
Task: "Implement addTask method in KanbanHandleEvents class"
Task: "Implement editTask method in KanbanHandleEvents class"
Task: "Implement deleteTask method in KanbanHandleEvents class"
Task: "Export KanbanHandleEvents from src/events/handles/kanban.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
