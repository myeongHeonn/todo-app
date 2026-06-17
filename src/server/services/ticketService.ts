import { eq, min, asc, or, ne, gte } from 'drizzle-orm';
import { db } from '../db';
import { tickets } from '../db/schema';
import type {
  CreateTicketInput,
  UpdateTicketInput,
  Ticket,
  TicketPriority,
  TicketStatus,
  BoardData,
  TicketWithMeta,
  ReorderableStatus,
} from '@/shared/types';

function toTicket(row: typeof tickets.$inferSelect): Ticket {
  return {
    ...row,
    status: row.status as TicketStatus,
    priority: row.priority as TicketPriority,
  };
}

function notFound(): never {
  throw new Error('티켓을 찾을 수 없습니다');
}

export async function getBoard(): Promise<BoardData> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];

  const rows = await db
    .select()
    .from(tickets)
    .where(or(ne(tickets.status, 'DONE'), gte(tickets.completedAt, cutoff)))
    .orderBy(asc(tickets.position));

  const board: BoardData = { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [] };

  for (const row of rows) {
    const ticket = toTicket(row);
    const isOverdue =
      !!ticket.dueDate && ticket.dueDate < today && ticket.status !== 'DONE';
    (board[ticket.status] as TicketWithMeta[]).push({ ...ticket, isOverdue });
  }

  return board;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const [minResult] = await db
    .select({ minPosition: min(tickets.position) })
    .from(tickets)
    .where(eq(tickets.status, 'BACKLOG'));

  const position = minResult?.minPosition != null ? minResult.minPosition - 1024 : 0;

  const [created] = await db
    .insert(tickets)
    .values({
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'MEDIUM',
      plannedStartDate: input.plannedStartDate ?? null,
      dueDate: input.dueDate ?? null,
      status: 'BACKLOG',
      position,
    })
    .returning();

  return toTicket(created);
}

export async function getTicket(id: number): Promise<Ticket> {
  const [row] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!row) notFound();
  return toTicket(row);
}

export async function updateTicket(id: number, input: UpdateTicketInput): Promise<Ticket> {
  const [updated] = await db
    .update(tickets)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(tickets.id, id))
    .returning();

  if (!updated) notFound();
  return toTicket(updated);
}

export async function deleteTicket(id: number): Promise<void> {
  const deleted = await db
    .delete(tickets)
    .where(eq(tickets.id, id))
    .returning({ id: tickets.id });

  if (!deleted.length) notFound();
}

export async function reorderTicket(input: {
  ticketId: number;
  status: ReorderableStatus;
  position: number;
}): Promise<Ticket> {
  const now = new Date();

  const patch: Partial<typeof tickets.$inferInsert> = {
    status: input.status,
    position: input.position,
    completedAt: null,
    updatedAt: now,
  };

  if (input.status === 'TODO') patch.startedAt = now;
  else if (input.status === 'BACKLOG') patch.startedAt = null;

  const [updated] = await db
    .update(tickets)
    .set(patch)
    .where(eq(tickets.id, input.ticketId))
    .returning();

  if (!updated) notFound();
  return toTicket(updated);
}

export async function completeTicket(
  id: number,
  input: { status: TicketStatus; position: number },
): Promise<Ticket> {
  const now = new Date();

  const [updated] = await db
    .update(tickets)
    .set({
      status: input.status,
      position: input.position,
      completedAt: input.status === 'DONE' ? now : null,
      updatedAt: now,
    })
    .where(eq(tickets.id, id))
    .returning();

  if (!updated) notFound();
  return toTicket(updated);
}
