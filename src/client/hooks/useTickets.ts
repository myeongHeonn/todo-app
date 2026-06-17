import { useState, useEffect, useCallback } from 'react';
import {
  getBoard,
  create as apiCreate,
  update as apiUpdate,
  remove as apiRemove,
  reorder as apiReorder,
  complete as apiComplete,
} from '../api/ticketApi';
import { COLUMN_ORDER } from '@/shared/types';
import type {
  BoardData,
  CreateTicketInput,
  UpdateTicketInput,
  ReorderTicketInput,
  TicketStatus,
  TicketWithMeta,
} from '@/shared/types';

export interface UseTicketsOptions {
  initialData?: BoardData;
}

export interface UseTicketsResult {
  board: BoardData | null;
  isLoading: boolean;
  error: string | null;
  create: (input: CreateTicketInput) => Promise<void>;
  update: (id: number, input: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (input: ReorderTicketInput) => Promise<void>;
  complete: (id: number, input: { status: TicketStatus; position: number }) => Promise<void>;
}

function applyMove(
  board: BoardData,
  ticketId: number,
  newStatus: TicketStatus,
  newPosition: number,
): BoardData {
  let moved: TicketWithMeta | undefined;

  const stripped = COLUMN_ORDER.reduce(
    (acc, status) => {
      const col = board[status];
      const idx = col.findIndex((t) => t.id === ticketId);
      if (idx !== -1) {
        moved = col[idx];
        acc[status] = col.filter((t) => t.id !== ticketId);
      } else {
        acc[status] = col;
      }
      return acc;
    },
    {} as BoardData,
  );

  if (!moved) return board;

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updated: TicketWithMeta = {
    ...moved,
    status: newStatus,
    position: newPosition,
    startedAt: newStatus === 'TODO' ? now : newStatus === 'BACKLOG' ? null : moved.startedAt,
    completedAt: newStatus === 'DONE' ? now : moved.status === 'DONE' ? null : moved.completedAt,
    isOverdue: newStatus !== 'DONE' && moved.dueDate !== null && new Date(moved.dueDate) < today,
  };

  const targetCol = [...stripped[newStatus], updated].sort((a, b) => a.position - b.position);

  return { ...stripped, [newStatus]: targetCol };
}

export function useTickets({ initialData }: UseTicketsOptions): UseTicketsResult {
  const [board, setBoard] = useState<BoardData | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBoard = useCallback(async () => {
    const data = await getBoard();
    setBoard(data);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshBoard().finally(() => setIsLoading(false));
  }, [refreshBoard]);

  async function withLoading(fn: () => Promise<void>) {
    setIsLoading(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }

  const create = (input: CreateTicketInput) =>
    withLoading(async () => {
      await apiCreate(input);
      await refreshBoard();
    });

  const update = (id: number, input: UpdateTicketInput) =>
    withLoading(async () => {
      await apiUpdate(id, input);
      await refreshBoard();
    });

  const remove = (id: number) =>
    withLoading(async () => {
      await apiRemove(id);
      await refreshBoard();
    });

  async function withOptimistic(optimisticBoard: BoardData, fn: () => Promise<void>) {
    const backup = board!;
    setBoard(optimisticBoard);
    setError(null);
    try {
      await fn();
      await refreshBoard();
    } catch (e) {
      setBoard(backup);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const reorder = (input: ReorderTicketInput) => {
    if (!board) return Promise.resolve();
    return withOptimistic(
      applyMove(board, input.ticketId, input.status, input.position),
      async () => { await apiReorder(input); },
    );
  };

  const complete = (id: number, input: { status: TicketStatus; position: number }) => {
    if (!board) return Promise.resolve();
    return withOptimistic(
      applyMove(board, id, input.status, input.position),
      async () => { await apiComplete(id, input); },
    );
  };

  return { board, isLoading, error, create, update, remove, reorder, complete };
}
