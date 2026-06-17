'use client';

import { Button } from './ui/Button';

interface BoardHeaderProps {
  onCreateClick: () => void;
}

export function BoardHeader({ onCreateClick }: BoardHeaderProps) {
  return (
    <header className="board-header">
      <span className="board-header__title">Tika</span>
      <input className="board-header__search" placeholder="검색" disabled />
      <Button onClick={onCreateClick}>새 업무</Button>
    </header>
  );
}
