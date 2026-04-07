import { describe, it, expect, beforeEach } from 'vitest';
import { taskFormSchema, type TaskFormData } from '@/utils/validation/task';

describe('Task Form Validation', () => {
  let validData: TaskFormData;

  beforeEach(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days in future
    
    validData = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: futureDate.toISOString().split('T')[0],
      status: 'todo',
    };
  });

  describe('Title Validation', () => {
    it('should accept valid titles', () => {
      expect(() => taskFormSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty titles', () => {
      const invalidData = { ...validData, title: '' };
      expect(() => taskFormSchema.parse(invalidData)).toThrow('O título deve ter pelo menos 3 caracteres');
    });

    it('should reject titles shorter than 3 characters', () => {
      const invalidData = { ...validData, title: 'AB' };
      expect(() => taskFormSchema.parse(invalidData)).toThrow('O título deve ter pelo menos 3 caracteres');
    });

    it('should reject titles longer than 100 characters', () => {
      const invalidData = { ...validData, title: 'a'.repeat(101) };
      expect(() => taskFormSchema.parse(invalidData)).toThrow('O título deve ter no máximo 100 caracteres');
    });

    it('should trim whitespace from titles', () => {
      const dataWithWhitespace = { ...validData, title: '  Test Task  ' };
      const result = taskFormSchema.parse(dataWithWhitespace);
      expect(result.title).toBe('Test Task');
    });
  });

  describe('Description Validation', () => {
    it('should accept empty descriptions', () => {
      const dataWithoutDescription = { ...validData, description: '' };
      expect(() => taskFormSchema.parse(dataWithoutDescription)).not.toThrow();
    });

    it('should accept undefined descriptions', () => {
      const dataWithoutDescription = { ...validData, description: undefined };
      expect(() => taskFormSchema.parse(dataWithoutDescription)).not.toThrow();
    });

    it('should reject descriptions longer than 500 characters', () => {
      const invalidData = { ...validData, description: 'a'.repeat(501) };
      expect(() => taskFormSchema.parse(invalidData)).toThrow('A descrição deve ter no máximo 500 caracteres');
    });
  });

  describe('Due Date Validation', () => {
    it('should accept empty due dates', () => {
      const dataWithoutDueDate = { ...validData, dueDate: '' };
      expect(() => taskFormSchema.parse(dataWithoutDueDate)).not.toThrow();
    });

    it('should accept undefined due dates', () => {
      const dataWithoutDueDate = { ...validData, dueDate: undefined };
      expect(() => taskFormSchema.parse(dataWithoutDueDate)).not.toThrow();
    });

    it('should accept valid future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dataWithFutureDate = { ...validData, dueDate: futureDate.toISOString().split('T')[0] };
      expect(() => taskFormSchema.parse(dataWithFutureDate)).not.toThrow();
    });

    it('should accept today\'s date', () => {
      const today = new Date();
      const dataWithToday = { ...validData, dueDate: today.toISOString().split('T')[0] };
      expect(() => taskFormSchema.parse(dataWithToday)).not.toThrow();
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const dataWithPastDate = { ...validData, dueDate: pastDate.toISOString().split('T')[0] };
      expect(() => taskFormSchema.parse(dataWithPastDate)).toThrow('A data de vencimento não pode ser anterior a hoje');
    });
  });

  describe('Status Validation', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['todo', 'in_progress', 'done'];
      validStatuses.forEach(status => {
        const dataWithStatus = { ...validData, status: status as any };
        expect(() => taskFormSchema.parse(dataWithStatus)).not.toThrow();
      });
    });

    it('should reject invalid status values', () => {
      const invalidData = { ...validData, status: 'invalid' as any };
      expect(() => taskFormSchema.parse(invalidData)).toThrow('Status inválido');
    });
  });

  describe('Complete Form Validation', () => {
    it('should accept complete valid form data', () => {
      expect(() => taskFormSchema.parse(validData)).not.toThrow();
    });

    it('should accept minimal valid form data', () => {
      const minimalData = {
        title: 'Test Task',
        status: 'todo',
      };
      expect(() => taskFormSchema.parse(minimalData)).not.toThrow();
    });
  });
});
