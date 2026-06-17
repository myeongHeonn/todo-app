import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from './Column';
import type { TicketWithMeta } from '@/shared/types';

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: jest.fn(), isOver: false }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}));

jest.mock('./TicketCard', () => ({
  TicketCard: ({ ticket, onClick }: { ticket: TicketWithMeta; onClick: () => void }) => (
    <div data-testid="ticket-card" data-id={ticket.id} onClick={onClick}>
      {ticket.title}
    </div>
  ),
}));

function makeTicket(id: number): TicketWithMeta {
  return {
    id,
    title: `티켓 ${id}`,
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    position: id * 1024,
    plannedStartDate: null,
    dueDate: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
    isOverdue: false,
  };
}

describe('Column', () => {
  it('칼럼명을 표시한다', () => {
    render(<Column status="BACKLOG" tickets={[]} onTicketClick={jest.fn()} />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
  });

  it('티켓 수를 표시한다', () => {
    render(<Column status="TODO" tickets={[makeTicket(1), makeTicket(2)]} onTicketClick={jest.fn()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('tickets=[] → 빈 칼럼 안내 문구를 표시한다', () => {
    render(<Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />);
    expect(screen.getByText('이 칼럼에 티켓이 없습니다')).toBeInTheDocument();
  });

  it('tickets=[] → TicketCard를 렌더링하지 않는다', () => {
    render(<Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />);
    expect(screen.queryByTestId('ticket-card')).not.toBeInTheDocument();
  });

  it('tickets 있으면 TicketCard를 렌더링한다', () => {
    render(<Column status="TODO" tickets={[makeTicket(1)]} onTicketClick={jest.fn()} />);
    expect(screen.getByTestId('ticket-card')).toBeInTheDocument();
  });

  it('티켓 수만큼 TicketCard를 렌더링한다', () => {
    render(<Column status="TODO" tickets={[makeTicket(1), makeTicket(2), makeTicket(3)]} onTicketClick={jest.fn()} />);
    expect(screen.getAllByTestId('ticket-card')).toHaveLength(3);
  });

  it('TicketCard 클릭 시 onTicketClick이 해당 ticket과 함께 호출된다', () => {
    const handleClick = jest.fn();
    const ticket = makeTicket(42);
    render(<Column status="TODO" tickets={[ticket]} onTicketClick={handleClick} />);
    fireEvent.click(screen.getByTestId('ticket-card'));
    expect(handleClick).toHaveBeenCalledWith(ticket);
  });

  it('루트 요소에 column 클래스가 적용된다', () => {
    const { container } = render(<Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />);
    expect(container.firstChild).toHaveClass('column');
  });
});
