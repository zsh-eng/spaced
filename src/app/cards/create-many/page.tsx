import CreateManyFlashcardForm from "@/components/flashcard/create-many-flashcard-form";
import { gridChildGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";
import { auth } from "@/auth";
import { PleaseSignIn } from "@/components/please-sign-in";

export default async function CreateManyFlashcardsPage() {
  const session = await auth();
  if (!session) {
    return <PleaseSignIn />;
  }

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
