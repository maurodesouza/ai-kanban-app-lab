import React from 'react';
import { Field } from '@/components/atoms/field';
import { Text } from '@/components/atoms/text';

function Root({ children, onSubmit }: { children: React.ReactNode; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="space-y-4">{children}</form>;
}

function TitleField() {
  return (
    <Field.Root>
      <Field.Label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-2">
        Título *
      </Field.Label>
      <Field.Input
        id="task-title"
        name="title"
        type="text"
        placeholder="Digite o título da tarefa"
        className="w-full"
        required
      />
    </Field.Root>
  );
}

function DescriptionField() {
  return (
    <Field.Root>
      <Field.Label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-2">
        Descrição
      </Field.Label>
      <Field.Textarea
        id="task-description"
        name="description"
        placeholder="Digite a descrição da tarefa (opcional)"
        className="w-full min-h-[100px] resize-none"
        rows={4}
      />
    </Field.Root>
  );
}

function DueDateField() {
  return (
    <Field.Root>
      <Field.Label htmlFor="task-due-date" className="block text-sm font-medium text-foreground mb-2">
        Data de Vencimento
      </Field.Label>
      <Field.Input
        id="task-due-date"
        name="dueDate"
        type="date"
        className="w-full"
      />
    </Field.Root>
  );
}

function StatusField() {
  return (
    <Field.Root>
      <Field.Label htmlFor="task-status" className="block text-sm font-medium text-foreground mb-2">
        Status
      </Field.Label>
      <Field.Select
        id="task-status"
        name="status"
        className="w-full h-11"
        defaultValue="todo"
      >
        <option value="todo">TODO</option>
        <option value="in_progress">IN PROGRESS</option>
        <option value="done">DONE</option>
      </Field.Select>
    </Field.Root>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-3 bg-palette-danger/10 border border-palette-danger/20 rounded-md">
      <Text.Paragraph className="text-palette-danger text-sm">
        {message}
      </Text.Paragraph>
    </div>
  );
}

function TaskFormComponent() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const status = formData.get('status') as string;

    try {
      // Validation
      if (!title.trim()) {
        throw new Error('O título é obrigatório');
      }

      if (title.trim().length < 3) {
        throw new Error('O título deve ter pelo menos 3 caracteres');
      }

      // Create task logic would go here
      console.log('Creating task:', { title, description, dueDate, status });

      // Reset form
      event.currentTarget.reset();
      
      // Close modal
      import('@/events').then(({ events }) => {
        events.modal.close();
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Root onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      
      <TitleField />
      <DescriptionField />
      <DueDateField />
      <StatusField />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => import('@/events').then(({ events }) => events.modal.close())}
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
    </Root>
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
