'use client';

import type { TicketPriority } from '@/shared/types';

type BadgeVariant = 'low' | 'medium' | 'high' | 'overdue' | 'date';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`badge badge--${priority.toLowerCase()}`} data-priority={priority}>
      {priority}
    </span>
  );
}

interface DueDateBadgeProps {
  date: string;
  isOverdue: boolean;
}

export function DueDateBadge({ date, isOverdue }: DueDateBadgeProps) {
  return <Badge variant={isOverdue ? 'overdue' : 'date'}>{date}</Badge>;
}
