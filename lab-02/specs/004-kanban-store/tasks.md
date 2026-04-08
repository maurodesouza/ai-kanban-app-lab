---

description: "Task list template for feature implementation"
---

# Tasks: Kanban Store

**Input**: Design documents from `/specs/004-kanban-store/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. When included, tests must focus only on core functionality validation. No performance testing, benchmarking, or extensive edge case testing is permitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create src/types directory structure per implementation plan
- [x] T002 Create src/stores/kanban directory structure per implementation plan
- [x] T003 [P] Add valtio dependency to package.json
- [x] T004 [P] Verify TypeScript configuration supports type definitions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Enable valtio unstable_op globally in project
- [x] T006 [P] Verify src/types/ directory exists and is accessible
- [x] T007 [P] Verify src/stores/kanban/ directory exists and is accessible

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Kanban Store (Priority: P1) MVP

**Goal**: Create TypeScript types for kanban entities and implement a valtio-based store with createKanbanStore function.

**Independent Test**: Can be fully tested by creating the store and verifying it can store, retrieve, and manage kanban data structures correctly.

### Implementation for User Story 1

- [x] T008 [US1] Create KanbanTask type in src/types/kanban.ts
- [x] T009 [US1] Create KanbanColumn type in src/types/kanban.ts
- [x] T010 [US1] Create Kanban type in src/types/kanban.ts
- [x] T011 [US1] Export all kanban types from src/types/kanban.ts
- [x] T012 [US1] Create createKanbanStore function in src/stores/kanban/index.ts
- [x] T013 [US1] Implement valtio proxy state in createKanbanStore
- [x] T014 [US1] Implement compute$columnIdsWithTasks function
- [x] T015 [US1] Implement subscribe pattern for computed properties
- [x] T016 [US1] Export createKanbanStore from src/stores/kanban/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Manage Kanban Operations (Priority: P2)

**Goal**: User needs to perform kanban operations like creating boards, adding columns, and moving cards between columns through the store interface.

**Independent Test**: Can be fully tested by implementing store operations and verifying data consistency.

### Implementation for User Story 2

- [ ] T017 [US2] Add basic CRUD operations to store interface
- [ ] T018 [US2] Implement board creation functionality
- [ ] T019 [US2] Implement column management functionality
- [ ] T020 [US2] Implement task movement between columns
- [ ] T021 [US2] Ensure data relationship consistency

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T022 Verify kanban types can be imported successfully
- [x] T023 Verify createKanbanStore can be imported successfully
- [x] T024 Test basic store functionality with sample data
- [x] T025 Verify computed properties update correctly
- [x] T026 Ensure compliance with user requirements (valtio, exact types)
- [x] T027 Clean up any temporary test files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1, P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on User Story 1 completion

### Within Each User Story

- Types must be created before store implementation
- Store implementation before operations
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Type creation tasks within User Story 1 can run in parallel
- Store implementation tasks within User Story 1 have dependencies

---

## Parallel Example: User Story 1

```bash
# Launch all type creation tasks together:
Task: "Create KanbanTask type in src/types/kanban.ts"
Task: "Create KanbanColumn type in src/types/kanban.ts"
Task: "Create Kanban type in src/types/kanban.ts"

# Then run store implementation tasks:
Task: "Create createKanbanStore function in src/stores/kanban/index.ts"
Task: "Implement valtio proxy state in createKanbanStore"
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
4. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
