import { render, screen } from '@testing-library/react';
import { ColumnHeader } from './ColumnHeader';

describe('ColumnHeader', () => {
  it('status에 맞는 칼럼명을 표시한다', () => {
    render(<ColumnHeader status="BACKLOG" count={3} />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
  });

  it('티켓 수를 표시한다', () => {
    render(<ColumnHeader status="TODO" count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('count=0이어도 0을 표시한다', () => {
    render(<ColumnHeader status="DONE" count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it.each([
    ['BACKLOG', 'column-dot--backlog'],
    ['TODO', 'column-dot--todo'],
    ['IN_PROGRESS', 'column-dot--inprogress'],
    ['DONE', 'column-dot--done'],
  ] as const)('status=%s → 색상 닷 클래스 %s 적용', (status, expectedClass) => {
    const { container } = render(<ColumnHeader status={status} count={0} />);
    expect(container.querySelector('.column-dot')).toHaveClass(expectedClass);
  });
});
