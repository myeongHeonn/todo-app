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

  // overId가 칼럼 status(string)이면 맨 뒤에 삽입
  if (typeof overId !== 'number') {
    return col[col.length - 1].position + 1024;
  }

  // overId가 티켓 ID → 그 티켓 바로 앞에 삽입
  const overIdx = col.findIndex((t) => t.id === overId);
  if (overIdx === -1) return col[col.length - 1].position + 1024;

  const prev = overIdx > 0 ? col[overIdx - 1] : null;
  const next = col[overIdx];

  if (!prev) return next.position - 1024;

  const gap = next.position - prev.position;
  if (gap <= 1) return prev.position + 1;

  return Math.floor((prev.position + next.position) / 2);
}

export function BoardContainer({ initialData }: BoardContainerProps) {
  const { board, isLoading, create, update, remove, reorder, complete } = useTickets({
    initialData,
  });
  const [activeTicket, setActiveTicket] = useState<TicketWithMeta | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const currentBoard = board ?? initialData;

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
        board={currentBoard}
        onTicketClick={setSelectedTicket}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        activeTicket={activeTicket}
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
