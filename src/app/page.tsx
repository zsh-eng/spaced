import FlashcardBox from "@/components/flashcard/flashcard-box";

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-2 py-24 lg:justify-between">
      <FlashcardBox />
    </main>
  );
}
