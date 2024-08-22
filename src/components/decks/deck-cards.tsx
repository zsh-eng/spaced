"use client";

import FlashcardSimple, {
  FlashcardSimpleSkeleton,
} from "@/components/flashcard/flashcard-simple";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/ui/tooltip";
import { useDeleteDeck } from "@/hooks/deck/use-delete-deck";
import { usePauseDeck } from "@/hooks/deck/use-pause-deck";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { format } from "date-fns";
import {
  ArrowLeft,
  CirclePause,
  CirclePlay,
  Clock,
  Loader2,
  NotebookTabs,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  deckId: string;
};

const containerClasses =
  "col-span-12 grid w-full grid-cols-1 gap-4 md:grid-cols-2";

function Title({ title }: { title: string }) {
  return (
    <div className="flex items-center">
      <h1 className="text-4xl">{title}</h1>

      <Link href="/decks" legacyBehavior passHref>
        <ArrowLeft className="ml-auto h-8 w-8 cursor-pointer text-accent-foreground transition duration-300 hover:-translate-x-4" />
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
  const { mutateAsync: deleteDeck, isPending: isDeleting } = useDeleteDeck();
  const { mutate: pauseDeck } = usePauseDeck();
  const router = useRouter();

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
      <section className="col-span-12 mb-6 flex w-full flex-col gap-y-4 pl-2">
        <Title title={deck.name} />
        <div className="flex gap-x-4">
          <p className="flex items-center text-lg">
            <NotebookTabs className="mr-2 h-5 w-5" />
            {deck.cardCount}
          </p>
          <p className="flex items-center text-lg">
            <Clock className="mr-2 h-5 w-5" />
            {format(deck.createdAt, "MMM d, yyyy")}
          </p>

          <TooltipIconButton
            className="ml-auto"
            tooltipContent="Unsuspend all cards"
            onClick={() => {
              pauseDeck({ id: deck.id, pause: false });
            }}
          >
            <CirclePlay className="h-6 w-6" strokeWidth={1.5} />
          </TooltipIconButton>

          <TooltipIconButton
            tooltipContent="Suspend all cards"
            onClick={() => {
              pauseDeck({ id: deck.id });
            }}
          >
            <CirclePause className="h-6 w-6" strokeWidth={1.5} />
          </TooltipIconButton>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size={"icon"} variant={"ghost"} className="">
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash className="h-5 w-5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will delete the deck and all the cards in it (
                  <span className="font-bold">{deck.cardCount} cards</span>).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    // After deleting, we should go to the decks page
                    // This should be a confirmation dialog
                    await deleteDeck({
                      deckId: deck.id,
                      deleteCards: true,
                    });
                    router.push("/decks");
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
        className={cn(
          "col-span-12 mt-4 justify-self-stretch sm:justify-self-end",
          !hasNextPage && "hidden",
        )}
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
