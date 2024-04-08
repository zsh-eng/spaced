import Flashcard from '@/components/Flashcard';
import db from '@/db';

export default async function Home() {
  const cardContentWithCards = await db.query.cardContents.findMany({
    with: {
      card: true,
    },
  });
  const cardContent = cardContentWithCards[0]!;

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Flashcard card={cardContent.card} cardContent={cardContent} />
    </main>
  );
}
