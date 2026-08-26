# Kanban Board

A multi-board kanban application where each board owns columns and tasks, persisted to local storage with no external API.

## Language

**Board**:
A self-contained kanban. Owns columns and tasks. N boards can exist in the store; one is active at a time. Identified by `boardId`.
_Avoid_: Kanban app, workspace

**Column**:
A vertical lane within a board, ordered by position. Owns the tasks visually grouped under it. Identified by `columnId`, scoped to its board.
_Avoid_: Lane, list, stage

**Task**:
A unit of work living in exactly one column of one board. Carries title, description, priority, start/end dates. Identified by `taskId`, scoped to its board.
_Avoid_: Card, item, ticket

**Priority**:
A task's urgency level. One of `none | low | medium | high | urgent`. Changeable in-place from the task card without opening the edit modal.
_Avoid_: Severity, importance

**Filter**:
A per-board view constraint combining free-text search (title + description), a date range, and a priority select. Stored on the board's slice; survives board switches and persistence.
_Avoid_: Search, query

## Composition

**Ghost Column**:
A dashed placeholder at the end of the column row. One click creates a real column in inline-edit mode.
_Avoid_: Add button, placeholder column

## Architecture

**Handle**:
A React component that registers command handlers with the command bus and owns the side-effecting logic for a domain (e.g. `KanbanHandle`, `ModalHandle`).
_Avoid_: Controller, container (in the command sense)

**Command**:
A named, typed intent dispatched through the command bus (`actions.domain.action(payload)`). The only mechanism for cross-component communication.
_Avoid_: Event, action (in the Redux sense), message
