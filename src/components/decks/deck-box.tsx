"use client";

import Deck, { DeckSkeleton } from "@/components/decks/deck";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/utils/trpc";

const sectionClasses =
  "col-span-12 flex flex-wrap gap-x-4 gap-y-4 justify-start items-stretch mt-6 px-2";

function Title() {
  return (
    <div className="col-span-12 sm:mb-4 flex items-center pl-2">
      <h1 className="text-4xl md:text-4xl">Decks</h1>
      <Separator className="ml-2 shrink" />
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
