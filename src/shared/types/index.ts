export const TICKET_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export const COLUMN_ORDER: TicketStatus[] = [
  TICKET_STATUS.BACKLOG,
  TICKET_STATUS.TODO,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.DONE,
];

export const COLUMN_LABELS: Record<TicketStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'TODO',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const PRIORITY_ORDER: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: '낮음 (Low)',
  MEDIUM: '보통 (Medium)',
  HIGH: '높음 (High)',
};

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  position: number;
  plannedStartDate: string | null;
  dueDate: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketWithMeta extends Ticket {
  isOverdue: boolean;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  plannedStartDate?: string;
  dueDate?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  plannedStartDate?: string | null;
  dueDate?: string | null;
}

export type ReorderableStatus = Exclude<TicketStatus, typeof TICKET_STATUS.DONE>;

export interface ReorderTicketInput {
  ticketId: number;
  status: ReorderableStatus;
  position: number;
}

export type BoardData = Record<TicketStatus, TicketWithMeta[]>;
