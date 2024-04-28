import { auth } from "@/auth";
import FlashcardBox from "@/components/flashcard/main/flashcard-box";
import { PleaseSignIn } from "@/components/please-sign-in";
import { gridChildContentGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";

export default async function Home() {
  const session = await auth();

  return (
    <main className={cn(gridChildContentGrid, "place-self-stretch px-4")}>
      {session ? <FlashcardBox /> : <PleaseSignIn />}
    </main>
  );
}
