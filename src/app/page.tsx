import db from '@/db';

export default async function Home() {
  const cards = await db.query.cards.findMany();

  const text = JSON.stringify(cards[0], null, 2);

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      {text}
    </main>
  );
}
