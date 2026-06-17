import { render, screen } from '@testing-library/react';
import { TicketDetailView } from './TicketDetailView';
import type { TicketWithMeta } from '@/shared/types';

const baseTicket: TicketWithMeta = {
  id: 1,
  title: '테스트 티켓',
  description: null,
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: new Date('2026-06-10T00:00:00Z'),
  completedAt: null,
  createdAt: new Date('2026-06-01T00:00:00Z'),
  updatedAt: new Date('2026-06-01T00:00:00Z'),
  isOverdue: false,
};

describe('TicketDetailView', () => {
  it('status를 COLUMN_LABELS 레이블로 표시한다', () => {
    render(<TicketDetailView ticket={baseTicket} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('createdAt을 항상 표시한다', () => {
    render(<TicketDetailView ticket={baseTicket} />);
    expect(screen.getByText('2026-06-01')).toBeInTheDocument();
  });

  it('startedAt이 있으면 날짜를 표시하고, 없으면 "-"을 표시한다', () => {
    const { rerender } = render(<TicketDetailView ticket={baseTicket} />);
    expect(screen.getByText('2026-06-10')).toBeInTheDocument();

    rerender(<TicketDetailView ticket={{ ...baseTicket, startedAt: null }} />);
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
  });

  it('completedAt이 있으면 날짜를 표시하고, 없으면 "-"을 표시한다', () => {
    const withCompleted = { ...baseTicket, completedAt: new Date('2026-06-15T00:00:00Z') };
    const { rerender } = render(<TicketDetailView ticket={withCompleted} />);
    expect(screen.getByText('2026-06-15')).toBeInTheDocument();

    rerender(<TicketDetailView ticket={{ ...baseTicket, completedAt: null }} />);
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
  });

  it('input, textarea, select 요소가 없다 (읽기 전용)', () => {
    const { container } = render(<TicketDetailView ticket={baseTicket} />);
    expect(container.querySelectorAll('input, textarea, select')).toHaveLength(0);
  });
});
