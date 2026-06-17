import { render, within } from '@testing-library/react';
import { Board } from './Board';
import type { BoardData } from '@/shared/types';

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
}));

jest.mock('./Column', () => ({
  Column: ({ status }: { status: string }) => (
    <div data-testid={`column-${status}`} />
  ),
}));

jest.mock('./TicketCard', () => ({
  TicketCard: () => null,
}));

const emptyBoard: BoardData = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  DONE: [],
};

describe('Board', () => {
  it('BACKLOG Column이 .board-sidebar에 배치된다', () => {
    const { container } = render(
      <Board board={emptyBoard} onTicketClick={jest.fn()} onDragEnd={jest.fn()} activeTicket={null} />,
    );
    const sidebar = container.querySelector('.board-sidebar')!;
    expect(within(sidebar).getByTestId('column-BACKLOG')).toBeInTheDocument();
  });

  it.each([['TODO'], ['IN_PROGRESS'], ['DONE']] as const)(
    '%s Column이 .board-main에 배치된다',
    (status) => {
      const { container } = render(
        <Board board={emptyBoard} onTicketClick={jest.fn()} onDragEnd={jest.fn()} activeTicket={null} />,
      );
      const main = container.querySelector('.board-main')!;
      expect(within(main).getByTestId(`column-${status}`)).toBeInTheDocument();
    },
  );
});
