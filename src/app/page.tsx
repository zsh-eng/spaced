import FlashcardBox from '@/components/flashcard/flashcard-box';

// Prevent Next.js from caching the page in development
export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center lg:justify-between py-24 px-2'>
      <FlashcardBox />
    </main>
  );
}
