'use client';

import { useId } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import type { BoardData, TicketWithMeta } from '@/shared/types';
import { Column } from './Column';
import { TicketCard } from './TicketCard';
import { FilterBar, type FilterType } from './FilterBar';

interface BoardProps {
  board: BoardData;
  onTicketClick: (ticket: TicketWithMeta) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeTicket: TicketWithMeta | null;
  activeFilter?: FilterType;
  thisWeekCount?: number;
  overdueCount?: number;
  onFilterChange?: (filter: FilterType) => void;
}

export function Board({
  board,
  onTicketClick,
  onDragStart,
  onDragEnd,
  activeTicket,
  activeFilter = 'all',
  thisWeekCount = 0,
  overdueCount = 0,
  onFilterChange = () => {},
}: BoardProps) {
  const dndId = useId();
  return (
    <DndContext id={dndId} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="board-body">
        <div className="board-sidebar">
          <Column status="BACKLOG" tickets={board.BACKLOG} onTicketClick={onTicketClick} />
        </div>
        <div className="board-content">
          <FilterBar
            activeFilter={activeFilter}
            thisWeekCount={thisWeekCount}
            overdueCount={overdueCount}
            onFilterChange={onFilterChange}
          />
          <div className="board-main">
            <Column status="TODO" tickets={board.TODO} onTicketClick={onTicketClick} />
            <Column status="IN_PROGRESS" tickets={board.IN_PROGRESS} onTicketClick={onTicketClick} />
            <Column status="DONE" tickets={board.DONE} onTicketClick={onTicketClick} />
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTicket && <TicketCard ticket={activeTicket} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}
