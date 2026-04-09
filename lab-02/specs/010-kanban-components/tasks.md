---

description: "Task list template for feature implementation"
---

# Tasks: Kanban Components

**Input**: Design documents from `/specs/010-kanban-components/`
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

- [ ] T001 Create component directories per Atomic Design structure in src/components/
- [ ] T002 Install Valtio dependency if not already present
- [ ] T003 [P] Verify existing Text components are accessible in src/components/atoms/text/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create type definitions for KanbanState, Column, and Task in src/components/organisms/kanban/types.ts
- [ ] T005 Create Valtio store with initial state in src/components/organisms/kanban/store.ts
- [ ] T006 Create Kanban Context and Provider in src/components/organisms/kanban/store.ts
- [ ] T007 [P] Create useKanbanState hook for context consumption in src/components/organisms/kanban/store.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Kanban Board Display (Priority: P1) 

**Goal**: Display kanban board with columns and task cards

**Independent Test**: Render board with sample data and verify columns and cards appear correctly

### Implementation for User Story 1

- [ ] T008 [US1] Create Kanban.Task atom component in src/components/atoms/kanban-task/index.tsx
- [ ] T009 [P] [US1] Create Kanban.Column molecule component in src/components/molecules/kanban-column/index.tsx
- [ ] T010 [US1] Create Kanban.Columns component in src/components/organisms/kanban/index.tsx (consumes context)
- [ ] T011 [US1] Create Kanban.Tasks component in src/components/organisms/kanban/index.tsx (consumes context)
- [ ] T012 [US1] Create structural components (Container, Header, Content) in src/components/organisms/kanban/index.tsx
- [ ] T013 [US1] Compose main Kanban export object in src/components/organisms/kanban/index.tsx
- [ ] T014 [US1] Add styling using twx for structural components and tv for task variants

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Drag and Drop Task Movement (Priority: P2)

**Goal**: Enable dragging tasks between columns to update status

**Independent Test**: Drag a card from one column to another and verify task status updates

### Implementation for User Story 2

- [ ] T015 [P] [US2] Add HTML5 drag event handlers to Kanban.Task component in src/components/atoms/kanban-task/index.tsx
- [ ] T016 [US2] Add drop zone indicators to Kanban.Column component in src/components/molecules/kanban-column/index.tsx
- [ ] T017 [US2] Implement task movement logic in store.ts to update columnId on drop
- [ ] T018 [US2] Add visual feedback during drag operations in src/components/atoms/kanban-task/index.tsx
- [ ] T019 [US2] Handle invalid drop zones gracefully in src/components/molecules/kanban-column/index.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Task Card Details (Priority: P3)

**Goal**: Display and edit basic task information on cards

**Independent Test**: Display cards with task information and verify edit functionality

### Implementation for User Story 3

- [ ] T020 [P] [US3] Add task priority display to Kanban.Task component in src/components/atoms/kanban-task/index.tsx
- [ ] T021 [US3] Add task description display to Kanban.Task component in src/components/atoms/kanban-task/index.tsx
- [ ] T022 [US3] Implement inline title editing in Kanban.Task component in src/components/atoms/kanban-task/index.tsx
- [ ] T023 [US3] Implement inline description editing in Kanban.Task component in src/components/atoms/kanban-task/index.tsx
- [ ] T024 [US3] Add priority selection dropdown in Kanban.Task component in src/components/atoms/kanban-task/index.tsx
- [ ] T025 [US3] Update store with task editing functions in src/components/organisms/kanban/store.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T026 [P] Add empty column handling in Kanban.Column component
- [ ] T027 Verify all Text components reuse existing atoms/text components
- [ ] T028 Add visual feedback for rapid drag operations
- [ ] T029 Handle incomplete task data gracefully
- [ ] T030 Validate styling follows token-based system (base-*, tone, palette-*)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create Kanban.Task atom component in src/components/atoms/kanban-task/index.tsx"
Task: "Create Kanban.Column molecule component in src/components/molecules/kanban-column/index.tsx"

# Launch structural components in parallel:
Task: "Create Kanban.Columns component in src/components/organisms/kanban/index.tsx"
Task: "Create Kanban.Tasks component in src/components/organisms/kanban/index.tsx"
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

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
