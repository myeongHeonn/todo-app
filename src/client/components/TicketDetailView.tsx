'use client';

import { COLUMN_LABELS, type TicketWithMeta } from '@/shared/types';

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toISOString().split('T')[0];
}

interface FieldRowProps {
  label: string;
  value: string;
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="ticket-detail__field">
      <dt className="ticket-detail__label">{label}</dt>
      <dd className="ticket-detail__value">{value}</dd>
    </div>
  );
}

export function TicketDetailView({ ticket }: { ticket: TicketWithMeta }) {
  return (
    <dl className="ticket-detail">
      <FieldRow label="상태" value={COLUMN_LABELS[ticket.status]} />
      <FieldRow label="시작일" value={formatDate(ticket.startedAt)} />
      <FieldRow label="종료일" value={formatDate(ticket.completedAt)} />
      <FieldRow label="생성일" value={formatDate(ticket.createdAt)} />
    </dl>
  );
}
