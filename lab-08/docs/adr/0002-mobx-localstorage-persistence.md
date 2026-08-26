# mobX + single-autorun localStorage persistence

The application state is managed with mobX (`makeAutoObservable`, `computed`, `action`) and persisted to `localStorage` by a single `autorun` on the root store that serializes the entire board collection on every change. The payload is keyed `kanban:store:v1` and carries a `version: 1` field; on load, if the key is missing or the version mismatches, defaults are seeded (no migration logic yet).

We rejected the valtio approach shown in the original `plan.excalidraw` in favor of mobX, which the spec mandated. We rejected per-action save calls and debounced serialization in favor of a single reactive `autorun` because changes are user-paced and the payload is small, so a single reaction is simpler and impossible to forget. The versioned key is cheap insurance against future model changes; migration can be added later without renaming the key.
