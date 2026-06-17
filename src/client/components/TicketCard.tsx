'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TicketWithMeta } from '@/shared/types';
import { PriorityBadge, DueDateBadge } from './ui/Badge';

interface TicketCardProps {
  ticket: TicketWithMeta;
  onClick: (ticket: TicketWithMeta) => void;
}

export const TicketCard = memo(function TicketCard({ ticket, onClick }: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const className = [
    'ticket-card',
    isDragging && 'ticket-card--dragging',
    ticket.status === 'DONE' && 'ticket-card--done',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = [
    `티켓: ${ticket.title}`,
    `우선순위: ${ticket.priority}`,
    ticket.dueDate && `마감일: ${ticket.dueDate}`,
    ticket.isOverdue && '기한 초과',
  ]
    .filter(Boolean)
    .join(', ');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(ticket);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
      role="button"
      aria-label={ariaLabel}
      tabIndex={0}
      data-overdue={ticket.isOverdue ? 'true' : undefined}
      onClick={() => onClick(ticket)}
      onKeyDown={handleKeyDown}
    >
      <p className="ticket-card__title" data-testid="ticket-title">
        {ticket.title}
      </p>
      <div className="ticket-card__meta">
        <PriorityBadge priority={ticket.priority} />
        {ticket.dueDate && (
          <span data-testid="ticket-due-date">
            <DueDateBadge date={ticket.dueDate} isOverdue={ticket.isOverdue} />
          </span>
        )}
      </div>
    </div>
  );
});
