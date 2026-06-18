import { getBoard } from '@/server/services/ticketService';
import { BoardContainer } from '@/client/components/BoardContainer';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData = await getBoard();
  return <BoardContainer initialData={initialData} />;
}
