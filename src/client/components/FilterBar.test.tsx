import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';

type FilterType = 'all' | 'this-week' | 'overdue';

describe('FilterBar', () => {
  it('"이번주 업무" 버튼에 카운트를 표시한다', () => {
    render(<FilterBar activeFilter="all" thisWeekCount={3} overdueCount={1} onFilterChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /이번주 업무/ })).toHaveTextContent('3');
  });

  it('"일정 초과" 버튼에 카운트를 표시한다', () => {
    render(<FilterBar activeFilter="all" thisWeekCount={3} overdueCount={2} onFilterChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /일정 초과/ })).toHaveTextContent('2');
  });

  it('"이번주 업무" 클릭 시 onFilterChange("this-week")를 호출한다', () => {
    const handleFilter = jest.fn();
    render(<FilterBar activeFilter="all" thisWeekCount={3} overdueCount={1} onFilterChange={handleFilter} />);
    fireEvent.click(screen.getByRole('button', { name: /이번주 업무/ }));
    expect(handleFilter).toHaveBeenCalledWith('this-week');
  });

  it('"일정 초과" 클릭 시 onFilterChange("overdue")를 호출한다', () => {
    const handleFilter = jest.fn();
    render(<FilterBar activeFilter="all" thisWeekCount={3} overdueCount={1} onFilterChange={handleFilter} />);
    fireEvent.click(screen.getByRole('button', { name: /일정 초과/ }));
    expect(handleFilter).toHaveBeenCalledWith('overdue');
  });

  it('활성 필터를 다시 클릭하면 onFilterChange("all")를 호출한다 (토글)', () => {
    const handleFilter = jest.fn();
    render(
      <FilterBar activeFilter="this-week" thisWeekCount={3} overdueCount={1} onFilterChange={handleFilter} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /이번주 업무/ }));
    expect(handleFilter).toHaveBeenCalledWith('all');
  });

  it('활성 필터 버튼에 filter-btn--active 클래스가 적용된다', () => {
    render(
      <FilterBar activeFilter="overdue" thisWeekCount={3} overdueCount={1} onFilterChange={jest.fn()} />,
    );
    expect(screen.getByRole('button', { name: /일정 초과/ })).toHaveClass('filter-btn--active');
    expect(screen.getByRole('button', { name: /이번주 업무/ })).not.toHaveClass('filter-btn--active');
  });
});
