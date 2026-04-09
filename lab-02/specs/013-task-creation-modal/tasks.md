---

description: "Task list template for feature implementation"
---

# Tasks: Task Creation Modal

**Input**: Design documents from `/specs/013-task-creation-modal/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

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

- [ ] T001 Install required dependencies (react-hook-form, @hookform/resolvers, zod)
- [ ] T002 Create task modal component directory in src/components/molecules/task-modal/
- [ ] T003 [P] Verify existing dialog component is accessible in src/components/atoms/dialog/
- [ ] T004 [P] Verify existing field component is accessible in src/components/atoms/field/
- [ ] T005 [P] Verify existing clickable component is accessible in src/components/atoms/clickable/
- [ ] T006 [P] Verify event system is working (events.modal.show/hide, events.kanban.addTask/editTask)
- [ ] T007 [P] Verify kanban stores are accessible and contain column data

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create Zod validation schema in src/components/molecules/task-modal/schema.ts
- [ ] T009 Define TypeScript interfaces for TaskModalProps and TaskFormValues
- [ ] T010 Create form validation resolver using zodResolver
- [ ] T011 [P] Verify all imports and dependencies are working correctly

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Creation Modal Interface (Priority: P1)

**Goal**: Create a modal interface that allows users to input task details and add tasks to the kanban board

**Independent Test**: Can be fully tested by opening the modal, filling in task details, submitting the form, and verifying the task appears in the correct column on the kanban board

### Implementation for User Story 1

- [ ] T012 [US1] Create main TaskModal component in src/components/molecules/task-modal/index.tsx
- [ ] T013 [US1] Implement form setup with react-hook-form and default values
- [ ] T014 [US1] Add kanban store integration for column options
- [ ] T015 [US1] Implement form fields (title, description, due date, column selection)
- [ ] T016 [US1] Add Dialog component integration (Content, Header, Title, Body, Footer)
- [ ] T017 [US1] Implement form submission logic with events.kanban.addTask
- [ ] T018 [US1] Add modal close functionality with events.modal.hide

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Modal Form Validation (Priority: P2)

**Goal**: Provide guidance and feedback when filling out the task creation form to ensure data quality and prevent errors

**Independent Test**: Can be tested by attempting to submit the form with various invalid inputs (empty fields, invalid dates, etc.) and verifying appropriate error messages appear

### Implementation for User Story 2

- [ ] T019 [US2] Add real-time validation using Zod schema
- [ ] T020 [US2] Implement validation error display for title field
- [ ] T021 [US2] Implement validation error display for due date field
- [ ] T022 [US2] Add validation for required column selection
- [ ] T023 [US2] Prevent form submission with invalid data
- [ ] T024 [US2] Test form validation with various invalid inputs

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Modal Cancel and Close Actions (Priority: P3)

**Goal**: Provide the ability to cancel task creation or close the modal without saving changes

**Independent Test**: Can be tested by opening the modal and using both the cancel button and modal close mechanisms to verify no task is created

### Implementation for User Story 3

- [ ] T025 [US3] Add cancel button with events.modal.hide functionality
- [ ] T026 [US3] Implement edit mode detection based on task parameter
- [ ] T027 [US3] Add form default values for edit mode (populate from task data)
- [ ] T028 [US3] Implement edit mode submission with events.kanban.editTask
- [ ] T029 [US3] Add modal title switching between "Create Task" and "Edit Task"
- [ ] T030 [US3] Test both create and edit modes functionality

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Test modal appears within 100ms performance requirement
- [ ] T032 [P] Verify modal can be triggered from any component in application
- [ ] T033 [P] Test modal with different kanban boards and column configurations
- [ ] T034 [P] Validate modal state management handles conflicts correctly
- [ ] T035 Validate all acceptance scenarios are met across all user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion
- **Polish (Final Phase)**: Depends on User Story 3 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - builds on modal foundation
- **User Story 3 (P3)**: Depends on User Story 2 completion - adds edit mode on top of validation

### Within Each User Story

- Form setup before field implementation
- Field implementation before submission logic
- Integration before testing

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All Polish tasks marked [P] can run in parallel (within Phase 6)

---

## Parallel Example: User Story 1

```bash
# Launch setup tasks together:
Task: "Verify existing dialog component is accessible in src/components/atoms/dialog/"
Task: "Verify existing field component is accessible in src/components/atoms/field/"
Task: "Verify existing clickable component is accessible in src/components/atoms/clickable/"

# Launch integration tasks in sequence:
Task: "Create main TaskModal component in src/components/molecules/task-modal/index.tsx"
Task: "Implement form setup with react-hook-form and default values"
Task: "Add kanban store integration for column options"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks story)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Add Polish -> Test independently -> Deploy/Demo
6. Each phase adds value without breaking previous functionality

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
