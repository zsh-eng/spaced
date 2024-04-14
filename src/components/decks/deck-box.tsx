"use client";

import Deck from "@/components/decks/deck";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { Diamond } from "lucide-react";

const sectionClasses = "grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2";
const containerClasses =
  "flex flex-col items-center gap-4 md:items-start md:gap-8";

export default function Deckbox() {
  const { data: decks = [], isLoading } = trpc.deck.all.useQuery();

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <Skeleton className="h-48 w-96" />
        <Skeleton className="h-48 w-96" />
        <Skeleton className="h-48 w-96" />
        <Skeleton className="h-48 w-96" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex items-center">
        <Diamond className="mr-3 h-8 w-8  text-accent-foreground" />
        <h1 className="text-4xl font-bold md:text-5xl">Decks</h1>
      </div>
      <section className={sectionClasses}>
        {decks.map((deck) => (
          <Deck key={deck.id} deck={deck} />
        ))}
      </section>
    </div>
  );
}

Deckbox.displayName = "Deckbox";
