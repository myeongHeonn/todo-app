import { NextRequest, NextResponse } from 'next/server';
import { reorderTicketSchema } from '@/shared/validations/ticketSchema';
import { reorderTicket } from '@/server/services/ticketService';

export async function PATCH(req: NextRequest) {
  const body: unknown = await req.json();
  const result = reorderTicketSchema.safeParse(body);

  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 },
    );
  }

  try {
    const ticket = await reorderTicket(result.data);
    return NextResponse.json(ticket);
  } catch (e) {
    const message = e instanceof Error ? e.message : '서버 오류가 발생했습니다';
    const isNotFound = message === '티켓을 찾을 수 없습니다';
    return NextResponse.json(
      { error: { code: isNotFound ? 'NOT_FOUND' : 'INTERNAL_ERROR', message } },
      { status: isNotFound ? 404 : 500 },
    );
  }
}
