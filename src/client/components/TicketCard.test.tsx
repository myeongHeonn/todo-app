import { render, screen, fireEvent } from '@testing-library/react';
import { TicketCard } from './TicketCard';
import type { TicketWithMeta } from '@/shared/types';

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: { toString: () => '' },
  },
}));

const baseTicket: TicketWithMeta = {
  id: 1,
  title: '테스트 티켓',
  description: null,
  status: 'TODO',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: '2026-12-31',
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
  isOverdue: false,
};

describe('TicketCard', () => {
  describe('C001-1: 기본 렌더링', () => {
    it('제목을 표시한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByText('테스트 티켓')).toBeInTheDocument();
    });

    it('우선순위 뱃지를 표시한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('종료예정일을 표시한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByTestId('ticket-due-date')).toHaveTextContent('2026-12-31');
    });
  });

  describe('C001-2: 오버듀 표시', () => {
    it('isOverdue=true → 카드에 data-overdue="true" 속성이 설정된다', () => {
      const ticket: TicketWithMeta = { ...baseTicket, isOverdue: true };
      render(<TicketCard ticket={ticket} onClick={jest.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('data-overdue', 'true');
    });

    it('isOverdue=false → data-overdue 속성이 "true"가 아니다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-overdue', 'true');
    });
  });

  describe('C001-3: 완료 상태', () => {
    it('status=DONE → ticket-card--done 클래스가 적용된다', () => {
      const ticket: TicketWithMeta = {
        ...baseTicket,
        status: 'DONE',
        completedAt: new Date(),
      };
      render(<TicketCard ticket={ticket} onClick={jest.fn()} />);
      expect(screen.getByRole('button')).toHaveClass('ticket-card--done');
    });

    it('status=TODO → ticket-card--done 클래스가 없다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByRole('button')).not.toHaveClass('ticket-card--done');
    });
  });

  describe('C001-4: 종료예정일 없는 티켓', () => {
    it('dueDate 있으면 날짜 영역을 렌더링한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByTestId('ticket-due-date')).toBeInTheDocument();
    });

    it('dueDate=null → 날짜 영역을 렌더링하지 않는다', () => {
      const ticket: TicketWithMeta = { ...baseTicket, dueDate: null };
      render(<TicketCard ticket={ticket} onClick={jest.fn()} />);
      expect(screen.queryByTestId('ticket-due-date')).not.toBeInTheDocument();
    });
  });

  describe('C001-5: 클릭 이벤트', () => {
    it('카드를 클릭하면 onClick이 호출된다', () => {
      const handleClick = jest.fn();
      render(<TicketCard ticket={baseTicket} onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('C001-6: 긴 제목 말줄임', () => {
    it('제목 요소에 말줄임 스타일 클래스가 적용된다', () => {
      const ticket: TicketWithMeta = { ...baseTicket, title: 'a'.repeat(200) };
      render(<TicketCard ticket={ticket} onClick={jest.fn()} />);
      expect(screen.getByTestId('ticket-title')).toHaveClass('ticket-card__title');
    });
  });

  describe('C001-7: 우선순위별 뱃지 data-priority 속성', () => {
    it.each([['LOW'], ['MEDIUM'], ['HIGH']] as const)(
      'priority=%s → 뱃지에 data-priority="%s" 속성이 설정된다',
      (priority) => {
        const ticket: TicketWithMeta = { ...baseTicket, priority };
        render(<TicketCard ticket={ticket} onClick={jest.fn()} />);
        expect(screen.getByText(priority)).toHaveAttribute('data-priority', priority);
      },
    );
  });
});
