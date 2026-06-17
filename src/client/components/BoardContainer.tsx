'use client';

import { useState } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  COLUMN_ORDER,
  type BoardData,
  type TicketStatus,
  type TicketWithMeta,
  type ReorderableStatus,
  type CreateTicketInput,
} from '@/shared/types';
import { useTickets } from '../hooks/useTickets';
import { Board } from './Board';
import { BoardHeader } from './BoardHeader';
import { TicketModal } from './TicketModal';
import { TicketForm } from './TicketForm';
import { Modal } from './ui/Modal';
import { type FilterType } from './FilterBar';

interface BoardContainerProps {
  initialData: BoardData;
}

function findTargetStatus(board: BoardData, overId: string | number): TicketStatus | null {
  if (typeof overId === 'string' && (COLUMN_ORDER as string[]).includes(overId)) {
    return overId as TicketStatus;
  }
  if (typeof overId === 'number') {
    for (const status of COLUMN_ORDER) {
      if (board[status].some((t) => t.id === overId)) return status;
    }
  }
  return null;
}

function calcDropPosition(
  board: BoardData,
  targetStatus: TicketStatus,
  overId: string | number,
  activeId: number,
): number {
  const col = board[targetStatus].filter((t) => t.id !== activeId);

  if (col.length === 0) return 0;

  if (typeof overId !== 'number') {
    return col[col.length - 1].position + 1024;
  }

  const overIdx = col.findIndex((t) => t.id === overId);
  if (overIdx === -1) return col[col.length - 1].position + 1024;

  const prev = overIdx > 0 ? col[overIdx - 1] : null;
  const next = col[overIdx];

  if (!prev) return next.position - 1024;

  const gap = next.position - prev.position;
  if (gap <= 1) return prev.position + 1;

  return Math.floor((prev.position + next.position) / 2);
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return date >= monday && date <= sunday;
}

function filterTickets(tickets: TicketWithMeta[], filter: FilterType): TicketWithMeta[] {
  if (filter === 'this-week') return tickets.filter((t) => t.dueDate != null && isThisWeek(t.dueDate));
  if (filter === 'overdue') return tickets.filter((t) => t.isOverdue);
  return tickets;
}

export function BoardContainer({ initialData }: BoardContainerProps) {
  const { board, isLoading, create, update, remove, reorder, complete } = useTickets({
    initialData,
  });
  const [activeTicket, setActiveTicket] = useState<TicketWithMeta | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const currentBoard = board ?? initialData;

  const activeTickets = [...currentBoard.TODO, ...currentBoard.IN_PROGRESS];
  const thisWeekCount = activeTickets.filter((t) => t.dueDate != null && isThisWeek(t.dueDate)).length;
  const overdueCount = activeTickets.filter((t) => t.isOverdue).length;

  const filteredBoard: BoardData = {
    BACKLOG: currentBoard.BACKLOG,
    TODO: filterTickets(currentBoard.TODO, activeFilter),
    IN_PROGRESS: filterTickets(currentBoard.IN_PROGRESS, activeFilter),
    DONE: filterTickets(currentBoard.DONE, activeFilter),
  };

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as number;
    const ticket = COLUMN_ORDER.flatMap((s) => currentBoard[s]).find((t) => t.id === id) ?? null;
    setActiveTicket(ticket);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as string | number;
    const targetStatus = findTargetStatus(currentBoard, overId);
    if (!targetStatus) return;

    const position = calcDropPosition(currentBoard, targetStatus, overId, activeId);

    if (targetStatus === 'DONE') {
      void complete(activeId, { status: 'DONE', position });
    } else {
      void reorder({ ticketId: activeId, status: targetStatus as ReorderableStatus, position });
    }
  }

  return (
    <div className="board-container">
      <BoardHeader onCreateClick={() => setIsCreating(true)} />
      <Board
        board={filteredBoard}
        onTicketClick={setSelectedTicket}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        activeTicket={activeTicket}
        activeFilter={activeFilter}
        thisWeekCount={thisWeekCount}
        overdueCount={overdueCount}
        onFilterChange={setActiveFilter}
      />
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen
          onClose={() => setSelectedTicket(null)}
          onUpdate={async (id, data) => {
            await update(id, data);
            setSelectedTicket(null);
          }}
          onDelete={async (id) => {
            await remove(id);
            setSelectedTicket(null);
          }}
        />
      )}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="새 업무">
        <TicketForm
          mode="create"
          onSubmit={async (data) => {
            await create(data as CreateTicketInput);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
