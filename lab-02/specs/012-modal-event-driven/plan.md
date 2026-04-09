# Implementation Plan: Event-Driven Modal System

**Branch**: `012-modal-event-driven` | **Date**: 2026-04-09 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/012-modal-event-driven/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Primary requirement: Create an event-driven modal system that can be triggered from anywhere in the application. Technical approach involves creating a modal molecule component that uses the existing dialog atom provider, reads content from a modal store, and implements a FlexibleRender helper component for dynamic content rendering.

## Technical Context

**Language/Version**: TypeScript with React 18+  
**Primary Dependencies**: Next.js (App Router), Valtio for state management, Radix UI for dialog  
**Storage**: Client-side state with Valtio proxy in modal store  
**Testing**: Optional - not explicitly required by specification  
**Target Platform**: Web browser  
**Project Type**: Web application  
**Performance Goals**: Modal appears within 100ms of event emission  
**Constraints**: Must use existing dialog provider, modal store, and Renderable type system  
**Scale/Scope**: Single modal component with helper for dynamic rendering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Specification exists and is complete before implementation
- Implementation plan follows minimal, single-layer approach
- No architectural patterns introduced unless explicitly required
- Scope limited to exact specification requirements
- Testing only if explicitly required by specification

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
  app/
    layout.tsx              # Root layout for modal provider mounting
    page.tsx                # Homepage (existing)
    kanban-demo/            # Existing demo page
  components/
    atoms/
      dialog/               # Existing dialog provider
        index.tsx
    molecules/
      modal/                # NEW: Modal molecule component
        index.tsx
    helpers/
      flexible-render/      # NEW: FlexibleRender helper component
        index.tsx
  store/
    modal/                  # Existing modal store
      index.ts
  types/
    helpers.ts              # Existing Renderable type
  events/
    handles/                # Event handles for modal
      modal.ts
    index.ts                # Event bus
```

**Structure Decision**: Single Next.js project with App Router. Modal component will be created in `src/components/molecules/modal/` using existing dialog provider from `src/components/atoms/dialog/`. Content will be read from modal store in `src/store/modal/`. FlexibleRender helper will be created in `src/components/helpers/flexible-render/` to handle dynamic content rendering using Renderable type.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
