import { eq, min } from 'drizzle-orm';
import { db } from '../db';
import { tickets } from '../db/schema';
import type { CreateTicketInput, Ticket, TicketPriority, TicketStatus } from '@/shared/types';

function toTicket(row: typeof tickets.$inferSelect): Ticket {
  return {
    ...row,
    status: row.status as TicketStatus,
    priority: row.priority as TicketPriority,
  };
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
