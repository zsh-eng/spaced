import { CreateDeckForm } from "@/components/decks/create-deck-form";

export default function CreateDeckPage() {
  return (
    <main className="flex flex-col items-center justify-center px-2 md:py-4 lg:justify-between">
      <CreateDeckForm />
    </main>
  );
}
