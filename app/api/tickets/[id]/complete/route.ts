import { NextRequest, NextResponse } from 'next/server';
import { completeTicketSchema } from '@/shared/validations/ticketSchema';
import { completeTicket } from '@/server/services/ticketService';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
      { status: 404 },
    );
  }

  const body: unknown = await req.json();
  const result = completeTicketSchema.safeParse(body);

  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 },
    );
  }

  try {
    const ticket = await completeTicket(id, result.data);
    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
      { status: 404 },
    );
  }
}
