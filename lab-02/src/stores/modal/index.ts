import { proxy } from 'valtio';
import type { Renderable } from '@/types/helpers';

type ModalStoreState = {
  modal: Renderable | undefined;
};

export const modalStore = proxy<ModalStoreState>({ modal: undefined });
