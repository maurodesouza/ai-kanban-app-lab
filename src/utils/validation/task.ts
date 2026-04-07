import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  dueDate: z.string()
    .optional()
    .or(z.literal(''))
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsedDate >= today;
    }, 'A data de vencimento não pode ser anterior a hoje'),
  status: z.enum(['todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Status inválido' })
  }),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.number(),
});

export type Task = z.infer<typeof taskSchema>;
