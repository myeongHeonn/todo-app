import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('isOpen=false → 렌더링 안 함', () => {
    render(<Modal isOpen={false} onClose={jest.fn()}>내용</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen=true → role=dialog로 렌더링', () => {
    render(<Modal isOpen={true} onClose={jest.fn()}>내용</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('isOpen=true → children 렌더링', () => {
    render(<Modal isOpen={true} onClose={jest.fn()}>모달 내용</Modal>);
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('ESC 키 → onClose 호출', async () => {
    const handleClose = jest.fn();
    render(<Modal isOpen={true} onClose={handleClose}>내용</Modal>);
    await userEvent.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 → onClose 호출', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>내용</Modal>,
    );
    fireEvent.click(container.querySelector('.modal-overlay')!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('모달 내부 클릭 → onClose 호출 안 함 (이벤트 버블링 차단)', () => {
    const handleClose = jest.fn();
    render(<Modal isOpen={true} onClose={handleClose}>내용</Modal>);
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).not.toHaveBeenCalled();
  });
});
