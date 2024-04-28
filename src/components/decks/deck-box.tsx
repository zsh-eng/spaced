"use client";

import Deck, { DeckSkeleton } from "@/components/decks/deck";
import { trpc } from "@/utils/trpc";
import { Diamond } from "lucide-react";

const sectionClasses =
  "col-span-12 flex flex-wrap gap-x-4 gap-y-4 justify-center mt-6";

function Title() {
  return (
    <div className="col-span-12 mb-4 flex items-center pl-2">
      <h1 className="text-4xl font-bold md:text-5xl">Decks</h1>
      <Diamond className="ml-3 h-8 w-8 text-accent-foreground md:h-10 md:w-10" />
    </div>
  );
}

export default function Deckbox() {
  const { data: decks = [], isLoading } = trpc.deck.all.useQuery();

  if (isLoading) {
    return (
      <>
        <Title />
        <section className={sectionClasses}>
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
        </section>
      </>
    );
  }

  return (
    <>
      <Title />
      <section className={sectionClasses}>
        {decks.map((deck) => (
          <Deck key={deck.id} deck={deck} />
        ))}
      </section>
    </>
  );
}

Deckbox.displayName = "Deckbox";
