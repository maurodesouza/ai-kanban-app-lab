import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { kanbanStore } from '@/stores/kanban';

describe('kanbanStore', () => {
  let storeId: string;

  beforeEach(() => {
    const store = kanbanStore.create('Test Kanban');
    storeId = store.$$storeId;
  });

  afterEach(() => {
    kanbanStore.remove(storeId);
  });

  describe('create', () => {
    it('should create a store with default columns', () => {
      const store = kanbanStore.create('Test');
      expect(store.columns).toBeDefined();
      expect(Object.keys(store.columns)).toHaveLength(3);
      expect(store.title).toBe('Test');
    });

    it('should have unique IDs for columns', () => {
      const store1 = kanbanStore.create('Test1');
      const store2 = kanbanStore.create('Test2');
      const ids1 = Object.keys(store1.columns);
      const ids2 = Object.keys(store2.columns);
      expect(ids1).not.toEqual(ids2);
      kanbanStore.remove(store1.$$storeId);
      kanbanStore.remove(store2.$$storeId);
    });
  });

  describe('getById', () => {
    it('should return the store by ID', () => {
      const store = kanbanStore.getById(storeId);
      expect(store).toBeDefined();
      expect(store?.title).toBe('Test Kanban');
    });

    it('should return undefined for non-existent store', () => {
      const store = kanbanStore.getById('non-existent');
      expect(store).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove the store', () => {
      const removed = kanbanStore.remove(storeId);
      expect(removed).toBe(true);
      expect(kanbanStore.getById(storeId)).toBeUndefined();
    });

    it('should return false for non-existent store', () => {
      const removed = kanbanStore.remove('non-existent');
      expect(removed).toBe(false);
    });
  });
});
