import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      date => {
        if (!date) return true; // Campo opcional, vazio é válido
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      {
        message: 'Invalid date format',
      }
    )
    .refine(
      date => {
        if (!date) return true; // Campo opcional, vazio é válido
        return new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)); // Permitir hoje e datas futuras
      },
      {
        message: 'Due date must be today or in the future',
      }
    ),
  columnId: z.string().min(1, 'Column is required'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
