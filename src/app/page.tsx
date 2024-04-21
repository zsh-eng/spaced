import FlashcardBox from "@/components/flashcard/flashcard-box";
import { gridChildContentGrid, gridChildGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";

export default async function Home() {
  return (
    <main className={cn(gridChildContentGrid, "h-full")}>
      <FlashcardBox />
    </main>
  );
}
