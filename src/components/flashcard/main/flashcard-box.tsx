"use client";

import Flashcard from "@/components/flashcard/main/flashcard";
import { useFlashcardSession } from "@/providers/flashcard-session";
import { getReviewDateForEachRating } from "@/utils/fsrs";
import { Bug, Telescope } from "lucide-react";

type Props = {};

export default function FlashcardBox({}: Props) {
  const {
    data,
    isLoading,
    error,
    currentCard,
    onRating,
    onEdit,
    onSkip,
    onDelete,
  } = useFlashcardSession();

  if (isLoading) {
    return (
      <div className="col-span-12 flex h-2/3 flex-col items-center justify-center">
        <Telescope className="h-24 w-24 animate-bounce" strokeWidth={1.5} />
        <div className="text-muted-foreground">
          Fetching cards, hold on tight...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 flex h-2/3 flex-col items-center justify-center gap-2">
        <Bug className="h-24 w-24" strokeWidth={1.5} />
        <div>Uh oh, something went wrong:</div>
        <div className="font-mono">{error ?? "Error message here."}</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="col-span-12 flex h-2/3 flex-col items-center justify-center">
        <Telescope className="h-24 w-24" strokeWidth={1.5} />
        <div className="mt-2 text-muted-foreground">All done for now!</div>
        <div className="text-muted-foreground">Check back later?</div>
      </div>
    );
  }
  const { stats } = data;
  const card = currentCard;
  const schemaRatingToReviewDay = getReviewDateForEachRating(card.cards);

  return (
    <>
      {
        // We trigger a full re-render when the card changes
        // Currently, there's no need to optimise the rendering
        <Flashcard
          key={card.cards.id}
          stats={stats}
          card={card}
          schemaRatingToReviewDay={schemaRatingToReviewDay}
          onRating={(rating) => onRating(rating, card)}
          onEdit={(content) => onEdit(content, card)}
          onDelete={() => onDelete(card)}
          onSkip={() => onSkip(card)}
        />
      }
    </>
  );
}

FlashcardBox.displayName = "FlashcardBox";
