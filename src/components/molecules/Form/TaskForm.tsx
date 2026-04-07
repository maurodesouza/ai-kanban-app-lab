import React from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '@/components/atoms/field';
import { Text } from '@/components/atoms/text';
import { taskFormSchema, type TaskFormData } from '@/utils/validation/task';
import { events } from '@/events';
import { TaskStatus } from '@/types/task';

function Root({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function TitleField({ error }: { error?: string }) {
  const { register } = useFormContext<TaskFormData>();
  
  return (
    <Field.Root>
      <Field.Label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-2">
        Título *
      </Field.Label>
      <Field.Input
        id="task-title"
        {...register('title')}
        type="text"
        placeholder="Digite o título da tarefa"
        className={`w-full ${error ? 'border-palette-danger' : ''}`}
        aria-invalid={!!error}
      />
      {error && (
        <Text.Paragraph className="text-palette-danger text-xs mt-1" role="alert">
          {error}
        </Text.Paragraph>
      )}
    </Field.Root>
  );
}

function DescriptionField({ error }: { error?: string }) {
  const { register } = useFormContext<TaskFormData>();
  
  return (
    <Field.Root>
      <Field.Label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-2">
        Descrição
      </Field.Label>
      <Field.Textarea
        id="task-description"
        {...register('description')}
        placeholder="Digite a descrição da tarefa (opcional)"
        className={`w-full min-h-[100px] resize-none ${error ? 'border-palette-danger' : ''}`}
        rows={4}
        aria-invalid={!!error}
      />
      {error && (
        <Text.Paragraph className="text-palette-danger text-xs mt-1" role="alert">
          {error}
        </Text.Paragraph>
      )}
    </Field.Root>
  );
}

function DueDateField({ error }: { error?: string }) {
  const { register } = useFormContext<TaskFormData>();
  
  return (
    <Field.Root>
      <Field.Label htmlFor="task-due-date" className="block text-sm font-medium text-foreground mb-2">
        Data de Vencimento
      </Field.Label>
      <Field.Input
        id="task-due-date"
        {...register('dueDate')}
        type="date"
        className={`w-full ${error ? 'border-palette-danger' : ''}`}
        aria-invalid={!!error}
      />
      {error && (
        <Text.Paragraph className="text-palette-danger text-xs mt-1" role="alert">
          {error}
        </Text.Paragraph>
      )}
    </Field.Root>
  );
}

function StatusField({ error }: { error?: string }) {
  const { register } = useFormContext<TaskFormData>();
  
  return (
    <Field.Root>
      <Field.Label htmlFor="task-status" className="block text-sm font-medium text-foreground mb-2">
        Status
      </Field.Label>
      <Field.Select
        id="task-status"
        {...register('status')}
        className={`w-full h-11 ${error ? 'border-palette-danger' : ''}`}
        aria-invalid={!!error}
      >
        <option value="todo">TODO</option>
        <option value="in_progress">IN PROGRESS</option>
        <option value="done">DONE</option>
      </Field.Select>
      {error && (
        <Text.Paragraph className="text-palette-danger text-xs mt-1" role="alert">
          {error}
        </Text.Paragraph>
      )}
    </Field.Root>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-3 bg-palette-danger/10 border border-palette-danger/20 rounded-md" role="alert">
      <Text.Paragraph className="text-palette-danger text-sm">
        {message}
      </Text.Paragraph>
    </div>
  );
}

function TaskFormComponent() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const methods = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      status: TaskStatus.TODO,
    },
  });

  const { handleSubmit, reset, formState: { errors } } = methods;

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create task logic would go here
      console.log('Creating task:', data);

      // Emit task creation event
      const eventData = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 1, // Would be calculated based on existing tasks
      };

      // For now, just close the modal
      events.modal.close();
      
      // Reset form
      reset();

    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && <ErrorMessage message={submitError} />}
        
        <TitleField error={errors.title?.message} />
        <DescriptionField error={errors.description?.message} />
        <DueDateField error={errors.dueDate?.message} />
        <StatusField error={errors.status?.message} />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => events.modal.close()}
            className="px-4 py-2 border border-tone-contrast-300 hover:bg-tone-contrast-100 transition-colors rounded-md"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-palette-brand text-white hover:bg-palette-brand/90 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

export const TaskForm = {
  Root,
  TitleField,
  DescriptionField,
  DueDateField,
  StatusField,
  ErrorMessage,
  Component: TaskFormComponent,
};
