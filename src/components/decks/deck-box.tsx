"use client";

import Deck, { DeckSkeleton } from "@/components/decks/deck";
import { trpc } from "@/utils/trpc";
import { Diamond } from "lucide-react";

const sectionClasses = "grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2";
const containerClasses =
  "flex flex-col items-center gap-4 md:items-start md:gap-8";

function Title() {
  return (
    <div className="flex items-center">
      <Diamond className="mr-3 h-8 w-8  text-accent-foreground" />
      <h1 className="text-4xl font-bold md:text-5xl">Decks</h1>
    </div>
  );
}

export default function Deckbox() {
  const { data: decks = [], isLoading } = trpc.deck.all.useQuery();

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <Title />
        <section className={sectionClasses}>
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
        </section>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <Title />
      <section className={sectionClasses}>
        {decks.map((deck) => (
          <Deck key={deck.id} deck={deck} />
        ))}
      </section>
    </div>
  );
}

Deckbox.displayName = "Deckbox";
