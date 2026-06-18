'use client';

import React, { useState } from 'react';
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketPriority } from '@/shared/types';
import { PRIORITY_LABELS, PRIORITY_ORDER } from '@/shared/types';
import { createTicketSchema } from '@/shared/validations/ticketSchema';
import { Button } from './ui/Button';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ id, label, error, required, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  const child = React.Children.only(children);
  const enhanced =
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(child) && typeof child.type === 'string'
      ? React.cloneElement(child, {
          ...(required && { 'aria-required': true as const }),
          ...(error && { 'aria-invalid': true as const, 'aria-describedby': errorId }),
        })
      : child;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span className="form-label__required" aria-hidden="true"> *</span>}
      </label>
      {enhanced}
      {error && <span id={errorId} className="form-error">{error}</span>}
    </div>
  );
}

interface PrioritySelectProps {
  value: TicketPriority;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  return (
    <div className="form-priority-wrapper" data-priority={value}>
      <span className="form-priority-dot" aria-hidden="true" />
      <select id="priority" name="priority" className="form-select" value={value} onChange={onChange}>
        {PRIORITY_ORDER.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>
    </div>
  );
}

const DATE_FIELDS = [
  { id: 'plannedStartDate', label: '시작예정일' },
  { id: 'dueDate', label: '종료예정일' },
] as const;

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
    <form onSubmit={handleSubmit} className="ticket-form" noValidate>
      <FormField id="title" label="제목" error={errors.title} required>
        <input
          id="title"
          name="title"
          type="text"
          className="form-input"
          value={values.title}
          onChange={handleChange}
          placeholder="업무 제목을 입력하세요"
        />
      </FormField>

      <FormField id="description" label="설명" error={errors.description}>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          value={values.description}
          onChange={handleChange}
          placeholder="업무 내용을 간략히 입력하세요 (선택)"
        />
      </FormField>

      <FormField id="priority" label="우선순위" error={errors.priority}>
        <PrioritySelect value={values.priority} onChange={handleChange} />
      </FormField>

      <div className="form-date-row">
        {DATE_FIELDS.map(({ id, label }) => (
          <FormField key={id} id={id} label={label} error={errors[id]}>
            <input
              id={id}
              name={id}
              type="date"
              className="form-input"
              value={values[id]}
              onChange={handleChange}
            />
          </FormField>
        ))}
      </div>

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
