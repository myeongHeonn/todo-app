import { getBoard } from '@/server/services/ticketService';
import { BoardContainer } from '@/client/components/BoardContainer';

export default async function Page() {
  const initialData = await getBoard();
  return <BoardContainer initialData={initialData} />;
}
