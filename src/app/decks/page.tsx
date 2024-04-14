"use client";
import Deckbox from "@/components/decks/deck-box";

export default function DecksPage() {
  return (
    <main className="flex flex-col items-center justify-center px-2 md:py-4 lg:justify-between">
      <Deckbox />
    </main>
  );
}
