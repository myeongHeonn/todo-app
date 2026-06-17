'use client';

import { useId } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import type { BoardData, TicketWithMeta } from '@/shared/types';
import { Column } from './Column';
import { TicketCard } from './TicketCard';

interface BoardProps {
  board: BoardData;
  onTicketClick: (ticket: TicketWithMeta) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeTicket: TicketWithMeta | null;
}

export function Board({ board, onTicketClick, onDragStart, onDragEnd, activeTicket }: BoardProps) {
  const dndId = useId();
  return (
    <DndContext id={dndId} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="board-body">
        <div className="board-sidebar">
          <Column status="BACKLOG" tickets={board.BACKLOG} onTicketClick={onTicketClick} />
        </div>
        <div className="board-main">
          <Column status="TODO" tickets={board.TODO} onTicketClick={onTicketClick} />
          <Column status="IN_PROGRESS" tickets={board.IN_PROGRESS} onTicketClick={onTicketClick} />
          <Column status="DONE" tickets={board.DONE} onTicketClick={onTicketClick} />
        </div>
      </div>
      <DragOverlay>
        {activeTicket && <TicketCard ticket={activeTicket} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}
