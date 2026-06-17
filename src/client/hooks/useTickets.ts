import { useState, useEffect, useCallback } from 'react';
import * as ticketApi from '../api/ticketApi';
import type {
  BoardData,
  CreateTicketInput,
  UpdateTicketInput,
  ReorderTicketInput,
  TicketStatus,
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

export function useTickets({ initialData }: UseTicketsOptions): UseTicketsResult {
  const [board, setBoard] = useState<BoardData | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBoard = useCallback(async () => {
    const data = await ticketApi.getBoard();
    setBoard(data);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshBoard().finally(() => setIsLoading(false));
  }, [refreshBoard]);

  async function withLoading(fn: () => Promise<void>) {
    setIsLoading(true);
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
      await ticketApi.create(input);
      await refreshBoard();
    });

  const update = (id: number, input: UpdateTicketInput) =>
    withLoading(async () => {
      await ticketApi.update(id, input);
      await refreshBoard();
    });

  const remove = (id: number) =>
    withLoading(async () => {
      await ticketApi.remove(id);
      await refreshBoard();
    });

  const reorder = (input: ReorderTicketInput) =>
    withLoading(async () => {
      await ticketApi.reorder(input);
      await refreshBoard();
    });

  const complete = (id: number, input: { status: TicketStatus; position: number }) =>
    withLoading(async () => {
      await ticketApi.complete(id, input);
      await refreshBoard();
    });

  return { board, isLoading, error, create, update, remove, reorder, complete };
}
