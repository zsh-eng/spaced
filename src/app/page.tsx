import FlashcardBox from '@/components/flashcard/flashcard-box';
import db from '@/db';

// Prevent Next.js from caching the page in development
export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <FlashcardBox />
    </main>
  );
}
