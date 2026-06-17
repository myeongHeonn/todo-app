import { renderHook, act } from '@testing-library/react';
import { useTickets } from './useTickets';
import * as ticketApi from '../api/ticketApi';
import type { BoardData, Ticket, CreateTicketInput, UpdateTicketInput, ReorderTicketInput } from '@/shared/types';

jest.mock('../api/ticketApi');

const mockedApi = ticketApi as jest.Mocked<typeof ticketApi>;

const baseTicket: Ticket = {
  id: 1,
  title: '테스트 티켓',
  description: null,
  status: 'TODO',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
};

const emptyBoard: BoardData = { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [] };

const boardWithTicket: BoardData = {
  BACKLOG: [],
  TODO: [{ ...baseTicket, isOverdue: false }],
  IN_PROGRESS: [],
  DONE: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getBoard.mockResolvedValue(emptyBoard);
});

describe('useTickets', () => {
  describe('초기화', () => {
    it('initialData가 있으면 board를 초기값으로 설정한다', async () => {
      const { result } = renderHook(() => useTickets({ initialData: boardWithTicket }));
      expect(result.current.board).toEqual(boardWithTicket);
    });

    it('initialData가 없으면 board는 null로 시작한다', () => {
      const { result } = renderHook(() => useTickets({}));
      expect(result.current.board).toBeNull();
    });

    it('마운트 시 getBoard를 호출한다', async () => {
      mockedApi.getBoard.mockResolvedValue(boardWithTicket);
      const { result } = renderHook(() => useTickets({}));
      await act(async () => {});
      expect(mockedApi.getBoard).toHaveBeenCalledTimes(1);
      expect(result.current.board).toEqual(boardWithTicket);
    });
  });

  describe('isLoading', () => {
    it('마운트 직후 getBoard 호출 중 isLoading=true이다', async () => {
      let resolve!: (v: BoardData) => void;
      mockedApi.getBoard.mockReturnValueOnce(new Promise((r) => (resolve = r)));

      const { result } = renderHook(() => useTickets({}));
      expect(result.current.isLoading).toBe(true);

      await act(async () => resolve(emptyBoard));
      expect(result.current.isLoading).toBe(false);
    });

    it('create 호출 중 isLoading=true이다', async () => {
      let resolve!: (v: Ticket) => void;
      mockedApi.create.mockReturnValueOnce(new Promise((r) => (resolve = r)));
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => {});

      // act() 콜백 이후 React가 setIsLoading(true)를 커밋한 상태를 읽는다
      act(() => { result.current.create({ title: '새 티켓' }); });
      expect(result.current.isLoading).toBe(true);

      await act(async () => resolve(baseTicket));
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('create', () => {
    const input: CreateTicketInput = { title: '새 티켓', priority: 'HIGH' };

    it('ticketApi.create를 호출한다', async () => {
      mockedApi.create.mockResolvedValue(baseTicket);
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.create(input));

      expect(mockedApi.create).toHaveBeenCalledWith(input);
    });

    it('create 성공 후 getBoard를 다시 호출해 board를 갱신한다', async () => {
      mockedApi.create.mockResolvedValue(baseTicket);
      mockedApi.getBoard.mockResolvedValue(boardWithTicket);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.create(input));

      expect(mockedApi.getBoard).toHaveBeenCalledTimes(2);
      expect(result.current.board).toEqual(boardWithTicket);
    });

    it('create 실패 시 error 상태를 설정한다', async () => {
      const err = new Error('제목을 입력해주세요');
      mockedApi.create.mockRejectedValue(err);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.create(input));

      expect(result.current.error).toBe('제목을 입력해주세요');
    });
  });

  describe('update', () => {
    const input: UpdateTicketInput = { title: '수정된 제목' };
    const updated = { ...baseTicket, title: '수정된 제목' };

    it('ticketApi.update를 호출한다', async () => {
      mockedApi.update.mockResolvedValue(updated);
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.update(1, input));

      expect(mockedApi.update).toHaveBeenCalledWith(1, input);
    });

    it('update 성공 후 getBoard를 다시 호출해 board를 갱신한다', async () => {
      const refreshed: BoardData = {
        ...emptyBoard,
        TODO: [{ ...updated, isOverdue: false }],
      };
      mockedApi.update.mockResolvedValue(updated);
      mockedApi.getBoard.mockResolvedValue(refreshed);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.update(1, input));

      expect(mockedApi.getBoard).toHaveBeenCalledTimes(2);
      expect(result.current.board).toEqual(refreshed);
    });

    it('update 실패 시 error 상태를 설정한다', async () => {
      mockedApi.update.mockRejectedValue(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.update(99, input));

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  describe('remove', () => {
    it('ticketApi.remove를 호출한다', async () => {
      mockedApi.remove.mockResolvedValue(undefined);
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.remove(1));

      expect(mockedApi.remove).toHaveBeenCalledWith(1);
    });

    it('remove 성공 후 getBoard를 다시 호출해 board를 갱신한다', async () => {
      mockedApi.remove.mockResolvedValue(undefined);
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: boardWithTicket }));
      await act(async () => result.current.remove(1));

      expect(mockedApi.getBoard).toHaveBeenCalledTimes(2);
      expect(result.current.board).toEqual(emptyBoard);
    });

    it('remove 실패 시 error 상태를 설정한다', async () => {
      mockedApi.remove.mockRejectedValue(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.remove(99));

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  describe('reorder', () => {
    const input: ReorderTicketInput = { ticketId: 1, status: 'IN_PROGRESS', position: 512 };
    const reordered = { ...baseTicket, status: 'IN_PROGRESS' as const, position: 512 };

    it('ticketApi.reorder를 호출한다', async () => {
      mockedApi.reorder.mockResolvedValue(reordered);
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.reorder(input));

      expect(mockedApi.reorder).toHaveBeenCalledWith(input);
    });

    it('reorder 성공 후 getBoard를 다시 호출해 board를 갱신한다', async () => {
      const refreshed: BoardData = {
        ...emptyBoard,
        IN_PROGRESS: [{ ...reordered, isOverdue: false }],
      };
      mockedApi.reorder.mockResolvedValue(reordered);
      mockedApi.getBoard.mockResolvedValue(refreshed);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.reorder(input));

      expect(mockedApi.getBoard).toHaveBeenCalledTimes(2);
      expect(result.current.board).toEqual(refreshed);
    });

    it('reorder 실패 시 error 상태를 설정한다', async () => {
      mockedApi.reorder.mockRejectedValue(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.reorder(input));

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  describe('complete', () => {
    const input = { status: 'DONE' as const, position: 0 };
    const completed = { ...baseTicket, status: 'DONE' as const, completedAt: new Date() };

    it('ticketApi.complete를 호출한다', async () => {
      mockedApi.complete.mockResolvedValue(completed);
      mockedApi.getBoard.mockResolvedValue(emptyBoard);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.complete(1, input));

      expect(mockedApi.complete).toHaveBeenCalledWith(1, input);
    });

    it('complete 성공 후 getBoard를 다시 호출해 board를 갱신한다', async () => {
      const refreshed: BoardData = {
        ...emptyBoard,
        DONE: [{ ...completed, isOverdue: false }],
      };
      mockedApi.complete.mockResolvedValue(completed);
      mockedApi.getBoard.mockResolvedValue(refreshed);

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.complete(1, input));

      expect(mockedApi.getBoard).toHaveBeenCalledTimes(2);
      expect(result.current.board).toEqual(refreshed);
    });

    it('complete 실패 시 error 상태를 설정한다', async () => {
      mockedApi.complete.mockRejectedValue(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets({ initialData: emptyBoard }));
      await act(async () => result.current.complete(99, input));

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });
});
