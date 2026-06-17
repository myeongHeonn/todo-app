import type {
  BoardData,
  Ticket,
  TicketStatus,
  CreateTicketInput,
  UpdateTicketInput,
  ReorderTicketInput,
} from '@/shared/types';

async function request<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error.message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function json(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function getBoard(): Promise<BoardData> {
  return request('/api/tickets', { method: 'GET' });
}

export function create(input: CreateTicketInput): Promise<Ticket> {
  return request('/api/tickets', json('POST', input));
}

export function update(id: number, input: UpdateTicketInput): Promise<Ticket> {
  return request(`/api/tickets/${id}`, json('PATCH', input));
}

export function remove(id: number): Promise<void> {
  return request(`/api/tickets/${id}`, { method: 'DELETE' });
}

export function reorder(input: ReorderTicketInput): Promise<Ticket> {
  return request('/api/tickets/reorder', json('PATCH', input));
}

export function complete(id: number, input: { status: TicketStatus; position: number }): Promise<Ticket> {
  return request(`/api/tickets/${id}/complete`, json('PATCH', input));
}
