import { KanbanStore } from "./kanban-store";
import { ModalStore } from "./modal-store";
import { ThemeStore } from "./theme-store";

export const kanbanStore = new KanbanStore();
export const modalStore = new ModalStore();
export const themeStore = new ThemeStore();

export { KanbanStore, ModalStore, ThemeStore };
