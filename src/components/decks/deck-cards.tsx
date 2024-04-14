"use client";

import FlashcardSimple, {
  FlashcardSimpleSkeleton,
} from "@/components/flashcard/flashcard-simple";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { format } from "date-fns";
import { ArrowLeft, Clock, Diamond, Loader2, NotebookTabs } from "lucide-react";
import Link from "next/link";

type Props = {
  deckId: string;
};

const containerClasses = "grid w-full grid-cols-1 gap-4 md:grid-cols-2";

function Title({ title }: { title: string }) {
  return (
    <div className="flex w-full items-center">
      <Diamond className="mr-3 h-8 w-8  text-accent-foreground" />
      <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
      <Link href="/decks" className="ml-auto">
        <ArrowLeft className="ml-4 h-8 w-8 text-accent-foreground transition duration-300 hover:-translate-x-4" />
      </Link>
    </div>
  );
}

export default function DeckCards({ deckId }: Props) {
  const {
    data,
    isLoading,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = trpc.deck.infiniteCards.useInfiniteQuery(
    {
      limit: 10,
      deckId: deckId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const { data: deckData, isLoading: isDeckLoading } = trpc.deck.all.useQuery();
  const deck = deckData?.find((d) => d.id === deckId);

  if (isLoading || isDeckLoading || !data) {
    return (
      <>
        <div className={containerClasses}>
          <FlashcardSimpleSkeleton />
          <FlashcardSimpleSkeleton />
          <FlashcardSimpleSkeleton />
          <FlashcardSimpleSkeleton />
        </div>
      </>
    );
  }

  if (!deck) {
    return <div>Deck not found</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <section className="flex w-full flex-col gap-y-4 pl-2">
        <Title title={deck.name} />
        <div className="flex gap-x-4">
          <p className="flex items-center text-xl">
            <NotebookTabs className="mr-2 h-6 w-6" />
            {deck.cardCount}
          </p>
          <p className="flex items-center text-xl">
            <Clock className="mr-2 h-6 w-6" />
            {format(deck.createdAt, "MMM d, yyyy")}
          </p>
        </div>
      </section>
      {data.pages.map((group, i) => {
        return (
          <div key={i} className={containerClasses}>
            {group.data.map((card) => {
              return (
                <FlashcardSimple
                  key={card.cards.id}
                  card={card.cards}
                  cardContent={card.cardContents!}
                />
              );
            })}
          </div>
        );
      })}
      <Button
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
        className={cn("ml-auto", !hasNextPage && "hidden")}
      >
        {isFetchingNextPage && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
      </Button>

      <div>
        {isFetching && !isFetchingNextPage ? (
          <div className={containerClasses}>
            <FlashcardSimpleSkeleton />
            <FlashcardSimpleSkeleton />
            <FlashcardSimpleSkeleton />
            <FlashcardSimpleSkeleton />
          </div>
        ) : null}
      </div>
    </>
  );
}

DeckCards.displayName = "DeckCards";
