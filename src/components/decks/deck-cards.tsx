"use client";

import CreateFlashcardForm from "@/components/flashcard/create-flashcard-form";
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
  PlusCircle,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [cardFormOpen, setCardFormOpen] = useState(false);

  if (isLoading || isDeckLoading || !data) {
    return (
      <>
        <section className="col-span-12 mb-6 flex w-full flex-col gap-y-4 sm:pl-2">
          <Skeleton className="flex h-28 w-full flex-col gap-y-4" />
          <div className={containerClasses}>
            <FlashcardSimpleSkeleton />
            <FlashcardSimpleSkeleton />
            <FlashcardSimpleSkeleton />
            <FlashcardSimpleSkeleton />
          </div>
        </section>
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
        <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div className="flex justify-center gap-2 sm:justify-start">
            <p className="flex items-center sm:text-lg">
              <NotebookTabs className="mr-1 h-5 w-5 sm:mr-2" />
              {deck.cardCount}
            </p>
            <p className="flex items-center sm:text-lg">
              <Clock className="mr-1 h-5 w-5 sm:mr-2" />
              {format(deck.createdAt, "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center justify-center gap-x-4 sm:ml-auto sm:gap-x-1">
            <TooltipIconButton
              // className="ml-auto"
              tooltipContent="Unsuspend all cards"
              onClick={() => {
                pauseDeck({ id: deck.id, pause: false });
              }}
            >
              <CirclePlay className="h-8 w-8 sm:h-6 sm:w-6" strokeWidth={1.5} />
            </TooltipIconButton>

            <TooltipIconButton
              tooltipContent="Suspend all cards"
              onClick={() => {
                pauseDeck({ id: deck.id });
              }}
            >
              <CirclePause
                className="h-8 w-8 sm:h-6 sm:w-6"
                strokeWidth={1.5}
              />
            </TooltipIconButton>

            <Dialog open={cardFormOpen} onOpenChange={setCardFormOpen}>
              <DialogTrigger asChild>
                <TooltipIconButton
                  tooltipContent="New card"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                  )}
                >
                  <PlusCircle
                    className="h-8 w-8 sm:h-6 sm:w-6"
                    strokeWidth={1.5}
                  />
                </TooltipIconButton>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create</DialogTitle>
                  <DialogDescription>
                    Fill in the front and back to your flashcard.
                  </DialogDescription>
                </DialogHeader>
                <CreateFlashcardForm deckId={deck.id} />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger
                type="button"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                  "m-0",
                )}
              >
                {isDeleting ? (
                  <Loader2 className="h-6 w-6 animate-spin sm:h-5 sm:w-5" />
                ) : (
                  <Trash className="h-6 w-6 sm:h-5 sm:w-5" />
                )}
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
