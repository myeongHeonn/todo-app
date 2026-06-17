'use client';

import { COLUMN_LABELS, type TicketStatus } from '@/shared/types';

const DOT_CLASS: Record<TicketStatus, string> = {
  BACKLOG: 'column-dot--backlog',
  TODO: 'column-dot--todo',
  IN_PROGRESS: 'column-dot--inprogress',
  DONE: 'column-dot--done',
};

interface ColumnHeaderProps {
  status: TicketStatus;
  count: number;
}

export function ColumnHeader({ status, count }: ColumnHeaderProps) {
  return (
    <div className="column-header">
      <span className={`column-dot ${DOT_CLASS[status]}`} />
      <span className="column-title">{COLUMN_LABELS[status]}</span>
      <span className="column-count">{count}</span>
    </div>
  );
}
