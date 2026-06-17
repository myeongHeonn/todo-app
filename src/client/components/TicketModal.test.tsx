import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketModal } from './TicketModal';
import type { TicketWithMeta } from '@/shared/types';

const baseTicket: TicketWithMeta = {
  id: 1,
  title: '테스트 티켓',
  description: '기존 설명',
  status: 'TODO',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-06-01T00:00:00Z'),
  updatedAt: new Date('2026-06-01T00:00:00Z'),
  isOverdue: false,
};

const defaultProps = {
  ticket: baseTicket,
  isOpen: true,
  onClose: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TicketModal', () => {
  it('C005-1: isOpen=false → 렌더링 안 함', () => {
    render(<TicketModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('C005-1: isOpen=true → 티켓 제목을 heading으로 표시한다', () => {
    render(<TicketModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: '테스트 티켓' })).toBeInTheDocument();
  });

  it('C005-4: ESC 키 → onClose 호출', async () => {
    render(<TicketModal {...defaultProps} />);
    await userEvent.keyboard('{Escape}');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('C005-5: 오버레이 클릭 → onClose 호출', () => {
    const { container } = render(<TicketModal {...defaultProps} />);
    fireEvent.click(container.querySelector('.modal-overlay')!);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('C005-6: 삭제 버튼 클릭 → ConfirmDialog 표시', async () => {
    render(<TicketModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('C005-6: ConfirmDialog 확인 → onDelete(ticket.id) 호출', async () => {
    render(<TicketModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    const dialogs = screen.getAllByRole('dialog');
    await userEvent.click(
      within(dialogs[dialogs.length - 1]).getByRole('button', { name: '삭제' }),
    );
    expect(defaultProps.onDelete).toHaveBeenCalledWith(baseTicket.id);
  });

  it('C005-6: ConfirmDialog 취소 → 다이얼로그만 닫힘, 모달 유지', async () => {
    render(<TicketModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    const dialogs = screen.getAllByRole('dialog');
    await userEvent.click(
      within(dialogs[dialogs.length - 1]).getByRole('button', { name: '취소' }),
    );
    expect(defaultProps.onDelete).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('수정 제출 → onUpdate(ticket.id, data) 호출', async () => {
    render(<TicketModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/제목/);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '수정된 제목');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(
      baseTicket.id,
      expect.objectContaining({ title: '수정된 제목' }),
    );
  });
});
