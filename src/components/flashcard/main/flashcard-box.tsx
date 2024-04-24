"use client";

import Flashcard from "@/components/flashcard/main/flashcard";
import { useFlashcardSession } from "@/providers/flashcard-session";
import { getReviewDateForEachRating } from "@/utils/fsrs";
import { Loader2 } from "lucide-react";

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
      <div className="col-span-12 flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accentblue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 flex h-96 items-center justify-center">
        <div>{error}</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div>All done for today!</div>
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
