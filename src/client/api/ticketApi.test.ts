import {
  getBoard,
  create,
  update,
  remove,
  reorder,
  complete,
} from './ticketApi';
import type { BoardData, Ticket, CreateTicketInput, UpdateTicketInput, ReorderTicketInput } from '@/shared/types';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeOkResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: true,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function makeErrorResponse(body: unknown, status = 400) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

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

const boardData: BoardData = {
  BACKLOG: [],
  TODO: [{ ...baseTicket, isOverdue: false }],
  IN_PROGRESS: [],
  DONE: [],
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ticketApi', () => {
  describe('getBoard', () => {
    it('GET /api/tickets 를 호출한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(boardData));
      await getBoard();
      expect(mockFetch).toHaveBeenCalledWith('/api/tickets', expect.objectContaining({ method: 'GET' }));
    });

    it('성공 시 BoardData를 반환한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(boardData));
      const result = await getBoard();
      expect(result).toEqual(boardData);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      mockFetch.mockReturnValueOnce(
        makeErrorResponse({ error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } }, 500),
      );
      await expect(getBoard()).rejects.toThrow('서버 오류가 발생했습니다');
    });
  });

  describe('create', () => {
    const input: CreateTicketInput = { title: '새 티켓', priority: 'HIGH' };

    it('POST /api/tickets 를 호출한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket, 201));
      await create(input);
      expect(mockFetch).toHaveBeenCalledWith('/api/tickets', expect.objectContaining({ method: 'POST' }));
    });

    it('요청 body에 input이 포함된다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket, 201));
      await create(input);
      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual(input);
    });

    it('성공 시 생성된 Ticket을 반환한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket, 201));
      const result = await create(input);
      expect(result).toEqual(baseTicket);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      mockFetch.mockReturnValueOnce(
        makeErrorResponse({ error: { code: 'VALIDATION_ERROR', message: '제목을 입력해주세요' } }, 400),
      );
      await expect(create(input)).rejects.toThrow('제목을 입력해주세요');
    });
  });

  describe('update', () => {
    const id = 1;
    const input: UpdateTicketInput = { title: '수정된 제목', priority: 'LOW' };

    it('PATCH /api/tickets/:id 를 호출한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket));
      await update(id, input);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tickets/${id}`,
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('요청 body에 input이 포함된다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket));
      await update(id, input);
      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual(input);
    });

    it('성공 시 수정된 Ticket을 반환한다', async () => {
      const updated = { ...baseTicket, title: '수정된 제목' };
      mockFetch.mockReturnValueOnce(makeOkResponse(updated));
      const result = await update(id, input);
      expect(result).toEqual(updated);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      mockFetch.mockReturnValueOnce(
        makeErrorResponse({ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }, 404),
      );
      await expect(update(id, input)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });

  describe('remove', () => {
    const id = 1;

    it('DELETE /api/tickets/:id 를 호출한다', async () => {
      mockFetch.mockReturnValueOnce(
        Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) } as Response),
      );
      await remove(id);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tickets/${id}`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('성공 시 undefined를 반환한다', async () => {
      mockFetch.mockReturnValueOnce(
        Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) } as Response),
      );
      const result = await remove(id);
      expect(result).toBeUndefined();
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      mockFetch.mockReturnValueOnce(
        makeErrorResponse({ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }, 404),
      );
      await expect(remove(id)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });

  describe('reorder', () => {
    const input: ReorderTicketInput = { ticketId: 1, status: 'IN_PROGRESS', position: 512 };

    it('PATCH /api/tickets/reorder 를 호출한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket));
      await reorder(input);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tickets/reorder',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('요청 body에 input이 포함된다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket));
      await reorder(input);
      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual(input);
    });

    it('성공 시 이동된 Ticket을 반환한다', async () => {
      const moved = { ...baseTicket, status: 'IN_PROGRESS' as const, position: 512 };
      mockFetch.mockReturnValueOnce(makeOkResponse(moved));
      const result = await reorder(input);
      expect(result).toEqual(moved);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      mockFetch.mockReturnValueOnce(
        makeErrorResponse(
          { error: { code: 'VALIDATION_ERROR', message: '상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요' } },
          400,
        ),
      );
      await expect(reorder(input)).rejects.toThrow('상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요');
    });
  });

  describe('complete', () => {
    const id = 1;
    const input = { status: 'DONE' as const, position: 0 };

    it('PATCH /api/tickets/:id/complete 를 호출한다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket));
      await complete(id, input);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tickets/${id}/complete`,
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('요청 body에 input이 포함된다', async () => {
      mockFetch.mockReturnValueOnce(makeOkResponse(baseTicket));
      await complete(id, input);
      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual(input);
    });

    it('성공 시 업데이트된 Ticket을 반환한다', async () => {
      const completed = { ...baseTicket, status: 'DONE' as const, completedAt: new Date() };
      mockFetch.mockReturnValueOnce(makeOkResponse(completed));
      const result = await complete(id, input);
      expect(result).toEqual(completed);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      mockFetch.mockReturnValueOnce(
        makeErrorResponse({ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }, 404),
      );
      await expect(complete(id, input)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });
});
