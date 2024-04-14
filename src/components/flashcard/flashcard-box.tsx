"use client";

import CardCountBadge from "@/components/flashcard/card-count-badge";
import Flashcard from "@/components/flashcard/flashcard";
import { useGradeCard } from "@/hooks/card/use-grade-card";
import { type Rating } from "@/schema";
import { getReviewDateForEachRating } from "@/utils/fsrs";
import { trpc } from "@/utils/trpc";
import { intlFormatDistance } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {};

export default function FlashcardBox({}: Props) {
  const { data: cardsWithContent = [], isLoading } = trpc.card.all.useQuery();
  const gradeMutation = useGradeCard();

  if (isLoading || cardsWithContent.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accentblue" />
      </div>
    );
  }

  const { cards: card, card_contents: cardContent } = cardsWithContent[0]!;
  const schemaRatingToReviewDay = getReviewDateForEachRating(card);
  const isCard = card && cardContent;

  const onRating = (rating: Rating) => {
    const reviewDay = schemaRatingToReviewDay[rating];
    gradeMutation.mutate({
      grade: rating,
      id: card.id,
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
      <CardCountBadge />
      {isCard && (
        <Flashcard
          card={card}
          cardContent={cardContent}
          onRating={onRating}
          schemaRatingToReviewDay={schemaRatingToReviewDay}
        />
      )}
    </div>
  );
}
