'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TicketStatus, TicketWithMeta } from '@/shared/types';
import { ColumnHeader } from './ColumnHeader';
import { TicketCard } from './TicketCard';

const STATUS_CLASS: Record<TicketStatus, string> = {
  BACKLOG: 'column--backlog',
  TODO: 'column--todo',
  IN_PROGRESS: 'column--inprogress',
  DONE: 'column--done',
};

interface ColumnProps {
  status: TicketStatus;
  tickets: TicketWithMeta[];
  onTicketClick: (ticket: TicketWithMeta) => void;
}

export function Column({ status, tickets, onTicketClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={['column', STATUS_CLASS[status], isOver && 'column--over'].filter(Boolean).join(' ')}>
      <ColumnHeader status={status} count={tickets.length} />
      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="column-cards">
          {tickets.length === 0 ? (
            <div className="column-empty">이 칼럼에 티켓이 없습니다</div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={onTicketClick}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
