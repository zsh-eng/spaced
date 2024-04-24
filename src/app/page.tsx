import FlashcardBox from "@/components/flashcard/main/flashcard-box";
import { gridChildContentGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";

export default async function Home() {
  return (
    <main className={cn(gridChildContentGrid, "h-full")}>
      <FlashcardBox />
    </main>
  );
}
