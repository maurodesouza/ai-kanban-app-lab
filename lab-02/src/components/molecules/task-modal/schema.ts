import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  dueDate: z.string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), 'Due date must be in the future')
    .optional(),
  columnId: z.string()
    .min(1, 'Column is required')
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;


