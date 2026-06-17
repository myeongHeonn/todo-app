import { NextRequest, NextResponse } from 'next/server';
import { updateTicketSchema } from '@/shared/validations/ticketSchema';
import { getTicket, updateTicket, deleteTicket } from '@/server/services/ticketService';

type Params = { params: Promise<{ id: string }> };

function parseId(idStr: string): number | null {
  const n = parseInt(idStr, 10);
  return isNaN(n) ? null : n;
}

function notFoundResponse() {
  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
    { status: 404 },
  );
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return notFoundResponse();

  try {
    const ticket = await getTicket(id);
    return NextResponse.json(ticket);
  } catch {
    return notFoundResponse();
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return notFoundResponse();

  const body: unknown = await req.json();
  const result = updateTicketSchema.safeParse(body);

  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 },
    );
  }

  try {
    const ticket = await updateTicket(id, result.data);
    return NextResponse.json(ticket);
  } catch {
    return notFoundResponse();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return notFoundResponse();

  try {
    await deleteTicket(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return notFoundResponse();
  }
}
