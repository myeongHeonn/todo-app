'use client';

export type FilterType = 'all' | 'this-week' | 'overdue';

interface FilterBarProps {
  activeFilter: FilterType;
  thisWeekCount: number;
  overdueCount: number;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: { id: Exclude<FilterType, 'all'>; label: string }[] = [
  { id: 'this-week', label: '이번주 업무' },
  { id: 'overdue', label: '일정 초과' },
];

export function FilterBar({ activeFilter, thisWeekCount, overdueCount, onFilterChange }: FilterBarProps) {
  const counts: Record<Exclude<FilterType, 'all'>, number> = {
    'this-week': thisWeekCount,
    overdue: overdueCount,
  };

  function handleClick(filter: Exclude<FilterType, 'all'>) {
    onFilterChange(activeFilter === filter ? 'all' : filter);
  }

  return (
    <div className="filter-bar">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          className={`filter-btn${activeFilter === id ? ' filter-btn--active' : ''}`}
          onClick={() => handleClick(id)}
        >
          {label} {counts[id]}
        </button>
      ))}
    </div>
  );
}
