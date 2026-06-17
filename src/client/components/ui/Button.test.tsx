import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('children 렌더링', () => {
    it('children 텍스트를 렌더링한다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    });
  });

  describe('기본값', () => {
    it('variant 기본값은 primary다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--primary');
    });

    it('size 기본값은 md다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--md');
    });
  });

  describe('variant별 CSS 클래스', () => {
    it.each([
      ['primary', 'btn--primary'],
      ['secondary', 'btn--secondary'],
      ['danger', 'btn--danger'],
      ['ghost', 'btn--ghost'],
    ] as const)('variant="%s" → %s 클래스', (variant, expected) => {
      render(<Button variant={variant}>버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass(expected);
    });

    it('항상 btn 기본 클래스를 포함한다', () => {
      render(<Button variant="primary">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn');
    });
  });

  describe('size별 CSS 클래스', () => {
    it.each([
      ['sm', 'btn--sm'],
      ['md', 'btn--md'],
      ['lg', 'btn--lg'],
    ] as const)('size="%s" → %s 클래스', (size, expected) => {
      render(<Button size={size}>버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass(expected);
    });
  });

  describe('onClick 핸들러', () => {
    it('클릭 시 onClick이 호출된다', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>클릭</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLoading', () => {
    it('isLoading=true → 버튼이 비활성화된다', () => {
      render(<Button isLoading>저장</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('isLoading=true → "처리중…" 텍스트를 표시한다', () => {
      render(<Button isLoading>저장</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('처리중…');
    });

    it('isLoading=true → 원래 children은 표시되지 않는다', () => {
      render(<Button isLoading>저장</Button>);
      expect(screen.queryByText('저장')).not.toBeInTheDocument();
    });

    it('isLoading=true → 클릭해도 onClick이 호출되지 않는다', async () => {
      const handleClick = jest.fn();
      render(<Button isLoading onClick={handleClick}>저장</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
