import CreateFlashcardForm from "@/components/flashcard/create-flashcard-form";

export default function CreateFlashcardPage() {
  return (
    <main className="col-start-1 col-end-13 grid grid-cols-8 gap-x-4 pb-12 pt-6 xl:col-start-3 xl:col-end-11">
      <CreateFlashcardForm />
    </main>
  );
}
