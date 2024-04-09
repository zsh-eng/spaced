import Flashcard from '@/components/flashcard/flashcard';
import FlashcardBox from '@/components/flashcard/flashcard-box';
import db from '@/db';

export default async function Home() {
  const cardContentWithCards = await db.query.cardContents.findMany({
    with: {
      card: true,
    },
  });
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <FlashcardBox cardContentWithCards={cardContentWithCards} />
    </main>
  );
}
