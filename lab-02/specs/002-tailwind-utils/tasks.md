---

description: "Task list template for feature implementation"
---

# Tasks: Tailwind Utils Centralization

**Input**: Design documents from `/specs/002-tailwind-utils/`
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

- [ ] T001 Create src/utils/tailwind directory structure per implementation plan
- [ ] T002 Install required dependencies: clsx, react-twc, tailwind-merge, tailwind-variants
- [ ] T003 [P] Verify package.json contains all required dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Ensure TypeScript configuration supports utility functions
- [ ] T005 [P] Verify TailwindCSS is properly configured in the project
- [ ] T006 Create base src/utils/tailwind/index.ts file structure

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Centralized Tailwind Utils (Priority: P1) MVP

**Goal**: Create centralized utility functions for application styling to ensure consistency and reusability across components.

**Independent Test**: Can be fully tested by creating the utility file and verifying all exported functions work correctly.

### Implementation for User Story 1

- [ ] T007 [US1] Implement cn function in src/utils/tailwind/index.ts with clsx and tailwind-merge
- [ ] T008 [US1] Implement twx function in src/utils/tailwind/index.ts with react-twc
- [ ] T009 [US1] Implement getThemeToken function in src/utils/tailwind/index.ts with DOM token access
- [ ] T010 [US1] Add TypeScript type definitions for all utility functions
- [ ] T011 [US1] Export all functions from src/utils/tailwind/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T012 Verify all functions can be imported successfully
- [ ] T013 Test basic functionality of each utility function
- [ ] T014 Ensure compliance with component styling strategy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Story 1 can proceed

---

## Parallel Example: User Story 1

```bash
# Launch all implementation tasks for User Story 1 together:
Task: "Implement cn function in src/utils/tailwind/index.ts with clsx and tailwind-merge"
Task: "Implement twx function in src/utils/tailwind/index.ts with react-twc"
Task: "Implement getThemeToken function in src/utils/tailwind/index.ts with DOM token access"
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
3. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
