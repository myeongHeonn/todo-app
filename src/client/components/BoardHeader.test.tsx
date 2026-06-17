import { render, screen, fireEvent } from '@testing-library/react';
import { BoardHeader } from './BoardHeader';

describe('BoardHeader', () => {
  it('"Tika" 타이틀을 표시한다', () => {
    render(<BoardHeader onCreateClick={jest.fn()} />);
    expect(screen.getByText('Tika')).toBeInTheDocument();
  });

  it('"새 업무" 버튼을 렌더링한다', () => {
    render(<BoardHeader onCreateClick={jest.fn()} />);
    expect(screen.getByRole('button', { name: '새 업무' })).toBeInTheDocument();
  });

  it('"새 업무" 버튼 클릭 시 onCreateClick을 호출한다', () => {
    const handleCreate = jest.fn();
    render(<BoardHeader onCreateClick={handleCreate} />);
    fireEvent.click(screen.getByRole('button', { name: '새 업무' }));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it('검색 input이 비활성(disabled) 상태로 렌더링된다', () => {
    render(<BoardHeader onCreateClick={jest.fn()} />);
    expect(screen.getByPlaceholderText('검색')).toBeDisabled();
  });
});
