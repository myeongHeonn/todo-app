/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/tickets/route';

jest.mock('../../src/server/services/ticketService', () => ({
  createTicket: jest.fn(),
}));

import { createTicket } from '../../src/server/services/ticketService';

const mockCreateTicket = createTicket as jest.MockedFunction<typeof createTicket>;

const MOCK_TICKET = {
  id: 1,
  title: '테스트 할일',
  description: null,
  status: 'BACKLOG' as const,
  priority: 'MEDIUM' as const,
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-06-11T00:00:00.000Z'),
  updatedAt: new Date('2026-06-11T00:00:00.000Z'),
};

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/tickets', () => {
  it('모든 필드를 포함한 정상 생성 → 201', async () => {
    const input = {
      title: '테스트 할일',
      description: '상세 설명',
      priority: 'HIGH',
      plannedStartDate: '2026-06-15',
      dueDate: '2027-01-01',
    };
    mockCreateTicket.mockResolvedValue({
      ...MOCK_TICKET,
      title: input.title,
      description: input.description,
      priority: 'HIGH',
      plannedStartDate: input.plannedStartDate,
      dueDate: input.dueDate,
    });

    const res = await POST(makePostRequest(input));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.title).toBe(input.title);
    expect(body.description).toBe(input.description);
    expect(body.priority).toBe('HIGH');
    expect(body.status).toBe('BACKLOG');
    expect(body.id).toBeDefined();
  });

  it('제목만으로 최소 생성 → 201, priority는 MEDIUM', async () => {
    mockCreateTicket.mockResolvedValue({ ...MOCK_TICKET, title: '최소 할일' });

    const res = await POST(makePostRequest({ title: '최소 할일' }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.priority).toBe('MEDIUM');
    expect(body.status).toBe('BACKLOG');
  });

  it('제목 누락 → 400, "제목을 입력해주세요"', async () => {
    const res = await POST(makePostRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('제목을 입력해주세요');
  });

  it('제목 200자 초과 → 400, "제목은 200자 이내로 입력해주세요"', async () => {
    const res = await POST(makePostRequest({ title: 'a'.repeat(201) }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('제목은 200자 이내로 입력해주세요');
  });

  it('과거 마감일 → 400, "종료예정일은 오늘 이후 날짜를 선택해주세요"', async () => {
    const res = await POST(makePostRequest({ title: '할일', dueDate: '2020-01-01' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('종료예정일은 오늘 이후 날짜를 선택해주세요');
  });

  it('잘못된 우선순위 값 → 400, "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"', async () => {
    const res = await POST(makePostRequest({ title: '할일', priority: 'URGENT' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요');
  });
});
