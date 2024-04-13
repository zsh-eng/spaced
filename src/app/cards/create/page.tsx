import CreateFlashcardForm from "@/components/flashcard/create-flashcard-form";

export default async function CreateFlashcardPage() {
  return (
    <main className="flex flex-col items-center justify-center px-2 py-24 lg:justify-between">
      <CreateFlashcardForm />
    </main>
  );
}
