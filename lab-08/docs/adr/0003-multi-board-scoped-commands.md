# Multi-board scoped commands from day one

Every `kanban.*` command is a `ScopedAction` keyed by `instanceId = boardId`, even though only one board is rendered at a time today. Columns and tasks carry their `boardId`, and the store holds a collection of boards rather than a single board.

We chose this over a single-board model because the spec explicitly requires supporting N kanbans on the same page. Retrofitting scoping later would mean rewriting every command signature, every handle registration, and the store shape. Building it scoped from the start costs one extra field per model and one `instanceId` argument per dispatch, but keeps the architecture forward-compatible. The board switcher, create, delete, and rename commands are also scoped-or-global as appropriate (`board.create`/`board.delete`/`board.select`/`board.rename` are global `Action`s since they operate on the collection, not a single mounted instance).
