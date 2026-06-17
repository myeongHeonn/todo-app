'use client';

import { useState } from 'react';
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketPriority } from '@/shared/types';
import { createTicketSchema } from '@/shared/validations/ticketSchema';
import { Button } from './ui/Button';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormValues {
  title: string;
  description: string;
  priority: TicketPriority;
  plannedStartDate: string;
  dueDate: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  plannedStartDate?: string;
  dueDate?: string;
}

export function TicketForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TicketFormProps) {
  const [values, setValues] = useState<FormValues>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    priority: initialData?.priority ?? 'MEDIUM',
    plannedStartDate: initialData?.plannedStartDate ?? '',
    dueDate: initialData?.dueDate ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      plannedStartDate: values.plannedStartDate || undefined,
      dueDate: values.dueDate || undefined,
    };

    const result = createTicketSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField id="title" label="제목" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          className="form-input"
          value={values.title}
          onChange={handleChange}
        />
      </FormField>

      <FormField id="description" label="설명" error={errors.description}>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          value={values.description}
          onChange={handleChange}
        />
      </FormField>

      <FormField id="priority" label="우선순위" error={errors.priority}>
        <select
          id="priority"
          name="priority"
          className="form-select"
          value={values.priority}
          onChange={handleChange}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </FormField>

      <FormField id="plannedStartDate" label="시작예정일" error={errors.plannedStartDate}>
        <input
          id="plannedStartDate"
          name="plannedStartDate"
          type="date"
          className="form-input"
          value={values.plannedStartDate}
          onChange={handleChange}
        />
      </FormField>

      <FormField id="dueDate" label="종료예정일" error={errors.dueDate}>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className="form-input"
          value={values.dueDate}
          onChange={handleChange}
        />
      </FormField>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" isLoading={isLoading}>
          저장
        </Button>
      </div>
    </form>
  );
}
