import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

const defaultProps = {
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ConfirmDialog', () => {
  it('isOpen=false → 렌더링 안 함', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('기본 메시지 "정말 삭제하시겠습니까?"를 표시한다', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('message prop으로 메시지를 커스터마이즈할 수 있다', () => {
    render(<ConfirmDialog {...defaultProps} message="이 작업을 취소하시겠습니까?" />);
    expect(screen.getByText('이 작업을 취소하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 → onConfirm 호출', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 → onCancel 호출', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('isLoading=true → 확인 버튼 비활성화', () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    expect(screen.getByRole('button', { name: '처리중…' })).toBeDisabled();
  });

  it('확인 버튼 → btn--danger 클래스', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: '삭제' })).toHaveClass('btn--danger');
  });
});
