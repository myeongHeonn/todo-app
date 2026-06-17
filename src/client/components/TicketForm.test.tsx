import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from './TicketForm';
import type { Ticket } from '@/shared/types';

const defaultProps = {
  mode: 'create' as const,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  isLoading: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TicketForm', () => {
  describe('C004-1: 생성 모드 렌더링', () => {
    it('빈 필드로 렌더링되고 우선순위 기본값은 MEDIUM이다', () => {
      render(<TicketForm {...defaultProps} />);
      expect(screen.getByLabelText(/제목/)).toHaveValue('');
      expect(screen.getByRole('combobox', { name: /우선순위/ })).toHaveValue('MEDIUM');
    });
  });

  describe('C004-2: 수정 모드 렌더링', () => {
    it('initialData가 각 필드에 반영된다', () => {
      const initialData: Partial<Ticket> = {
        title: '기존 제목',
        description: '기존 설명',
        priority: 'HIGH',
        plannedStartDate: '2026-06-20',
        dueDate: '2026-12-31',
      };
      render(<TicketForm {...defaultProps} mode="edit" initialData={initialData} />);
      expect(screen.getByLabelText(/제목/)).toHaveValue('기존 제목');
      expect(screen.getByLabelText(/설명/)).toHaveValue('기존 설명');
      expect(screen.getByRole('combobox', { name: /우선순위/ })).toHaveValue('HIGH');
      expect(screen.getByLabelText(/시작예정일/)).toHaveValue('2026-06-20');
      expect(screen.getByLabelText(/종료예정일/)).toHaveValue('2026-12-31');
    });
  });

  describe('C004-3: 빈 제목 제출', () => {
    it('"제목을 입력해주세요" 에러가 표시되고 onSubmit은 호출되지 않는다', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(await screen.findByText('제목을 입력해주세요')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('C004-4: 과거 종료예정일', () => {
    it('"종료예정일은 오늘 이후 날짜를 선택해주세요" 에러가 표시된다', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText(/제목/), '테스트 제목');
      fireEvent.change(screen.getByLabelText(/종료예정일/), {
        target: { value: '2020-01-01' },
      });
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(
        await screen.findByText('종료예정일은 오늘 이후 날짜를 선택해주세요'),
      ).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('C004-5: 시작예정일 필드', () => {
    it('plannedStartDate date input이 렌더링된다', () => {
      render(<TicketForm {...defaultProps} />);
      const input = screen.getByLabelText(/시작예정일/);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'date');
    });
  });

  describe('C004-6: 정상 제출', () => {
    it('onSubmit이 호출되고 입력된 데이터가 전달된다', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText(/제목/), '새 업무');
      await userEvent.type(screen.getByLabelText(/설명/), '업무 설명');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /우선순위/ }),
        'HIGH',
      );
      fireEvent.change(screen.getByLabelText(/시작예정일/), {
        target: { value: '2026-06-20' },
      });
      fireEvent.change(screen.getByLabelText(/종료예정일/), {
        target: { value: '2026-12-31' },
      });
      await userEvent.click(screen.getByRole('button', { name: '저장' }));
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: '새 업무',
        description: '업무 설명',
        priority: 'HIGH',
        plannedStartDate: '2026-06-20',
        dueDate: '2026-12-31',
      });
    });
  });

  describe('C004-7: 로딩 상태', () => {
    it('isLoading=true이면 제출 버튼이 비활성화된다', () => {
      render(<TicketForm {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '처리중…' })).toBeDisabled();
    });
  });
});
