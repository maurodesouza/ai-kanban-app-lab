/**
 * Root of the `kanban.*` actions. Each sub-domain extends `KanbanActions`
 * through module augmentation in its own `<domain>-actions.ts`.
 */
// biome-ignore lint/suspicious/noEmptyInterface: extended by every kanban sub-domain
export interface KanbanActions {}

declare module "#/lib/command/global" {
    interface Actions {
        kanban: KanbanActions;
    }
}
