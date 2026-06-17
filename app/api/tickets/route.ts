import { NextRequest, NextResponse } from 'next/server';
import { createTicketSchema } from '@/shared/validations/ticketSchema';
import { createTicket, getBoard } from '@/server/services/ticketService';

export async function GET() {
  try {
    const board = await getBoard();
    return NextResponse.json(board);
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body: unknown = await req.json();
  const result = createTicketSchema.safeParse(body);

  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 }
    );
  }

  const ticket = await createTicket(result.data);
  return NextResponse.json(ticket, { status: 201 });
}
