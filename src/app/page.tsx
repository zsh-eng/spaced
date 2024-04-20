import FlashcardBox from "@/components/flashcard/flashcard-box";

export default async function Home() {
  return (
    <main className="col-span-12 grid h-full grid-cols-12 gap-x-4">
      <FlashcardBox />
    </main>
  );
}
