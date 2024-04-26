import CreateManyFlashcardForm from "@/components/flashcard/create-many-flashcard-form";
import { gridChildGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";

export default function CreateManyFlashcardsPage() {
  return (
    <main
      className={cn(
        gridChildGrid,
        "max-w-screen-2xl justify-self-stretch pb-12 pt-6 2xl:justify-self-center",
      )}
    >
      <CreateManyFlashcardForm />
    </main>
  );
}
