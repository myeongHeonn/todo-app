import { render, screen } from '@testing-library/react';
import { Badge, PriorityBadge, DueDateBadge } from './Badge';

describe('Badge', () => {
  describe('variant별 CSS 클래스', () => {
    it.each([
      ['low', 'badge--low'],
      ['medium', 'badge--medium'],
      ['high', 'badge--high'],
      ['overdue', 'badge--overdue'],
      ['date', 'badge--date'],
    ] as const)('variant="%s" → %s 클래스', (variant, expected) => {
      render(<Badge variant={variant}>텍스트</Badge>);
      expect(screen.getByText('텍스트')).toHaveClass(expected);
    });

    it('항상 badge 기본 클래스를 포함한다', () => {
      render(<Badge variant="low">텍스트</Badge>);
      expect(screen.getByText('텍스트')).toHaveClass('badge');
    });
  });

  describe('children 렌더링', () => {
    it('전달된 텍스트를 렌더링한다', () => {
      render(<Badge variant="medium">MEDIUM</Badge>);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });
});

describe('PriorityBadge', () => {
  it('LOW → badge--low 클래스', () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('LOW')).toHaveClass('badge--low');
  });

  it('MEDIUM → badge--medium 클래스', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('MEDIUM')).toHaveClass('badge--medium');
  });

  it('HIGH → badge--high 클래스', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH')).toHaveClass('badge--high');
  });
});

describe('DueDateBadge', () => {
  it('isOverdue=false → badge--date 클래스', () => {
    render(<DueDateBadge date="2026-12-31" isOverdue={false} />);
    expect(screen.getByText('2026-12-31')).toHaveClass('badge--date');
  });

  it('isOverdue=true → badge--overdue 클래스', () => {
    render(<DueDateBadge date="2026-01-01" isOverdue={true} />);
    expect(screen.getByText('2026-01-01')).toHaveClass('badge--overdue');
  });

  it('날짜 텍스트를 표시한다', () => {
    render(<DueDateBadge date="2026-06-17" isOverdue={false} />);
    expect(screen.getByText('2026-06-17')).toBeInTheDocument();
  });
});
