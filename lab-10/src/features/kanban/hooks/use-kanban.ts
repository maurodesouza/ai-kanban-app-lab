import { kanbanStore } from "#/features/kanban/store/store";

export function useKanban() {
    return kanbanStore;
}
