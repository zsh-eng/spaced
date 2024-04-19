"use client";

import CardCountBadge from "@/components/flashcard/card-count-badge";
import Flashcard from "@/components/flashcard/flashcard";
import { useGradeCard } from "@/hooks/card/use-grade-card";
import { type Rating } from "@/schema";
import { getReviewDateForEachRating } from "@/utils/fsrs";
import { trpc } from "@/utils/trpc";
import { intlFormatDistance } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {};

const getNew = () => Math.random() > 0.75;

export default function FlashcardBox({}: Props) {
  const {
    data: cardsWithContent = {
      newCards: [],
      reviewCards: [],
      stats: {
        new: 0,
        learning: 0,
        review: 0,
        total: 0,
      },
    },
    isLoading: isLoading,
    error: error,
  } = trpc.card.sessionData.useQuery();

  const gradeMutation = useGradeCard();
  const [isNextCardNew, setIsNextCardNew] = useState(getNew());

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accentblue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div>{error.message}</div>
      </div>
    );
  }

  const { newCards, reviewCards, stats } = cardsWithContent;

  if (newCards.length === 0 && reviewCards.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div>All done for today!</div>
      </div>
    );
  }

  const getNextCard = () => {
    if (reviewCards.length === 0) {
      return newCards[0];
    }

    if (isNextCardNew) {
      return newCards[0];
    }

    return reviewCards[0];
  };

  const card = getNextCard();
  const schemaRatingToReviewDay = getReviewDateForEachRating(card.cards);
  const isCard = card && card.card_contents;

  const onRating = (rating: Rating) => {
    const reviewDay = schemaRatingToReviewDay[rating];
    setIsNextCardNew(getNew());
    gradeMutation.mutate({
      grade: rating,
      id: card.cards.id,
    });

    toast(`Card marked as ${rating}.`, {
      action: {
        label: "Undo",
        onClick: () => {},
      },
      description: `You'll see this again ${intlFormatDistance(
        reviewDay,
        new Date(),
      )}`,
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-y-2 ">
      <CardCountBadge stats={stats} />
      {isCard && (
        <Flashcard
          card={card}
          onRating={onRating}
          schemaRatingToReviewDay={schemaRatingToReviewDay}
        />
      )}
    </div>
  );
}
